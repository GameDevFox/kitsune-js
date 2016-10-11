let fs = require("fs");

var data = function() {
    let strData = fs.readFileSync("./data/1cd179d6e63660fba96d54fe71693d1923e3f4f1.json", "utf-8");
    let data = JSON.parse(strData);
    return data;
};
module.exports = data;
