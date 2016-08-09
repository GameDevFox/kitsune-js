console.log("Hello Kitsune");

let mod = angular.module("kitsune", []);

mod.factory("kitsuneService", function($http) {

    let post = function(funcId, data) {
        return $http({ method: "POST", url: "/api/"+ funcId, headers: {
            'Content-Type': 'text/plain'
        }, data });
    };

    let service = {
        name: (node, name) => post("2885e34819b8a2f043b139bd92b96e484efd6217", JSON.stringify({ node, name })),
        save: () => $http({ method: "GET", url: "/api/save" })
    };
    return service;
});

mod.controller("yours", function(kitsuneService) {
    this.log = (msg) => console.log(msg);
    this.nameFn = (node, name) => kitsuneService.name(node, name).then(() => console.log("Named!"));
    this.save = () => kitsuneService.save().then(() => console.log("Saved!"));
});

mod.run(function($http) {
    $http({ method: "POST", url: "/api/bf565ae1309f425b0ab00efa2ba541ae03ad22cf" }).then(function(e) {
        console.log(e.data);
    });
});
