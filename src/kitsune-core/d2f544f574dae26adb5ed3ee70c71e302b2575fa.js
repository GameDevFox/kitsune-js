function isInCollection({ collFind, node }) {
    var result = collFind({ id: node });
    return result.length > 0;
}
module.exports = isInCollection;
