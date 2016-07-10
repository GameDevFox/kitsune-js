import { execSync as exec } from "child_process";
import fs from "fs";

import _ from "lodash";
import { expect } from "chai";

import systemLoader from "kitsune-core/31d21eb2620a8f353a250ad2edd4587958faf3b1"; // system-loader

// STEP 1
function buildLoader({ bind, autoParam }) {
    // INIT LOADER SYSTEM - already loaded, just here for reference
    // let systemLoaderId = "31d21eb2620a8f353a250ad2edd4587958faf3b1"; // system-loader
    let loader = bind({ func: systemLoader, params: { path: "kitsune-core" }});
    loader = autoParam({ func: loader, paramName: "id" });

    return loader;
}

// STEP 2
function buildCache({ loader, bind }) {
    let systemList = {};

    let dictFunc = loader("30c8959d5d7804fb80cc9236edec97e04e5c4c3d"); // dictionary-function
    let cache = dictFunc(systemList);

    var putSystem = loader("d1e484530280752dd99b7e64a854f96cf66dd502"); // put-system
    putSystem = bind({ func: putSystem, params: { systemList }});

    return { cache, putSystem };
}

// STEP 3
function buildCore({ cache, modules, putSystem, bind, autoParam }) {
    let systems = function({ cache, modules, id }) {

        let system = cache(id);

        if(!system) {
            for(let key in modules) {
                let module = modules[key];
                system = module(id);

                if(system)
                    break;
            }
            putSystem({ id, system });
        }
        return system;
    };
    systems = bind({ func: systems, params: { cache, modules }});
    systems = autoParam({ func: systems, paramName: "id" });

    return systems;
}

// STEP 4
function loadDataSystems({ loader, bind, autoParam, putSystem }) {

    let graphData = loader("24c045b912918d65c9e9aaea9993e9ab56f50d2e"); // graph-data
    let stringData = loader("1cd179d6e63660fba96d54fe71693d1923e3f4f1"); // string-data

    let lokiColl = loader("0741c54e604ad973eb41c02ab59c5aabdf2c6bc3"); // loki-collection
    let lokiPut = loader("f45ccdaba9fdca2234be7ded1a5578dd17c2374e"); // loki-put
    let lokiFind = loader("30dee1b715bcfe60afeaadbb0e3e66019140686a"); // loki-find

    let valueFunc = loader("62126ce823b700cf7441b5179a3848149c9d8c89"); // value-function

    var insertData = function({ data, put }) {
        data().forEach(value => {
            put({ element: value });
        });
    };

    // Graph
    let graphColl = lokiColl();
    putSystem({ id: "adf6b91bb7c0472237e4764c044733c4328b1e55", system: valueFunc(graphColl) });
    let graphPut = bind({ func: lokiPut, params: { db: graphColl }});
    putSystem({ id: "7e5e764e118960318d513920a0f33e4c5ae64b50", system: graphPut });
        let graphFind = bind({ func: lokiFind, params: { db: graphColl }});
    graphFind = autoParam({ func: graphFind, paramName: "where" });
    putSystem({ id: "a1e815356dceab7fded042f3032925489407c93e", system: graphFind });
    insertData({ data: graphData, put: graphPut });

    // String
    let stringColl = lokiColl();
    let stringPut = bind({ func: lokiPut, params: { db: stringColl }});
    putSystem({ id: "b4cdd85ce19700c7ef631dc7e4a320d0ed1fd385", system: stringPut });
        let stringFind = bind({ func: lokiFind, params: { db: stringColl }});
    stringFind = autoParam({ func: stringFind, paramName: "where" });
    putSystem({ id: "8b1f2122a8c08b5c1314b3f42a9f462e35db05f7", system: stringFind });
    insertData({ data: stringData, put: stringPut });
    putSystem({ id: "ce6de1160131bddb4e214f52e895a68583105133", system: valueFunc(stringColl) });

    return { graphFind, stringPut, stringFind };
}

