function lokiPut({ db, element }) {
    if(!element)
        throw new Error(`The "element" property is null, please set { element: ... }`);

    db.insert(element);
    return element.id;
}
module.exports = lokiPut;
