import { Scraper } from './util';
import { Command } from './constants';

class Core {
    constructor() {
        this.scraper = new Scraper();
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
        const recs = this.scraper.getMusicFromPost(this.posts[id]);
        console.log(recs);
        return recs;
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
                    sendResponse(recs);
                    break;

                default:
                    throw new Error('Unknown command intercepted');
            }
        });
    }
}

const app = new Core();
app.start();
