console.log("Hello Kitsune");

let mod = angular.module("kitsune", []);

mod.run(function($http) {
    $http({ method: "POST", url: "/api/bf565ae1309f425b0ab00efa2ba541ae03ad22cf" }).then(function(e) {
        console.log(e.data);
    });
});

mod.factory("kitsuneService", function($http) {

    let post = function(funcId, data) {
        return $http({ method: "POST", url: "/api/"+ funcId, headers: {
            'Content-Type': 'text/plain'
        }, data });
    };

    let mkCall = function(funcId, data) {
        return post(funcId, JSON.stringify(data)).then(res => res.data);
    };

    let service = {
        name: (node, name) => mkCall("2885e34819b8a2f043b139bd92b96e484efd6217", { node, name }),
        unname: (node, name) => mkCall("708f17af0e4f537757cf8817cbca4ed016b7bb8b", { node, name }),
        listGroup: (groupId) => mkCall("a8a338d08b0ef7e532cbc343ba1e4314608024b2", groupId),
        listNames: (nodeId) => mkCall("890b0b96d7d239e2f246ec03b00cb4e8e06ca2c3", nodeId),
        save: () => $http({ method: "GET", url: "/api/save" })
    };
    return service;
});

mod.component("nodeView", {
    templateUrl: "templates/node-view.html",
    controller: function(kitsuneService) {
        kitsuneService.listNames(this.id).then(x => this.names = x);
    },
    bindings: {
        id: "<"
    }
});

mod.controller("yours", function(kitsuneService) {
    this.log = (msg) => console.log(msg);
    this.addName = (node, name) => kitsuneService.name(node, name).then(() => console.log("Named!"));
    this.removeName = (node, name) => kitsuneService.unname(node, name).then(() => console.log("Unnamed!"));
    this.save = () => kitsuneService.save().then(() => console.log("Saved!"));

    this.coreGroups = kitsuneService.listGroup("7f82d45a6ffb5c345f84237a621de35dd8b7b0e3").then((data) => {
        this.coreGroups = data;
    });
});

mod.filter("type", function() {
    return value => typeof value;
});
