const crypto = require("crypto");

module.exports = {
    saltHashString: (plaintext, salt) => {
        return crypto.pbkdf2Sync(plaintext, salt.toLowerCase(), 10000, 64, 'sha512').toString("hex");
    },

    generateSalt: () => {
        return crypto.randomBytes(64).toString("hex");
    }
}