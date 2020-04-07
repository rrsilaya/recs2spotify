class Storage {
    save = (payload, callback) => {
        chrome.storage.local.set(payload, callback);
    }

    load = async (keys) => new Promise(resolve => {
        chrome.storage.local.get(keys, result => {
            return resolve(result);
        });
    });
}

export default Storage;
