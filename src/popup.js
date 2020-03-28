import { Sender, Storage } from './util';
import { NodeSelector, Command } from './constants';

const BUTTON_LOADING = 'Button--loading';

class PopUp {
    constructor() {
        this.sender = new Sender();
        this.storage = new Storage();
        this.dom = {
            dropdown: document.querySelector(NodeSelector.DROPDOWN),
            getContexts: document.querySelector(NodeSelector.GET_LIST),
            authenticate: document.querySelector(NodeSelector.AUTHENTICATE),
            trackList: document.querySelector(NodeSelector.TRACK_LIST),
            createPlaylist: document.querySelector(NodeSelector.CREATE_PLAYST),
            generatedPlaylistUrl: document.querySelector(`${NodeSelector.GENERATED_PLAYLIST}-url`),
            generatedPlaylistTitle: document.querySelector(`${NodeSelector.GENERATED_PLAYLIST}-title`),
            authUser: document.querySelector(NodeSelector.AUTH_USER),
            blocker: document.querySelector(NodeSelector.BLOCKER),
            listBlocker: document.querySelector(NodeSelector.LIST_BLOCKER),
            trackCount: document.querySelector(NodeSelector.TRACK_COUNT),
        };

        this.populateContexts = this.populateContexts.bind(this);
        this.handleGetRecs = this.handleGetRecs.bind(this);
        this.handleCreatePlaylist = this.handleCreatePlaylist.bind(this);
        this.handleAuthenticate = this.handleAuthenticate.bind(this);
        this.handleOnLoad = this.handleOnLoad.bind(this);
        this.getAuthUser = this.getAuthUser.bind(this);
        this.handleContextChange = this.handleContextChange.bind(this);
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

        this.dom.trackCount.innerHTML = `Tracks: ${tracks.length}`;
    }

    handleGetRecs() {
        this.dom.getContexts.classList.add(BUTTON_LOADING);
        this.dom.listBlocker.classList.add('Popup-list-blocker--hidden');

        this.sender.sendToActiveTab(
            { type: Command.GET_RECS, payload: +this.dom.dropdown.value },
            tracks => {
                this.dom.getContexts.classList.remove(BUTTON_LOADING);
                this.populateTrackList(tracks);

                if (tracks.length) {
                    this.dom.createPlaylist.disabled = false;
                }
            },
        );
    }

    handleAuthenticate() {
        this.dom.authenticate.classList.add(BUTTON_LOADING);
        this.sender.sendToRuntime({ type: Command.AUTHENTICATE }, identity => {
            this.dom.authenticate.classList.remove(BUTTON_LOADING);
            this.dom.blocker.classList.add('Popup-blocker--hidden');
            this.dom.authUser.innerHTML = `@${identity.name}`;
        });
    }

    handleCreatePlaylist() {
        this.dom.createPlaylist.classList.add(BUTTON_LOADING);

        const title = this.dom.dropdown[+this.dom.dropdown.selectedIndex].text;
        this.sender.sendToRuntime({
            type: Command.CREATE_PLAYLIST,
            payload: title,
        }, res => {
            const { url, name } = res;

            this.dom.listBlocker.classList.remove('Popup-list-blocker--hidden');
            this.dom.generatedPlaylistTitle.innerHTML = name;
            this.dom.generatedPlaylistUrl.href = url;
            this.dom.createPlaylist.classList.remove(BUTTON_LOADING);
            this.dom.createPlaylist.disabled = true;
        });
    }

    handleContextChange({ target }) {
        if (target.value) {
            this.dom.getContexts.disabled = false;
        }
    }

    async handleReauthenticate() {
        const { auth } = await this.storage.load(['auth']);
        const now = Date.now();

        if (auth && auth.expiry <= now) {
            this.sender.sendToRuntime({ type: Command.REAUTHENTICATE, payload: auth.refreshToken });
        }
    }

    handleOnLoad() {
        this.getAuthUser();
        this.handleReauthenticate();

        this.sender.sendToActiveTab({ type: Command.GET_CONTEXTS }, contexts => this.populateContexts(contexts));
    }

    async getAuthUser() {
        const { me } = await this.storage.load(['me']);

        if (me) {
            this.dom.authUser.innerHTML = `@${me.name}`;
        } else {
            this.dom.blocker.classList.remove('Popup-blocker--hidden');
        }
    }

    start() {
        this.dom.getContexts.addEventListener('click', this.handleGetRecs);
        this.dom.authenticate.addEventListener('click', this.handleAuthenticate);
        this.dom.createPlaylist.addEventListener('click', this.handleCreatePlaylist);
        this.dom.dropdown.addEventListener('change', this.handleContextChange);

        window.onload = this.handleOnLoad;
    }
}

const app = new PopUp();
app.start();
