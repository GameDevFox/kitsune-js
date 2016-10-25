let _ = require("lodash");

let fs = require("fs");
let exec = require("child_process").execSync;

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

    // GENERAL //
    addManSys("e35f8959f853683e0c164af7e907d881ec62c46a", function(systems) {
        let isArray = systems("c04c9e4cf83ffbde1c5254409f078ac39d144c10");

        let castToArray = function({ isArray, input }) {
            input = isArray(input) ? input : [input];
            return input;
        };
        castToArray = bindAndAuto(castToArray, { isArray }, "input");
        return castToArray;
    });

    addManSys("b2b0b2c49dae0b75a8681b0cd0afeba3e3e65265", function(systems) {
        let mapMergeFuncBuilder = function(node) {
            let arrayFunc = systems(node);
            return function(inputArray) {
                let resultArrays = inputArray.map(arrayFunc);
                let result = _.flatten(resultArrays);
                return result;
            };
        };
        return mapMergeFuncBuilder;
    });

    addManSys("7efca9ebecc3eded126cef2ef89c67bb35516d78", function(systems) {
        let readChain = systems("97142d3a71acdb994784bb0d57450ddd3513d41d");

        let chainFuncBuilder = function({ readChain, systems, node }) {
            let chain = readChain(node);
            let funcs = chain.map(systems);

            return function(input) {
                let result = input;
                for(func of funcs)
                    result = func(result);
                return result;
            };
        };
        chainFuncBuilder = bindAndAuto(chainFuncBuilder, { readChain, systems }, "node");
        return chainFuncBuilder;
    });

    addManSys("725bf3d81ff4670a523206ba90c193dd536db85d", function(systems) {
        let deleteEdge = systems("f2a8d330f7980a2b757056a3d4790d03f4d68c0e");
        let writeEdge = systems("10ae12f47866d3c8e1d6cfeabb39fcf7e839a220");

        let updateEdge = function({ deleteEdge, writeEdge, edge }) {
            deleteEdge(edge.id);
            writeEdge(edge);
            let result = edge.id;
            return result;
        };
        updateEdge = bindAndAuto(updateEdge, { deleteEdge, writeEdge }, "edge");
        return updateEdge;
    });

    addManSys("985e17bdc3c4406fb3e61de0d2ad6d79f7dc04f3", function(systems) {
        let virtualFuncBuilder = function(node) {
            let virtualFnSwitch = systems(node);
            return function(target) {
                let fn = virtualFnSwitch(target);
                return fn(target);
            };
        };
        return virtualFuncBuilder;
    });

    addManSys("bc9cf7aae6e2d2a418bcac62778bdd655c644085", function(systems) {
        let targetedVirtualFuncBuilder = function(node) {
            let virtualFnSwitch = systems(node);
            return function(input) {
                let fn = virtualFnSwitch(input.$target);
                return fn(input);
            };
        };
        return targetedVirtualFuncBuilder;
    });

    addManSys("5888eb9b00777ebd470a5e9d5522b12afebb7db5", function(systems) {
        let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");
        let readString = systems("08f8db63b1843f7dea016e488bd547555f345c59");

        let targetedSystemBuilder = function({ readEdge, systems, readString, node }) {
            let edge = readEdge(node);
            let func = systems(edge.head);
            let paramName = readString(edge.tail);
            return function(input) {
                input[paramName] = input.$target;
                delete input.$target;
                return func(input);
            };
        };
        targetedSystemBuilder = bindAndAuto(targetedSystemBuilder, { readEdge, systems, readString }, "node");
        return targetedSystemBuilder;
    });

    addManSys("6807e56240bfb462f4aaf8195b6be8d5fd053350", function(systems) {
        let hasTailAssign = systems("10ab1718fa83f48ec2cd14bd8d2b7b44cbc7f9dd");

        let hasTailAssignTypeBuilder = function({ hasTailAssign, type }) {
            return function(node) {
                let result = hasTailAssign({ type, node });
                return result;
            };
        };
        hasTailAssignTypeBuilder = bindAndAuto(hasTailAssignTypeBuilder, { hasTailAssign }, "type");
        return hasTailAssignTypeBuilder;
    });

    addManSys("c661457ccddf43406886a34c10e8a3049bbd26d0", function(systems) {
        let getTailAssign = systems("1e51b328e86262ad616cbac51c1a87371e454c2c");

        let getTailAssignBuilder = function({ getTailAssign, type }) {
            return function(node) {
                let result = getTailAssign({ type, node });
                return result;
            };
        };
        getTailAssignBuilder = bindAndAuto(getTailAssignBuilder, { getTailAssign }, "type");
        return getTailAssignBuilder;
    });

    addManSys("10ab1718fa83f48ec2cd14bd8d2b7b44cbc7f9dd", function(systems) {
        let getTailAssign = systems("1e51b328e86262ad616cbac51c1a87371e454c2c");

        let hasTailAssign = function({ getTailAssign, type, node }) {
            let tailAssign = getTailAssign({ type, node });
            let result = tailAssign.length > 0;
            return result;
        };
        hasTailAssign = bind({ func: hasTailAssign, params: { getTailAssign }});
        return hasTailAssign;
    });

    addManSys("1e51b328e86262ad616cbac51c1a87371e454c2c", function(systems) {
        let factor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");

        let getTailAssign = function({ factor, type, node }) {
            let f = factor({ head: node, type });
            let result = f.map(x => x.tail);
            return result;
        };
        getTailAssign = bind({ func: getTailAssign, params: { factor }});
        return getTailAssign;
    });

    addManSys("25230375a7135e5fa9248c18908b9edbef6a0e38", function(systems) {
        let factor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");

        let getSingleTailAssign = function({ factor, type, node }) {
            let f = factor({ head: node, type });
            if(f.length > 1)
                throw new Error(`Node '${node}' has more than one tail assign of type: ${type}`);

            let result = f.length ? f[0].tail : null;
            return result;
        };
        getSingleTailAssign = bind({ func: getSingleTailAssign, params: { factor }});
        return getSingleTailAssign;
    });

    addManSys("4d93b56e9f9d81c189417aff770052589d930d7e", function(systems) {
        let getSingleTailAssign = systems("25230375a7135e5fa9248c18908b9edbef6a0e38");

        let getSingleTailAssignBuilder = function({ getSingleTailAssign, type }) {
            let result = bind({ func: getSingleTailAssign, params: { type }});
            result = autoParam({ func: result, paramName: "node" });
            return result;
        };
        getSingleTailAssignBuilder = bind({ func: getSingleTailAssignBuilder, params: { getSingleTailAssign }});
        return getSingleTailAssignBuilder;
    });

    addManSys("791c75dbf041d6343bc059f420ad4e591aa3f0ad", function(systems) {
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

        let listEdges = function() {
            let edges = graphFind();
            let edgeIds = edges.map(x => x.id);
            return edgeIds;
        };
        return listEdges;
    });

    addManSys("3547f89e53986393711f8c1a1a278f4880b7bb08", function(systems) {
        let factor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");

        let parentType = "cd522ceab4c9285b7b5bafe107eab8d738e7bc59";

        let listTypes = function({ factor }) {
            let f = factor({ type: parentType });
            let result = f.map(x => x.head);
            result = _.uniq(result);
            return result;
        };
        listTypes = bind({ func: listTypes, params: { factor }});
        return listTypes;
    });

    addManSys("dd350e001cd1498b968bcd04df198c03ea072539", function(systems) {
        let factor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");

        let parentType = "cd522ceab4c9285b7b5bafe107eab8d738e7bc59";

        let isType = function({ factor, node }) {
            let f = factor({ head: node, type: parentType });
            let result = f.length > 0;
            return result;
        };
        isType = bind({ func: isType, params: { factor }});
        isType = autoParam({ func: isType, paramName: "node" });
        return isType;
    });

    addManSys("b70da77f2d3efbdda74669fb5e60b0ddaab06d87", function(systems) {
        let readString = systems("08f8db63b1843f7dea016e488bd547555f345c59");

        let hasPropertyBuilder = function({ readString, node }) {
            let propName = readString(node);
            return function(input) {
                return (propName in input);
            };
        };
        hasPropertyBuilder = bind({ func: hasPropertyBuilder, params: { readString }});
        hasPropertyBuilder = autoParam({ func: hasPropertyBuilder, paramName: "node" });
        return hasPropertyBuilder;
    });

    addManSys("eda1dd6a89611ea7dcc225580bc5ea92975a9e22", function(systems) {
        let descTypeBuilder = systems("2d8022c3ef2d5b3ecc906c8429aab57c672a1b29");

        let typeBuilder = function({ descTypeBuilder, node }) {
            let fn = descTypeBuilder(node);
            return function(input) {
                let desc = fn(input);
                let result = desc.result;
                return result;
            };
        };
        typeBuilder = bind({ func: typeBuilder, params: { descTypeBuilder }});
        typeBuilder = autoParam({ func: typeBuilder, paramName: "node" });
        return typeBuilder;
    });

    addManSys("2d8022c3ef2d5b3ecc906c8429aab57c672a1b29", function(systems) {
        let getTypeTree = systems("51322740c8de7e951c6a5ed1462edb352d60f33b");
        let applyResults = systems("2699b90bfdc36e4beb2404b750316835f697ba3b");

        function checkNode({ typeNode, typeResults, input }) {
            let node = typeNode.node;

            if(node in typeResults)
                return typeResults[node];

            let deps = typeNode.deps;
            let prereqs = deps === true ? true : checkDeps({ deps, typeResults, input });

            let result;
            if(typeNode.derivedTypeFn) {
                let type = systems(typeNode.derivedTypeFn);
                result = type(prereqs);
            } else {
                let type = systems(typeNode.node);
                let prereq = prereqs[0];
                result = prereq ? false : type(input);
            }

            typeResults[node] = result;
            return result;
        }

        function checkDeps({ deps, typeResults, input }) {
            let result = [];
            for(let dep of deps) {
                let nodeResult = checkNode({ typeNode: dep, typeResults, input });
                result.push(nodeResult);
            }
            return result;
        }

        let descTypeBuilder = function({ getTypeTree, node }) {
            let typeTree = getTypeTree(node);

            return function(input) {
                let typeResults = {};
                checkNode({ typeNode: typeTree, typeResults, input });
                let result = applyResults({ typeTree, typeResults });
                return result;
            };
        };
        descTypeBuilder = bind({ func: descTypeBuilder, params: { getTypeTree }});
        descTypeBuilder = autoParam({ func: descTypeBuilder, paramName: "node" });
        return descTypeBuilder;
    });

    addManSys("2699b90bfdc36e4beb2404b750316835f697ba3b", function(systems) {
        let applyResults = function({ typeTree, typeResults }) {
            let node = typeTree.node;
            typeTree.result = typeResults[node];

            let deps = typeTree.deps || [];
            for(let dep of deps)
                applyResults({ typeTree: dep, typeResults });

            return typeTree;
        };
        return applyResults;
    });

    addManSys("51322740c8de7e951c6a5ed1462edb352d60f33b", function(systems) {
        let isDerivedType = systems("c479bb7023cf898287beee3bd6e8c616ff6afe8d");
        let getHeads = systems("fc83ddd594c9b4fa2a44b3b42d8f1824d0f68c3e");
        let getTails = systems("a8a338d08b0ef7e532cbc343ba1e4314608024b2");
        let factor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");

        let derivedType = "daf93e35e6521c3af6de24d91121ed557a089b3e";
        let parentType = "cd522ceab4c9285b7b5bafe107eab8d738e7bc59";
        let isAnything = "2efc0dfc9c2e65aa9aabb3b29346315cd1330761";

        let derivedTypeFns = getTails(derivedType);

        let getTypeTree;
        function fn({ isDerivedType: isDerivedTypeFn, getHeads, getTails, factor, node }) {
            let types = null;

            // Use impl func here
            let derivedTypeFn = null;
            let isDerivedType = isDerivedTypeFn(node);
            if(isDerivedType) {
                derivedTypeFn = getHeads(node).filter(x => derivedTypeFns.includes(x))[0];
                types = getTails(node);
            } else {
                let f = factor({ head: node, type: parentType });
                if(f.length !== 0) {
                    let inputType = f[0].tail;
                    if(inputType != isAnything)
                        types = [inputType];
                    else
                        return true;
                }
            }

            let deps = [];
            if(types && types.length) {
                for (let type of types) {
                    let typeTree = getTypeTree(type);
                    deps.push(typeTree);
                }
            }

            let result = { node, derivedTypeFn, deps };
            return result;
        }
        getTypeTree = fn;
        getTypeTree = bind({ func: getTypeTree, params: { isDerivedType, getHeads, getTails, factor }});
        getTypeTree = autoParam({ func: getTypeTree, paramName: "node" });
        return getTypeTree;
    });

    addManSys("6db94400d9b6b8904970a5fdf2b1d080b981572d", function(systems) {
        let and = function(typeResults) {
            for(let typeResult of typeResults)
                if(!typeResult)
                    return false;
            return true;
        };
        return and;
    });

    addManSys("45917b34b8a7812461d191790fd9116afad36dff", function(systems) {
        let or = function(typeResults) {
            for(let typeResult of typeResults)
                if(typeResult)
                    return true;
            return false;
        };
        return or;
    });

    addManSys("5ed7da047e31af439507c0f2311521a7c41bf7eb", function(systems) {
        let xor = function(typeResults) {
            let trueCount = 0;
            for(let typeResult of typeResults)
                if(typeResult)
                    trueCount++;
            return trueCount % 2 !== 0;
        };
        return xor;
    });

    addManSys("1d89395460431d99a68ee10632caa2744b346829", function(systems) {
        let not = function(typeResult) {
            return !typeResult;
        };
        return not;
    });

    addManSys("c27664993b4c1de48d4b1545f87171018336ba43", function(systems) {
        let loadData = function({ coll, putFn, data }) {
            // Clear collection
            coll.clear();

            // Load data
            data.forEach(value => {
                putFn({ element: value });
            });
        };
        return loadData;
    });

    // Graph Stuff
    addManSys("adf6b91bb7c0472237e4764c044733c4328b1e55", function(systems) {
        let lokiColl = systems("0741c54e604ad973eb41c02ab59c5aabdf2c6bc3");
        let valueFunc = systems("62126ce823b700cf7441b5179a3848149c9d8c89");

        let graphColl = lokiColl();
        return valueFunc(graphColl);
    });

    addManSys("7e5e764e118960318d513920a0f33e4c5ae64b50", function(systems) {
        let lokiPut = systems("f45ccdaba9fdca2234be7ded1a5578dd17c2374e");
        let graphColl = systems("adf6b91bb7c0472237e4764c044733c4328b1e55");

        let writeEdge = bind({ func: lokiPut, params: { db: graphColl() }});
        return writeEdge;
    });

    addManSys("a1e815356dceab7fded042f3032925489407c93e", function(systems) {
        let lokiFind = systems("30dee1b715bcfe60afeaadbb0e3e66019140686a");
        let graphColl = systems("adf6b91bb7c0472237e4764c044733c4328b1e55");

        let graphFind = bind({ func: lokiFind, params: { db: graphColl() }});
        graphFind = autoParam({ func: graphFind, paramName: "where" });
        return graphFind;
    });

    addManSys("abc1100cf7579a10d519719dc72ff7ead4a5914b", function(systems) {
        let buildLoadDataFn = systems("c27664993b4c1de48d4b1545f87171018336ba43");
        let graphColl = systems("adf6b91bb7c0472237e4764c044733c4328b1e55");
        let writeEdge = systems("7e5e764e118960318d513920a0f33e4c5ae64b50");

        let loadGraphData = bind({ func: buildLoadDataFn, params: { coll: graphColl(), putFn: writeEdge }});
        loadGraphData = autoParam({ func: loadGraphData, paramName: "data" });
        return loadGraphData;
    });

    // String Stuff
    addManSys("ce6de1160131bddb4e214f52e895a68583105133", function(systems) {
        let lokiColl = systems("0741c54e604ad973eb41c02ab59c5aabdf2c6bc3");
        let valueFunc = systems("62126ce823b700cf7441b5179a3848149c9d8c89");

        let stringColl = lokiColl();
        return valueFunc(stringColl);
    });

    addManSys("b4cdd85ce19700c7ef631dc7e4a320d0ed1fd385", function(systems) {
        let lokiPut = systems("f45ccdaba9fdca2234be7ded1a5578dd17c2374e");
        let stringColl = systems("ce6de1160131bddb4e214f52e895a68583105133");

        let writeString = bind({ func: lokiPut, params: { db: stringColl() }});
        return writeString;
    });

    addManSys("8b1f2122a8c08b5c1314b3f42a9f462e35db05f7", function(systems) {
        let lokiFind = systems("30dee1b715bcfe60afeaadbb0e3e66019140686a");
        let stringColl = systems("ce6de1160131bddb4e214f52e895a68583105133");

        let stringFind = bind({ func: lokiFind, params: { db: stringColl() }});
        stringFind = autoParam({ func: stringFind, paramName: "where" });
        return stringFind;
    });

    addManSys("aa9b9341f8c4236d27831625ebbb91f2031cfb4b", function(systems) {
        let buildLoadDataFn = systems("c27664993b4c1de48d4b1545f87171018336ba43");
        let stringColl = systems("ce6de1160131bddb4e214f52e895a68583105133");
        let writeString = systems("b4cdd85ce19700c7ef631dc7e4a320d0ed1fd385");

        let loadStringData = bind({ func: buildLoadDataFn, params: { coll: stringColl(), putFn: writeString }});
        loadStringData = autoParam({ func: loadStringData, paramName: "data" });
        return loadStringData;
    });

    // END STUFF

    addManSys("307f3450473542f1b5b31b23eb9bd00197c9f4e8", function(systems) {
        let getImplFuncByNode = systems("6a77c3877d99fa29846eae647cea102edab55903");

        let virtualFuncSwitchBuilder = function({ getImplFuncByNode, node }) {
            let func = getImplFuncByNode(node);
            let doubleFunc = function(target) {
                let innerFunc = func(target);
                return function(args) {
                    let input = _.merge(args, { $target: target });
                    return innerFunc(input);
                };
            };
            return doubleFunc;
        };
        virtualFuncSwitchBuilder = bindAndAuto(virtualFuncSwitchBuilder, { getImplFuncByNode }, "node");
        return virtualFuncSwitchBuilder;
    });

    addManSys("e4e33d78e37170738a4f84925f4ada0d80ec74f6", function(systems) {
        let readChain = systems("97142d3a71acdb994784bb0d57450ddd3513d41d");
        let readEdge = systems("25cff8a2afcf560b5451d2482dbf9d9d69649f26");

        // TODO: Create read-func/write-func relationships for types
        let readTypeImpl = function({ readChain, readEdge, systems, node }) {
            let list = readChain(node);
            let result = list.map(item => {
                let { head: typeNode, tail: implNode } = readEdge(item);

                let type = systems(typeNode);
                let impl = systems(implNode);

                return [type, impl];
            });
            return result;
        };
        readTypeImpl = bindAndAuto(readTypeImpl, { readChain, readEdge, systems }, "node");
        return readTypeImpl;
    });

    addManSys("a82d6af4777c9f7036fc0a137f7cd31a2ec133b9", function(systems) {
        let getImplFunc = function({ typeImpl, input }) {
            for(let i in typeImpl) {
                let pair = typeImpl[i];
                let type = pair[0];

                if(type(input)) {
                    let implFunc = pair[1];
                    return implFunc;
                }
            }
            throw new Error("No implementation found for input: "+input);
        };
        return getImplFunc;
    });

    addManSys("6a77c3877d99fa29846eae647cea102edab55903", function(systems) {
        let readTypeImpl = systems("e4e33d78e37170738a4f84925f4ada0d80ec74f6");
        let getImplFunc = systems("a82d6af4777c9f7036fc0a137f7cd31a2ec133b9");

        // TODO: Rename to builder
        let getImplFuncByNode = function({ readTypeImpl, getImplFunc, typeImplNode }) {
            let typeImpl = readTypeImpl(typeImplNode);

            let boundGetImplFunc = bindAndAuto(getImplFunc, { typeImpl }, "input");
            return boundGetImplFunc;
        };
        getImplFuncByNode = bindAndAuto(getImplFuncByNode, { readTypeImpl, getImplFunc }, "typeImplNode");
        return getImplFuncByNode;
    });

    addManSys("1f7e292e777e8e80355290c6f7d1ff901766931b", function(systems) {
        let describeNode = function({ typeMap, node }) {
            let result = [];
            for(let key in typeMap) {
                let type = typeMap[key];

                let isA = type(node);
                if(isA)
                    result.push(key);
            }
            return result;
        };
        return describeNode;
    });

    addManSys("6deaa7dcfe0bcf82e193ea7c4f28b0ae4b9ad894", function(systems) {
        let getTails = systems("a8a338d08b0ef7e532cbc343ba1e4314608024b2");
        let describeNode = systems("1f7e292e777e8e80355290c6f7d1ff901766931b");

        let nodeDescriptionBuilder = function({ getTails, systems, node }) {
            let typeNodes = getTails(node);
            let typeMap = {};
            for(let typeNode of typeNodes)
                typeMap[typeNode] = systems(typeNode);

            return bindAndAuto(describeNode, { typeMap }, "node");
        };
        nodeDescriptionBuilder = bindAndAuto(nodeDescriptionBuilder, { getTails, systems }, "node");
        return nodeDescriptionBuilder;
    });

    addManSys("f2a8d330f7980a2b757056a3d4790d03f4d68c0e", function(systems) {
        let graphRemove = systems("e773ae04f0879e8a949f42d34b67f4d619c986a9");
        graphRemove = autoParam({ func: graphRemove, paramName: "id" });
        return graphRemove;
    });

    // write "toward" chain or "away" chain
    // "away" for lists (default)
    // "toward" for types and super types
    addManSys("f3106f372a55b1e33b3b666d5df0c9e96f06cba1", function(systems) {
        let splitChain = systems("0b5e055cd86ea41c8df64b3e41235e553f564b13");
        let deleteLink = systems("c3d64c328223bc8739858c73a01b6c56986f9e74");
        let writeLink = systems("aaed3741d764d724eb2f0b0b48faed8d6834ad91");
        let readLink = systems("50d8281dde04445fa434a9617ed7b033b495900c");
        let graphRemove = systems("f2a8d330f7980a2b757056a3d4790d03f4d68c0e");
        let writeEdge = systems("10ae12f47866d3c8e1d6cfeabb39fcf7e839a220");

        let spliceChain = function({
                splitChain, deleteLink, writeLink, readLink, graphRemove, writeEdge,
                deleteCount, insert, // TODO: deleteUntil
                away, node }) {
            let tail = node;
            let split = splitChain({ away, node: tail });

            // Delete
            for (var i = 0; split !== null && i < deleteCount; i++)
                split = deleteLink({ away, node: split });

            // Insert
            insert = insert || [];
            for (let val of insert)
                tail = writeLink({ away, link: tail, node: val });

            // Join
            if (split !== null) {
                let joinLink = readLink({away, node: split});
                if (joinLink) {
                    graphRemove(joinLink.id);
                    let newEdge = away ? {head: tail, tail: joinLink.tail} : {head: joinLink.head, tail: tail};
                    newEdge.id = joinLink.id;
                    writeEdge(newEdge);
                }
            }

            return tail;
        };
        spliceChain = bind({ func: spliceChain, params: {
            splitChain, deleteLink, writeLink, readLink, graphRemove, writeEdge
        }});
        return spliceChain;
    });

    addManSys("0b5e055cd86ea41c8df64b3e41235e553f564b13", function(systems) {
        let readLink = systems("50d8281dde04445fa434a9617ed7b033b495900c");
        let graphRemove = systems("f2a8d330f7980a2b757056a3d4790d03f4d68c0e");
        let hashRandom = systems("bf565ae1309f425b0ab00efa2ba541ae03ad22cf");
        let writeEdge = systems("10ae12f47866d3c8e1d6cfeabb39fcf7e839a220");

        let splitChain = function({ readLink, graphRemove, hashRandom, writeEdge, away, node }) {
            let link = readLink({ away, node });
            if(!link)
                return null;

            graphRemove(link.id);

            let newLink = hashRandom();
            let newEdge = away ? { head: newLink, tail: link.tail } : { head: link.head, tail: newLink };
            newEdge.id = link.id;
            writeEdge(newEdge);

            return newLink;
        };
        splitChain = bind({ func: splitChain, params: { readLink, graphRemove, hashRandom, writeEdge }});
        return splitChain;
    });

    addManSys("c3d64c328223bc8739858c73a01b6c56986f9e74", function(systems) {
        let readLink = systems("50d8281dde04445fa434a9617ed7b033b495900c");
        let graphRemove = systems("f2a8d330f7980a2b757056a3d4790d03f4d68c0e");

        let deleteLink = function({ readLink, graphRemove, away, node }) {
            let link = readLink({ away, node });
            if(!link)
                return null;

            let result = link.id;
            graphRemove(result);
            return result;
        };
        deleteLink = bind({ func: deleteLink, params: { readLink, graphRemove }});
        return deleteLink;
    });

    addManSys("9c25645ecb274b261f1afebd115b09f6e35f7cec", function(systems) {
        let traceChain = systems("b1565419b484bc440da1a81316cec147aec4e1dc");

        let getLastLink = function({ traceChain, away, skip, limit, until, node }) {
            let trace = traceChain({ away, skip, limit, until, node });
            let result = trace.length ? trace[trace.length-1].next : node;
            return result;
        };
        getLastLink = bind({ func: getLastLink, params: { traceChain }});
        return getLastLink;
    });

    addManSys("aaed3741d764d724eb2f0b0b48faed8d6834ad91", function(systems) {
        let autoWriteEdge = systems("f7b073eb5ef5680e7ba308eaf289de185f0ec3f7");

        let writeLink = function({ autoWriteEdge, away, link, node }) {
            let nextLink = away ? autoWriteEdge({ head: link, tail: node })
                                : autoWriteEdge({ head: node, tail: link });
            return nextLink;
        };
        writeLink = bind({ func: writeLink, params: { autoWriteEdge }});
        return writeLink;
    });

    addManSys("f934a7bede868c16b8603c20f31965a262ac19f4", function(systems) {
        let writeLink = systems("aaed3741d764d724eb2f0b0b48faed8d6834ad91");

        let writeChain = function({ writeLink, away, node, items }) {
            let link = node;
            for(let item of items)
                link = writeLink({ away, link, node: item });
            return link;
        };
        writeChain = bindAndAuto(writeChain, { writeLink });
        return writeChain;
    });

    addManSys("f7d85e5fdaa712e9ce55724d1bd2006ebc48032c", function(systems) {
        let writeChain = systems("f934a7bede868c16b8603c20f31965a262ac19f4");
        let writeAwayChain = bindAndAuto(writeChain, { away: true });
        return writeAwayChain;
    });

    addManSys("50d8281dde04445fa434a9617ed7b033b495900c", function(systems) {
        let graphFind = systems("a1e815356dceab7fded042f3032925489407c93e");

        // TODO: Make a version of this that returns { link, next, value } format
        let readLink = function({ graphFind, away, node }) {
            let search = away ? { head: node } : { tail: node };
            let edges = graphFind(search);

            if(edges.length > 1)
                throw new Error("readLink: Multiple tails for node: " + node);

            let result = edges.length === 0 ? null : edges[0];
            return result;
        };
        readLink = bind({ func: readLink, params: { graphFind }});
        return readLink;
    });

    addManSys("b1565419b484bc440da1a81316cec147aec4e1dc", function(systems) {
        let readLink = systems("50d8281dde04445fa434a9617ed7b033b495900c");

        let traceChain = function({ readLink, away, skip, limit, until, node }) {
            if(away === undefined)
                throw new Error("'away' must be set");

            let base = node;

            let count = 0;
            let result = [];
            while(true) {
                if (limit !== undefined && result.length >= limit)
                    break;

                let next;
                try {
                    next = readLink({away, node: base});
                } catch(e) {
                    console.warn("traceChain: link found with multiple tails");
                    break;
                }
                if(!next)
                    break;


                base = next.id;
                if(!skip || count >= skip) {
                    let link = away ? next.head : next.tail;
                    let value = away ? next.tail : next.head;
                    result.push({ link, next: base, value });
                    if(until && (value == until))
                        break;
                }

                count++;
            }
            return result;
        };
        traceChain = bindAndAuto(traceChain, { readLink });
        return traceChain;
    });

    addManSys("26c327a18c224378783ee1603f46ac9618462b85", function(systems) {
        let traceChain = systems("b1565419b484bc440da1a81316cec147aec4e1dc");

        let readChain = function({ traceChain, away, skip, limit, until, node }) {
            let trace = traceChain({ away, skip, limit, until, node });
            let result = trace.map(x => x.value);
            return result;
        };
        readChain = bindAndAuto(readChain, { traceChain });
        return readChain;
    });

    addManSys("97142d3a71acdb994784bb0d57450ddd3513d41d", function(systems) {
        let readChain = systems("26c327a18c224378783ee1603f46ac9618462b85");
        let readAwayChain = bindAndAuto(readChain, { away: true }, "node");
        return readAwayChain;
    });

    addManSys("cd12108f90eb59a6044fe894815bc104fe2fd201", function(systems) {
        let readChain = systems("26c327a18c224378783ee1603f46ac9618462b85");
        let readAwayChain = bindAndAuto(readChain, { away: true });
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
            return function(object) {
                let field = object[name];
                let result = type(field);
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

    // TODO: Deprecate this
    addManSys("3528d88fb3d5a3dc22f2ffbd40690ec71edd3819", function(systems) {
        // TODO: Swap for a getInputType system
        let inputType = "0713c6285e4a9d9fc96b375ff2dce3e1807d942d";
        let factor = systems("c83cd0ab78a1d57609f9224f851bde6d230711d0");

        // RULE: Node always has exactly one input type
        let fullTypeBuilder = function({ factor, systems, node }) {
            let result = factor({ head: node, type: inputType })[0];

            let child = systems(node);
            let parent = systems(result.tail);

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

    // TODO: Deprecate this
    addManSys("5d134bcf95eb55efa7807da43e11e4fc37e269b9", function(systems) {
        // TODO: Swap for a getInputType system
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

        addManSys("2efc0dfc9c2e65aa9aabb3b29346315cd1330761", function(systems) {
            let isAnything = function() {
                return true;
            };
            return isAnything();
        });

        addManSys("5ee5fd45d44b35eec83eeab4d1e4c9edbf77ee0d", function(systems) {
            let isNothing = function() {
                return false;
            };
            return isNothing();
        });

        // list-manual-systems
        addManSys("12d8b6e0e03d5c6e5d5ddb86bda423d50d172ec8", function (systems) {
            return () => _.keys(manSysFuncs);
        });

        // list-system-files
        addManSys("5277dc011cbc9800046edeb4460f7138e060a935", function (systems) {
            let files = fs.readdirSync("./src/kitsune-core").map(x => x.replace(/\.js/g, ""));
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
            let listSystemFiles = systems("5277dc011cbc9800046edeb4460f7138e060a935");

            let recreateLinks = function ({ groupList, nameList }) {
                exec("rm -rf src/kitsune-core-src");
                exec("mkdir -p src/kitsune-core-src");

                // let coreNodes = groupList("66564ec14ed18fb88965140fc644d7b813121c78");
                let coreNodes = listSystemFiles();
                coreNodes.forEach(node => {
                    let myNames = nameList(node);
                    if (myNames && myNames.length > 0) {
                        let name = myNames[0]+".js";
                        try {
                            let cmdStr = "ln -s ../../src/kitsune-core/" + node + ".js src/kitsune-core-src/" + name;
                            exec(cmdStr);
                        } catch (e) {
                            console.log("Already a link for " + name);
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
