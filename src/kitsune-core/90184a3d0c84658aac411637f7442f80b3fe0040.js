function and({ types, node }) {
    let notA = types.find(type => {
        let isA = !type(node);
        return isA;
    });
    return !notA;
}
module.exports = and;
