class Sender {
    sendToActiveTab(payload, callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, payload, callback);
        })
    }
}

export default Sender;
