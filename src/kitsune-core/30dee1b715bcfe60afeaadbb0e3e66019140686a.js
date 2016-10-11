function lokiFind({ db, where }) {
    let criteria = [];

    let count = 0;
    for(let i in where) {
        var obj = {};

        if(typeof where[i] == "object")
            obj[i] = { $in: where[i] };
        else
            obj[i] = { $eq: where[i] };

        criteria.push(obj);
        count++;
    }

    if(count == 1)
        criteria = criteria[0];
    else if(count > 1)
        criteria = { $and: criteria };

    return db.find(criteria);
}
module.exports = lokiFind;
