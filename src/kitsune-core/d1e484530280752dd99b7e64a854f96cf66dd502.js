function putSystem({ systemList, id, system }) {
    if(!id && (!system || !system.id))
        throw new Error("No id found in param or on system");

    if(!system.id)
        system.id = id;
    else
        id = system.id;

    systemList[id] = system;
}
module.exports = putSystem;
