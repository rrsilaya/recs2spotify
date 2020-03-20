import axios from 'axios';
import qs from 'qs';

import {
    Installer,
    Spotify,
    Storage,
} from './util';
import { ApiToken, Command } from './constants';

class Background {
    constructor() {
        this.installer = new Installer();
        this.storage = new Storage();

        this.uri = chrome.identity.getRedirectURL('recs2spotify');
        this.tracks = [];

        this.authenticate = this.authenticate.bind(this);
        this.handleAuthFlow = this.handleAuthFlow.bind(this);
        this.initialize = this.initialize.bind(this);
        this.start = this.start.bind(this);
    }

    authenticate() {
        chrome.identity.launchWebAuthFlow({
            url: `https://accounts.spotify.com/authorize?client_id=${ApiToken.CLIENT_ID}&redirect_uri=${encodeURIComponent(this.uri)}&response_type=code&scope=playlist-modify-private`,
            interactive: true,
        }, this.handleAuthFlow);
    }

    async handleAuthFlow(response) {
        const params = new URLSearchParams(response.replace(this.uri, ''));
        const code = params.get('code');

        const token = await Spotify.getTokenFromCode(code, this.uri);

        const spotify = new Spotify(token.accessToken);
        const me = await spotify.getUserInfo();

        this.storage.save({ auth: token, me });
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

        const playlist = await spotify.createPlaylist(me.id, { name: title });
        const trackUris = this.tracks.map(track => track.uri);

        await spotify.addTracksToPlaylist(playlist.id, trackUris);
        return playlist;
    }

    initialize() {
        this.installer.bootstrap([
            this.installer.initialize,
        ]);
    }

    start() {
        chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
            switch (request.type) {
                case Command.AUTHENTICATE:
                    this.authenticate();
                    break;

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

app.initialize();
app.start();
