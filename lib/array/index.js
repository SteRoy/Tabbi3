module.exports = {
    average: (arr) => {
        if (arr.length === 0) {
            return 0;
        }
        return module.exports.sum(arr)/arr.length;
    },

    sum: (arr) => {
        return arr.reduce((acc, elem) => acc + elem)
    }
}