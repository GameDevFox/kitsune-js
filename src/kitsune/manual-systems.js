import fs from "fs";
import { execSync as exec } from "child_process";

import _ from "lodash";

function buildManualSystemBuilder(systems) {
    let bind = systems("878c8ef64d31a194159765945fc460cb6b3f486f");
    let autoParam = systems("b69aeff3eb1a14156b1a9c52652544bcf89761e2");
    let putSystem = systems("a26808f06030bb4c165ecbfe43d9d200672a0878");

    var manSysFuncs = {};
    let addManSys = function(id, builderFunc) {
        if(typeof id == "object")
            _.forEach(id, value => manSysFuncs[value] = builderFunc);
        else
            manSysFuncs[id] = builderFunc;
    };

    var manualSystems = function({ manSysFuncs, systems, putSystem, id }) {
        if(!manSysFuncs[id])
            return null;

        let result = manSysFuncs[id](systems);

        // TODO: Factor this out into a new system
        if(typeof result == "object") {
            _.forEach(result, (value, key) => putSystem({ id: key, system: value }));
            result = result[id];
        } else
            putSystem({ id, system: result });

        return result;
    };
    manualSystems = bind({ func: manualSystems, params: { manSysFuncs, systems, putSystem }});
    manualSystems = autoParam({ func: manualSystems, paramName: "id" });

    let bindAndAuto = function(func, bindParams, paramName) {
        let result = bind({ func: func, params: bindParams });
        if(paramName)
            result = autoParam({ func: result, paramName });
        return result;
    };
    addManSys("7da92783c4352686c028256ae61207647fc61831", (systems) => bindAndAuto);

    // BUILDERS //
    {
        // Bind func builder
        addManSys("2c677e2c78bede32f66bed87c214e5875c2c685c", function () {
            let bindFuncBuilder = function ({ readBindFunc, nameList, bind, id }) {
                let bindFunc = readBindFunc(id);

                let func = systems(bindFunc.func);
                let params = {};
                for (let i in bindFunc.params) {
                    let name = nameList(i)[0];
                    let param = systems(bindFunc.params[i]);
                    params[name] = param;
                }

                let result = bind({func, params});
                return result;
            };
            return bindFuncBuilder;
        });

        addManSys("9a6b1f2a0bcb5576e5b6347cb113eb2cd16c985a", function () {
            let readBindFunc = systems("4841f107fb76dbf4ac1d29a936b16b7365985ca4");
            let nameList = systems("890b0b96d7d239e2f246ec03b00cb4e8e06ca2c3");
            let bind = systems("878c8ef64d31a194159765945fc460cb6b3f486f");

            let bindFuncBuilder = systems("2c677e2c78bede32f66bed87c214e5875c2c685c");
            bindFuncBuilder = bind({func: bindFuncBuilder, params: { readBindFunc, nameList, bind }});
            bindFuncBuilder = autoParam({func: bindFuncBuilder, paramName: "id"});
            return bindFuncBuilder;
        });

        // Auto param builder
        addManSys("e7077ff12256c2c8da6a200c90899c311caf2cf4", function () {
            let autoParamBuilder = function ({ readEdge, readString, autoParam, id }) {
                let edge = readEdge(id);

                let funcId = edge.head;
                let paramNameId = edge.tail;

                let func = systems(funcId);
                let paramName = readString(paramNameId);
                let result = autoParam({func, paramName});
                return result;
            };
            return autoParamBuilder;
        });

        addManSys("c18b49e9b5d330e1573707e9b3defc6592897522", function () {
            let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");
            let readString = systems("08f8db63b1843f7dea016e488bd547555f345c59");
            let autoParam = systems("b69aeff3eb1a14156b1a9c52652544bcf89761e2");

            let autoParamBuilder = systems("e7077ff12256c2c8da6a200c90899c311caf2cf4");
            autoParamBuilder = bind({func: autoParamBuilder, params: { readEdge, readString, autoParam }});
            autoParamBuilder = autoParam({func: autoParamBuilder, paramName: "id"});
            return autoParamBuilder;
        });
    }

    // BUILDER DEPENDENCIES //
    {
        // Dependancies of Bind Function Builder
        addManSys("4841f107fb76dbf4ac1d29a936b16b7365985ca4", function (systems) {
            let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");
            let readNodeObject = systems("971a9f4b9f8e841b4519d96fa8733311c8b58fe2");

            let readBindFunc = systems("54988d866ff79e589c5a2b50aeaf720d743c01a4");
            readBindFunc = bind({func: readBindFunc, params: {readEdge, readNodeObject}});
            readBindFunc = autoParam({func: readBindFunc, paramName: "id"});
            return readBindFunc;
        });

        addManSys("25cff8a2afcf560b5451d2482dbf9d9d69649f26", function (systems) {
            let returnFirst = systems("68d3fb9d10ae2b0455a33f2bfb80543c4f137d51");
            let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

            let readEdge = returnFirst(graphFind);
            readEdge = autoParam({func: readEdge, paramName: "id"});
            return readEdge;
        });

        addManSys("91ad9a39b3968af9f4418c3066963ce41ee38804", function () {
            let readNodeObject = function ({graphFactor, id}) {
                let result = {};
                let factor = graphFactor({type: id});
                for (let i in factor) {
                    let key = factor[i].head;
                    let value = factor[i].tail;
                    result[key] = value;
                }
                return result;
            };
            return readNodeObject;
        });

        addManSys("971a9f4b9f8e841b4519d96fa8733311c8b58fe2", function (systems) {
            let graphFactor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");

            let readNodeObject = systems("91ad9a39b3968af9f4418c3066963ce41ee38804");
            readNodeObject = bind({func: readNodeObject, params: {graphFactor}});
            readNodeObject = autoParam({func: readNodeObject, paramName: "id"});
            return readNodeObject;
        });

        addManSys("c83cd0ab78a1d57609f9224f851bde6d230711d0", function (systems) {
            let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

            let graphFactor = systems("4163d1cd63d3949b79c37223bd7da04ad6cd36c8");
            graphFactor = bind({func: graphFactor, params: {graphFind}});
            return graphFactor;
        });

        addManSys("890b0b96d7d239e2f246ec03b00cb4e8e06ca2c3", function (systems) {
            let graphFactor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");
            let stringReadString = systems("08f8db63b1843f7dea016e488bd547555f345c59");

            let nameList = systems("81e0ef7e2fae9ccc6e0e3f79ebf0c9e14d88d266");
            nameList = bind({func: nameList, params: {graphFactor, stringReadString}});
            nameList = autoParam({func: nameList, paramName: "node"});
            return nameList;
        });

        addManSys("08f8db63b1843f7dea016e488bd547555f345c59", function (systems) {
            let stringFind = systems("8b1f2122a8c08b5c1314b3f42a9f462e35db05f7");
            let returnFirst = systems("68d3fb9d10ae2b0455a33f2bfb80543c4f137d51");
            let returnProperty = systems("c1020aea14a46b72c6f8a4b7fa57acc14a73a64e");

            let stringReadString = autoParam({func: stringFind, paramName: "id"});
            stringReadString = returnFirst(stringReadString);
            stringReadString = returnProperty({func: stringReadString, propertyName: "string"});
            return stringReadString;
        });
    }

    addManSys("a82d6af4777c9f7036fc0a137f7cd31a2ec133b9", function(systems) {
        // based on object description
        // type <-> function mapping
        // This must be an ordered list
        let descMappings = {
            "is-type-builder-function": function(node) {
                return is-node;
            },
            "has-input": function(node) {
                return factor({ head: node, type: input })[0].tail;
            }
        };

        let getInputType = function(node) {
            // We can call a more efficient method here based on available types in mapping
            // The results of this method should be a subset of the mapping types
            let desc = describeNode(node);

            let input;
            for(let d of desc) {
                let func = descMappings[d];
                if(func) {
                    input = func(node);
                    break;
                }
            }
            return input;
        };
        return getInputType;
    });

    // write "toward" chain or "away" chain
    // "away" for lists (default)
    // "toward" for types and super types
    addManSys("f934a7bede868c16b8603c20f31965a262ac19f4", function(systems) {
        let autoWriteEdge = systems("f7b073eb5ef5680e7ba308eaf289de185f0ec3f7");

        let writeChain = function({ autoWriteEdge, away, node, items }) {
            let edge = node;
            for(let i=0; i<items.length; i++) {
                let item = items[i];
                edge = away ? autoWriteEdge({ head: edge, tail: item })
                            : autoWriteEdge({ head: item, tail: edge });
            }
            return edge;
        };
        writeChain = bindAndAuto(writeChain, { autoWriteEdge });
        return writeChain;
    });
    
    addManSys("f7d85e5fdaa712e9ce55724d1bd2006ebc48032c", function(systems) {
        let writeChain = systems("f934a7bede868c16b8603c20f31965a262ac19f4");
        let writeAwayChain = bindAndAuto(writeChain, { away: true });
        return writeAwayChain;
    });
    
    addManSys("26c327a18c224378783ee1603f46ac9618462b85", function(systems) {
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

        let readChain = function({ graphFind, away, node }) {
            let base = node;
            let result = [];
            while(true) {
                let search = away ? { head: base } : { tail: base };
                let edges = graphFind(search);

                if (edges.length > 1)
                    throw new Error("readChain: Multiple tails for node: " + node);

                if(edges.length === 0)
                    break;

                let edge = edges[0];
                result.push(away ? edge.tail : edge.head);
                base = edge.id;
            }
            return result;
        };
        readChain = bindAndAuto(readChain, { graphFind });
        return readChain;
    });
    
    addManSys("97142d3a71acdb994784bb0d57450ddd3513d41d", function(systems) {
        let readChain = systems("26c327a18c224378783ee1603f46ac9618462b85");
        let readAwayChain = bindAndAuto(readChain, { away: true }, "node");
        return readAwayChain;
    });
    
    addManSys("c2ff24899966a19f0615519692679bff2c2b8b26", function(systems) {
        let cleanStringSystem = systems("f3db04b0138e827a9b513ab195cc373433407f83");
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");
        let stringFind = systems("8b1f2122a8c08b5c1314b3f42a9f462e35db05f7");
        let writeData = systems("40e2d84c31114c5a00b567a94cefe4e8e83a3050");

        let saveData = function({ cleanStringSystem, graphFind, stringFind, writeData }) {
            cleanStringSystem();

            let sortedGraphData = _.sortBy(graphFind(), ["head", "tail"]);
            let sortedStringData = _.sortBy(stringFind(), ["string"]);

            exec("mkdir -p out/data");
            writeData({ data: sortedGraphData, filename: "./data/24c045b912918d65c9e9aaea9993e9ab56f50d2e.json" });
            writeData({ data: sortedStringData, filename: "./data/1cd179d6e63660fba96d54fe71693d1923e3f4f1.json" });
        };
        return bindAndAuto(saveData, { cleanStringSystem, graphFind, stringFind, writeData });
    });

    addManSys("40e2d84c31114c5a00b567a94cefe4e8e83a3050", function(systems) {
        let cleanLoki = systems("3a9764d312ae5668c2f7e12f9bfd509a3a01224e");

        let writeData = function({ cleanLoki, data, filename }) {
            let cleanData = cleanLoki(data);
            let json = JSON.stringify(cleanData, null, 2);
            fs.writeFileSync(filename, json+"\n");
        };
        writeData = bind({ func: writeData, params: { cleanLoki }});
        return writeData;
    });

    addManSys("3a9764d312ae5668c2f7e12f9bfd509a3a01224e", function(systems) {
        let cleanLoki = function(data) {
            let result = data.map(value => _.omit(value, "meta", "$loki"));
            return result;
        };
        return cleanLoki;
    });

    addManSys("cea68943c5674bdfd2a880fedb40965adb801790", function(systems) {
        let getTails = systems("a8a338d08b0ef7e532cbc343ba1e4314608024b2");

        let systemGroupBuilderBuilder = function({ systems, getTails, groupFuncNode }) {
            let groupFunc = systems(groupFuncNode);
            let systemGroupBuilder = function(node) {
                let tails = getTails(node);
                let systemGroup = systems(tails);
                return groupFunc(systemGroup);
            };
            return systemGroupBuilder;
        };
        return bindAndAuto(systemGroupBuilderBuilder, { systems, getTails }, "groupFuncNode");
    });

    addManSys("4f5b93c385b2702b57d09a31e62933e2a77af668", function(systems) {
        let buildMergeList = function(lists) {
            return function() {
                let result = [];
                for(let list of lists)
                    result = result.concat(list());
                return result;
            };
        };
        return buildMergeList;
    });

    addManSys("e87662929821638a53c049c8e9380d105b923458", function(systems) {
        let buildAndType = function(types) {
            return function(input) {
                let result;
                for(let type of types) {
                    result = type(input);
                    if(!result)
                        break;
                }
                return result;
            };
        };
        return buildAndType;
    });

    addManSys("dc613d0418cf2e86aa585dcef149b29906302c42", function(systems) {
        let buildOrType = function(types) {
            return function(input) {
                let result;
                for(let type of types) {
                    result = type(input);
                    if(result)
                        break;
                }
                return result;
            };
        };
        return buildOrType;
    });

    addManSys("f5f1de26b2bd57f7e5d28a3ef9cfc7e67e72eff8", function(systems) {
        let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");
        let readString = systems("08f8db63b1843f7dea016e488bd547555f345c59");
        let buildFieldType = systems("369acd471c7100072de57ae0dbcc8cfcb4c39dfa");

        let fieldTypeBuilder = function({ readEdge, readString, systems, buildFieldType, node }) {
            let { head: nameNode, tail: typeNode } = readEdge(node);
            let name = readString(nameNode);
            let type = systems(typeNode);

            return buildFieldType({ name, type });
        };
        return bindAndAuto(fieldTypeBuilder, {
            readEdge, readString, systems, buildFieldType }, "node");
    });

    addManSys("369acd471c7100072de57ae0dbcc8cfcb4c39dfa", function(systems) {
        let buildFieldType = function({ name, type }) {
            return (object) => {
                let field = object[name];
                let result = (field === undefined) ? false : type(field);
                return result;
            };
        };
        return buildFieldType;
    });

    addManSys("187757b06fee5a804c312e55d834d06025762605", function(systems) {
        let systemMap = function({ systems, system, data }) {
            let sys = systems(system);
            let values = _.map(data, x => sys(x));
            let result = _.zipObject(data, values);
            return result;
        };
        systemMap = bind({ func: systemMap, params: { systems }});
        return systemMap;
    });

    addManSys("383103bd68460b5ff1d48e629720533dc3e3a1e4", function(systems) {
        let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");

        let nodeFuncBuilder = function({ readEdge, systems, node }) {
            let { head: func, tail: arg } = readEdge(node);

            let fn = systems(func);
            return function() {
                return fn(arg);
            };
        };
        return bindAndAuto(nodeFuncBuilder, { readEdge, systems }, "node");
    });

    addManSys("e73694a13d302e910ee51a1f326cf08e1bce0c12", function() {
        let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");

        let readAssign = systems("b8aea374925bfcd5884054aa23fed2ccce3c1174");
        readAssign = bind({ func: readAssign, params: { readEdge }});
        readAssign = autoParam({ func: readAssign, paramName: "id" });
        return readAssign;
    });

    addManSys("debb03595c98dabf804339d4b4e8510bb14b56f9", function() {
        let stringDb = systems("ce6de1160131bddb4e214f52e895a68583105133");

        let stringFindLike = systems("d744dc750675113a5914be50bf3fbd3f9bd4319f");
        stringFindLike = bind({ func: stringFindLike, params: { db: stringDb }});
        stringFindLike = autoParam({ func: stringFindLike, paramName: "like" });
        return stringFindLike;
    });

    addManSys("4c2699dc1fec0111f46c758489a210eb7f58e4df", function(systems) {
        let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");

        let callNodeFunc = systems("6a96bb7f6144af37ffe81fca6dd31546890fbfb5");
        callNodeFunc = bind({ func: callNodeFunc, params: { readEdge, systems }});
        callNodeFunc = autoParam({ func: callNodeFunc, paramName: "node" });
        return callNodeFunc;
    });

        addManSys("c62d4ef1e0a3e7cf289dfb455e52ed540ac06b79", function() {
            let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");
            let nameList = systems("890b0b96d7d239e2f246ec03b00cb4e8e06ca2c3");
            let getLibraryFunc = systems("3990d47251b3e9a52f311241bf65368ac66989c4");

            let libraryFuncBuilder = systems("9c9a7115ab807d4f97b9f29031f5dbfc35ae0cf7");
            libraryFuncBuilder = bind({ func: libraryFuncBuilder, params: { readEdge, nameList, getLibraryFunc }});
            libraryFuncBuilder = autoParam({ func: libraryFuncBuilder, paramName: "node" });
            return libraryFuncBuilder;
        });

        addManSys("34808982614a55b16897427d36e8ce37c6d68277", function() {
            let getPrimitiveType = systems("6bfea805fec330b875b15744fd8bff3ae34635c3");

            let isPrimitiveType = systems("2e898c3acd767449308279ae99645244dc248b08");
            isPrimitiveType = bind({ func: isPrimitiveType, params: { getPrimitiveType }});
            return isPrimitiveType;
        });

        addManSys("43cd34ab8105d158f421eecce9ed22948ec34893", function() {
            let getPrimitiveType = systems("34808982614a55b16897427d36e8ce37c6d68277");
            let isBoolean = bind({ func: getPrimitiveType, params: { primitiveType: "boolean" }});
            isBoolean = autoParam({ func: isBoolean, paramName: "value" });
            return isBoolean;
        });

        addManSys("05ef7fa49f431784fccc98f676c171e86c300449", function() {
            let getPrimitiveType = systems("34808982614a55b16897427d36e8ce37c6d68277");
            let isString = bind({ func: getPrimitiveType, params: { primitiveType: "string" }});
            isString = autoParam({ func: isString, paramName: "value" });
            return isString;
        });

        addManSys("5658516f9274e7fcdeb87aa20d0b69a35ec335c3", function() {
            let isNode = function(string) {
                return string.search(/^[0-9a-z]{40}$/i) != -1;
            };
            return isNode;
        });

    addManSys("3528d88fb3d5a3dc22f2ffbd40690ec71edd3819", function(systems) {
        let inputType = "0713c6285e4a9d9fc96b375ff2dce3e1807d942d";
        let factor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");

        // RULE: Node always has exactly one input type
        let fullTypeBuilder = function({ factor, systems, node }) {
            let inputType = factor({ head: node, type: inputType })[0];

            let child = systems(node);
            let parent = systems(inputType.tail);

            return function(input) {
                if(!parent(input))
                    return false;

                return child(input);
            };
        };
        fullTypeBuilder = bind({ func: fullTypeBuilder, params: { factor, systems }});
        fullTypeBuilder = autoParam({ func: fullTypeBuilder, paramName: "node" });
        return fullTypeBuilder;
    });

    addManSys("5d134bcf95eb55efa7807da43e11e4fc37e269b9", function(systems) {
        let inputType = "0713c6285e4a9d9fc96b375ff2dce3e1807d942d";
        let factor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");

        let getTypeList = function({ factor, node }) {
            let typeList = [node];

            let currentNode = node;
            while(true) {
                let inputTypes = factor({ head: currentNode, type: inputType });
                if(inputTypes.length === 0)
                    break;

                currentNode = inputTypes[0].tail;
                typeList.push(currentNode);
            }

            return typeList;
        };
        getTypeList = bind({ func: getTypeList, params: { factor }});
        getTypeList = autoParam({ func: getTypeList, paramName: "node" });
        return getTypeList;
    });

    addManSys("d30dc37c36dd88e12dab2311ad7b1e9ef1038118", function(systems) {
        let getTypeList = systems("5d134bcf95eb55efa7807da43e11e4fc37e269b9");

        let descTypeBuilder = function({ getTypeList, systems, node }) {
            let typeList = getTypeList(node);
            typeList = typeList.reverse();

            let result = {
                is: null,
                isNot: null
            };
            return (input) => {
                for (let typeNode of typeList) {
                    console.log(typeNode);
                    let type = systems(typeNode);
                    if (type(input))
                        result.is = typeNode;
                    else {
                        result.isNot = typeNode;
                        break;
                    }
                }
                return result;
            };
        };
        descTypeBuilder = bind({ func: descTypeBuilder, params: { getTypeList, systems }});
        descTypeBuilder = autoParam({ func: descTypeBuilder, paramName: "node" });
        return descTypeBuilder;
    });

    addManSys("f7b073eb5ef5680e7ba308eaf289de185f0ec3f7", function(systems) {
        let writeEdge = systems("10ae12f47866d3c8e1d6cfeabb39fcf7e839a220");
        let autoId = systems("e048e5d7d4a4fbc45d5cd0d035982dae2ee768d0");

        let autoWriteEdge = autoId(writeEdge);
        return autoWriteEdge;
    });

    addManSys("8c7d214678ce851d39ebb4a774c9f168bfffe43d", function() {
        let returnFirst = systems("68d3fb9d10ae2b0455a33f2bfb80543c4f137d51");
        let returnProperty = systems("c1020aea14a46b72c6f8a4b7fa57acc14a73a64e");

        let stringGetId = systems("263b18de1773a7bf1954c5622e67f0f2edf0aabc");
        stringGetId = returnFirst(stringGetId);
        stringGetId = returnProperty({ func: stringGetId, propertyName: "id" });
        return stringGetId;
    });

    addManSys("d1d3e1c9b3a0bf5cb07df6ee9a75f741d3cfdd78", function() {
        let autoId = systems("d673ba0c8d334d4644375f853e30ad46df514120");
        autoId = bind({ func: autoId, params: { paramName: "id" }});
        return autoId;
    });

    addManSys("647b87f6c165824714c48ffa8bf224d1bcf11709", function() {
        let isInGroup = systems("a3fd8e7c0d51f13671ebbb6f9758833ff6120b42");
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

        isInGroup = bind({ func: isInGroup, params: { graphFind }});
        return isInGroup;
    });

    addManSys("cf2331e774de09eee361e94199546123913a2773", function(systems) {
        let isInGroup = systems("647b87f6c165824714c48ffa8bf224d1bcf11709");

        let groupTypeBuilder = function({ isInGroup, group }) {
            return function(node) {
                return isInGroup({ group, node });
            };
        };
        groupTypeBuilder = bind({ func: groupTypeBuilder, params: { isInGroup }});
        groupTypeBuilder = autoParam({ func: groupTypeBuilder, paramName: "group" });
        return groupTypeBuilder;
    });

    addManSys("1b12f086f8555c4d13e6c98a8cece7ce4e198d43", function(systems) {
        let getEdgeHead = systems("da697bd0863212526208d79e3e65019377b07670");
        let isInGroup = systems("647b87f6c165824714c48ffa8bf224d1bcf11709");

        let isBuilderFunction = function({ getEdgeHead, isInGroup, node }) {
            let edgeHead = getEdgeHead(node);
            if(!edgeHead)
                return false;

            let result = isInGroup({
                group: "7b4ecffac40b9c00ecdee386763b0e6584834eca",
                node: edgeHead
            });
            return result;
        };
        isBuilderFunction = bind({ func: isBuilderFunction, params: { getEdgeHead, isInGroup }});
        isBuilderFunction = autoParam({ func: isBuilderFunction, paramName: "node" });
        return isBuilderFunction;
    });

    addManSys("a5145963a941491432e65b37cbf6d4f6160cc543", function(systems) {
        let getTails = systems("a8a338d08b0ef7e532cbc343ba1e4314608024b2");
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

        let listBuilderFunctions = function({ getTails, graphFind }) {
            let builderList = getTails("7b4ecffac40b9c00ecdee386763b0e6584834eca");

            let result = [];
            builderList.forEach(builder => {
                let edges = graphFind({ head: builder });
                let ids = _.map(edges, "id");
                result = result.concat(ids);
            });
            return result;
        };
        listBuilderFunctions = bind({ func: listBuilderFunctions, params: { getTails, graphFind }});
        return listBuilderFunctions;
    });

    addManSys("da697bd0863212526208d79e3e65019377b07670", function() {
        let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");

        let getEdgeHead = function({ readEdge, node }) {
            let edge = readEdge(node);
            if(!edge)
                return null;

            return edge.head;
        };
        getEdgeHead = bind({ func: getEdgeHead, params: { readEdge }});
        getEdgeHead = autoParam({ func: getEdgeHead, paramName: "node" });
        return getEdgeHead;
    });

    addManSys("de9803674df491c66c99dcb85d14402f3339c645", function(systems) {
        let getEdgeHead = systems("da697bd0863212526208d79e3e65019377b07670");

        let edgeHeadTypeBuilder = function({ getEdgeHead, edgeHead }) {
            return function(node) {
                return getEdgeHead(node) == edgeHead;
            };
        };
        edgeHeadTypeBuilder = bind({ func: edgeHeadTypeBuilder, params: { getEdgeHead }});
        edgeHeadTypeBuilder = autoParam({ func: edgeHeadTypeBuilder, paramName: "edgeHead" });
        return edgeHeadTypeBuilder;
    });

    addManSys("88bd34b2a7aa6c5c14127f6d3d11b82125597f61", function(systems) {
        let listTypeBuilder = function({ systems, listFuncNode }) {
            let listFunc = systems(listFuncNode);
            return function(node) {
                return listFunc().includes(node);
            };
        };
        listTypeBuilder = bind({ func: listTypeBuilder, params: { systems }});
        listTypeBuilder = autoParam({ func: listTypeBuilder, paramName: "listFuncNode" });
        return listTypeBuilder;
    });

    addManSys("bd7d5695726fa6fe5eb35bed1e009f8784b29c98", function() {
        let andIs = systems("90184a3d0c84658aac411637f7442f80b3fe0040");
        let isEdge = systems("20bfa138672de625230eef7faebe0e10ba6a49d0");
        let isInNameGroup = systems("842d244f8e9698d469dc060db0f9c9b4e24c50b0");

        let isNameEdge = bind({ func: andIs, params: { types: [ isEdge, isInNameGroup ] }});
        return isNameEdge;
    });

    addManSys("248743603215c126461a7e4debdee6d18c3686cb", function() {
        let writeNodeObject =  systems("236063bf30465aef27d1366d7573ffafa99d8c14");
        let autoId = systems("e048e5d7d4a4fbc45d5cd0d035982dae2ee768d0");

        let autoWriteNodeObject = autoId(writeNodeObject);
        return autoWriteNodeObject;
    });

    addManSys("4f22989e5edf2634371133db2720b09fc441a141", function(systems) {
        let groupList = systems("a8a338d08b0ef7e532cbc343ba1e4314608024b2");

        let nodeTypes = groupList("585d4cc792af1a4754f1819630068bdbb81bfd20");

        let typeMap = _.zipObject(nodeTypes, _.map(nodeTypes, (typeId) => systems(typeId)));
        return () => typeMap;
    });

    addManSys("8d15cc103c5f3453e8b5ad8cdada2e5d2dde8039", function(systems) {
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");
        let nameList = systems("890b0b96d7d239e2f246ec03b00cb4e8e06ca2c3");
        let describeNode = systems("15b16d6f586760a181f017d264c4808dc0f8bd06");

        let edgeReport = systems("42e9ce26666845ae2855a6ed619b54b8280b415b");
        edgeReport = bind({ func: edgeReport, params: { graphFind, nameList, describeNode }});
        return edgeReport;
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

    // TODO: We might not some of this right now
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

        // TODO: Do we need these two?
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
    {
        addManSys("c583892108bf5de4fa22b42a75d0e5e47651a744", function(systems) {
            let trueFn = () => true;
            return trueFn;
        });

        addManSys("c6bf0178d3510380fcb21d749751934a01f4f6be", function(systems) {
            let falseFn = () => false;
            return falseFn;
        });

        // list-manual-systems
        addManSys("12d8b6e0e03d5c6e5d5ddb86bda423d50d172ec8", function (systems) {
            return () => _.keys(manSysFuncs);
        });

        // list-system-files
        addManSys("5277dc011cbc9800046edeb4460f7138e060a935", function (systems) {
            let files = fs.readdirSync("./src/kitsune-core");
            let listSysFiles = function() {
               return files;
            };
            return listSysFiles;
        });

        addManSys("d744dc750675113a5914be50bf3fbd3f9bd4319f", function() {
            let stringFindLike = function({ db, like }) {
                let search = db().find({ string: { $regex: new RegExp(like, "i") } });
                return search.map(x => x.id);
            };
            return stringFindLike;
        });

        addManSys("9c9a7115ab807d4f97b9f29031f5dbfc35ae0cf7", function() {
            let libraryFuncBuilder = function({ readEdge, nameList, getLibraryFunc, node }) {
                let { head: library, tail: func } = readEdge(node);

                let libraryName = nameList(library)[0];
                let funcName = nameList(func)[0];

                let result = getLibraryFunc({ libraryName, funcName });
                return result;
            };
            return libraryFuncBuilder;
        });

        addManSys("6a96bb7f6144af37ffe81fca6dd31546890fbfb5", function(systems) {
            let callNodeFunc = function({ readEdge, systems, node }) {
                let edge = readEdge(node);
                if(!edge)
                    return null;

                let func = systems(edge.head);
                let arg = edge.tail;

                let result = func(arg);
                return result;
            };
            return callNodeFunc;
        });

        addManSys("3990d47251b3e9a52f311241bf65368ac66989c4", function() {
            let getLibraryFunc = function({ libraryName, funcName }) {
                let library = require(libraryName);
                let result = library[funcName];
                return result;
            };
            return getLibraryFunc;
        });

        addManSys("6bfea805fec330b875b15744fd8bff3ae34635c3", function() {
            let getPrimitiveType = function(input) {
                let result = typeof input;
                return result;
            };
            return getPrimitiveType;
        });

        addManSys("2e898c3acd767449308279ae99645244dc248b08", function() {
            let isPrimitiveType = function({ getPrimitiveType, primitiveType, value }) {
                let result = getPrimitiveType(value) == primitiveType;
                return result;
            };
            return isPrimitiveType;
        });

        addManSys("54988d866ff79e589c5a2b50aeaf720d743c01a4", function () {
            let readBindFunc = function ({readEdge, readNodeObject, id}) {
                let bindFunc = readEdge(id);

                let func = bindFunc.head;
                let paramId = bindFunc.tail;
                let params = readNodeObject(paramId);

                return { func, params };
            };
            return readBindFunc;
        });

        addManSys("e6ff3d78ebd8f80c8945afd3499195049609905d", function (systems) {
            let readSystemFile = function (id) {
                return fs.readFileSync("./src/kitsune-core/" + id, "utf8");
            };
            return readSystemFile;
        });

        addManSys("f6886ff48a34c6561cbab13fbfeabc0e6a4bd964", function () {
            let getHeads = function ({graphFind, node}) {
                let edges = graphFind({tail: node});
                let result = edges.map(edge => edge.head);
                return result;
            };
            return getHeads;
        });

        addManSys("4a24b766f417667abc55a0bcc3a6617a85c73902", function () {
            let createSystemFile = function ({hashRandom, graphAutoPut, nameFn, name}) {
                let newSystemId = hashRandom();
                exec("cp src/kitsune-core/ddfe7d402ff26c18785bcc899fa69183b3170a7d src/kitsune-core/" + newSystemId);
                graphAutoPut({head: "66564ec14ed18fb88965140fc644d7b813121c78", tail: newSystemId});
                nameFn({node: newSystemId, name: name});
                return newSystemId;
            };
            return createSystemFile;
        });

        addManSys("c574e6cc383ede7bae894721dbf7f0e19233dbac", function () {
            let nodeDescReport = function ({systems, graphListNodes, describeNode}) {
                let nodeList = graphListNodes();

                console.log("== Node Description Report ==");
                nodeList.forEach(node => {
                    let types = describeNode(node);
                    console.log(node + " => " + JSON.stringify(types));
                });
            };
            return nodeDescReport;
        });

        addManSys("d79ba735ae111d7d34457c712cf44519f13e827e", function () {
            let cleanStringSystem = function ({stringFind, graphListNodes, stringRemove}) {
                let stringIds = stringFind({}).map(value => value.id);
                let graphNodes = graphListNodes();

                let diff = _.difference(stringIds, graphNodes);

                diff.forEach(id => {
                    stringRemove({id});
                });

                return diff;
            };
            return cleanStringSystem;
        });

        addManSys("a3bf45bfe89ebb31dac911bfbe299fcb2ce6491c", function (systems) {
            let hyphenNameToCamelCase = function (name) {
                let result = name
                    .replace(/-(.)/g, capture => capture.toUpperCase())
                    .replace(/-/g, '');
                return result;
            };
            return hyphenNameToCamelCase;
        });

        addManSys("de4c22f8bae0d00aad89fe0767d64f38da88a357", function () {
            let graphReport = function ({ graphFind, graphListNodes }) {
                let edges = graphFind();
                let nodes = graphListNodes();
                let nodePercent = (edges.length / nodes.length * 100).toPrecision(4);

                console.log("== Graph Report ==");
                console.log("Nodes: " + nodes.length);
                console.log("Edges: " + edges.length + " (" + nodePercent + "%)");
            };
            return graphReport;
        });

        addManSys("bcf4dfc4210f020178288d9c134cf6e3e94a6d63", function () {
            let stringReport = function ({stringFind}) {
                let strings = stringFind();

                strings = _.sortBy(strings, "string");

                console.log("== String Report ==");
                strings.forEach(value => {
                    console.log(`${value.id} => ${value.string}`);
                });
            };
            return stringReport;
        });

        addManSys("d5e195726a6a3650166a6591dc3d7619adaef98d", function (systems) {
            let getDataTime = function () {
                let graphTime = fs.statSync("./data/24c045b912918d65c9e9aaea9993e9ab56f50d2e.json").mtime;
                let stringTime = fs.statSync("./data/1cd179d6e63660fba96d54fe71693d1923e3f4f1.json").mtime;

                let latest = Math.max(graphTime.getTime(), stringTime.getTime());
                return latest;
            };
            return getDataTime;
        });

        addManSys("1d6976a263d64b64ac113f178e8ddc1d245b6120", function () {
            let writeNodeObject = function ({graphAssign, id, obj}) {
                for (let i in obj)
                    graphAssign({head: i, type: id, tail: obj[i]});
                return id;
            };
            return writeNodeObject;
        });

        addManSys("aed811d85de045e271fdfe4097349dbdae83db3f", function () {
            let writeBindFunc = function ({autoWriteNodeObject, writeEdge, id, func, params}) {
                let paramObj = autoWriteNodeObject(params);
                writeEdge({id, head: func, tail: paramObj});
                return id;
            };
            return writeBindFunc;
        });

        addManSys("091a8647a5d3dfbd5964e608a5490de592a4cb12", function () {
            let writeAutoParamFunc = function ({writeString, writeEdge, id, func, paramName}) {
                let strId = writeString(paramName);
                writeEdge({id, head: func, tail: strId});
                return id;
            };
            return writeAutoParamFunc;
        });

        addManSys("f520dd0e4da481f0fbc18584a7bf8098d19d3222", function () {
            let recreateLinks = function ({groupList, nameList}) {
                exec("rm -rf src/kitsune-core-src");
                exec("mkdir -p src/kitsune-core-src");

                let coreNodes = groupList("66564ec14ed18fb88965140fc644d7b813121c78");
                coreNodes.forEach(node => {
                    let myNames = nameList(node);
                    if (myNames && myNames.length > 0) {
                        try {
                            let cmdStr = "ln -s ../../src/kitsune-core/" + node + " src/kitsune-core-src/" + myNames[0];
                            exec(cmdStr);
                        } catch (e) {
                            console.log("Already a link for " + myNames[0]);
                        }
                    }
                });
            };
            return recreateLinks;
        });

        addManSys("a06a20a98b11deb325416a6897978342632db336", function () {
            let writeFuncCall = function ({writeValue, graphAssign, func, param}) {
                if (typeof func == "function")
                    func = func.id;

                if (!func)
                    throw new Error("funcId must not be null or must have an id");

                let ref = writeValue(param);

                let args = {head: ref.funcId, type: func, tail: ref.id};
                let result = graphAssign(args);

                return result;
            };
            return writeFuncCall;
        });

        addManSys("7e387151076d045bedf4b34eef4f84aab789306d", function () {
            let writeAndNameFuncCall = function ({writeFuncCall, nameFn, func, param, name}) {
                let id = writeFuncCall({func, param});
                graphAutoPut({head: "d2cd5a6f99428baaa05394cf1fe3afa17fb59aff", tail: id});
                nameFn({node: id, name});
                return id;
            };
            return writeAndNameFuncCall;
        });

        addManSys("4a263590d11f4ba73661c476564f7aacea8c8286", function () {
            let listLists = function ({getTails}) {
                let lists = getTails("283287a7c0c2ccaa5c69dfd99a800d13eb6805ea");
                return lists;
            };
            return listLists;
        });

        addManSys("42e9ce26666845ae2855a6ed619b54b8280b415b", function () {
            let edgeReport = function ({ graphFind, nameList, describeNode }) {
                console.log("== Graph Report ==");

                var edgeTypes = {};

                let makeFn = function (groupId) {
                    return edgeId => {
                        let edge = graphFind({id: edgeId})[0];
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
                    edgeTypes[name + "-group"] = makeFn(coreNode);
                });

                edgeTypes["name-edge"] = function (edgeId) {
                    let search = graphFind({head: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0", tail: edgeId});
                    return search.length;
                };

                let edges = graphFind();
                let edgeIds = _.map(edges, "id");
                let edgeReport = _.map(edgeIds, function (edge) {
                    let types = _.map(edgeTypes, (edgeType, name) => edgeType(edge) ? name : null).filter(x => x);
                    return {edge, types};
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
                    let edge = graphFind({id: data.edge})[0];
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
    }

    return manualSystems;
}

module.exports = buildManualSystemBuilder;
