function nameListIds({ stringAutoPut, graphFactor, name }) {
    // TODO: Fix this or simplify, we just need the hash of the string instead of "stringAutoPut"
    let nameId = stringAutoPut(name);
    let factor = graphFactor({ type: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0", head: nameId });
    let result = factor.map(node => node.tail);
    return result;
}
module.exports = nameListIds;
