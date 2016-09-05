import { execSync as exec } from "child_process";
import fs from "fs";

import _ from "lodash";

// "copy" param is deprecated
function saveData(systems, copy) {
    let groupList = systems("a8a338d08b0ef7e532cbc343ba1e4314608024b2");
    let nameList = systems("890b0b96d7d239e2f246ec03b00cb4e8e06ca2c3");
    recreateLinks({ groupList, nameList });

    let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");
    let stringFind = systems("8b1f2122a8c08b5c1314b3f42a9f462e35db05f7");
    let sortedGraphData = _.sortBy(graphFind(), ["head", "tail"]);
    let sortedStringData = _.sortBy(stringFind(), ["string"]);

    exec("mkdir -p out/data");
    writeData(sortedGraphData, "./data/24c045b912918d65c9e9aaea9993e9ab56f50d2e.json");
    writeData(sortedStringData, "./data/1cd179d6e63660fba96d54fe71693d1923e3f4f1.json");

    // Deprecated
    // if(copy)
    //     exec("cp out/data/* data");
}

function recreateLinks({ groupList, nameList }) {
    exec("rm -rf src/kitsune-core-src");
    exec("mkdir -p src/kitsune-core-src");

    let coreNodes = groupList("66564ec14ed18fb88965140fc644d7b813121c78");
    coreNodes.forEach(node => {
        let myNames = nameList(node);
        if(myNames && myNames.length > 0) {
            try {
                let cmdStr = "ln -s ../../src/kitsune-core/"+node+" src/kitsune-core-src/"+myNames[0];
                exec(cmdStr);
            } catch(e) {
                console.log("Already a link for "+myNames[0]);
            }
        }
    });
}

function writeData(data, filename) {
    data = cleanLoki(data);
    let json = JSON.stringify(data, null, 2);
    fs.writeFileSync(filename, json);
}

function cleanLoki(data) {
    let result = data.map(value => _.omit(value, "meta", "$loki"));
    return result;
}

module.exports = saveData;
