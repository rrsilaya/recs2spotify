import { NodeSelector } from '../constants';

class Scraper {
    isFbNext = () => {
        const body = document.querySelector(NodeSelector.FB_NEXT);
        return !!body;
    }

    getPosts = () => {
        const selector = this.isFbNext() ? NodeSelector.POST_NEXT : NodeSelector.POST;
        return document.querySelectorAll(selector);
    }

    getContexts = (posts) => {
        const selector = this.isFbNext() ? NodeSelector.CONTEXT_NEXT : NodeSelector.CONTEXT;
        const contexts = [];

        posts.forEach((post, id) => {
            const context = post.querySelector(selector);

            if (context) {
                contexts.push({
                    id,
                    label: context.innerText,
                    post,
                });
            }
        });

        return contexts;
    }

    getMusicFromPost = (post) => {
        const songs = [
            ...post.querySelectorAll(NodeSelector.SPOTIFY_TRACK_PARSED),
            ...post.querySelectorAll(NodeSelector.SPOTIFY_TRACK_UNPARSED),
        ];

        return songs.map(song => {
            const url = song.href.replace('https://l.facebook.com/l.php?u=', '');

            return decodeURIComponent(url);
        });
    }
}

export default Scraper;
