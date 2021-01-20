const router = require('express').Router();
const models = require("../../models");
const ttlib = require("ttlib");

// TODO: Captcha Authenticate

//
//  POST /api/accounts/create
//  500: Sequelize Create failed to return new person
//  400: Missing either name, email, password
//  200: Account created successfully
//
router.post("/create", (req, res) => {
    ttlib.validation.objContainsFields(req.body, ["name", "email", "password"]).then(postForm => {
        const salt = ttlib.auth.generateSalt();
        const password = ttlib.auth.saltHashString(postForm.password, salt);
        const newPerson = models.Person.create(
            {
                name: postForm.name,
                account: {
                    email: postForm.email,
                    salt,
                    password
                }
            },
            {
                include: [models.Account]
            });
        if (newPerson) {
            return res.status(200).json({success: `Account Created`});
        } else {
            return res.status(500).json({error: `Internal Server Error`});
        }
    }).catch(missingField => {
        return res.status(400).json({error: `Missing ${missingField}`});
    })
});

module.exports = router;