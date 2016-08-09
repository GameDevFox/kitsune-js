import { execSync as exec } from "child_process";
import fs from "fs";

import _ from "lodash";

function saveData(systems) {
    let groupList = systems("a8a338d08b0ef7e532cbc343ba1e4314608024b2");
    let nameList = systems("890b0b96d7d239e2f246ec03b00cb4e8e06ca2c3");
    recreateLinks({ groupList, nameList });

    let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");
    let stringFind = systems("8b1f2122a8c08b5c1314b3f42a9f462e35db05f7");
    let sortedGraphData = _.sortBy(graphFind(), ["head", "tail"]);
    let sortedStringData = _.sortBy(stringFind(), ["string"]);

    exec("mkdir -p out/data");
    writeData(sortedGraphData, "out/data/graph.js");
    writeData(sortedStringData, "out/data/string.js");
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
    let finalData = wrapData(json);
    fs.writeFileSync(filename, finalData);
}

function cleanLoki(data) {
    let result = data.map(value => _.omit(value, "meta", "$loki"));
    return result;
}

function wrapData(data) {
    return `// -*- mode: js2 -*-
var data = function() {
    return ${data};
};
module.exports = data;
`;
}

module.exports = saveData;
