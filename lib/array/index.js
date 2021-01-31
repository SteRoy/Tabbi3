module.exports = {
    average: (arr) => {
        if (arr.length === 0) {
            return 0;
        }
        return module.exports.sum(arr)/arr.length;
    },

    sum: (arr) => {
        return arr.reduce((acc, elem) => acc + elem)
    },

    // https://bost.ocks.org/mike/shuffle/
    shuffle: (array) => {
        var m = array.length, t, i;
        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        return array;
    },

    partition: (array, n) => {
        let rooms = [];
        for (let i = 0; i < array.length; i = i+n) {
            rooms.push(array.slice(i, i+n));
        }
        return rooms;
    },

    // https://stackoverflow.com/questions/8188548/splitting-a-js-array-into-n-arrays
    chunkify: (a, n) => {
        if (n < 2)
            return [a];

        var len = a.length,
            out = [],
            i = 0,
            size;

        if (len % n === 0) {
            size = Math.floor(len / n);
            while (i < len) {
                out.push(a.slice(i, i += size));
            }
        }

        else {
            while (i < len) {
                size = Math.ceil((len - i) / n--);
                out.push(a.slice(i, i += size));
            }
        }

        return out;
    }
}