function nameFn({ stringAutoPut, graphAssign, node, name }) {
    var nameNode = stringAutoPut(name);
    var result = graphAssign({ head: nameNode, type: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0", tail: node });
    return result;
}
module.exports = nameFn;
