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
        let autoParam = loader({ id: "b69aeff3eb1a14156b1a9c52652544bcf89761e2" }); // auto-param

        loader = autoParam({ func: loader, paramName: "id" });

        // MANUAL LOADING
        let graphData = loader("24c045b912918d65c9e9aaea9993e9ab56f50d2e"); // graph-data
        let stringData = loader("1cd179d6e63660fba96d54fe71693d1923e3f4f1"); // string-data

        let lokiColl = loader("0741c54e604ad973eb41c02ab59c5aabdf2c6bc3"); // loki-collection
        let lokiPut = loader("f45ccdaba9fdca2234be7ded1a5578dd17c2374e"); // loki-put
        let lokiFind = loader("30dee1b715bcfe60afeaadbb0e3e66019140686a"); // loki-find

        let graphFactor = loader("4163d1cd63d3949b79c37223bd7da04ad6cd36c8"); // graph-factor
        let nameList = loader("81e0ef7e2fae9ccc6e0e3f79ebf0c9e14d88d266"); // nameList

        let returnFirst = loader("68d3fb9d10ae2b0455a33f2bfb80543c4f137d51"); // return-first
        let returnProperty = loader("c1020aea14a46b72c6f8a4b7fa57acc14a73a64e"); // return-property

        let dictFunc = loader("30c8959d5d7804fb80cc9236edec97e04e5c4c3d"); // dictionary-function

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

        let _stringGetString = autoParam({ func: string.find, paramName: "id" });
        _stringGetString = returnFirst(_stringGetString);
        string.getString = returnProperty({ func: _stringGetString, propertyName: "string" });

        nameList = bind({ func: nameList, params: { graphFactor: graph.factor, stringGetString: string.getString }});

        let group = graph.find({ head: "66564ec14ed18fb88965140fc644d7b813121c78" });
        let groupIds = _.map(group, "tail");

        let systemList = {};
        let systemsByName = {};
        groupIds.forEach(id => {
            let names = nameList({ node: id });
            let system = loader(id);

            systemList[id] = system;

            names.forEach(name => {
                let camelName = name
                        .replace(/-(.)/g, capture => capture.toUpperCase())
                        .replace(/-/g, '');
                systemsByName[camelName] = system;
            });
        });
        let systems = dictFunc(systemList);

        // Build systems
        let {
            andIs,
            describeNode,
            executeFunction,
            graphAssign,
            graphAutoPut,
            graphListNodes,
            groupList,
            isInCollection,
            isInGroup,
            lokiRemove,
            name,
            nameRemove,
            stringAutoPut,
            callNodeFunction
        } = systemsByName;

        let graphRemove = bind({ func: lokiRemove, params: { db: graph.coll }});
        graph.remove = autoParam({ func: graphRemove, paramName: "id" });

        graph.autoPut = bind({ func: graphAutoPut, params: { graphPut: graph.put }});
        graph.assign = bind({ func: graphAssign, params: { graphAutoPut: graph.autoPut }});
        graph.listNodes = bind({ func: graphListNodes, params: { graphFind: graph.find }});

        let _stringGetId = autoParam({ func: string.find, paramName: "string" });
        _stringGetId = returnFirst(_stringGetId);
        string.getId = returnProperty({ func: _stringGetId, propertyName: "id" });

        string.remove = bind({ func: lokiRemove, params: { db: string.coll }});
        let _stringAutoPut = bind({ func: stringAutoPut, params: { stringFind: string.find, stringPut: string.put }});
        string.autoPut = autoParam({ func: _stringAutoPut, paramName: "string" });

        name = bind({ func: name, params: { stringAutoPut: string.autoPut, graphAssign: graph.assign }});
        nameRemove = bind({ func: nameRemove, params: { stringGetId: string.getId, graphFactor: graph.factor, graphRemove: graph.remove }});

        let _groupList = bind({ func: groupList, params: { graphFind: graph.find }});
        groupList = autoParam({ func: _groupList, paramName: "group" });

        let createSystemFile = bind({ func: _createSystemFile, params: { graphAutoPut: graph.autoPut, nameFn: name }});
        let createCoreNode = bind({ func: _createCoreNode, params: { graphAutoPut: graph.autoPut, nameFn: name }});
        let cleanStringSystem = bind({ func: _cleanStringSystem, params: { stringFind: string.find, graphListNodes: graph.listNodes, stringRemove: string.remove }});
        let isEdge = bind({ func: isInCollection, params: { collFind: graph.find }});
        let isString = bind({ func: isInCollection, params: { collFind: string.find }});

        executeFunction = bind({ func: executeFunction, params: { callNodeFunc: callNodeFunction }});

        // Execute systems
        // createSystemFile({ name: "exec-func" });

        // Append systemList with "home-made" system
        // TODO: Automate building "home-made" systems
        systemList["08f8db63b1843f7dea016e488bd547555f345c59"] = string.getString;

        // createCoreNode({ node: "fdf7d0f2b33dcf6c71a9b91111f83f458161cee2", name: "function-argument" });
        // createCoreNode({ node: "4cb8a3c55e8489dfa51211a9295dddeef6f9cfda", name: "function-argument-function" });

        let afterReports = function() {
            executeFunction({
                funcSys: systems,
                funcId:     "cfcb898db1a24d50ed7254644ff75aba4fb5c5f8", // log
                argFuncId:  "08f8db63b1843f7dea016e488bd547555f345c59",  // stringGetStr
                argId:      "7115e9890f5b5cc6914bdfa3b7c011db1cdafedb"  // "test-data" string
            });
        };

        // console.log(result);

        // name({ node: "db7ab44b273faf81159baba0e847aaf0e46a406b", name: "execute-function" });
        // nameRemove({ node: "db7ab44b273faf81159baba0e847aaf0e46a406b", name: "exec-func" });
        // cleanStringSystem();

        let coreNodes = fs.readdirSync("node_modules/kitsune-core");
        // REPORTS //
        {
            // nodeDescReport({ bind, isInGroup, graph, andIs, isEdge, isString, describeNode });
            coreNodeReport({ groupList, nameList });
            systemFileReport({ coreNodes, groupList, nameList });
            graphReport({ graph });
        }
        console.log("== AFTER REPORTS ==");
        afterReports();
        console.log("===================");

        // END REPORTS //

        // Recreate links
        recreateLinks({ coreNodes, nameList });

        // Sort and save Data
        let sortedGraphData = _.sortBy(graph.find(), ["head", "tail"]);
        let sortedStringData = _.sortBy(string.find(), ["string"]);

        exec("mkdir -p out/data");
        writeData(sortedGraphData, "out/data/graph.js");
        writeData(sortedStringData, "out/data/string.js");
    });
});

