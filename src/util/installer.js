const URL_MATCH = /facebook\.com\/groups\/1664811250303043\//;

class Installer {
    bootstrap(functions) {
        chrome.runtime.onInstalled.addListener(() => {
            functions.forEach(f => f());
        });
    }

    initialize() {
        chrome.tabs.onUpdated.addListener(function(tabId, _, tab) {
            if (tab.url.match(URL_MATCH)) {
                chrome.pageAction.show(tabId);
            } else {
                chrome.pageActions.hide(tabId);
            }
        });
    }

    attachCallbackToActiveTab(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, callback);
    }
}

export default Installer;
