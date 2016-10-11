function factor({ graphFind, head, type, tail }) {

    if(!head && !type && !tail)
        throw new Error("Must have one or more of (head, type, tail) params set");

    let edges;
    let edgeIds;
    if(head || tail) {
        var criteria = {};
        if(head)
            criteria.head = head;
        if(tail)
            criteria.tail = tail;

        edges = graphFind(criteria);
        edgeIds = edges.map(edge => edge.id);
    }

    let typeCriteria = {};
    if(edgeIds)
        typeCriteria.tail = edgeIds;
    if(type)
        typeCriteria.head = type;

    let typeEdges = graphFind(typeCriteria);
    let typeTails = typeEdges.map(edge => edge.tail);

    // filter edges by type tails
    if(edges) {
        edges = edges.filter(edge => {
            return (typeTails.indexOf(edge.id) != -1);
        });
    } else
        edges = graphFind({ id: typeTails });

    let result = typeEdges.map(typeEdge => {
        var edge = edges.find(edge => edge.id == typeEdge.tail);
        return {
            id: edge.id,
            head: edge.head,
            tail: edge.tail,
            typeEdge: typeEdge.id,
            type: typeEdge.head
        };
    });

    return result;
}
module.exports = factor;
