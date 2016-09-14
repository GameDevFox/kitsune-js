import fs from "fs";
import { execSync as exec } from "child_process";

import _ from "lodash";

function buildManualSystemLoader(systems) {
    let bind = systems("878c8ef64d31a194159765945fc460cb6b3f486f");
    let autoParam = systems("b69aeff3eb1a14156b1a9c52652544bcf89761e2");
    let putSystem = systems("a26808f06030bb4c165ecbfe43d9d200672a0878");

    var manSysFuncs = {};
    let addManSys = function(id, builderFunc) {

        if(typeof id == "object") {
            _.forEach(id, value => {
                manSysFuncs[value] = builderFunc;
            });
        } else
            manSysFuncs[id] = builderFunc;
    };

    var manualSystems = function({ manSysFuncs, systems, putSystem, id }) {

        let result;

        if(manSysFuncs[id]) {
            result = manSysFuncs[id](systems);

            if(typeof result == "object") {
                _.forEach(result, (value, key) => {
                    putSystem({ id: key, system: value });
                });
                result = result[id];
            }
        }

        return result;
    };
    manualSystems = bind({ func: manualSystems, params: { manSysFuncs, systems, putSystem }});
    manualSystems = autoParam({ func: manualSystems, paramName: "id" });

    // TODO: See which of these can be converted to function call systems or bind-functions

    // TODO: Make a loader for native/libary stuff like this (like lodash)
    addManSys("cfcb898db1a24d50ed7254644ff75aba4fb5c5f8", () => console.log);

    // list-manual-systems
    addManSys("12d8b6e0e03d5c6e5d5ddb86bda423d50d172ec8", function(systems) {
        return () => _.keys(manSysFuncs);
    });

    // list-system-files
    addManSys("5277dc011cbc9800046edeb4460f7138e060a935", function(systems) {
        let files = fs.readdirSync("./src/kitsune-core");
        return () => files;
    });

    addManSys("e6ff3d78ebd8f80c8945afd3499195049609905d", function(systems) {
        let readSystemFile = function(id) {
            return fs.readFileSync("./src/kitsune-core/"+id, "utf8");
        };
        return readSystemFile;
    });

    // LOADERS //
    // FOLD

    // Bind func loader
    addManSys("2c677e2c78bede32f66bed87c214e5875c2c685c", function() {
        let bindFuncLoader = function({ isBindFunc, readBindFunc, nameList, bind, id }) {
            if(!isBindFunc(id))
                return null;

            let bindFunc = readBindFunc(id);

            let func = systems(bindFunc.func);
            let params = {};
            for(let i in bindFunc.params) {
                let name = nameList(i)[0];
                let param = systems(bindFunc.params[i]);
                params[name] = param;
            }

            let result = bind({ func, params });
            return result;
        };
        return bindFuncLoader;
    });

    addManSys("9a6b1f2a0bcb5576e5b6347cb113eb2cd16c985a", function() {
        let isBindFunc = systems("03d33fe3603bfa66db338b5768f21a5c90a4e1b8");
        let readBindFunc = systems("4841f107fb76dbf4ac1d29a936b16b7365985ca4");
        let nameList = systems("890b0b96d7d239e2f246ec03b00cb4e8e06ca2c3");
        let bind = systems("878c8ef64d31a194159765945fc460cb6b3f486f");

        let bindFuncLoader = systems("2c677e2c78bede32f66bed87c214e5875c2c685c");
        bindFuncLoader = bind({ func: bindFuncLoader, params: { isBindFunc, readBindFunc, nameList, bind }});
        bindFuncLoader = autoParam({ func: bindFuncLoader, paramName: "id" });
        return bindFuncLoader;
    });

    // Auto param loader
    addManSys("e7077ff12256c2c8da6a200c90899c311caf2cf4", function() {
        let autoParamLoader = function({ isAutoParamFunc, readEdge, readString, autoParam, id }) {
            if(!isAutoParamFunc(id))
                return null;

            let edge = readEdge(id);

            let funcId = edge.head;
            let paramNameId = edge.tail;

            let func = systems(funcId);
            let paramName = readString(paramNameId);
            let result = autoParam({ func, paramName });
            return result;
        };
        return autoParamLoader;
    });

    addManSys("c18b49e9b5d330e1573707e9b3defc6592897522", function() {
        let isAutoParamFunc = systems("dc9959d7b543763255547b16b11e21ae6c3a8209");
        let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");
        let readString = systems("08f8db63b1843f7dea016e488bd547555f345c59");
        let autoParam = systems("b69aeff3eb1a14156b1a9c52652544bcf89761e2");

        let autoParamLoader = systems("e7077ff12256c2c8da6a200c90899c311caf2cf4");
        autoParamLoader = bind({ func: autoParamLoader, params: { isAutoParamFunc, readEdge, readString, autoParam }});
        autoParamLoader = autoParam({ func: autoParamLoader, paramName: "id" });
        return autoParamLoader;
    });
    // END FOLD

    // LOADER DEPENDENCIES //
    // FOLD
    // Dependancies of Bind Function Loader
    addManSys("54988d866ff79e589c5a2b50aeaf720d743c01a4", function() {
        let readBindFunc = function({ readEdge, readNodeObject, id }) {
            let bindFunc = readEdge(id);

            let func = bindFunc.head;
            let paramId = bindFunc.tail;
            let params = readNodeObject(paramId);

            return { func, params };
        };
        return readBindFunc;
    });

    addManSys("4841f107fb76dbf4ac1d29a936b16b7365985ca4", function(systems) {
        let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");
        let readNodeObject = systems("971a9f4b9f8e841b4519d96fa8733311c8b58fe2");

        let readBindFunc = systems("54988d866ff79e589c5a2b50aeaf720d743c01a4");
        readBindFunc = bind({ func: readBindFunc, params: { readEdge, readNodeObject }});
        readBindFunc = autoParam({ func: readBindFunc, paramName: "id" });
        return readBindFunc;
    });

        addManSys("25cff8a2afcf560b5451d2482dbf9d9d69649f26", function(systems) {
            let returnFirst = systems("68d3fb9d10ae2b0455a33f2bfb80543c4f137d51");
            let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

            let readEdge = returnFirst(graphFind);
            readEdge = autoParam({ func: readEdge, paramName: "id" });
            return readEdge;
        });

        addManSys("91ad9a39b3968af9f4418c3066963ce41ee38804", function() {
            let readNodeObject = function({ graphFactor, id }) {
                let result = {};
                let factor = graphFactor({ type: id });
                for(let i in factor) {
                    let key = factor[i].head;
                    let value = factor[i].tail;
                    result[key] = value;
                }
                return result;
            };
            return readNodeObject;
        });

        addManSys("971a9f4b9f8e841b4519d96fa8733311c8b58fe2", function(systems) {
            let graphFactor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");

            let readNodeObject = systems("91ad9a39b3968af9f4418c3066963ce41ee38804");
            readNodeObject = bind({ func: readNodeObject, params: { graphFactor }});
            readNodeObject = autoParam({ func: readNodeObject, paramName: "id" });
            return readNodeObject;
        });

            addManSys("c83cd0ab78a1d57609f9224f851bde6d230711d0", function(systems) {
                let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

                let graphFactor = systems("4163d1cd63d3949b79c37223bd7da04ad6cd36c8");
                graphFactor = bind({ func: graphFactor, params: { graphFind }});
                return graphFactor;
            });

    addManSys("890b0b96d7d239e2f246ec03b00cb4e8e06ca2c3", function(systems) {
        let graphFactor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");
        let stringReadString = systems("08f8db63b1843f7dea016e488bd547555f345c59");

        let nameList = systems("81e0ef7e2fae9ccc6e0e3f79ebf0c9e14d88d266");
        nameList = bind({ func: nameList, params: { graphFactor, stringReadString }});
        nameList = autoParam({ func: nameList, paramName: "node" });
        return nameList;
    });

        addManSys("08f8db63b1843f7dea016e488bd547555f345c59", function(systems) {
            let stringFind = systems("8b1f2122a8c08b5c1314b3f42a9f462e35db05f7");
            let returnFirst = systems("68d3fb9d10ae2b0455a33f2bfb80543c4f137d51");
            let returnProperty = systems("c1020aea14a46b72c6f8a4b7fa57acc14a73a64e");

            let stringReadString = autoParam({ func: stringFind, paramName: "id" });
            stringReadString = returnFirst(stringReadString);
            stringReadString = returnProperty({ func: stringReadString, propertyName: "string" });
            return stringReadString;
        });

    addManSys("03d33fe3603bfa66db338b5768f21a5c90a4e1b8", function(systems) {
        let isInGroup = systems("a3fd8e7c0d51f13671ebbb6f9758833ff6120b42");
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

        let isBindFunc = bind({ func: isInGroup, params: { graphFind, group: "e6429ca88b178bd13982b6ca543c822043b609c6" }});
        isBindFunc = autoParam({ func: isBindFunc, paramName: "node" });
        return isBindFunc;
    });

    addManSys("dc9959d7b543763255547b16b11e21ae6c3a8209", function(systems) {
        let isInGroup = systems("a3fd8e7c0d51f13671ebbb6f9758833ff6120b42");
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

        let isAutoParamFunc = bind({ func: isInGroup, params: { graphFind, group: "01ec9bb984b50b0a7bd0e296004ef1e74ea293a0" }});
        isAutoParamFunc = autoParam({ func: isAutoParamFunc, paramName: "node" });
        return isAutoParamFunc;
    });
    // END FOLD

    addManSys("f7b073eb5ef5680e7ba308eaf289de185f0ec3f7", function(systems) {
        let writeEdge = systems("10ae12f47866d3c8e1d6cfeabb39fcf7e839a220");
        let autoId = systems("e048e5d7d4a4fbc45d5cd0d035982dae2ee768d0");

        let autoWriteEdge = autoId(writeEdge);
        return autoWriteEdge;
    });

    addManSys("8c7d214678ce851d39ebb4a774c9f168bfffe43d", function() {
        let returnFirst = systems("68d3fb9d10ae2b0455a33f2bfb80543c4f137d51");
        let returnProperty = systems("c1020aea14a46b72c6f8a4b7fa57acc14a73a64e");

        stringGetId = returnFirst(stringGetId);
        stringGetId = returnProperty({ func: stringGetId, propertyName: "id" });
        return stringGetId;
    });

    addManSys("fc83ddd594c9b4fa2a44b3b42d8f1824d0f68c3e", function() {
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

        let getHeads = systems("f6886ff48a34c6561cbab13fbfeabc0e6a4bd964");
        getHeads = bind({ func: getHeads, params: { graphFind }});
        getHeads = autoParam({ func: getHeads, paramName: "group" });
        return getHeads;
    });

    addManSys("e048e5d7d4a4fbc45d5cd0d035982dae2ee768d0", function() {
        let hashRandom = systems("bf565ae1309f425b0ab00efa2ba541ae03ad22cf");

        let autoId = systems("d673ba0c8d334d4644375f853e30ad46df514120");
        autoId = bind({ func: autoId, params: { paramName: "id" }});
        autoId = autoParam({ func: autoId, paramName: "func" });
        return autoId;
    });

    addManSys("abd7880e8088fdf6c8e0519ea45a50a603be0687", function() {
        let hashRandom = systems("bf565ae1309f425b0ab00efa2ba541ae03ad22cf");
        let graphAutoPut = systems("f7b073eb5ef5680e7ba308eaf289de185f0ec3f7");
        let name = systems("2885e34819b8a2f043b139bd92b96e484efd6217");

        let createSystemFile = systems("4a24b766f417667abc55a0bcc3a6617a85c73902");
        createSystemFile = bind({ func: createSystemFile, params: { hashRandom, graphAutoPut, nameFn: name }});
        return createSystemFile;
    });

    addManSys("f3db04b0138e827a9b513ab195cc373433407f83", function(systems) {
        let stringFind = systems("8b1f2122a8c08b5c1314b3f42a9f462e35db05f7");
        let graphListNodes = systems("74b1eb95baaf14385cf3a0b1b76198a5cadfa258");
        let stringRemove = systems("6f00c44367d415878955630378683e1463f87aea");

        let cleanStringSystem = systems("d79ba735ae111d7d34457c712cf44519f13e827e");
        cleanStringSystem = bind({ func: cleanStringSystem, params: { stringFind, graphListNodes, stringRemove }});
        return cleanStringSystem;
    });

    addManSys("15b16d6f586760a181f017d264c4808dc0f8bd06", function(systems) {
        let typeMap = systems("4f22989e5edf2634371133db2720b09fc441a141")();

        let describeNode = systems("4bea815e7814aa415569ecd48e5733a19e7777db");
        describeNode = bind({ func: describeNode, params: { types: typeMap }});
        describeNode = autoParam({ func: describeNode, paramName: "node" });
        return describeNode;
    });

    addManSys("f3d18aa9371f876d4264bfe051e5b4e312e90040", function(systems) {
        let graphListNodes = systems("74b1eb95baaf14385cf3a0b1b76198a5cadfa258");
        let describeNode = systems("15b16d6f586760a181f017d264c4808dc0f8bd06");

        let nodeDescReport = systems("c574e6cc383ede7bae894721dbf7f0e19233dbac");
        nodeDescReport = bind({ func: nodeDescReport, params: { systems, graphListNodes, describeNode }});
        return nodeDescReport;
    });

    addManSys("39bedcfba59c016590ddd53ddc7d89268b5340fd", function(systems) {
        let isInGroup = systems("a3fd8e7c0d51f13671ebbb6f9758833ff6120b42");
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

        let isCoreNode = bind({ func: isInGroup, params: { graphFind, group: "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3" }});
        isCoreNode = autoParam({ func: isCoreNode, paramName: "node" });
        return isCoreNode;
    });

    addManSys("b7df76bb3573caba7da57400c412f344cc309978", function(systems) {
        let isInGroup = systems("a3fd8e7c0d51f13671ebbb6f9758833ff6120b42");
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

        let isSystemFile = bind({ func: isInGroup, params: { graphFind, group: "66564ec14ed18fb88965140fc644d7b813121c78" }});
        isSystemFile = autoParam({ func: isSystemFile, paramName: "node" });
        return isSystemFile;
    });

    addManSys("604a2dbd0f19f35564efc9b9ca3d77ac82ea9382", function(systems) {
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");
        let graphListNodes = systems("74b1eb95baaf14385cf3a0b1b76198a5cadfa258");

        let graphReport = systems("de4c22f8bae0d00aad89fe0767d64f38da88a357");
        graphReport = bind({ func: graphReport, params: { graphFind, graphListNodes }});
        return graphReport;
    });

    addManSys("8efd75de58a2802dd9b784d8bc1bdd66aaedd856", function() {
        let stringFind = systems("8b1f2122a8c08b5c1314b3f42a9f462e35db05f7");

        let stringReport = systems("bcf4dfc4210f020178288d9c134cf6e3e94a6d63");
        stringReport = bind({ func: stringReport, params: { stringFind }});
        return stringReport;
    });

    addManSys("8d15cc103c5f3453e8b5ad8cdada2e5d2dde8039", function(systems) {
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");
        let graphListNodes = systems("74b1eb95baaf14385cf3a0b1b76198a5cadfa258");
        let nameList = systems("890b0b96d7d239e2f246ec03b00cb4e8e06ca2c3");
        let describeNode = systems("15b16d6f586760a181f017d264c4808dc0f8bd06");

        let edgeReport = systems("42e9ce26666845ae2855a6ed619b54b8280b415b");
        edgeReport = bind({ func: edgeReport, params: { graphFind, graphListNodes }});
        return edgeReport;
    });

    addManSys("842d244f8e9698d469dc060db0f9c9b4e24c50b0", function(systems) {
        let isInGroup = systems("a3fd8e7c0d51f13671ebbb6f9758833ff6120b42");
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

        let isInNameGroup = bind({ func: isInGroup, params: { graphFind, group: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0" }});
        isInNameGroup = autoParam({ func: isInNameGroup, paramName: "node" });
        return isInNameGroup;
    });

    addManSys("7bee27a3335f7d2e3f562a84b9358b58f49390c1", function(systems) {
        let andIs = systems("90184a3d0c84658aac411637f7442f80b3fe0040");
        let isEdge = systems("20bfa138672de625230eef7faebe0e10ba6a49d0");
        let isInNameGroup = systems("842d244f8e9698d469dc060db0f9c9b4e24c50b0");

        let isNameEdge = bind({ func: andIs, params: { types: [ isEdge, isInNameGroup ] }});
        isNameEdge = autoParam({ func: isNameEdge, paramName: "node" });
        return isNameEdge;
    });

    addManSys("236063bf30465aef27d1366d7573ffafa99d8c14", function(systems) {
        let graphAssign = systems("7b5e1726ccc3a1c2ac69e441900ba002c26b2f74");

        let writeNodeObject = systems("1d6976a263d64b64ac113f178e8ddc1d245b6120");
        writeNodeObject = bind({ func: writeNodeObject, params: { graphAssign }});
        return writeNodeObject;
    });

    addManSys("e5f7c17a83b013b4bc9d2e34c078ba5d5ae69077", function() {
        let writeNodeObject =  systems("236063bf30465aef27d1366d7573ffafa99d8c14");
        let autoId = systems("e048e5d7d4a4fbc45d5cd0d035982dae2ee768d0");

        let autoWriteNodeObject = autoId(writeNodeObject);
        autoWriteNodeObject = autoParam({ func: autoWriteNodeObject, paramName: "obj" });
        return autoWriteNodeObject;
    });

    addManSys("ccd7b9796a25b50b3d5d712392c9758e3ab6133d", function(systems) {
        let autoWriteNodeObject = systems("e5f7c17a83b013b4bc9d2e34c078ba5d5ae69077");
        let writeEdge = systems("10ae12f47866d3c8e1d6cfeabb39fcf7e839a220");

        let writeBindFunc = systems("aed811d85de045e271fdfe4097349dbdae83db3f");
        writeBindFunc = bind({ func: writeBindFunc, params: { autoWriteNodeObject, writeEdge }});
        return writeBindFunc;
    });

    addManSys("ca79cd84ab6a9eb3e5ac06ed48d3d24e6649d0bc", function(systems) {
        let callNodeFunction = systems("ad95b67eca3c4044cb78a730a9368c3e54a56c5f");
        callNodeFunction = bind({ func: callNodeFunction, params: { funcSys: systems }});
        return callNodeFunction;
    });

    addManSys("091a8647a5d3dfbd5964e608a5490de592a4cb12", function() {
        let writeAutoParamFunc = function({ writeString, writeEdge, id, func, paramName }) {
            let strId = writeString(paramName);
            writeEdge({ id, head: func, tail: strId });
            return id;
        };
        return writeAutoParamFunc;
    });

    addManSys("2fb95ddb758034712fe85b8cf63c9ea1ea0570cf", function() {
        let writeString = systems("4e63843a9bee61351b80fac49f4182bd582907b4");
        let writeEdge = systems("10ae12f47866d3c8e1d6cfeabb39fcf7e839a220");

        let writeAutoParamFunc = systems("091a8647a5d3dfbd5964e608a5490de592a4cb12");
        writeAutoParamFunc = bind({ func: writeAutoParamFunc, params: { writeString, writeEdge }});
        return writeAutoParamFunc;
    });

    addManSys("36b76ca66bba2d0b98fe25ce05efeaec1f286826", function(systems) {
        let groupList = systems("a8a338d08b0ef7e532cbc343ba1e4314608024b2");
        let nameList = systems("890b0b96d7d239e2f246ec03b00cb4e8e06ca2c3");

        let recreateLinks = systems("f520dd0e4da481f0fbc18584a7bf8098d19d3222");
        recreateLinks = bind({ func: recreateLinks, params: { groupList, nameList } });
        return recreateLinks;
    });

    addManSys("4f22989e5edf2634371133db2720b09fc441a141", function(systems) {
        let groupList = systems("a8a338d08b0ef7e532cbc343ba1e4314608024b2");

        let nodeTypes = groupList("585d4cc792af1a4754f1819630068bdbb81bfd20");

        let typeMap = _.zipObject(nodeTypes, _.map(nodeTypes, (typeId) => systems(typeId)));
        return () => typeMap;
    });

    addManSys("58f4149870fd4f99bcbf8083eedfee6fbc1199b0", function() {
        let hashInteger = systems("cb76708f83577aa1a50f91ed39b98f077e969efe");
        let readInteger = systems("a3cb3210c4688aabf0772e5a7dec9c9922247194");
        let stringAutoPut = systems("4e63843a9bee61351b80fac49f4182bd582907b4");
        let stringReadString = systems("08f8db63b1843f7dea016e488bd547555f345c59");

        let typeMappings = {
            "integer": {
                typeFunc: _.isInteger,
                putFunc: hashInteger,
                readFuncId: readInteger.id
            },
            "string": {
                typeFunc: _.isString,
                putFunc: stringAutoPut,
                readFuncId: stringReadString.id
            },
            "function": {
                typeFunc: _.isFunction,
                putFunc: value =>  value.id,
                readFuncId: systems.id
            }
        };

        return function() {
            return typeMappings;
        };
    });

    addManSys(["c5cfe7d5154188daaa2a5cdf5d27a18fce4c2345",
               "0abebb208d96e3aa8a17890a5606734e03fa2539",
               "30381757ef98651b92e54ce11a4fb839e76aa847",
               "6e52da614fc7779bd2aed50b06e753ee09cc346b",
               "0d4085c107c1e9fab3fcb0cd49a8372003f00484",
               "253cd1812a32a6a81f1365e1eca19cc1549f6002"], function(systems) {

        // Object Put and Auto Put
        let graphAssign = systems("7b5e1726ccc3a1c2ac69e441900ba002c26b2f74");
        let graphAutoPut = systems("f7b073eb5ef5680e7ba308eaf289de185f0ec3f7");
        let stringAutoPut = systems("4e63843a9bee61351b80fac49f4182bd582907b4");
        let typeMappings = systems("58f4149870fd4f99bcbf8083eedfee6fbc1199b0")();
        let autoId = systems("e048e5d7d4a4fbc45d5cd0d035982dae2ee768d0");
        let name = systems("2885e34819b8a2f043b139bd92b96e484efd6217");

        let writeObject = systems("eed13556a72cf02a35da377d6d074fe39c3b59c4");
        writeObject = bind({ func: writeObject, params: { graphAssign, graphAutoPut, stringAutoPut, typeMappings }});

        let objectAutoPut = autoId(writeObject);
        objectAutoPut = autoParam({ func: objectAutoPut, paramName: "object" });

        // Add object to type mappings
        let readObject = systems("d7f80b3486eee7b142c190a895c5496242519608");
        typeMappings.objects = {
            typeFunc: _.isPlainObject,
            putFunc: objectAutoPut,
            readFuncId: readObject.id
        };

        let mappingResult = _.mapValues(typeMappings, function(value) {
            return value.readFuncId;
        });
        // console.log(mappingResult);

        // Write func call Stuff
        let writeValue = systems("d2a5636a4b4e88b0c7c640bfd8915e78919641a0");
        writeValue = bind({ func: writeValue, params: { typeMappings }});
        writeValue = autoParam({ func: writeValue, paramName: "value" });

        let writeFuncCall = systems("a06a20a98b11deb325416a6897978342632db336");
        writeFuncCall = bind({ func: writeFuncCall, params: { writeValue, graphAssign }});

        let writeAndNameFuncCall = systems("7e387151076d045bedf4b34eef4f84aab789306d");
        writeAndNameFuncCall = bind({ func: writeAndNameFuncCall, params: { writeFuncCall, nameFn: name }});

        return { "c5cfe7d5154188daaa2a5cdf5d27a18fce4c2345": writeObject,
                "0abebb208d96e3aa8a17890a5606734e03fa2539": objectAutoPut,
                "30381757ef98651b92e54ce11a4fb839e76aa847": readObject,
                "6e52da614fc7779bd2aed50b06e753ee09cc346b": writeValue,
                "0d4085c107c1e9fab3fcb0cd49a8372003f00484": writeFuncCall,
                "253cd1812a32a6a81f1365e1eca19cc1549f6002": writeAndNameFuncCall };
    });

    // FUNCTIONS
    // FOLD
    addManSys("f6886ff48a34c6561cbab13fbfeabc0e6a4bd964", function() {
        let getHeads = function({ graphFind, node }) {
            let edges = graphFind({ tail: node });
            let result = edges.map(edge => edge.head);
            return result;
        };
        return getHeads;
    });

    addManSys("4a24b766f417667abc55a0bcc3a6617a85c73902", function() {
        let createSystemFile = function({ hashRandom, graphAutoPut, nameFn, name }) {
            let newSystemId = hashRandom();
            exec("cp src/kitsune-core/ddfe7d402ff26c18785bcc899fa69183b3170a7d src/kitsune-core/"+newSystemId);
            graphAutoPut({ head: "66564ec14ed18fb88965140fc644d7b813121c78", tail: newSystemId });
            nameFn({ node: newSystemId, name: name });
        };
        return createSystemFile;
    });

    addManSys("c574e6cc383ede7bae894721dbf7f0e19233dbac", function() {
        let nodeDescReport = function({ systems, graphListNodes, describeNode }) {
            let nodeList = graphListNodes();

            console.log("== Node Description Report ==");
            nodeList.forEach(node => {
                let types = describeNode(node);
                console.log(node+" => "+JSON.stringify(types));
            });
        };
        return nodeDescReport;
    });

    addManSys("d79ba735ae111d7d34457c712cf44519f13e827e", function() {
        let cleanStringSystem = function({ stringFind, graphListNodes, stringRemove }) {
            let stringIds = stringFind({}).map(value => value.id);
            let graphNodes = graphListNodes();

            let diff = _.difference(stringIds, graphNodes);

            console.log("Removed string ids:");
            console.log(diff);

            diff.forEach(id => {
                stringRemove({ id });
            });
        };
        return cleanStringSystem;
    });

    addManSys("a3bf45bfe89ebb31dac911bfbe299fcb2ce6491c", function(systems) {
        let hyphenNameToCamelCase = function(name) {
            let result = name
                    .replace(/-(.)/g, capture => capture.toUpperCase())
                    .replace(/-/g, '');
            return result;
        };
        return hyphenNameToCamelCase;
    });

    addManSys("de4c22f8bae0d00aad89fe0767d64f38da88a357", function() {
        let graphReport = function({ graphFind, graphListNodes }) {
            let edges = graphFind();
            let nodes = graphListNodes();
            let nodePercent = (edges.length/nodes.length*100).toPrecision(4);

            console.log("== Graph Report ==");
            console.log("Nodes: "+nodes.length);
            console.log("Edges: "+edges.length+" ("+nodePercent+"%)");
        };
        return graphReport;
    });

    addManSys("bcf4dfc4210f020178288d9c134cf6e3e94a6d63", function() {
        let stringReport = function({ stringFind }) {
            let strings = stringFind();

            strings = _.sortBy(strings, "string");

            console.log("== String Report ==");
            strings.forEach(value => {
                console.log(`${value.id} => ${value.string}`);
            });
        };
        return stringReport;
    });

    addManSys("d5e195726a6a3650166a6591dc3d7619adaef98d", function(systems) {
        let getDataTime = function() {
            let graphTime = fs.statSync("./data/24c045b912918d65c9e9aaea9993e9ab56f50d2e.json").mtime;
            let stringTime = fs.statSync("./data/1cd179d6e63660fba96d54fe71693d1923e3f4f1.json").mtime;

            let latest = Math.max(graphTime.getTime(), stringTime.getTime());
            return latest;
        };
        return getDataTime;
    });

    addManSys("1d6976a263d64b64ac113f178e8ddc1d245b6120", function() {
        let writeNodeObject = function({ graphAssign, id, obj }) {
            for(let i in obj)
                graphAssign({ head: i, type: id, tail: obj[i] });
            return id;
        };
        return writeNodeObject;
    });

    addManSys("aed811d85de045e271fdfe4097349dbdae83db3f", function() {
        let writeBindFunc = function({ autoWriteNodeObject, writeEdge, id, func, params }) {
            let paramObj = autoWriteNodeObject(params);
            writeEdge({ id, head: func, tail: paramObj });
            return id;
        };
        return writeBindFunc;
    });

    addManSys("f520dd0e4da481f0fbc18584a7bf8098d19d3222", function() {
        let recreateLinks = function({ groupList, nameList }) {
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
        };
        return recreateLinks;
    });

    addManSys("42e9ce26666845ae2855a6ed619b54b8280b415b", function() {
        let edgeReport = function({ graphFind }) {
            console.log("== Graph Report ==");

            var edgeTypes = {};

            let makeFn = function(groupId) {
                return edgeId => {
                    let edge = graphFind({ id: edgeId })[0];
                    return edge.head == groupId;
                };
            };

            let allowedGroups = [
                "585d4cc792af1a4754f1819630068bdbb81bfd20",
                "66564ec14ed18fb88965140fc644d7b813121c78",
                "7f82d45a6ffb5c345f84237a621de35dd8b7b0e3",
                "d2cd5a6f99428baaa05394cf1fe3afa17fb59aff",
                "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0"
            ];
            allowedGroups.forEach(coreNode => {
                let name = nameList(coreNode)[0];
                edgeTypes[name+"-group"] = makeFn(coreNode);
            });

            edgeTypes["name-edge"] = function(edgeId) {
                let search = graphFind({ head: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0", tail: edgeId });
                return search.length;
            };

            let edges = graphFind();
            let edgeIds = _.map(edges, "id");
            let edgeReport = _.map(edgeIds, function(edge) {
                let types = _.map(edgeTypes, (edgeType, name) => edgeType(edge) ? name : null).filter(x => x);
                return { edge, types };
            });

            edgeReport = _.sortBy(edgeReport, value => value.types.join(""));

            let [goodEdges, badEdges] = _.partition(edgeReport, value => value.types.length);

            let totalCount = edgeIds.length;
            let goodCount = goodEdges.length;
            let badCount = badEdges.length;
            let goodRatio = (goodCount / totalCount) * 100;

            console.log(`-- Good Edges: ${goodCount}/${totalCount} [${goodRatio.toFixed(2)}%] --`);
            _.forEach(goodEdges, data => console.log(`${data.edge} =>`, data.types));
            console.log(`-- Bad Edges: ${badCount} --`);
            _.forEach(badEdges, data => {
                console.log(data.edge);
                let edge = graphFind({ id: data.edge })[0];
                let headDesc = describeNode(edge.head);
                console.log(`\tH ${edge.head}  =>`, headDesc);
                let tailDesc = describeNode(edge.tail);
                console.log(`\tT ${edge.tail}  =>`, tailDesc);
            });

            console.log(`Good Edges: ${goodCount}/${totalCount} [${goodRatio.toFixed(2)}%]`);
            console.log(`Bad Edges: ${badCount}`);
        };
        return edgeReport;
    });

    addManSys("a06a20a98b11deb325416a6897978342632db336", function() {
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
        return writeFuncCall;
    });

    addManSys("7e387151076d045bedf4b34eef4f84aab789306d", function() {
        let writeAndNameFuncCall = function({ writeFuncCall, nameFn, func, param, name }) {
            let id = writeFuncCall({ func, param });
            graphAutoPut({ head: "d2cd5a6f99428baaa05394cf1fe3afa17fb59aff", tail: id });
            nameFn({ node: id, name });
            return id;
        };
        return writeAndNameFuncCall;
    });
    // END FOLD

    return manualSystems;
}

module.exports = buildManualSystemLoader;
