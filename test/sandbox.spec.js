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
        let dictFunc = loader("30c8959d5d7804fb80cc9236edec97e04e5c4c3d"); // dictionary-function
        let graphData = loader("24c045b912918d65c9e9aaea9993e9ab56f50d2e"); // graph-data
        let graphFactor = loader("4163d1cd63d3949b79c37223bd7da04ad6cd36c8"); // graph-factor
        let lokiColl = loader("0741c54e604ad973eb41c02ab59c5aabdf2c6bc3"); // loki-collection
        let lokiFind = loader("30dee1b715bcfe60afeaadbb0e3e66019140686a"); // loki-find
        let lokiPut = loader("f45ccdaba9fdca2234be7ded1a5578dd17c2374e"); // loki-put
        let nameList = loader("81e0ef7e2fae9ccc6e0e3f79ebf0c9e14d88d266"); // nameList
        let returnFirst = loader("68d3fb9d10ae2b0455a33f2bfb80543c4f137d51"); // return-first
        let returnProperty = loader("c1020aea14a46b72c6f8a4b7fa57acc14a73a64e"); // return-property
        let stringData = loader("1cd179d6e63660fba96d54fe71693d1923e3f4f1"); // string-data
        let value = loader("4c135d591fc67df7b652431515bd82ac5f31367a"); // value
        let valueFunc = loader("62126ce823b700cf7441b5179a3848149c9d8c89"); // value-function

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

            control.coll = valueFunc(coll);

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

        let systemFileEdges = graph.find({ head: "66564ec14ed18fb88965140fc644d7b813121c78" });
        let systemFileIds = _.map(systemFileEdges, "tail");

        // Build System List
        let systemList = {};
        var putSystem = function({ systemList, id, system }) {
            if(!id && !system.id)
                throw new Error("No id found in param or on system");

            if(!system.id)
                system.id = id;
            else
                id = system.id;

            systemList[id] = system;
        };
        putSystem = bind({ func: putSystem, params: { systemList }});

        // Load systems into list
        _.each(systemFileIds, id => {
            let system = loader(id);
            putSystem({ id, system });
        });

        // Append systemList with "home-made" system
        putSystem({ id: "adf6b91bb7c0472237e4764c044733c4328b1e55", system: graph.coll });
        putSystem({ id: "ce6de1160131bddb4e214f52e895a68583105133", system: string.coll });

        putSystem({ id: "7e5e764e118960318d513920a0f33e4c5ae64b50", system: graph.put });
        putSystem({ id: "a1e815356dceab7fded042f3032925489407c93e", system: graph.find });
        putSystem({ id: "b4cdd85ce19700c7ef631dc7e4a320d0ed1fd385", system: string.put });
        putSystem({ id: "8b1f2122a8c08b5c1314b3f42a9f462e35db05f7", system: string.find });

        // putSystem({ id: "a12b68854a0ae8cf1ae2a986aac15677a0aab605", system: valueFunc(graph) });
        // putSystem({ id: "eace59cae90b00e292779b7bd4b18a033598ac73", system: valueFunc(string) });

        // Build systemsByName
        let systemsByName = {};
        _.map(systemList, (system, id) => {
            let names = nameList({ node: id });

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
            hashRandom,
            hashString,
            isInCollection,
            isInGroup,
            lokiRemove,
            name,
            nameRemove,
            stringAutoPut,
            callNodeFunction
        } = systemsByName;

        // Graph
        let graphRemove = bind({ func: lokiRemove, params: { db: graph.coll() }});
        graph.remove = autoParam({ func: graphRemove, paramName: "id" });

        graph.autoPut = bind({ func: graphAutoPut, params: { graphPut: graph.put }});
        graph.assign = bind({ func: graphAssign, params: { graphAutoPut: graph.autoPut }});
        graph.listNodes = bind({ func: graphListNodes, params: { graphFind: graph.find }});

        // String
        let _stringGetId = autoParam({ func: string.find, paramName: "string" });
        _stringGetId = returnFirst(_stringGetId);
        string.getId = returnProperty({ func: _stringGetId, propertyName: "id" });

        string.remove = bind({ func: lokiRemove, params: { db: string.coll() }});
        let _stringAutoPut = bind({ func: stringAutoPut, params: { stringFind: string.find, stringPut: string.put }});
        string.autoPut = autoParam({ func: _stringAutoPut, paramName: "string" });

        // Name
        name = bind({ func: name, params: { stringAutoPut: string.autoPut, graphAssign: graph.assign }});
        nameRemove = bind({ func: nameRemove, params: { stringGetId: string.getId, graphFactor: graph.factor, graphRemove: graph.remove }});

        // Group
        let _groupList = bind({ func: groupList, params: { graphFind: graph.find }});
        groupList = autoParam({ func: _groupList, paramName: "group" });

        // Other
        hashRandom = bind({ func: hashRandom, params: { hashString }});

        let createSystemFile = bind({ func: _createSystemFile, params: { graphAutoPut: graph.autoPut, nameFn: name }});
        let createCoreNode = bind({ func: _createCoreNode, params: { graphAutoPut: graph.autoPut, nameFn: name }});
        let cleanStringSystem = bind({ func: _cleanStringSystem, params: { stringFind: string.find, graphListNodes: graph.listNodes, stringRemove: string.remove }});
        let isEdge = bind({ func: isInCollection, params: { collFind: graph.find }});
        let isString = bind({ func: isInCollection, params: { collFind: string.find }});

        // Function
        let nodeFunc = bind({ func: callNodeFunction, params: { funcSys: systems }});
        executeFunction = bind({ func: executeFunction, params: { callNodeFunc: callNodeFunction }});

        let traceAssign = function({ graphFind, assignId }) {
            let typeEdge = graphFind({ id: assignId })[0];
            let edge = graphFind({ id: typeEdge.tail })[0];
            return {
                type: typeEdge.head,
                head: edge.head,
                tail: edge.tail
            };
        };

        // Execute systems
        // createSystemFile({ name: "hash-random" });
        // nameRemove({ node: "fdf7d0f2b33dcf6c71a9b91111f83f458161cee2", name: "function-argument" });
        // nameRemove({ node: "4cb8a3c55e8489dfa51211a9295dddeef6f9cfda", name: "function-argument-function" });
        // let edges = graph.find({ head: "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3", tail: ["fdf7d0f2b33dcf6c71a9b91111f83f458161cee2", "4cb8a3c55e8489dfa51211a9295dddeef6f9cfda"] });
        // edges.forEach(edge => graph.remove(edge.id));

        // TODO: Automate building "home-made" systems
        putSystem({ id: "08f8db63b1843f7dea016e488bd547555f345c59", system: string.getString });
        putSystem({ id: "ab3c2b8f8ef49a450344437801bbadef765caf69", system: systems });

        var putObject = function self({ graphAssign, stringAutoPut, createId, id, object }) {

            let types = {};
            let invalids = [];
            for(let key in object) {
                let value = object[key];

                if(_.isString(value))
                    types[key] = "string";
                else if(_.isFunction(value))
                    types[key] = "function";
                else if(_.isPlainObject(value))
                    types[key] = "object";
                else
                    invalids.push(key);
            }

            if(invalids.length > 0) {
                throw new Error("The following properties can not be stored " +
                    "in the system: " + invalids);
            }

            for(let key in types) {
                let value = object[key];
                let type = types[key];

                let valueId;
                switch(type) {
                    case "string":
                        let stringId = stringAutoPut(value);
                        valueId = graph.autoPut({
                            head: "08f8db63b1843f7dea016e488bd547555f345c59",
                            tail: stringId
                        });
                        break;
                    case "function":
                        let funcId = value.id;
                        valueId = graph.autoPut({
                            head: "ab3c2b8f8ef49a450344437801bbadef765caf69",
                            tail: funcId
                        });
                        break;
                    // case "object":
                    //     let objId = randomHash();
                    //     self({ graphAssign, stringAutoPut, id: objId, object: value });
                    //     valueId = graph.autoPut({
                    //         head: "ab3c2b8f8ef49a450344437801bbadef765caf69",
                    //         tail: objId
                    //     });
                    //     break;
                }

                let nameId = stringAutoPut(key);
                let args = { head: id, type: nameId, tail: valueId };
                graphAssign(args);
            }
        };

        var getObject = function({ graphFactor, stringGetString, node }) {
            let children = graphFactor({ head: node });

            let result = {};
            children.forEach(child => {
                // Get key
                let key = stringGetString(child.type);

                // Get Value
                let { head, tail } = graph.find({ id: child.tail })[0];
                let value = nodeFunc({ funcId: head, argId: tail });

                result[key] = value;
            });
            return result;
        };


        // RUN THIS AFTER REPORT //
        let afterReports = function() {

            console.log(hashString("hello"));
            console.log(hashString("hello"));
            console.log(hashString("hello2"));

            console.log(hashRandom());
            console.log(hashRandom());
            console.log(hashRandom());

            // let obj = {
            //     name: "james",
            //     partner: "hime",
            //     func: systems
            // };
            // putObject({
            //     graphAssign: graph.assign,
            //     stringAutoPut: string.autoPut,
            //     id: "e3d8797320e82983ccf0293c1fbf1429de9abd44",
            //     object: obj
            // });
            //
            // /////////////////////////////////////
            //
            // let objData = getObject({
            //     graphFactor: graph.factor,
            //     stringGetString: string.getString,
            //     node: "e3d8797320e82983ccf0293c1fbf1429de9abd44"
            // });
            // console.log(objData);
            //
            // console.log((9007199254740991).toString(16));

            // let a = nodeFunc({ funcId: "08f8db63b1843f7dea016e488bd547555f345c59", argId: "b4239885728788227d10ced1e59da66130eaea8f" });
            // console.log(a);
            //
            // let str = string.getString("b4239885728788227d10ced1e59da66130eaea8f");
            // console.log(str);
            //
            // executeFunction({
            //     funcSys: systems,
            //     funcId:     "cfcb898db1a24d50ed7254644ff75aba4fb5c5f8", // log
            //     argFuncId:  "08f8db63b1843f7dea016e488bd547555f345c59",  // stringGetStr
            //     argId:      "7115e9890f5b5cc6914bdfa3b7c011db1cdafedb"  // "test-data" string
            // });

        };
        ///////////////////////////

        let coreNodes = fs.readdirSync("node_modules/kitsune-core");
        // REPORTS //
        {
            // nodeDescReport({ bind, isInGroup, graph, andIs, isEdge, isString, describeNode });
            coreNodeReport({ groupList, nameList });
            systemFileReport({ coreNodes, groupList, nameList });
            // graphReport({ graph });
            // stringReport({ string });
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
        console.log(`${node} ${JSON.stringify(names)}`);
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

function stringReport({ string }) {
    let strings = string.find();

    console.log("== String Report ==");
    strings.forEach(value => {
        console.log(`${value.id} => ${value.string}`);
    });
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
}

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
