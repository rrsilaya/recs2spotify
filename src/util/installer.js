class Installer {
    bootstrap(functions) {
        chrome.runtime.onInstalled.addListener(() => {
            functions.forEach(f => f());
        });
    }

    initialize() {
        chrome.tabs.onUpdated.addListener((tabId) => {
            chrome.pageAction.show(tabId);
        });
    }

    attachCallbackToActiveTab(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, callback);
    }
}

export default Installer;
