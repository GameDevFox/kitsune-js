function readFuncCall({ readAssign, id }) {
    let assign = readAssign(id);

    if(!assign)
        return null;

    return {
        funcId: assign.type,
        argFuncId: assign.head,
        argId: assign.tail
    };
}
module.exports = readFuncCall;
