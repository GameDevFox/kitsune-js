function autoParam({ func, paramName }) {
    return function autoParamF(param) {
        var params = {};
        params[paramName] = param;
        return func(params);
    };
}
module.exports = autoParam;
