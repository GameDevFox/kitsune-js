function hashRandom({ hashString }) {
    let result = hashString(Math.random().toString());
    return result;
}
module.exports = hashRandom;
