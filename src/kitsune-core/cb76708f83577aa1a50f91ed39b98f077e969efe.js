let _ = require("lodash");

function hashInteger(integer) {
    let result = integer.toString(16);
    result = _.padStart(result, 40, "0");

    return result;
}
module.exports = hashInteger;