function bootstrap() {

    // STEP 1: LOADER
    let bind = systemLoader({ path: "kitsune-core", id: "878c8ef64d31a194159765945fc460cb6b3f486f" }); // bind
    let autoParam = systemLoader({ path: "kitsune-core", id: "b69aeff3eb1a14156b1a9c52652544bcf89761e2" }); // auto-param
    let loader = buildLoader({ bind, autoParam });

    // STEP 2: CACHE MODULE
    let { cache, putSystem } = buildCache({ loader, bind });
    putSystem({ id: "a26808f06030bb4c165ecbfe43d9d200672a0878", system: putSystem });

    // STEP 3: CREATE CORE
    let modules = [loader];
    let systems = buildCore({ cache, modules, putSystem, bind, autoParam });
    putSystem({ id: "ab3c2b8f8ef49a450344437801bbadef765caf69", system: systems });

    // STEP 4: DATA FUNCTIONS
    // TODO: See which of these are IMMEDIATELY nessisary
    let {
        graphFind, stringPut, stringFind
    } = loadDataSystems({ loader, bind, autoParam, putSystem });

        let stringAutoPut = loader("8f8b523b9a05a55bfdffbf14187ecae2bf7fe87f");
        stringAutoPut = bind({ func: stringAutoPut, params: { stringFind, stringPut }});
    stringAutoPut = autoParam({ func: stringAutoPut, paramName: "string" });
    putSystem({ id: "4e63843a9bee61351b80fac49f4182bd582907b4", system: stringAutoPut });
        let graphFactor = loader("4163d1cd63d3949b79c37223bd7da04ad6cd36c8"); // graph-factor
    graphFactor = bind({ func: graphFactor, params: { graphFind }});
    putSystem({ id: "c83cd0ab78a1d57609f9224f851bde6d230711d0", system: graphFactor });

    // STEP 6: NAME LOADER
        // TODO: Fix this or simplify, we just need the hash of the string instead of "stringAutoPut"
        let nameListIds = function({ stringAutoPut, graphFactor, name }) {
            let nameId = stringAutoPut(name);
            let factor = graphFactor({ type: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0", head: nameId });
            let result = factor.map(node => node.tail);
            return result;
        };
        nameListIds = bind({ func: nameListIds, params: { stringAutoPut, graphFactor }});
    nameListIds = autoParam({ func: nameListIds, paramName: "name" });

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

    return { systems, modules, nameLoader };
}

describe("sandbox", function() {
    it.only("should have sand in it", function() {

        console.log("== BOOTSTRAP ==");
        let { systems, modules, nameLoader } = bootstrap();

        let putSystem = systems("a26808f06030bb4c165ecbfe43d9d200672a0878");

        let bind = nameLoader("bind");
        let autoParam = nameLoader("auto-param");

        // Graph
        let returnFirst = nameLoader("return-first");
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");
            let graphReadEdge = returnFirst(graphFind);
        graphReadEdge = autoParam({ func: graphReadEdge, paramName: "id" });

            let graphAutoPut = nameLoader("graph-autoPut");
            let graphPut = systems("7e5e764e118960318d513920a0f33e4c5ae64b50");
        graphAutoPut = bind({ func: graphAutoPut, params: { graphPut }});
            let graphAssign = nameLoader("graph-assign");
        graphAssign = bind({ func: graphAssign, params: { graphAutoPut }});

        // Name
            // TODO: Fix this -> let name = nameLoader("name");
            let name = systems("ddfe7d402ff26c18785bcc899fa69183b3170a7d");
            let stringAutoPut = systems("4e63843a9bee61351b80fac49f4182bd582907b4");
        name = bind({ func: name, params: { stringAutoPut, graphAssign }});

        // Function
            let callNodeFunction = nameLoader("call-node-function");
        let nodeFunc = bind({ func: callNodeFunction, params: { funcSys: systems }});
            let executeFunction = nameLoader("execute-function");
        executeFunction = bind({ func: executeFunction, params: {
            callNodeFunc: callNodeFunction, funcSys: systems }});

        // Object
            let hashInteger = nameLoader("hash-integer");
        let typeMappings = createTypeMappings({ hashInteger, stringAutoPut });
            let objectPut = nameLoader("object-put");
        objectPut = bind({ func: objectPut, params: { graphAssign, graphAutoPut,
            stringAutoPut, typeMappings }});
        let objectAutoPut = function(object) {
            let id = hashRandom();
            objectPut({ id, object });
            return id;
        };
        typeMappings.object.putFunc = objectAutoPut; // Fill Placeholder

            let stringFind = systems("8b1f2122a8c08b5c1314b3f42a9f462e35db05f7");
            let stringReadString = autoParam({ func: stringFind, paramName: "id" });
            stringReadString = returnFirst(stringReadString);
            let returnProperty = systems("c1020aea14a46b72c6f8a4b7fa57acc14a73a64e"); // return-property
        stringReadString = returnProperty({ func: stringReadString, propertyName: "string" });
        putSystem({ id: "08f8db63b1843f7dea016e488bd547555f345c59", system: stringReadString });

            let readObject = nameLoader("read-object");
            let graphFactor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");
            readObject = bind({ func: readObject, params: { graphFactor, stringReadString,
                graphReadEdge, nodeFunc }});
        readObject = autoParam({ func: readObject, paramName: "node" });
        putSystem({ id: "d7f80b3486eee7b142c190a895c5496242519608", system: readObject });

        // Other
            let hashRandom = nameLoader("hash-random");
            let hashString = nameLoader("hash-string");
        hashRandom = bind({ func: hashRandom, params: { hashString }});

            let readAssign = nameLoader("read-assign");
            readAssign = bind({ func: readAssign, params: { graphReadEdge }});
        readAssign = autoParam({ func: readAssign, paramName: "id" });

        // LOWER //
        // Low priority //
            let lokiRemove = nameLoader("loki-remove");
            let graphColl = systems("adf6b91bb7c0472237e4764c044733c4328b1e55");
            let graphRemove = bind({ func: lokiRemove, params: { db: graphColl }});
        graphRemove = autoParam({ func: graphRemove, paramName: "id" });
            let graphListNodes = nameLoader("graph-list-nodes");
        graphListNodes = bind({ func: graphListNodes, params: { graphFind }});

            let stringGetId = autoParam({ func: stringFind, paramName: "string" });
            stringGetId = returnFirst(stringGetId);
        stringGetId = returnProperty({ func: stringGetId, propertyName: "id" });
            let stringColl = systems("ce6de1160131bddb4e214f52e895a68583105133");
        let stringRemove = bind({ func: lokiRemove, params: { db: stringColl }});

            let groupList = nameLoader("group-list");
            groupList = bind({ func: groupList, params: { graphFind }});
        groupList = autoParam({ func: groupList, paramName: "group" });

            let nameRemove = nameLoader("name-remove");
        nameRemove = bind({ func: nameRemove, params: { stringGetId, graphFactor, graphRemove }});

        // Write func call Stuff
            let writeValue = nameLoader("write-value");
            writeValue = bind({ func: writeValue, params: { typeMappings }});
        writeValue = autoParam({ func: writeValue, paramName: "value" });

        let writeFuncCall = function({ writeValue, graphAssign, func, param }) {
            if(typeof func == "function")
                func = func.id;

            if(!func)
                throw new Error("funcId must not be null or must have an id");

            let ref = writeValue(param);

            let args = { head: ref.funcId, type: func, tail: ref.id };
            let result = graphAssign(args);

            return result;
        };
        writeFuncCall = bind({ func: writeFuncCall, params: { writeValue, graphAssign }});

        let writeAndNameFuncCall = function({ writeFuncCall, nameFn, func, param, name }) {
            let id = writeFuncCall({ func, param });
            graphAutoPut({ head: "d2cd5a6f99428baaa05394cf1fe3afa17fb59aff", tail: id });
            nameFn({ node: id, name });
            return id;
        };
        writeAndNameFuncCall = bind({ func: writeAndNameFuncCall, params: { writeFuncCall, nameFn: name }});

        // Report Stuff
            let nameList = systems("81e0ef7e2fae9ccc6e0e3f79ebf0c9e14d88d266"); // name-list
            nameList = bind({ func: nameList, params: { graphFactor, stringReadString }});
        nameList = autoParam({ func: nameList, paramName: "node" });

        let isInCollection = nameLoader("is-in-collection");
        let isEdge = bind({ func: isInCollection, params: { collFind: graphFind }});
        let isString = bind({ func: isInCollection, params: { collFind: stringFind }});

        let createSystemFile = bind({ func: _createSystemFile, params: { hashRandom, graphAutoPut, nameFn: name }});
        let createCoreNode = bind({ func: _createCoreNode, params: { graphAutoPut, nameFn: name }});
        let cleanStringSystem = bind({ func: _cleanStringSystem, params: { stringFind, graphListNodes, stringRemove }});

        // OUTER SCOPE //
        let node;
        let nodeSearch;
        let graphFindOneId;
        let readEdgeId;
        /////////////////

        // createSystemFile({ name: "write-value" });
        // nameRemove({ node: "eed13556a72cf02a35da377d6d074fe39c3b59c4", name: "object-put" });
        // name({ node: "eed13556a72cf02a35da377d6d074fe39c3b59c4", name: "write-object" });
        // let edges = graphFind({ head: "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3", tail: ["fdf7d0f2b33dcf6c71a9b91111f83f458161cee2", "4cb8a3c55e8489dfa51211a9295dddeef6f9cfda"] });
        // edges.forEach(edge => graphRemove(edge.id));

        // BEFORE REPORT //
        let beforeReports = function() {

            putSystem({ id: "cfcb898db1a24d50ed7254644ff75aba4fb5c5f8", system: console.log });

            // Create function calls
            graphFindOneId = writeAndNameFuncCall({ func: returnFirst,
                param: graphFind,
                name: "graph-find-one" });
            let fRef = nameLoader("function-reference");
            readEdgeId = writeAndNameFuncCall({ func: autoParam,
                param: { func: fRef(graphFindOneId), paramName: "id" },
                name: "read-edge" });

            let graphRemoveBind = writeAndNameFuncCall({ func: bind,
                param: { func: lokiRemove, params: { db: graphColl }},
                name: "graph-remove-bind" });
            let graphRemove = writeAndNameFuncCall({ func: autoParam,
                param: { func: fRef(graphRemoveBind), paramName: "id" },
                name: "graph-remove" });

            // Loading function calls
                let readFuncCall = nameLoader("read-function-call");
                readFuncCall = bind({ func: readFuncCall, params: { readAssign }});
            readFuncCall = autoParam({ func: readFuncCall, paramName: "id" });

                let loadSystem = function({ readFuncCall, executeFunction, id }) {
                    let funcCall = readFuncCall(id);
                    let func = executeFunction(funcCall);

                    return func;
                };
                loadSystem = bind({ func: loadSystem, params: { readFuncCall, executeFunction }});
            loadSystem = autoParam({ func: loadSystem, paramName: "id" });

                let funcCallSystems = function({ loadSystem, putSystem, id }) {
                    let system = loadSystem(id);

                    if(system)
                        putSystem({ id, system });

                    return system;
                };
                funcCallSystems = bind({ func: funcCallSystems, params: {
                    loadSystem,
                    putSystem
                }});
            funcCallSystems = autoParam({ func: funcCallSystems, paramName: "id" });
            modules.splice(0, 0, funcCallSystems);

            nodeSearch = {
                head: "66564ec14ed18fb88965140fc644d7b813121c78",
                tail: "2f7ff34b09a1fb23b9a5d4fbdd8bb44abbe2007a"
            };
            node = graphFind(nodeSearch)[0];
            // let myGraphRemove = systems(graphRemove);
            // myGraphRemove(node.id);
        };
        /////////////////////

        // AFTER REPORT //
        let afterReports = function() {
            console.log(node.id);

            let edge = graphFind(nodeSearch)[0];
            console.log(edge);

            let graphFindOne = systems(graphFindOneId);
            console.log(graphFindOne(nodeSearch));

            let readEdge = systems(readEdgeId);
            console.log(readEdge(node.id));
        };
        ///////////////////////////

        // REPORTS //
        console.log("== BEFORE REPORTS ==");
        beforeReports();
        let coreNodes = fs.readdirSync("node_modules/kitsune-core");
        {
            // nodeDescReport({ bind, isInGroup, graph, andIs, isEdge, isString, describeNode });
            coreNodeReport({ groupList, nameList });
            functionCallReport({ groupList, nameList });
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
        let sortedGraphData = _.sortBy(graphFind(), ["head", "tail"]);
        let sortedStringData = _.sortBy(stringFind(), ["string"]);

        exec("mkdir -p out/data");
        writeData(sortedGraphData, "out/data/graph.js");
        writeData(sortedStringData, "out/data/string.js");
    });
});

function recreateLinks({ coreNodes, nameList }) {
    exec("rm -rf src/kitsune-core-src");
    exec("mkdir -p src/kitsune-core-src");
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

// Report functions
function printReport(report) {
    report.forEach(({ node, names }) => {
        console.log(`${node} ${JSON.stringify(names)}`);
    });
}

function coreNodeReport({ groupList, nameList }) {
    console.log("=== Core Node Report ===");
    let report = groupReport({ groupList, nameList, groupId: "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3" });
    printReport(report);
}

function functionCallReport({ groupList, nameList }) {
    console.log("=== Function Call Report ===");
    let report = groupReport({ groupList, nameList, groupId: "d2cd5a6f99428baaa05394cf1fe3afa17fb59aff" });
    printReport(report);
}

function groupReport({ groupList, nameList, groupId }) {
    let coreNodes = groupList(groupId);
    let nodesAndNames = [];
    coreNodes.forEach(node => {
        let names = nameList(node);
        nodesAndNames.push({
            node,
            names
        });
    });

    // Sort by first name
    nodesAndNames = _.sortBy(nodesAndNames, value => {
        return value.names[0];
    });

    return nodesAndNames;
}

function nodeDescReport({ bind, isInGroup, graph, andIs, isEdge, isString, describeNode }) {
    let isCoreNode = bind({ func: isInGroup, params: { graphFind, group: "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3" }});
    let isSystemFile = bind({ func: isInGroup, params: { graphFind, group: "66564ec14ed18fb88965140fc644d7b813121c78" }});
    let isInNameGroup = bind({ func: isInGroup, params: { graphFind, group: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0" }});
    let isNameEdge = bind({ func: andIs, params: { types: [ isEdge, isInNameGroup ] }});

    let typeMap = { isEdge, isString, isCoreNode, isSystemFile, isNameEdge };
    let nodeList = graphListNodes();

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
        let myNames = nameList(node);
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
    let edges = graphFind();
    let nodes = graphListNodes();
    let nodePercent = (edges.length/nodes.length*100).toPrecision(4);

    console.log("== Graph Report ==");
    console.log("Nodes: "+nodes.length);
    console.log("Edges: "+edges.length+" ("+nodePercent+"%)");
}

function stringReport({ string }) {
    let strings = stringFind();

    console.log("== String Report ==");
    strings.forEach(value => {
        console.log(`${value.id} => ${value.string}`);
    });
}

// Local utils - don't need to make system files out of these
function _createSystemFile({ hashRandom, graphAutoPut, nameFn, name }) {
    let newSystemId = hashRandom();
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

function hyphenNameToCamelCase(name) {
    let result = name
            .replace(/-(.)/g, capture => capture.toUpperCase())
            .replace(/-/g, '');
    return result;
}

function createTypeMappings({ hashInteger, stringAutoPut }) {

    return {
        "integer": {
            typeFunc: _.isInteger,
            putFunc: hashInteger,
            readFuncId: "a3cb3210c4688aabf0772e5a7dec9c9922247194"
        },
        "string": {
            typeFunc: _.isString,
            putFunc: stringAutoPut,
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
}
