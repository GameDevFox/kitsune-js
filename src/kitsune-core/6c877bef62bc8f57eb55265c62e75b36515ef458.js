function assign({ graphAutoPut, head, type, tail }) {
    var edge = graphAutoPut({ head, tail });
    return graphAutoPut({ head: type, tail: edge });
}
module.exports = assign;
