import { execSync as exec } from "child_process";
import fs from "fs";

import _ from "lodash";
import { expect } from "chai";

import { createId } from "kitsune/util";
import systemLoader from "kitsune-core/31d21eb2620a8f353a250ad2edd4587958faf3b1"; // system-loader

describe("sandbox", function() {
    it.only("should have sand in it", function() {

        // INIT LOADER SYSTEM - already loaded, just here for reference
        // let systemLoaderId = "31d21eb2620a8f353a250ad2edd4587958faf3b1"; // system-loader
        let bind = systemLoader({ path: "kitsune-core", id: "878c8ef64d31a194159765945fc460cb6b3f486f" }); // bind
        let loader = bind({ func: systemLoader, params: { path: "kitsune-core" }});

        // MANUAL LOADING
        let graphData = loader({ id: "24c045b912918d65c9e9aaea9993e9ab56f50d2e" }); // graph-data
        let stringData = loader({ id: "1cd179d6e63660fba96d54fe71693d1923e3f4f1" }); // string-data

        let lokiColl = loader({ id: "0741c54e604ad973eb41c02ab59c5aabdf2c6bc3" }); // ... same
        let lokiCollPlus = loader({ id: "fe60fc76f26f8dce6c5f68bbb0ea0c51efef3dff" }); // loki-collection

        // INIT DATA SYSTEMS
        var data = { graph: graphData(), string: stringData() };

        data = _.mapValues(data, (dataSet, systemName) => {
            let coll = lokiColl();
            let control = _.mapValues(lokiCollPlus(), (func, name) => {
                return bind({ func: func, params: { db: coll }});
            });

            dataSet.forEach(value => {
                control.put({ element: value });
            });

            return control;
        });

        let { graph, string } = data;

        // INIT SYSTEMS
        let systemIds = [
            "a73b64eba9daa07051815ca7151ba009789616e2", // graph-autoPut
            "6c877bef62bc8f57eb55265c62e75b36515ef458", // graph-assign
            "4163d1cd63d3949b79c37223bd7da04ad6cd36c8", // graph-factor
            "b7916f86301a6bc2af32f402f6515809bac75b03", // graph-listNodes
            "8f8b523b9a05a55bfdffbf14187ecae2bf7fe87f", // string-autoPut
            "ddfe7d402ff26c18785bcc899fa69183b3170a7d", // name
            "81e0ef7e2fae9ccc6e0e3f79ebf0c9e14d88d266", // getNames
            "d2f544f574dae26adb5ed3ee70c71e302b2575fa", // is-in-collection
            "4bea815e7814aa415569ecd48e5733a19e7777db", // describe-node
            "a3fd8e7c0d51f13671ebbb6f9758833ff6120b42", // is-in-group
            "90184a3d0c84658aac411637f7442f80b3fe0040", // and-is
        ];

        let systems = systemIds.map(id => loader({ id }));

        let [
            graphAutoPut,
            graphAssign,
            graphFactor,
            graphListNodes,
            stringAutoPut,
            name,
            getNames,
            isInCollection,
            describe,
            isInGroup,
            andIs
        ] = systems;

        // Build systems
        graph.autoPut = bind({ func: graphAutoPut, params: { graphPut: graph.put }});
        graph.assign = bind({ func: graphAssign, params: { graphAutoPut: graph.autoPut }});
        graph.factor = bind({ func: graphFactor, params: { graphFind: graph.find }});
        graph.listNodes = bind({ func: graphListNodes, params: { graphFind: graph.find }});
        string.autoPut = bind({ func: stringAutoPut, params: { stringFind: string.find, stringPut: string.put }});
        name = bind({ func: name, params: { stringAutoPut: string.autoPut, graphAssign: graph.assign }});
        getNames = bind({ func: getNames, params: { graphFactor: graph.factor, stringFind: string.find }});

        let createSystemFile = bind({ func: _createSystemFile, params: { graphAutoPut: graph.autoPut, nameFn: name }});
        let isEdge = bind({ func: isInCollection, params: { collFind: graph.find }});
        let isString = bind({ func: isInCollection, params: { collFind: string.find }});

        // Execute systems
        // createSystemFile({ name: "loki-collection" });

        // name({ node: "fe60fc76f26f8dce6c5f68bbb0ea0c51efef3dff", name: "old-loki-collection" });

        // console.log(systemIds.length);
        // console.log(systems);
        // let group = graph.find({ where: { head: "66564ec14ed18fb88965140fc644d7b813121c78" } });
        // console.log(_.map(group, "tail"));

        let coreNodes = fs.readdirSync("node_modules/kitsune-core");
        // REPORTS //
        {
            // Node description report
            // nodeDescReport({ isInGroup, graph, andIs, isEdge, isString, describe });

            // System file report
            systemFileReport({ coreNodes, graph, getNames });

            // Graph report
            graphReport({ graph });
        }

        // Recreate links
        exec("rm -rf src/kitsune-core-src");
        exec("mkdir -p src/kitsune-core-src");
        coreNodes.forEach(node => {
            let myNames = getNames({ node });
            if(myNames && myNames.length > 0) {
                try {
                    let cmdStr = "ln -s ../../src/kitsune-core/"+node+" src/kitsune-core-src/"+myNames[0];
                    exec(cmdStr);
                } catch(e) {
                    console.log("Already a link for "+myNames[0]);
                }
            }
        });

        // Sort and save Data
        let sortedGraphData = _.sortBy(graph.find(), ["head", "tail"]);
        let sortedStringData = _.sortBy(string.find(), ["string"]);

        exec("mkdir -p out/data");
        writeData(sortedGraphData, "out/data/graph.js");
        writeData(sortedStringData, "out/data/string.js");
    });
});

