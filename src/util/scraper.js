import { NodeSelector } from '../constants';

class Scraper {
    getPosts = () => {
        return document.querySelectorAll(NodeSelector.POST);
    }

    getContexts = (posts) => {
        const contexts = [];

        posts.forEach((post, id) => {
            const context = post.querySelector(NodeSelector.CONTEXT);

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
