function isInGroup({ graphFind, group, node }) {
    let results = graphFind({ head: group, tail: node });
    return results.length > 0;
}
module.exports = isInGroup;
