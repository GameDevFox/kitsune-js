function groupList({ graphFind, group }) {
    let edges = graphFind({ head: group });
    let result = edges.map(edge => edge.tail);
    return result;
}
module.exports = groupList;
