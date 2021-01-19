module.exports = {
    //  objContainsFields(obj: Dictionary
    //  fields: Array<String>, non-empty fields obj must contain
    //  returns Promise accepting on all fields being present and rejecting in all other cases.
    objContainsFields: (obj, fields) => {
        return new Promise((resolve, reject) => {
            fields.forEach(key => {
                if (!obj[key]) {
                    return reject(key);
                }
            });
            return resolve(obj);
        })
    }
}