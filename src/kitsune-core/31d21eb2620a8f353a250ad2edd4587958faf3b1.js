function load({ path, id }) {
    let systemPath = path+"/"+id+".js";

    let system = null;
    try {
        system = require(systemPath);
    } catch(e) {
        // ignore and return null
    }
    return system;
}
module.exports = load;
