class Storage {
    save(payload, callback) {
        chrome.storage.local.set(payload, callback);
    }

    async load(keys) {
        return new Promise(resolve => {
            chrome.storage.local.get(keys, result => {
                return resolve(result);
            });
        });
    }
}

export default Storage;
