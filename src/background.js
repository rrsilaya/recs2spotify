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

        this.authenticate = this.authenticate.bind(this);
        this.handleAuthFlow = this.handleAuthFlow.bind(this);
        this.initialize = this.initialize.bind(this);
        this.start = this.start.bind(this);
    }

    authenticate() {
        chrome.identity.launchWebAuthFlow({
            url: `https://accounts.spotify.com/authorize?client_id=${ApiToken.CLIENT_ID}&redirect_uri=${encodeURIComponent(this.uri)}&response_type=code`,
            interactive: true,
        }, this.handleAuthFlow);
    }

    async handleAuthFlow(response) {
        const params = new URLSearchParams(response.replace(this.uri, ''));
        const code = params.get('code');

        const token = await Spotify.getTokenFromCode(code, this.uri);
        this.storage.save({ auth: token });
    }

    async getTrackInfo(ids = []) {
        const { auth } = await this.storage.load(['auth']);
        const spotify = new Spotify(auth.accessToken);

        const tracks = await spotify.getTracksById(ids);
        return tracks;
    }

    initialize() {
        this.installer.bootstrap([
            this.installer.initialize,
        ]);
    }

    start() {
        chrome.runtime.onMessage.addListener(async (request, _, sendResponse) => {
            switch (request.type) {
                case Command.AUTHENTICATE:
                    this.authenticate();
                    break;

                case Command.GET_TRACKS_INFO:
                    const tracks = await this.getTrackInfo(request.payload);
                    sendResponse(tracks);
                    break;
            }
        });
    }
}

const app = new Background();

app.initialize();
app.start();
