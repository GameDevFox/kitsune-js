function writeValue({ typeMappings, value }) {
    let id;
    let funcId;
    for(let key in typeMappings) {
        let mapping = typeMappings[key];

        let typeFunc = mapping.typeFunc;
        if(typeFunc(value)) {
            let putFunc = mapping.putFunc;
            id = putFunc(value);
            funcId = mapping.readFuncId;
            break;
        }
    }
    return { id, funcId };
}
module.exports = writeValue;
