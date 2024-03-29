let hash = require("kitsune/util").hash;

function autoPut({ stringFind, stringPut, string }) {
    // Make sure the string isn't stored already
    let search = stringFind({ string: string });
    if(search.length > 0)
        return search[0].id;

    let id = hash(string);
    let result = stringPut({ element: { id, string } });
    return result;
}
module.exports = autoPut;
