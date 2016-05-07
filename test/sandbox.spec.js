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

        let lokiColl = loader({ id: "0741c54e604ad973eb41c02ab59c5aabdf2c6bc3" }); // loki-collection
        let lokiPut = loader({ id: "f45ccdaba9fdca2234be7ded1a5578dd17c2374e" }); // loki-put
        let lokiFind = loader({ id: "30dee1b715bcfe60afeaadbb0e3e66019140686a" }); // loki-find
        let autoParam = loader({ id: "b69aeff3eb1a14156b1a9c52652544bcf89761e2" }); // auto-param

        let graphFactor = loader({ id: "4163d1cd63d3949b79c37223bd7da04ad6cd36c8" }); // graph-factor
        let getNames = loader({ id: "81e0ef7e2fae9ccc6e0e3f79ebf0c9e14d88d266" }); // getNames

        // INIT DATA SYSTEMS
        var data = { graph: graphData(), string: stringData() };

        data = _.mapValues(data, (dataSet, systemName) => {
            // Create loki collection
            let coll = lokiColl();

            // Bind dataSystem functions
            let control = {};
            control.put = bind({ func: lokiPut, params: { db: coll }});

            let find = bind({ func: lokiFind, params: { db: coll }});
            control.find = autoParam({ func: find, paramName: "where" });

            control.coll = coll;

            // Insert data
            dataSet.forEach(value => {
                control.put({ element: value });
            });

            return control;
        });

        let { graph, string } = data;

        // Auto load systems
        graph.factor = bind({ func: graphFactor, params: { graphFind: graph.find }});
        getNames = bind({ func: getNames, params: { graphFactor: graph.factor, stringFind: string.find }});

        let group = graph.find({ head: "66564ec14ed18fb88965140fc644d7b813121c78" });
        let groupIds = _.map(group, "tail");

        let systems = {};
        let systemsByName = {};
        groupIds.forEach(id => {
            let names = getNames({ node: id });
            let system = loader({ id });

            systems[id] = system;

            names.forEach(name => {
                let camelName = name
                        .replace(/-(.)/g, capture => capture.toUpperCase())
                        .replace(/-/g, '');
                systemsByName[camelName] = system;
            });
        });

        // Build systems
        let {
            lokiRemove,
            graphAutoPut,
            graphAssign,
            graphListNodes,
            stringAutoPut,
            name,
            isInCollection,
            describeNode,
            isInGroup,
            andIs,
            groupList
        } = systemsByName;

        graph.remove = bind({ func: lokiRemove, params: { db: graph.coll }});
        graph.autoPut = bind({ func: graphAutoPut, params: { graphPut: graph.put }});
        graph.assign = bind({ func: graphAssign, params: { graphAutoPut: graph.autoPut }});
        graph.listNodes = bind({ func: graphListNodes, params: { graphFind: graph.find }});

        string.remove = bind({ func: lokiRemove, params: { db: string.coll }});
        string.autoPut = bind({ func: stringAutoPut, params: { stringFind: string.find, stringPut: string.put }});

        name = bind({ func: name, params: { stringAutoPut: string.autoPut, graphAssign: graph.assign }});
        groupList = bind({ func: groupList, params: { graphFind: graph.find }});

        let createSystemFile = bind({ func: _createSystemFile, params: { graphAutoPut: graph.autoPut, nameFn: name }});
        let removeName = bind({ func: _removeName, params: { stringFind: string.find, graphFactor: graph.factor, graphRemove: graph.remove }});
        let isEdge = bind({ func: isInCollection, params: { collFind: graph.find }});
        let isString = bind({ func: isInCollection, params: { collFind: string.find }});

        // Execute systems
        // createSystemFile({ name: "rename" });
        // createSystemFile({ name: "removeName" });

        console.log(getNames({ node: "d2f544f574dae26adb5ed3ee70c71e302b2575fa" }));
        name({ node: "d2f544f574dae26adb5ed3ee70c71e302b2575fa", name: "another-name" });
        name({ node: "d2f544f574dae26adb5ed3ee70c71e302b2575fa", name: "one-more" });
        console.log(getNames({ node: "d2f544f574dae26adb5ed3ee70c71e302b2575fa" }));
        removeName({ node: "d2f544f574dae26adb5ed3ee70c71e302b2575fa", name: "another-name" });
        console.log(getNames({ node: "d2f544f574dae26adb5ed3ee70c71e302b2575fa" }));
        removeName({ node: "d2f544f574dae26adb5ed3ee70c71e302b2575fa", name: "one-more" });
        console.log(getNames({ node: "d2f544f574dae26adb5ed3ee70c71e302b2575fa" }));

        let coreNodes = fs.readdirSync("node_modules/kitsune-core");
        // REPORTS //
        {
            // nodeDescReport({ bind, isInGroup, graph, andIs, isEdge, isString, describeNode });
            coreNodeReport({ groupList, getNames });
            systemFileReport({ coreNodes, groupList, getNames });
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

function _removeName({ node, name, stringFind, graphFactor, graphRemove }) {
    let stringNode = stringFind({ string: name });
    if(stringNode.length === 0)
        return;

    stringNode = stringNode[0].id;

    let fac = graphFactor({ head: stringNode, tail: node });
    if(fac.length === 0)
        return;

    fac = fac[0];

    graphRemove({ id: fac.id });
    graphRemove({ id: fac.typeEdge });
}

// Report functions
function coreNodeReport({ groupList, getNames }) {
    console.log("=== Core Node Report ===");
    let coreNodes = groupList({ group: "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3" });
    coreNodes.forEach(node => {
        let names = getNames({ node: node });
        console.log(`${node}: ${JSON.stringify(names)}`);
    });
}

function nodeDescReport({ bind, isInGroup, graph, andIs, isEdge, isString, describeNode }) {
    let isCoreNode = bind({ func: isInGroup, params: { graphFind: graph.find, group: "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3" }});
    let isSystemFile = bind({ func: isInGroup, params: { graphFind: graph.find, group: "66564ec14ed18fb88965140fc644d7b813121c78" }});
    let isInNameGroup = bind({ func: isInGroup, params: { graphFind: graph.find, group: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0" }});
    let isNameEdge = bind({ func: andIs, params: { types: [ isEdge, isInNameGroup ] }});

    let typeMap = { isEdge, isString, isCoreNode, isSystemFile, isNameEdge };
    let nodeList = graph.listNodes();

    nodeList.forEach(node => {
        let types = describeNode({ node: node, types: typeMap });
        console.log(node+" => "+JSON.stringify(types));
    });
}

function systemFileReport({ coreNodes, groupList, getNames }) {
    console.log("=== System File Report ===");
    console.log("System files: "+coreNodes.length);

    let group = groupList({ group: "66564ec14ed18fb88965140fc644d7b813121c78" });
    let systemFiles = group.sort();

    coreNodes.forEach(node => {
        let isInGroup = systemFiles.indexOf(node) != -1;
        let myNames = getNames({ node });
        console.log(`[${isInGroup ? "X" : " "}] ${node}: ${JSON.stringify(myNames)}`);
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

function removeSystemFile({ graphFind, graphRemove, stringFind, stringRemove, groupId,
                            systemFileId, systemFileName, removeName }) {
    let groupEdge = graphFind({ head: "66564ec14ed18fb88965140fc644d7b813121c78",
                                tail: systemFileId });
        graphRemove({ id: groupEdge[0].id });
        removeName({ node: groupEdge[0].tail });
        let stringNode = stringFind({ string: systemFileName });
        stringRemove({ id: stringNode[0].id });
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
