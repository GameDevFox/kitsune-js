function readObject({ graphFactor, stringReadString, graphReadEdge, nodeFunc, node }) {

    let result;

    let children = graphFactor({ head: node });
    children.forEach(child => {
        // Get key
        let key = stringReadString(child.type);

        // Get Value
        let { head, tail } = graphReadEdge(child.tail);
        let value = nodeFunc({ funcId: head, argId: tail });

        if(!result)
            result = {};

        result[key] = value;
    });
    return result;
}
module.exports = readObject;
