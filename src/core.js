import { Scraper, Sender } from './util';
import { Command } from './constants';

class Core {
    constructor() {
        this.scraper = new Scraper();
        this.sender = new Sender();
        this.posts = [];

        this.getContexts = this.getContexts.bind(this);
        this.getRecsFromId = this.getRecsFromId.bind(this);
        this.start = this.start.bind(this);
    }

    getContexts() {
        this.posts = this.scraper.getPosts();
        return this.scraper.getContexts(this.posts);
    }

    getRecsFromId(id) {
        const URL_REGEX = /^https?:\/\/open\.spotify\.com\/track\/(\w+)\?/;

        const recs = this.scraper.getMusicFromPost(this.posts[id]);
        const trackIds = recs.map(url => url.match(URL_REGEX)[1]);

        return trackIds;
    }

    start() {
        chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
            switch (request.type) {
                case Command.GET_CONTEXTS:
                    const contexts = this.getContexts();
                    sendResponse(contexts);
                    break;

                case Command.GET_RECS:
                    const recs = this.getRecsFromId(request.payload);

                    this.sender.sendToRuntime({
                        type: Command.GET_TRACKS_INFO,
                        payload: recs,
                    }, tracks => sendResponse(tracks));

                    break;
            }

            return true;
        });
    }
}

const app = new Core();
app.start();
