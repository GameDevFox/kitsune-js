function returnProperty({ func, propertyName }) {
    let newFunc = function(input) {
        let result = func(input);

        if(result)
            result = result[propertyName];

        return result;
    };
    return newFunc;
}
module.exports = returnProperty;
