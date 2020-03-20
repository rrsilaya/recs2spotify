import { Sender } from './util';
import { NodeSelector, Command } from './constants';

class PopUp {
    constructor() {
        this.sender = new Sender();
        this.dom = {
            dropdown: document.querySelector(NodeSelector.DROPDOWN),
            getContexts: document.querySelector(NodeSelector.GET_LIST),
            authenticate: document.querySelector(NodeSelector.AUTHENTICATE),
            trackList: document.querySelector(NodeSelector.TRACK_LIST),
            createPlaylist: document.querySelector(NodeSelector.CREATE_PLAYST),
            generatedPlaylist: document.querySelector(NodeSelector.GENERATED_PLAYLIST),
        };

        this.populateContexts = this.populateContexts.bind(this);
        this.handleGetRecs = this.handleGetRecs.bind(this);
        this.handleCreatePlaylist = this.handleCreatePlaylist.bind(this);
        this.handleAuthenticate = this.handleAuthenticate.bind(this);
        this.handleOnLoad = this.handleOnLoad.bind(this);
        this.start = this.start.bind(this);
    }

    populateContexts(contexts = []) {
        contexts.forEach(context => {
            const template = `
                <option value="${context.id}">${context.label}</option>
            `;

            this.dom.dropdown.innerHTML += template;
        });
    }

    populateTrackList(tracks = []) {
        this.dom.trackList.innerHTML = '';

        tracks.forEach(track => {
            const template = `
                <li class="Popup-list-track">
                    <div class="Popup-list-track-thumbnail">
                        <img
                            alt="${track.album}"
                            class="Popup-list-track-thumbnail-image"
                            src="${track.thumbnail.url}"
                        />
                    </div>
                    <div class="Popup-list-track-info">
                        <div class="Popup-list-track-info-title">
                            ${track.title}
                        </div>
                        <div class="Popup-list-track-info-description">
                            <div class="Popup-list-track-info-artist">
                                ${track.artist}
                            </div>
                            ${track.album}
                        </div>
                    </div>
                </li>
            `;

            this.dom.trackList.innerHTML += template;
        });
    }

    handleGetRecs() {
        this.sender.sendToActiveTab(
            { type: Command.GET_RECS, payload: +this.dom.dropdown.value },
            tracks => this.populateTrackList(tracks),
        );
    }

    handleAuthenticate() {
        this.sender.sendToRuntime({ type: Command.AUTHENTICATE });
    }

    handleCreatePlaylist() {
        const title = this.dom.dropdown[+this.dom.dropdown.selectedIndex].text;
        this.sender.sendToRuntime({
            type: Command.CREATE_PLAYLIST,
            payload: title,
        }, res => {
            const { url } = res;

            this.dom.generatedPlaylist.innerHTML = `
                Successfully created playlist! <a href="${url}" target="_blank">Link</a>
            `;
        });
    }

    handleOnLoad() {
        this.sender.sendToActiveTab({ type: Command.GET_CONTEXTS }, contexts => this.populateContexts(contexts));
    }

    start() {
        this.dom.getContexts.addEventListener('click', this.handleGetRecs);
        this.dom.authenticate.addEventListener('click', this.handleAuthenticate);
        this.dom.createPlaylist.addEventListener('click', this.handleCreatePlaylist);

        window.onload = this.handleOnLoad;
    }
}

const app = new PopUp();
app.start();
