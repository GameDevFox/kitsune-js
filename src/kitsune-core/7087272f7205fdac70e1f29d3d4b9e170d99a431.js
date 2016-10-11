function removeName({ node, name, stringGetId, graphFactor, graphRemove }) {
    let strId = stringGetId(name);

    if(!strId)
        return;

    let fac = graphFactor({ head: strId, tail: node });
    if(fac.length === 0)
        return;

    fac = fac[0];

    graphRemove(fac.id);
    graphRemove(fac.typeEdge);
}
module.exports = removeName;
