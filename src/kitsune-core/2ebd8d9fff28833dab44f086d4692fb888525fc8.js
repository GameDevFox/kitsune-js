function lokiRemove({ db, id }) {
    let dataB = db();
    dataB.removeWhere({ id });
}
module.exports = lokiRemove;
