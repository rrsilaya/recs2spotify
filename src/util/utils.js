class Util {
    static chunkArray(array = [], chunkSize) {
        const chunks = [];

        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }

        return chunks;
    }

    static flatten(array = []) {
        return array.reduce((acc, arr) => acc.concat(arr), []);
    }
}

export default Util;
