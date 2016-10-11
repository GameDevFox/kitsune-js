function functionReference(id) {
    let result = function() {};
    result.id = id;
    return result;
}
module.exports = functionReference;
