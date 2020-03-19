import axios from 'axios';
import qs from 'qs';

import { ApiToken } from '../constants';

const Endpoint = {
    TOKEN: 'https://accounts.spotify.com/api/token',
    TRACKS: 'https://api.spotify.com/v1/tracks',
    WHOAMI: 'https://api.spotify.com/v1/me',
};

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
        };
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

    async getTracksById(tracks = []) {
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
            artist: track.artists.map(artist => artist.name).toString(),
        }));
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
            url: data.href,
            name: data.name,
            description: data.description,
            id: data.id,
            uri: data.uri,
        };
    }

    async addTracksToPlaylist(playlistId, trackUris = []) {
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
    }
}

export default Spotify;
