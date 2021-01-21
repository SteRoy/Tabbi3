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
        ).then(() => {
            return res.status(200).json({success: `Account Created`});
        }).catch(() => {
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
});

//
// POST /api/accounts/logout
// 200 Logged out successfully
//
router.post("/logout", (req, res) => {
    req.logout();
    return res.status(200).json({success: "Logged out"});
})


//
// GET /api/accounts/me
// 200 Session is authed, provide account details
// 401 User is not logged in
// 500 Who knows what happened, you are somehow authed with passport but don't exist
//
router.get("/me", (req, res) => {
   if (req.user) {
        models.Account.findOne({
            attributes: [
              'email',
              'Person.name'
            ],
            where: {
                email: req.user.email
            },
            include: [
                models.Person
            ]
        }).then(account => {
            return res.status(200).json({account});
        }).catch(err => {
            console.log(err);
            return res.status(500).json({error: `Internal Server Error`});
        })
   } else {
       return res.status(401).json({error: `You are not logged in.`});
   }
});

module.exports = router;