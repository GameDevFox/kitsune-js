function execFunc({ callNodeFunc, funcSys, funcId, argFuncId, argId }) {

    let nodeFuncResult = callNodeFunc({
        funcSys,
        funcId: argFuncId,
        argId
    });

    let primaryFunc = funcSys(funcId);

    let result = primaryFunc(nodeFuncResult);
    return result;
}
module.exports = execFunc;
