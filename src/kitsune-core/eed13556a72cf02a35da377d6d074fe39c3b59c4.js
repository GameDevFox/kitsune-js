function objectPut({ graphAssign, graphAutoPut,stringAutoPut, typeMappings, id, object }) {
    // TODO: There must be serveral ways to break this method down

    // Gather types of all children
    let types = {};
    let invalids = [];
    for(let key in object) {
        let value = object[key];

        let type;
        for(let mKey in typeMappings) {
            let mapping = typeMappings[mKey];
            if(mapping.typeFunc(value)) {
                type = mKey;
                break;
            }
        }

        if(type)
            types[key] = type;
        else
            invalids.push(key);
    }

    if(invalids.length > 0)
        throw new Error("The following properties can not be stored " +
            "in the system: " + invalids);

    // Put all values
    for(let key in types) {
        let value = object[key];

        let type = types[key];
        let mapping = typeMappings[type];
        let argId = mapping.putFunc(value);
        let valueId = graphAutoPut({
            head: mapping.readFuncId,
            tail: argId
        });

        let nameId = stringAutoPut(key);

        let args = { head: id, type: nameId, tail: valueId };
        graphAssign(args);
    }

    return id;
}
module.exports = objectPut;