// Report functions
function nodeDescReport({ isInGroup, graph, andIs, isEdge, isString, describe }) {
    let isCoreNode = bind({ func: isInGroup, params: { graphFind: graph.find, group: "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3" }});
    let isSystemFile = bind({ func: isInGroup, params: { graphFind: graph.find, group: "66564ec14ed18fb88965140fc644d7b813121c78" }});
    let isInNameGroup = bind({ func: isInGroup, params: { graphFind: graph.find, group: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0" }});
    let isNameEdge = bind({ func: andIs, params: { types: [ isEdge, isInNameGroup ] }});

    let typeMap = { isEdge, isString, isCoreNode, isSystemFile, isNameEdge };
    let nodeList = graph.listNodes();

    nodeList.forEach(node => {
        let types = describe({ node: node, types: typeMap });
        console.log(node+" => "+JSON.stringify(types));
    });
}

function systemFileReport({ coreNodes, graph, getNames }) {
    console.log("=== System File Report ===");
    console.log("System files: "+coreNodes.length);

    let group = graph.find({ where: { head: "66564ec14ed18fb88965140fc644d7b813121c78" } });
    let systemFiles = group.map(x => x.tail).sort();

    coreNodes.forEach(node => {
        let isInGroup = systemFiles.indexOf(node) != -1;
        let myNames = getNames({ node });
        let nameStr = myNames ? JSON.stringify(myNames) : "[]";
        console.log("["+(isInGroup ? "X" : " ")+"] "+node+": "+nameStr);
    });
}

function graphReport({ graph }) {
    let edges = graph.find();
    let nodes = graph.listNodes();
    let nodePercent = (edges.length/nodes.length*100).toPrecision(4);

    console.log("== Graph Report ==");
    console.log("Nodes: "+nodes.length);
    console.log("Edges: "+edges.length+" ("+nodePercent+"%)");
    console.log("==================");
}

// Local utils - don't need to make system files out of these
function _createSystemFile({ graphAutoPut, nameFn, name }) {
    let newSystemId = createId();
    exec("cp src/kitsune-core/ddfe7d402ff26c18785bcc899fa69183b3170a7d src/kitsune-core/"+newSystemId);
    graphAutoPut({ head: "66564ec14ed18fb88965140fc644d7b813121c78", tail: newSystemId });
    nameFn({ node: newSystemId, name: name });
}

function removeName({ tail, graphFactor, graphRemove }) {
        let fac = graphFactor({ tail });
        graphRemove({ id: fac[0].id });
        graphRemove({ id: fac[0].typeEdge });
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

function writeData(data, filename) {
    data = cleanLoki(data);
    let json = JSON.stringify(data, null, 2);
    let finalData = wrapData(json);
    fs.writeFileSync(filename, finalData);
}
