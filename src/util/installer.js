class Installer {
    bootstrap(functions) {
        chrome.runtime.onInstalled.addListener(() => {
            functions.forEach(f => f());
        });
    }

    initialize() {
        chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {
                            hostEquals: 'www.facebook.com',
                            pathPrefix: '/groups/1664811250303043/'
                        },
                    }),
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }]);
        });
    }

    attachCallbackToActiveTab(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, callback);
    }
}

export default Installer;
