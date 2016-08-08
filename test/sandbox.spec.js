import { execSync as exec } from "child_process";
import fs from "fs";

import _ from "lodash";
import { expect } from "chai";

import bootstrap from "kitsune/core.js";

// Logging
import Logger from "js-logger";
Logger.useDefaults();

let rootLogger = Logger.get("root");
let debugLog = Logger.get("debug");
global.debugLog = debugLog;

rootLogger.setLevel(Logger.INFO);
debugLog.setLevel(Logger.OFF);

// Settings
let runReportWrappers = 0;
let runReports = 1;

describe("sandbox", function() {
    it.only("should have sand in it", function() {

        let log = rootLogger;

        log.info("boostrap");
        let { modules, systems } = bootstrap();

        // Utilities
        // let createSystemFile = systems("76c55430fccd4f9e0b19c1c2b98d8a3babea81b2");
        // createSystemFile("something");

        // let createCoreNode = systems("a21b86930a00f7b31b5984aabb21cb5eea7efc56");
        // createCoreNode({ node: "585d4cc792af1a4754f1819630068bdbb81bfd20", name: "some-thing" });

        // let graphRemove = systems("c2d807f302ca499c3584a8ccf04fb7a76cf589ad");
        // let edges = graphFind({ head: "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3", tail: "???" });
        // edges.forEach(edge => graphRemove(edge.id));

        // let name = systems("2885e34819b8a2f043b139bd92b96e484efd6217");
        // let nameRemove = systems("708f17af0e4f537757cf8817cbca4ed016b7bb8b");
        // nameRemove({ node: "b7916f86301a6bc2af32f402f6515809bac75b03", name: "graph-listNodes" });
        // name({ node: "b7916f86301a6bc2af32f402f6515809bac75b03", name: "graph-list-nodes" });

        // let cleanStringSystem = systems("f3db04b0138e827a9b513ab195cc373433407f83");
        // cleanStringSystem();

        // Outer Scope
        let node;
        let nodeSearch;
        let graphFindOneId;
        let readEdgeId;

        // BEFORE REPORT //
        if(runReportWrappers) {
            console.log("== BEFORE REPORTS ==");

            let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");
            let autoParam = systems("b69aeff3eb1a14156b1a9c52652544bcf89761e2");
            let bind = systems("878c8ef64d31a194159765945fc460cb6b3f486f");
            let fRef = systems("78e787d70cc0f1c1dfdf6a406250dbe5243631ff");
            let graphColl = systems("adf6b91bb7c0472237e4764c044733c4328b1e55");
            let lokiRemove = systems("2ebd8d9fff28833dab44f086d4692fb888525fc8");
            let returnFirst = systems("68d3fb9d10ae2b0455a33f2bfb80543c4f137d51");

            // Create function calls
            let writeAndNameFuncCall = systems("253cd1812a32a6a81f1365e1eca19cc1549f6002");

            graphFindOneId = writeAndNameFuncCall({ func: returnFirst,
                param: graphFind,
                name: "graph-find-one" });
            readEdgeId = writeAndNameFuncCall({ func: autoParam,
                param: { func: fRef(graphFindOneId), paramName: "id" },
                name: "read-edge" });

            let graphRemoveBind = writeAndNameFuncCall({ func: bind,
                param: { func: lokiRemove, params: { db: graphColl }},
                name: "graph-remove-bind" });
            let graphRemove = writeAndNameFuncCall({ func: autoParam,
                param: { func: fRef(graphRemoveBind), paramName: "id" },
                name: "graph-remove" });

            nodeSearch = {
                head: "66564ec14ed18fb88965140fc644d7b813121c78",
                tail: "2f7ff34b09a1fb23b9a5d4fbdd8bb44abbe2007a"
            };
            node = graphFind(nodeSearch)[0];
            // let myGraphRemove = systems(graphRemove);
            // myGraphRemove(node.id);
        }

        // REPORTS //
        if(runReports) {
            let printGraphReport = systems("1cbcbae3c4aea924e7bb9af6c6bde5192a6646ae");

            let edgeReport = systems("8d15cc103c5f3453e8b5ad8cdada2e5d2dde8039"); edgeReport();
            // let nodeDescReport = systems("f3d18aa9371f876d4264bfe051e5b4e312e90040"); nodeDescReport();

            console.log("=== Core Node Report ===");
            printGraphReport("7f82d45a6ffb5c345f84237a621de35dd8b7b0e3");
            // console.log("=== Function Call Report ===");
            // printGraphReport("d2cd5a6f99428baaa05394cf1fe3afa17fb59aff");
            // console.log("=== Node Type Report ===");
            // printGraphReport("585d4cc792af1a4754f1819630068bdbb81bfd20");

            // let systemFileReport = systems("0750f117e54676b9eb32aebe5db1d3dae2e1853e"); systemFileReport();
            // let stringReport = systems("8efd75de58a2802dd9b784d8bc1bdd66aaedd856"); stringReport();
            // let graphReport = systems("604a2dbd0f19f35564efc9b9ca3d77ac82ea9382"); graphReport();
        }

        // AFTER REPORT //
        if(runReportWrappers) {
            console.log("== AFTER REPORTS ==");

            let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

            let edge = graphFind(nodeSearch)[0];
            console.log(edge);

            let graphFindOne = systems(graphFindOneId);
            console.log(graphFindOne(nodeSearch));

            let readEdge = systems(readEdgeId);
            console.log(readEdge(node.id));
        }

        // Save Data
        saveData(systems);
    });
});

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

function removeSystemFile({ graphFind, graphRemove, nameRemove, stringFind, stringRemove,
                            systemFileId, systemFileName  }) {
    // TODO: Fix this, it's broken
    let groupEdge = graphFind({ head: "66564ec14ed18fb88965140fc644d7b813121c78",
                                tail: systemFileId });
    graphRemove({ id: groupEdge[0].id });
    nameRemove({ node: groupEdge[0].tail, name: systemFileName });
    let stringNode = stringFind({ string: systemFileName });
    stringRemove({ id: stringNode[0].id });
}

// Local utils - don't need to make system files out of these
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

function writeData(data, filename) {
    data = cleanLoki(data);
    let json = JSON.stringify(data, null, 2);
    let finalData = wrapData(json);
    fs.writeFileSync(filename, finalData);
}

// TODO: Move below to manual loader
function hyphenNameToCamelCase(name) {
    let result = name
            .replace(/-(.)/g, capture => capture.toUpperCase())
            .replace(/-/g, '');
    return result;
}

// TODO: Names should never be used to load system, instead they
// should be used to lookup system ids and load by that
// TODO: DON'T USE THIS
function buildNameLoader(systems) {

    let bind = systems("878c8ef64d31a194159765945fc460cb6b3f486f");
    let autoParam = systems("b69aeff3eb1a14156b1a9c52652544bcf89761e2");

    let stringAutoPut = systems("4e63843a9bee61351b80fac49f4182bd582907b4");
    let graphFactor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");
    let nameListIds = systems("2bf3bbec64d4b33302b9ab228eb90bc3f04b22a8");

    let nameLoader = function({ nameListIds, core, name }) {
        let ids = nameListIds(name);

        let system;
        for(let key in ids) {
            let id = ids[key];
            system = core(id);
            if(system)
                break;
        }

        return system;
    };
    nameLoader = bind({ func: nameLoader, params: { nameListIds, core: systems }});
    nameLoader = autoParam({ func: nameLoader, paramName: "name" });

    return nameLoader;
}

