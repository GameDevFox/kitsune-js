import _ from "lodash";
import { expect } from "chai";

import bootstrap from "kitsune/core.js";
import saveData from "kitsune/save-data.js";

// Logging
import Logger from "js-logger";
Logger.useDefaults();

let rootLogger = Logger.get("root");
let debugLog = Logger.get("debug");
global.debugLog = debugLog;

rootLogger.setLevel(Logger.INFO);
debugLog.setLevel(Logger.OFF);

// Settings
let run = {
    // reportWrappers : true,
    reports:  true
};

describe("sandbox", function() {
    it.only("should have sand in it", function() {

        let log = rootLogger;

        log.info("boostrap");
        let { modules, systems } = bootstrap();

        // Outer Scope
        let node;
        let nodeSearch;
        let graphFindOneId;
        let readEdgeId;

        // BEFORE REPORT //
        if(run.reportWrappers) {
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
        if(run.reports) {
            let printGraphReport = systems("1cbcbae3c4aea924e7bb9af6c6bde5192a6646ae");

            // let edgeReport = systems("8d15cc103c5f3453e8b5ad8cdada2e5d2dde8039"); edgeReport();
            // let nodeDescReport = systems("f3d18aa9371f876d4264bfe051e5b4e312e90040"); nodeDescReport();

            console.log("=== Core Node Report ===");
            printGraphReport("7f82d45a6ffb5c345f84237a621de35dd8b7b0e3");
            console.log("=== Function Call Report ===");
            printGraphReport("d2cd5a6f99428baaa05394cf1fe3afa17fb59aff");
            // console.log("=== Node Type Report ===");
            // printGraphReport("585d4cc792af1a4754f1819630068bdbb81bfd20");

            let systemFileReport = systems("0750f117e54676b9eb32aebe5db1d3dae2e1853e"); systemFileReport();
            // let stringReport = systems("8efd75de58a2802dd9b784d8bc1bdd66aaedd856"); stringReport();
            // let graphReport = systems("604a2dbd0f19f35564efc9b9ca3d77ac82ea9382"); graphReport();
        }

        // AFTER REPORT //
        if(run.reportWrappers) {
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

// TODO: Move below to manual loader
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
