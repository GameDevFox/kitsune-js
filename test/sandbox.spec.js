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

        let _stringReadString = autoParam({ func: string.find, paramName: "id" });
        _stringReadString = returnFirst(_stringReadString);
        string.readString = returnProperty({ func: _stringReadString, propertyName: "string" });

        nameList = bind({ func: nameList, params: { graphFactor: graph.factor, stringReadString: string.readString }});

        let systemFileEdges = graph.find({ head: "66564ec14ed18fb88965140fc644d7b813121c78" });
        let systemFileIds = _.map(systemFileEdges, "tail");

        // Build System List
        let systemList = {};
        var putSystem = function({ systemList, id, system }) {
            if(!id && (!system || !system.id))
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

        putSystem({ id: "08f8db63b1843f7dea016e488bd547555f345c59", system: string.readString });

        // Build systemsByName
        let systemsByName = {};
        _.forEach(systemList, (system, id) => {
            let names = nameList({ node: id });

            names.forEach(name => {
                let camelName = name
                        .replace(/-(.)/g, capture => capture.toUpperCase())
                        .replace(/-/g, '');
                systemsByName[camelName] = system;
            });
        });

        let systems = dictFunc(systemList);
        putSystem({ id: "ab3c2b8f8ef49a450344437801bbadef765caf69", system: systems });

        // Build systems
        let {
            andIs,
            describeNode,
            executeFunction,
            graphAssign,
            graphAutoPut,
            graphListNodes,
            groupList,
            hashInteger,
            hashRandom,
            hashString,
            isInCollection,
            isInGroup,
            lokiRemove,
            name,
            nameRemove,
            readInteger,
            readObject,
            stringAutoPut,
            callNodeFunction
        } = systemsByName;

        // Graph
        graph.readEdge = returnFirst(graph.find);

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

        // Function
        let nodeFunc = bind({ func: callNodeFunction, params: { funcSys: systems }});
        executeFunction = bind({ func: executeFunction, params: { callNodeFunc: callNodeFunction }});

        // Object
        readObject = bind({ func: readObject, params: {
            graphFactor: graph.factor,
            stringReadString: string.readString,
            graphReadEdge: graph.readEdge,
            nodeFunc
        }});
        readObject = autoParam({ func: readObject, paramName: "node" });
        putSystem({ id: "d7f80b3486eee7b142c190a895c5496242519608", system: readObject });

        // Other
        hashRandom = bind({ func: hashRandom, params: { hashString }});

        let createSystemFile = bind({ func: _createSystemFile, params: { graphAutoPut: graph.autoPut, nameFn: name }});
        let createCoreNode = bind({ func: _createCoreNode, params: { graphAutoPut: graph.autoPut, nameFn: name }});
        let cleanStringSystem = bind({ func: _cleanStringSystem, params: { stringFind: string.find, graphListNodes: graph.listNodes, stringRemove: string.remove }});
        let isEdge = bind({ func: isInCollection, params: { collFind: graph.find }});
        let isString = bind({ func: isInCollection, params: { collFind: string.find }});

        let traceAssign = function({ graphReadEdge, assignId }) {
            let typeEdge = graphReadEdge({ id: assignId });
            let edge = graphReadEdge({ id: typeEdge.tail });
            return {
                type: typeEdge.head,
                head: edge.head,
                tail: edge.tail
            };
        };

        // Execute systems
        // createSystemFile({ name: "read-object" });
        // nameRemove({ node: "fdf7d0f2b33dcf6c71a9b91111f83f458161cee2", name: "function-argument" });
        // nameRemove({ node: "4cb8a3c55e8489dfa51211a9295dddeef6f9cfda", name: "function-argument-function" });
        // let edges = graph.find({ head: "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3", tail: ["fdf7d0f2b33dcf6c71a9b91111f83f458161cee2", "4cb8a3c55e8489dfa51211a9295dddeef6f9cfda"] });
        // edges.forEach(edge => graph.remove(edge.id));

        var putObject = function self({ graphAssign, graphAutoPut,
            stringAutoPut, valueMappings, id, object }) {
            // Gather types of all children
            let types = {};
            let invalids = [];
            for(let key in object) {
                let value = object[key];

                let type;
                for(let mKey in valueMappings) {
                    let mapping = valueMappings[mKey];
                    if(mapping.typeFunc(value)) {
                        type = mKey;
                        break;
                    }
                }

                if(type)
                    types[key] = type;
                else
                    invalids.push(key);
            }

            if(invalids.length > 0)
                throw new Error("The following properties can not be stored " +
                    "in the system: " + invalids);

            // Put all values
            for(let key in types) {
                let value = object[key];

                let type = types[key];
                let mapping = valueMappings[type];

                let argId = mapping.putFunc(value);
                let valueId = graphAutoPut({
                    head: mapping.readFuncId,
                    tail: argId
                });

                let nameId = stringAutoPut(key);

                let args = { head: id, type: nameId, tail: valueId };
                graphAssign(args);
            }
        };

        let valueMappings = {
            "integer": {
                typeFunc: _.isInteger,
                putFunc: hashInteger,
                readFuncId: "a3cb3210c4688aabf0772e5a7dec9c9922247194"
            },
            "string": {
                typeFunc: _.isString,
                putFunc: string.autoPut,
                readFuncId: "08f8db63b1843f7dea016e488bd547555f345c59"
            },
            "function": {
                typeFunc: _.isFunction,
                putFunc: value =>  value.id,
                readFuncId: "ab3c2b8f8ef49a450344437801bbadef765caf69"
            },
            "object": {
                typeFunc: _.isPlainObject,
                putFunc: null, // Placeholder
                readFuncId: "d7f80b3486eee7b142c190a895c5496242519608"
            }
        };

        putObject = bind({ func: putObject, params: {
            graphAssign: graph.assign,
            graphAutoPut: graph.autoPut,
            stringAutoPut: string.autoPut,
            valueMappings
        }});
        let autoPutObject = function(object) {
            let id = hashRandom();
            putObject({ id, object });
            return id;
        };

        // Fill Placeholder
        valueMappings.object.putFunc = autoPutObject;

        // RUN THIS AFTER REPORT //
        let afterReports = function() {

            let inObj = {
                name: "james",
                gold: 2000,
                func: systems,
                sub: {
                    final: {
                        last: "thing",
                        what: "up",
                        code: 123
                    },
                    another: "one"
                }
            };
            putObject({
                id: "e3d8797320e82983ccf0293c1fbf1429de9abd44",
                object: inObj
            });

            let outObj = readObject("e3d8797320e82983ccf0293c1fbf1429de9abd44");
            console.log(outObj);

            console.log(_.isEqual(inObj, outObj));

            // let a = nodeFunc({ funcId: "08f8db63b1843f7dea016e488bd547555f345c59", argId: "b4239885728788227d10ced1e59da66130eaea8f" });
            // console.log(a);
            //
            // let str = string.readString("b4239885728788227d10ced1e59da66130eaea8f");
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
