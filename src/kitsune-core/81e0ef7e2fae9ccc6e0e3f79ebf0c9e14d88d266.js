function nameList({ graphFactor, stringReadString, node }) {
    if(!node)
        return [];

    let names = graphFactor({ type: "f1830ba2c84e3c6806d95e74cc2b04d99cd269e0", tail: node });
    let result = names.map(node => stringReadString(node.head));
    return result;
}
module.exports = nameList;
