let _ = require("lodash");

function autoId({ hashRandom, func, paramName }) {
    return function(input) {
        let initial = {};
        initial[paramName] = hashRandom();

        let newInput = _.assign(initial, input);
        return func(newInput);
    };
}
module.exports = autoId;
