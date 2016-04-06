import fs from "fs";
import _ from "lodash";
import { expect } from "chai";

import { Collection } from "lokijs";

import systemLoader from "kitsune-core/31d21eb2620a8f353a250ad2edd4587958faf3b1"; // system-loader
let loader = bind(systemLoader, { path: "kitsune-core" });

describe("sandbox", function() {
    it.only("should have sand in it", function() {

        let data;
        try {
            let json = fs.readFileSync("data.json");
            data = JSON.parse(json);
        } catch(e) {
            data = {
                graph: [],
                string: []
            };
        }

        let systemIds = [
            "fe60fc76f26f8dce6c5f68bbb0ea0c51efef3dff", // loki-collection
            "a73b64eba9daa07051815ca7151ba009789616e2", // graph-autoPut
            "6c877bef62bc8f57eb55265c62e75b36515ef458", // graph-assign
            "4163d1cd63d3949b79c37223bd7da04ad6cd36c8", // graph-factor
            "b7916f86301a6bc2af32f402f6515809bac75b03", // graph-listNodes
            "8f8b523b9a05a55bfdffbf14187ecae2bf7fe87f", // string-autoPut
            "ddfe7d402ff26c18785bcc899fa69183b3170a7d", // name
        ];

        let systems = systemIds.map(id => loader({ id }));

        let [
            lokiColl,
            graphAutoPut,
            graphAssign,
            graphFactor,
            graphListNodes,
            stringAutoPut,
            name
        ] = systems;

        var { graph, string } = readData(data, lokiColl);

        // Build systems
        graph.autoPut = bind(graphAutoPut, { graphPut: graph.put });
        graph.assign = bind(graphAssign, { graphAutoPut: graph.autoPut });
        graph.factor = bind(graphFactor, { graphFind: graph.find });
        graph.listNodes = bind(graphListNodes, { graphFind: graph.find });
        string.autoPut = bind(stringAutoPut, { stringPut: string.put });
        name = bind(name, { stringAutoPut: string.autoPut, graphAssign: graph.assign });

        // Execute systems
        // var nodes = graph.listNodes();
        // console.log(nodes.sort());

        // printTable(graph.find);

        let group = graph.find({ where: { head: "66564ec14ed18fb88965140fc644d7b813121c78" } });
        let systemFiles = group.map(x => x.tail).sort();
        console.log("=== System files ===");
        console.log(systemFiles);

        let systemMap = graph.factor({ head: systemFiles, type: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0" });
        systemMap.forEach(value => {
            var names = string.find({ where: { id: value.tail } });
            value.name = names[0].string;
        });
        systemMap = systemMap.map(value => ({ head: value.head, name: value.name }));
        systemMap = _.sortBy(systemMap, ["head"]);
        console.log(systemMap);

        // Sort and save Data
        let graphData = _.sortBy(graph.find(), ["head", "tail"]);
        let stringData = _.sortBy(string.find(), ["string"]);
        writeData({ graph: graphData, string: stringData });
    });
});

function bind(func, bindParams) {
    var f = function(partParams) {
        var fullParams = {};
        for(let key in bindParams)
            fullParams[key] = bindParams[key];

        for(let key in partParams)
            fullParams[key] = partParams[key];

        return func(fullParams);
    };
    return f;
}

function cleanLoki(data) {
    let result = data.map(value => _.omit(value, "meta", "$loki"));
    return result;
}

function logLoki(data) {
    let cleanData = cleanLoki(data);
    let json = JSON.stringify(cleanData, null, 2);
    console.log(json);
}

function readData(data, lokiColl) {
    let controls = _.mapValues(data, collData => {
        let coll = new Collection();
        var control = _.mapValues(lokiColl(), (func, name) => {
            return bind(func, { db: coll });
        });

        collData.forEach(value => {
            control.put({ element: value });
        });

        return control;
    });
    return controls;
}

function writeData(data) {
    data = _.mapValues(data, coll => {
        return cleanLoki(coll);
    });
    fs.writeFileSync("out.json", JSON.stringify(data, null, 2)+"\n");
}

function printTable(graphFind) {
    let table = graphFind();
    table = _.sortBy(table, ["head", "tail"]);
    table.forEach(x => console.log(x.id, x.head, x.tail));
}
