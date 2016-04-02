import fs from "fs";
import _ from "lodash";
import { expect } from "chai";

import { Collection } from "lokijs";

import buildLoader from "kitsune-core/31d21eb2620a8f353a250ad2edd4587958faf3b1"; // system-loader
let loader = buildLoader("kitsune-core");

describe("sandbox", function() {
    it.only("should have sand in it", function(done) {
        loader("fe60fc76f26f8dce6c5f68bbb0ea0c51efef3dff", // loki-control
               "a73b64eba9daa07051815ca7151ba009789616e2", // graph-autoPut
               "8f8b523b9a05a55bfdffbf14187ecae2bf7fe87f") // string-autoPut
            .then(systems => {
                let [
                    buildControl,
                    graphAutoPut,
                    stringAutoPut
                ] = systems;

                var { graph, string } = readData(buildControl);
                graph.autoPut = graphAutoPut(graph.put);
                string.autoPut = stringAutoPut(string.put);

                // DO STUFF HERE
                _.each({ graph, string }, (control, name) => {
                    console.log(`=== Name: ${name} ===`);
                    var values = control.find();
                    logLoki(values);
                });

                let group = graph.find({ head: "66564ec14ed18fb88965140fc644d7b813121c78" });
                console.log("=== System files ===");
                console.log(group.map(x => x.tail).sort());
                // DO STUFF HERE

                writeData({ graph, string });

                console.log("=====");

                var testF = function({ a, b, x }) {
                    console.log(a);
                    console.log(b);
                    console.log(x);
                };
                testF({ a: 100, b: "Frank", x: 3.14 });

                var testF2 = objBind(testF, { b: "Foxes!" });
                testF2({ a: 123, x: 0.01 });
                testF2({ a: 123, b: "Bob", x: 0.01 });

                var params = { a: 123, x: 0.01 };
                console.log(params);
                testF2(params);
                console.log(params);
            })
            .then(done, done);
    });
});

function objBind(func, bindParams) {
    var f = function(partParams) {
        var fullParams = {}; 
        for(let key in bindParams)
            fullParams[key] = bindParams[key];

        for(let key in partParams)
            fullParams[key] = partParams[key];
        
        func(fullParams);
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
