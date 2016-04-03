import fs from "fs";
import _ from "lodash";
import { expect } from "chai";

import { Collection } from "lokijs";

import systemLoader from "kitsune-core/31d21eb2620a8f353a250ad2edd4587958faf3b1"; // system-loader
let loader = bind(systemLoader, { path: "kitsune-core" });

describe("sandbox", function() {
    it("should have sand in it", function(done) {
        let systemIds = ["fe60fc76f26f8dce6c5f68bbb0ea0c51efef3dff", // loki-control
                         "a73b64eba9daa07051815ca7151ba009789616e2", // graph-autoPut
                         "8f8b523b9a05a55bfdffbf14187ecae2bf7fe87f"]; // string-autoPut
        
        let promises = systemIds.map(id => loader({ id }));
        Promise.all(promises)
            .then(systems => {
                let [
                    buildControl,
                    graphAutoPut,
                    stringAutoPut
                ] = systems;
                
                var { graph, string } = readData(buildControl);
                graph.autoPut = graphAutoPut(graph.put);
                string.autoPut = stringAutoPut(string.put);
                
                let group = graph.find({ head: "66564ec14ed18fb88965140fc644d7b813121c78" });
                console.log("=== System files ===");
                console.log(group.map(x => x.tail).sort());
                // DO STUFF HERE
                
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

        console.log(fullParams);
        
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

function readData(buildControl) {
    let json = fs.readFileSync("data.json");
    let data = JSON.parse(json);

    let controls = _.mapValues(data, collData => {
        let coll = new Collection();
        var control = buildControl(coll);

        collData.forEach(value => {
            control.put(value);
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
