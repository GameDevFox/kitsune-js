function returnFirst(func) {
    let newFunc = function(input) {
        let result = func(input);

        if(result)
            result = result[0];

        return result;
    };
    return newFunc;
}
module.exports = returnFirst;
