import systemLoader from "kitsune-core/31d21eb2620a8f353a250ad2edd4587958faf3b1";
import buildManualSystemLoader from "kitsune/manual-systems.js";

import Logger from "js-logger";
let rootLogger = Logger.get("root");
let bootstrapLogger = Logger.get("bootstrap");

rootLogger.setLevel(Logger.INFO);
bootstrapLogger.setLevel(Logger.WARN);

// BOOTSTRAP - STEP 1
function buildLoader({ bind, autoParam }) {
    let loader = bind({ func: systemLoader, params: { path: "kitsune-core" }});
    loader = autoParam({ func: loader, paramName: "id" });
    return loader;
}

// BOOTSTRAP - STEP 2
function buildCache({ loader, bind }) {
    let systemList = {};

    let dictFunc = loader("30c8959d5d7804fb80cc9236edec97e04e5c4c3d"); // dictionary-function
    let cache = dictFunc(systemList);

    var putSystem = loader("d1e484530280752dd99b7e64a854f96cf66dd502"); // put-system
    putSystem = bind({ func: putSystem, params: { systemList }});

    return { cache, putSystem };
}

// BOOTSTRAP - STEP 3
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

            if(system)
                putSystem({ id, system });
            else
                rootLogger.warn("System was not found for id: "+id);
        }
        return system;
    };
    systems = bind({ func: systems, params: { cache, modules }});
    systems = autoParam({ func: systems, paramName: "id" });

    return systems;
}

// BOOTSTRAP - STEP 4
function loadDataSystems({ loader, bind, autoParam, putSystem }) {

    let graphData = loader("24c045b912918d65c9e9aaea9993e9ab56f50d2e");
    let stringData = loader("1cd179d6e63660fba96d54fe71693d1923e3f4f1");

    let lokiColl = loader("0741c54e604ad973eb41c02ab59c5aabdf2c6bc3");
    let lokiPut = loader("f45ccdaba9fdca2234be7ded1a5578dd17c2374e");
    let lokiFind = loader("30dee1b715bcfe60afeaadbb0e3e66019140686a");

    let valueFunc = loader("62126ce823b700cf7441b5179a3848149c9d8c89");

    // Graph
    let graphColl = lokiColl();
    putSystem({ id: "adf6b91bb7c0472237e4764c044733c4328b1e55", system: valueFunc(graphColl) });

    let graphPut = bind({ func: lokiPut, params: { db: graphColl }});
    putSystem({ id: "7e5e764e118960318d513920a0f33e4c5ae64b50", system: graphPut });

    let graphFind = bind({ func: lokiFind, params: { db: graphColl }});
    graphFind = autoParam({ func: graphFind, paramName: "where" });
    putSystem({ id: "a1e815356dceab7fded042f3032925489407c93e", system: graphFind });

    // String
    let stringColl = lokiColl();
    putSystem({ id: "ce6de1160131bddb4e214f52e895a68583105133", system: valueFunc(stringColl) });

    let stringPut = bind({ func: lokiPut, params: { db: stringColl }});
    putSystem({ id: "b4cdd85ce19700c7ef631dc7e4a320d0ed1fd385", system: stringPut });

    let stringFind = bind({ func: lokiFind, params: { db: stringColl }});
    stringFind = autoParam({ func: stringFind, paramName: "where" });
    putSystem({ id: "8b1f2122a8c08b5c1314b3f42a9f462e35db05f7", system: stringFind });

    let buildLoadDataFn = function({ coll, putFn, data }) {
        // Clear collection
        coll.clear();

        // Load data
        data.forEach(value => {
            putFn({ element: value });
        });
    };

    let loadGraphData = bind({ func: buildLoadDataFn, params: { coll: graphColl, putFn: graphPut }});
    loadGraphData = autoParam({ func: loadGraphData, paramName: "data" });
    putSystem({ id: "abc1100cf7579a10d519719dc72ff7ead4a5914b", system: loadGraphData });
    let loadStringData = bind({ func: buildLoadDataFn, params: { coll: stringColl, putFn: stringPut }});
    loadStringData = autoParam({ func: loadStringData, paramName: "data" });
    putSystem({ id: "aa9b9341f8c4236d27831625ebbb91f2031cfb4b", system: loadStringData });

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

    return { graphFind, stringPut, stringFind };
}

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
    putSystem({ id: "a26808f06030bb4c165ecbfe43d9d200672a0878", system: putSystem });

    // STEP 3: BUILD CORE
    log.info(":Build Core");
    let modules = [loader];
    let systems = buildCore({ cache, modules, putSystem, bind, autoParam });
    putSystem({ id: "ab3c2b8f8ef49a450344437801bbadef765caf69", system: systems });

    // STEP 4: LOAD DATA SYSTEMS
    log.info(":Load Data Systems");
    let { graphFind, stringPut, stringFind } = loadDataSystems({ loader, bind, autoParam, putSystem });

    // Build and load system loaders
    log.info(":Manual System Loader");
    let manualSystems = buildManualSystemLoader(systems);
    modules.push(manualSystems);

    log.info(":Prime Function Builder");
    let primeFuncBuilder = systems("4c2699dc1fec0111f46c758489a210eb7f58e4df");
    modules.push(primeFuncBuilder);

    return { modules, systems };
}

module.exports = bootstrap;
