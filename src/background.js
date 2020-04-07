import {
    Installer,
    Spotify,
    SpotifyAuth,
    Storage,
} from './util';
import { ApiToken, Command } from './constants';

const MILLISECOND = 1000;

class Background {
    constructor() {
        this.installer = new Installer();
        this.storage = new Storage();
        this.oauth = new SpotifyAuth();

        this.uri = `${chrome.identity.getRedirectURL()}recs2spotify`;
        this.tracks = [];

        this.authenticate = this.authenticate.bind(this);
        this.reauthenticate = this.reauthenticate.bind(this);
        this.handleAuthFlow = this.handleAuthFlow.bind(this);
        this.start = this.start.bind(this);
    }

    authenticate() {
        return new Promise((resolve) => {
            chrome.identity.launchWebAuthFlow(
                {
                    url: `https://accounts.spotify.com/authorize?client_id=${ApiToken.CLIENT_ID}&redirect_uri=${encodeURIComponent(this.uri)}&response_type=code&scope=playlist-modify-private`,
                    interactive: true,
                },
                response => {
                    this.handleAuthFlow(response)
                        .then(identity => resolve(identity));
                },
            );
        });
    }

    async handleAuthFlow(response) {
        const params = new URLSearchParams(response.replace(this.uri, ''));
        const code = params.get('code');

        const token = await this.oauth.authenticate(code, this.uri);
        token.expiry = Date.now() + token.expiry * MILLISECOND;

        const spotify = new Spotify(token.accessToken);
        const me = await spotify.getUserInfo();

        this.storage.save({ auth: token, me });
        return me;
    }

    async reauthenticate(token) {
        const newToken = await this.oauth.refreshAuth(token.refreshToken);
        const auth = {
            ...token,
            accessToken: newToken.accessToken,
            expiry: Date.now() + newToken.expiry * MILLISECOND,
        };

        this.storage.save({ auth });
        return auth;
    }

    async getTrackInfo(ids = []) {
        const { auth } = await this.storage.load(['auth']);
        const spotify = new Spotify(auth.accessToken);

        this.tracks = await spotify.getTracksById(ids);
        return this.tracks;
    }

    async generatePlaylist(title) {
        const { auth, me } = await this.storage.load(['auth', 'me']);
        const spotify = new Spotify(auth.accessToken);

        const playlist = await spotify.createPlaylist(me.id, {
            name: title,
            description: 'Exported from "music recs without playlist" group using recs2spotify 🎵🔥',
        });
        const trackUris = this.tracks.map(track => track.uri);

        await spotify.addTracksToPlaylist(playlist.id, trackUris);
        return playlist;
    }

    start() {
        this.installer.initialize();

        chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
            switch (request.type) {
                case Command.AUTHENTICATE:
                    this.authenticate()
                        .then(identity => sendResponse(identity));
                    break;

                case Command.REAUTHENTICATE:
                    this.reauthenticate(request.payload)
                        .then(auth => sendResponse(auth));

                case Command.GET_TRACKS_INFO:
                    this.getTrackInfo(request.payload)
                        .then(tracks => sendResponse(tracks));
                    break;

                case Command.CREATE_PLAYLIST:
                    this.generatePlaylist(request.payload)
                        .then(playlist => sendResponse(playlist));
                    break;
            }

            return true;
        });
    }
}

const app = new Background();
app.start();
