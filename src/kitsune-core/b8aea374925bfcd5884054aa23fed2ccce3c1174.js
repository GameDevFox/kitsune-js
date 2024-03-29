function readAssign({ graphReadEdge, id }) {
    let typeEdge = graphReadEdge(id);

    if(!typeEdge)
        return null;

    let edge = graphReadEdge(typeEdge.tail);
    return {
        type: typeEdge.head,
        head: edge.head,
        tail: edge.tail
    };
}
module.exports = readAssign;
