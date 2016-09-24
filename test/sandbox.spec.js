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
    reportWrappers : false,
    reports:  true
};

describe("sandbox", function() {
    it("should have sand in it", function() {

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
            // let edgeReport = systems("8d15cc103c5f3453e8b5ad8cdada2e5d2dde8039"); edgeReport();
            // let nodeDescReport = systems("f3d18aa9371f876d4264bfe051e5b4e312e90040"); nodeDescReport();

            // let stringReport = systems("8efd75de58a2802dd9b784d8bc1bdd66aaedd856"); stringReport();
            let graphReport = systems("604a2dbd0f19f35564efc9b9ca3d77ac82ea9382"); graphReport();
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
        let recreateLinks = systems("36b76ca66bba2d0b98fe25ce05efeaec1f286826");
        recreateLinks();

        if(run.reportWrappers)
            saveData(systems);
    });
});
