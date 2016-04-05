require('source-map-support').install();

import fs from "fs";
import _ from "lodash";
import { expect } from "chai";

import { Collection } from "lokijs";

import systemLoader from "kitsune-core/31d21eb2620a8f353a250ad2edd4587958faf3b1"; // system-loader
let loader = bind(systemLoader, { path: "kitsune-core" });

describe("sandbox", function() {
    it.only("should have sand in it", function(done) {
        let systemIds = ["fe60fc76f26f8dce6c5f68bbb0ea0c51efef3dff", // loki-collection
                         "a73b64eba9daa07051815ca7151ba009789616e2", // graph-autoPut
                         "6c877bef62bc8f57eb55265c62e75b36515ef458", // graph-assign
                         "8f8b523b9a05a55bfdffbf14187ecae2bf7fe87f", // string-autoPut
                         "ddfe7d402ff26c18785bcc899fa69183b3170a7d", // name
                        ];

        let promises = systemIds.map(id => loader({ id }));
        Promise.all(promises)
            .then(systems => {
                let [
                    lokiColl,
                    graphAutoPut,
                    graphAssign,
                    stringAutoPut,
                    name
                ] = systems;

                var { graph, string } = readData(lokiColl);

                // Build systems
                graph.autoPut = bind(graphAutoPut, { graphPut: graph.put });
                graph.assign = bind(graphAssign, { graphAutoPut: graph.autoPut });

                string.autoPut = bind(stringAutoPut, { stringPut: string.put });

                name = bind(name, { stringAutoPut: string.autoPut, graphAssign: graph.assign });

                // Execute systems
                // graph.autoPut({ head: "Head", tail: "Tail" });
                // graph.assign({ head: "AFox", type: "name", "tail": "kit" });

                // string.autoPut({ string: "String" });

                // name({ head: "NameThis", name: "This is my name" });

                // Other
                // let systemIds = [
                //     { id: "fe60fc76f26f8dce6c5f68bbb0ea0c51efef3dff", name: "loki-collection" },
                //     { id: "a73b64eba9daa07051815ca7151ba009789616e2", name: "graph-autoPut" },
                //     { id: "6c877bef62bc8f57eb55265c62e75b36515ef458", name: "graph-assign" },
                //     { id: "8f8b523b9a05a55bfdffbf14187ecae2bf7fe87f", name: "string-autoPut" },
                //     { id: "ddfe7d402ff26c18785bcc899fa69183b3170a7d", name: "name" },
                // ];
                // systemIds.forEach(({ id, name: nameStr }) => {
                //     graph.autoPut({ head: "66564ec14ed18fb88965140fc644d7b813121c78", tail: id });
                //     name({ head: id, name: nameStr });
                // });

                let group = graph.find({ where: { head: "66564ec14ed18fb88965140fc644d7b813121c78" } });
                console.log("=== System files ===");
                console.log(group.map(x => x.tail).sort());

                // Save Data
                writeData({ graph, string });
            })
            .then(done, done);
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

function readData(lokiColl) {

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
        var data = coll.find();
        return cleanLoki(data);
    });
    fs.writeFileSync("out.json", JSON.stringify(data, null, 2)+"\n");
}
