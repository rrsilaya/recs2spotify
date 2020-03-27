import axios from 'axios';
import qs from 'qs';

import { ApiToken } from '../constants';

const API_URL = 'https://accounts.spotify.com/api';

class SpotifyAuth {
    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${btoa(`${ApiToken.CLIENT_ID}:${ApiToken.CLIENT_SECRET}`)}`,
            },
        });
    }

    authenticate = async (code, redirectUri) => {
        const payload = {
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
        };

        const { data } = await this.api.post('/token', qs.stringify(payload));

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiry: data.expires_in,
        };
    }

    refreshAuth = async (refreshToken) => {
        const payload = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        };

        const { data } = await this.api.post('/token', qs.stringify(payload));

        return { accessToken: data.access_token, expiry: data.expires_in };
    }
}

export default SpotifyAuth;
