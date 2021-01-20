const router = require('express').Router();
const models = require("../../models");
const ttlib = require("ttlib");
const passport = require("passport");

// TODO: Captcha Authenticate

//
//  POST /api/accounts/create
//  500: Sequelize Create failed to return new person
//  400: Missing either name, email, password
//  200: Account created successfully
//
router.post("/create", (req, res) => {
    ttlib.validation.objContainsFields(req.body, ["name", "email", "password"]).then(postForm => {
        console.log(postForm);
        const salt = ttlib.auth.generateSalt();
        const password = ttlib.auth.saltHashString(postForm.password, salt);
        models.Account.create(
            {
                email: postForm.email,
                salt,
                password,
                Person: {
                    name: postForm.name
                }
            },
            {
                include: [models.Person]
            }
        ).then(account => {
            return res.status(200).json({success: `Account Created`});
        }).catch(error => {
            return res.status(500).json({error: `Could not create new account - are you already registered?`});
        });
    }).catch(missingField => {
        return res.status(400).json({error: `Missing ${missingField}`});
    })
});

//
// POST /api/accounts/login
// 200 Logged in successfully
//
router.post("/login", passport.authenticate('local'), (req, res) => {
    return res.status(200).json({success: "Logged in"});
})

module.exports = router;