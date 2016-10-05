import { execSync as exec } from "child_process";
import fs from "fs";

import _ from "lodash";

function saveData(systems) {
    let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");
    let stringFind = systems("8b1f2122a8c08b5c1314b3f42a9f462e35db05f7");
    let cleanStringSystem = systems("f3db04b0138e827a9b513ab195cc373433407f83");

    cleanStringSystem();

    let sortedGraphData = _.sortBy(graphFind(), ["head", "tail"]);
    let sortedStringData = _.sortBy(stringFind(), ["string"]);

    exec("mkdir -p out/data");
    writeData(sortedGraphData, "./data/24c045b912918d65c9e9aaea9993e9ab56f50d2e.json");
    writeData(sortedStringData, "./data/1cd179d6e63660fba96d54fe71693d1923e3f4f1.json");
}

function writeData(data, filename) {
    data = cleanLoki(data);
    let json = JSON.stringify(data, null, 2);
    fs.writeFileSync(filename, json+"\n");
}

function cleanLoki(data) {
    let result = data.map(value => _.omit(value, "meta", "$loki"));
    return result;
}

module.exports = saveData;
