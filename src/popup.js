import { Sender } from './util';
import { NodeSelector, Command } from './constants';

class PopUp {
    constructor() {
        this.sender = new Sender();
        this.dom = {
            dropdown: document.querySelector(NodeSelector.DROPDOWN),
            getContexts: document.querySelector(NodeSelector.GET_LIST),
            authenticate: document.querySelector(NodeSelector.AUTHENTICATE),
        };

        this.populateContexts = this.populateContexts.bind(this);
        this.handleGetRecs = this.handleGetRecs.bind(this);
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

    handleGetRecs() {
        this.sender.sendToActiveTab({ type: Command.GET_RECS, payload: +this.dom.dropdown.value });
    }

    handleAuthenticate() {
        this.sender.sendToRuntime({ type: Command.AUTHENTICATE });
    }

    handleOnLoad() {
        this.sender.sendToActiveTab({ type: Command.GET_CONTEXTS }, contexts => this.populateContexts(contexts));
    }

    start() {
        this.dom.getContexts.addEventListener('click', this.handleGetRecs);
        this.dom.authenticate.addEventListener('click', this.handleAuthenticate);

        window.onload = this.handleOnLoad;
    }
}

const app = new PopUp();
app.start();
