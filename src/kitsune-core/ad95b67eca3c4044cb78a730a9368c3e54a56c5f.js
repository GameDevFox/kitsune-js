function callNodeFunc({ funcSys, funcId, argId }) {
    let func = funcSys(funcId);
    let result = func(argId);

    return result;
}
module.exports = callNodeFunc;
