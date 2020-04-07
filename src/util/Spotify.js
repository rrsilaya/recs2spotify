import axios from 'axios';
import qs from 'qs';

import Utils from './utils';

const TRACK_LIMIT = 50;
const API_URL = 'https://api.spotify.com/v1';

class Spotify {
    constructor(token) {
        this.token = token;
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' }),
        });

        this.api.interceptors.request.use(this._credentialsMiddleware);
    }

    _credentialsMiddleware = (config) => {
        return {
            ...config,
            headers: {
                ...config.headers,
                Authorization: `Bearer ${this.token}`,
            },
        };
    };

    getUserInfo = async () => {
        const { data } = await this.api.get('/me');

        return {
            name: data.display_name,
            icon: data.images[0],
            id: data.id,
            uri: data.uri,
        }
    }

    getTracksById = async (trackIds = []) => {
        const trackBatches = Utils.chunkArray(trackIds, TRACK_LIMIT);

        const requests = trackBatches.map(async tracks => {
            const ids = tracks.toString();

            const { data } = await this.api.get('/tracks', { params: { ids }});

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

    createPlaylist = async (userId, { name, description = '' }) => {
        const payload = {
            name,
            description,
            public: false,
        };

        const { data } = await this.api.post(`/users/${userId}/playlists`, payload);

        return {
            url: `https://open.spotify.com/playlist/${data.id}`,
            name: data.name,
            description: data.description,
            id: data.id,
            uri: data.uri,
        };
    }

    addTracksToPlaylist = async (playlistId, trackUris = []) => {
        const trackBatches = Utils.chunkArray(trackUris, TRACK_LIMIT);

        const requests = trackBatches.map(async trackUris => {
            const uris = trackUris.toString();

            const { data } = await this.api.post(
                `/playlists/${playlistId}/tracks`,
                {},
                { params: { uris }},
            );

            return data;
        });

        const tracks = await Promise.all(requests);
        return Utils.flatten(tracks);
    }
}

export default Spotify;
