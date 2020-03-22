import axios from 'axios';
import qs from 'qs';

import { ApiToken } from '../constants';
import Utils from './utils';

const Endpoint = {
    TOKEN: 'https://accounts.spotify.com/api/token',
    TRACKS: 'https://api.spotify.com/v1/tracks',
    WHOAMI: 'https://api.spotify.com/v1/me',
};

const TRACK_LIMIT = 50;

class Spotify {
    constructor(token) {
        this.token = token;
    }

    encodeToken(token) {
        return `Bearer ${token}`;
    }

    static async getTokenFromCode(code, redirectUri) {
        const payload = {
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: ApiToken.CLIENT_ID,
            client_secret: ApiToken.CLIENT_SECRET,
        };

        const { data } = await axios.post(
            Endpoint.TOKEN,
            qs.stringify(payload),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }},
        );

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiry: data.expires_in,
        };
    }

    static async reauthenticate(refreshToken) {
        const payload = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        };

        const { data } = await axios.post(
            Endpoint.TOKEN,
            qs.stringify(payload),
            {
                headers: {
                    Authorization: this.encodeToken(`${Api.CLIENT_ID}:${Api.CLIENT_SECRET}`),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );

        return { accessToken: data.access_token, expiry: data.expires_in };
    }

    async getUserInfo() {
        const { data } = await axios.get(Endpoint.WHOAMI, { headers: { Authorization: this.encodeToken(this.token) }});

        return {
            name: data.display_name,
            icon: data.images[0],
            id: data.id,
            uri: data.uri,
        }
    }

    async getTracksById(trackIds = []) {
        const trackBatches = Utils.chunkArray(trackIds, TRACK_LIMIT);

        const requests = trackBatches.map(async tracks => {
            const ids = tracks.toString();

            const { data } = await axios.get(
                Endpoint.TRACKS,
                {
                    headers: { Authorization: this.encodeToken(this.token) },
                    params: { ids },
                },
            );

            return data.tracks.map(track => ({
                id: track.id,
                uri: track.uri,
                title: track.name,
                url: track.href,
                album: track.album.name,
                thumbnail: track.album.images[0],
                artist: track.artists.map(artist => artist.name).join(', '),
            }));
        });

        const tracks = await Promise.all(requests);
        return Utils.flatten(tracks);
    }

    async createPlaylist(userId, { name, description = '' }) {
        const payload = {
            name,
            description,
            public: false,
        };

        const { data } = await axios.post(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            payload,
            { headers: { Authorization: this.encodeToken(this.token) }},
        );

        return {
            url: `https://open.spotify.com/playlist/${data.id}`,
            name: data.name,
            description: data.description,
            id: data.id,
            uri: data.uri,
        };
    }

    async addTracksToPlaylist(playlistId, trackUris = []) {
        const trackBatches = Utils.chunkArray(trackUris, TRACK_LIMIT);

        const requests = trackBatches.map(async trackUris => {
            const uris = trackUris.toString();

            const { data } = await axios.post(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                {},
                {
                    headers: { Authorization: this.encodeToken(this.token) },
                    params: { uris },
                },
            );

            return data;
        });

        const tracks = await Promise.all(requests);
        return Utils.flatten(tracks);
    }
}

export default Spotify;