function recreateLinks({ coreNodes, nameList }) {
    exec("rm -rf src/kitsune-core-src");
    exec("mkdir -p src/kitsune-core-src");
    coreNodes.forEach(node => {
        let myNames = nameList({ node });
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

// Report functions
function coreNodeReport({ groupList, nameList }) {
    console.log("=== Core Node Report ===");
    let coreNodes = groupList("7f82d45a6ffb5c345f84237a621de35dd8b7b0e3");
    let nodesAndNames = [];
    coreNodes.forEach(node => {
        let names = nameList({ node: node });
        nodesAndNames.push({
            node,
            names
        });
    });

    // Sort by first name
    nodesAndNames = _.sortBy(nodesAndNames, value => {
        return value.names[0]; 
    });
    
    nodesAndNames.forEach(({ node, names }) => {
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

function systemFileReport({ coreNodes, groupList, nameList }) {
    console.log("=== System File Report ===");
    console.log("System files: "+coreNodes.length);

    let group = groupList("66564ec14ed18fb88965140fc644d7b813121c78");
    let systemFiles = group.sort();

    let list = coreNodes.map(node => {
        let isInGroup = systemFiles.indexOf(node) != -1;
        let myNames = nameList({ node });
        return {
            node,
            isInGroup,
            names: myNames
        };
    });

    list.sort((a, b) => a.names[0].localeCompare(b.names[0]));

    list.forEach(({isInGroup, node, names}) => {
        console.log(`[${isInGroup ? "X" : " "}] ${node} ${JSON.stringify(names)}`);
    });

}

function graphReport({ graph }) {
    let edges = graph.find();
    let nodes = graph.listNodes();
    let nodePercent = (edges.length/nodes.length*100).toPrecision(4);

    console.log("== Graph Report ==");
    console.log("Nodes: "+nodes.length);
    console.log("Edges: "+edges.length+" ("+nodePercent+"%)");
}

// Local utils - don't need to make system files out of these
function _createSystemFile({ graphAutoPut, nameFn, name }) {
    let newSystemId = createId();
    exec("cp src/kitsune-core/ddfe7d402ff26c18785bcc899fa69183b3170a7d src/kitsune-core/"+newSystemId);
    graphAutoPut({ head: "66564ec14ed18fb88965140fc644d7b813121c78", tail: newSystemId });
    nameFn({ node: newSystemId, name: name });
}

function _createCoreNode({ node, name, graphAutoPut, nameFn }) {
    graphAutoPut({ head: "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3", tail: node });
    nameFn({ node: node, name: name });
};

function removeSystemFile({ graphFind, graphRemove, stringFind, stringRemove, groupId,
                            systemFileId, systemFileName, nameRemove }) {
    // TODO: Fix this, it's broken
    let groupEdge = graphFind({ head: "66564ec14ed18fb88965140fc644d7b813121c78",
                                tail: systemFileId });
        graphRemove({ id: groupEdge[0].id });
        nameRemove({ node: groupEdge[0].tail });
        let stringNode = stringFind({ string: systemFileName });
        stringRemove({ id: stringNode[0].id });
}

function _cleanStringSystem({ stringFind, graphListNodes, stringRemove }) {
        let stringIds = stringFind({}).map(value => value.id);
        let graphNodes = graphListNodes();
        let diff = _.difference(stringIds, graphNodes);
        diff.forEach(id => {
            stringRemove({ id });
        });
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
