let fs = require("fs");

var data = function() {
    let strData = fs.readFileSync("./data/24c045b912918d65c9e9aaea9993e9ab56f50d2e.json", "utf-8");
    let data = JSON.parse(strData);
    return data;
};
module.exports = data;
