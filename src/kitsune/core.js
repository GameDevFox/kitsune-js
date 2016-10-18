let _ = require("lodash");

let systemLoader = require("kitsune-core/31d21eb2620a8f353a250ad2edd4587958faf3b1.js");
let buildManualSystemLoader = require("kitsune/manual-systems.js");

let Logger = require("js-logger");

let rootLogger = Logger.get("root");
let bootstrapLogger = Logger.get("bootstrap");

rootLogger.setLevel(Logger.INFO);
bootstrapLogger.setLevel(Logger.WARN);

function bootstrap() {

    let log = bootstrapLogger;

    // STEP 1: LOADER
    log.info(":Loader");
    let bind = systemLoader({ path: "kitsune-core", id: "878c8ef64d31a194159765945fc460cb6b3f486f" });
    let autoParam = systemLoader({ path: "kitsune-core", id: "b69aeff3eb1a14156b1a9c52652544bcf89761e2" });
    let loader = buildLoader({ bind, autoParam });

    // STEP 2: CACHE MODULE
    log.info(":Cache Modules");
    let { cache, putSystem } = buildCache({ loader, bind });
    putSystem({ id: "b0dca2585eb4cb77f2b255e8afa45de96610f1bc", system: cache });
    putSystem({ id: "a26808f06030bb4c165ecbfe43d9d200672a0878", system: putSystem });

    // STEP 3: BUILD CORE
    log.info(":Build Core");
    let modules = [loader];
    let systems = buildCore({ cache, modules, putSystem, bind, autoParam });
    putSystem({ id: "ab3c2b8f8ef49a450344437801bbadef765caf69", system: systems });

    // STEP 4: BUILD AND LOAD SYSTEM LOADERS
    log.info(":Manual System Loader");
    let manualSystems = buildManualSystemLoader(systems);
    modules.push(manualSystems);

    // STEP 5: LOAD DATA SYSTEMS
    log.info(":Load Data Systems");
    loadDataSystems({ systems, putSystem });

    log.info(":Function Builder");
    let funcBuilder = systems("4c2699dc1fec0111f46c758489a210eb7f58e4df");
    modules.push(funcBuilder);

    return { modules, systems };
}

function buildLoader({ bind, autoParam }) {
    let loader = bind({ func: systemLoader, params: { path: "kitsune-core" }});
    loader = autoParam({ func: loader, paramName: "id" });
    return loader;
}

function buildCache({ loader, bind }) {
    let systemList = {};

    let dictFunc = loader("30c8959d5d7804fb80cc9236edec97e04e5c4c3d"); // dictionary-function
    let cache = dictFunc(systemList);

    var putSystem = loader("d1e484530280752dd99b7e64a854f96cf66dd502"); // put-system
    putSystem = bind({ func: putSystem, params: { systemList }});

    return { cache, putSystem };
}

function buildCore({ cache, modules, putSystem, bind, autoParam }) {
    let getSystem = function({ cache, modules, id }) {

        let system = cache(id);

        if(!system) {
            for(let key in modules) {
                let module = modules[key];
                system = module(id);

                if(system)
                    break;
            }

            if(system)
                putSystem({ id, system });
            else
                rootLogger.warn("System was not found for id: "+id);
        }
        return system;
    };
    getSystem = bind({ func: getSystem, params: { cache, modules }});
    getSystem = autoParam({ func: getSystem, paramName: "id" });

    let listSystems = (nodes) => nodes.map(getSystem);

    let systems = function(nodes) {
        return _.isArray(nodes) ? listSystems(nodes) : getSystem(nodes);
    };

    return systems;
}

function loadDataSystems({ systems, putSystem }) {

    let graphData = systems("24c045b912918d65c9e9aaea9993e9ab56f50d2e");
    let stringData = systems("1cd179d6e63660fba96d54fe71693d1923e3f4f1");

    let loadGraphData = systems("abc1100cf7579a10d519719dc72ff7ead4a5914b");
    let loadStringData = systems("aa9b9341f8c4236d27831625ebbb91f2031cfb4b");

    let loadedTime;
    let getLoadedTime = () => loadedTime;
    putSystem({ id: "9a3a7c56e96abc04bd92f63cdfc5f31d49f778cd", system: getLoadedTime });

    // Populate collections
    let loadData = function() {
        loadGraphData(graphData());
        loadStringData(stringData());

        loadedTime = new Date().getTime();
    };
    putSystem({ id: "d575ab0a08a412215384e34ccbf363e960f3b392", system: loadData });

    loadData();
}

module.exports = bootstrap;
