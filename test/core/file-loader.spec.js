let _ = require("lodash");
let expect = require("chai").expect;

let systemLoader = require("kitsune-core/31d21eb2620a8f353a250ad2edd4587958faf3b1"); // system-loader

describe("kitsune/core/system-loader", function() {

    describe("load(systemId)", function() {
        it("should load a sub-system from a module by id", function() {
            let systemId = "d2875fcaa91079d5c4065d7d887e747b7e170f66";
            var data = systemLoader({ path: "kitsune-core", id: systemId }); // test-data
            expect(_.isFunction(data)).to.equal(true);
            expect(_.isArray(data())).to.equal(true);
        });
    });
});
