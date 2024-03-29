function bind({ func, params }) {
    let bindF = function(partParams) {
        let fullParams = {};
        for(let key in params)
            fullParams[key] = params[key];

        for(let key in partParams)
            fullParams[key] = partParams[key];

        return func(fullParams);
    };
    return bindF;
}
module.exports = bind;
