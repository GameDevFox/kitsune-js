function dictionaryFunc(obj) {
    return function(input) {
        let output = obj[input];
        return output;
    };
}
module.exports = dictionaryFunc;
