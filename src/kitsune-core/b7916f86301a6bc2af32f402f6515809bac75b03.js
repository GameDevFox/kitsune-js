function listNodes({ graphFind }) {
    var edges = graphFind();

    var nodes = [];

    var ids = edges.map(edge => edge.id);
    var heads = edges.map(edge => edge.head);
    var tails = edges.map(edge => edge.tail);

    var nodeLists = [ids, heads, tails];
    nodeLists.forEach(nodeList => {
        nodeList.forEach(node => {
            if(nodes.indexOf(node) == -1)
                nodes.push(node);
        });
    });

    return nodes;
}
module.exports = listNodes;
