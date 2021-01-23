const router = require('express').Router();
const models = require("../../models");
const ttlib = require("ttlib");

//
// GET /api/people
// 200 - a list of all names with their identifiers
//
router.get("/", (req, res) => {
    models.Person.findAll({
        includes: [
            models.InstitutionMembership
        ]
    }).then(people => {
        return res.status(200).json({people});
    }).catch(err => {
        return res.status(500).json({error: 'Internal Server Error'});
    })
});

//
// POST /api/people/me/institutions
// 200 - added new institution membership
//
router.post("/me/institutions", (req, res) => {
    // TODO: Requires req.user, so must be authenticated or hard fail
    // TODO: Verify that the index uniquity constraint on this works
    ttlib.validation.objContainsFields(req.body, ["institution"]).then(postForm => {
        if (req.user) {
            models.Person.findOne({
                where: {
                    AccountId: req.user.id
                }
            }).then(person => {
                models.InstitutionMembership.create({
                    PersonId: person.id,
                    InstitutionId: postForm.institution,
                    startDate: postForm.startDate === "" ? null : postForm.startDate,
                    endDate: postForm.endDate === "" ? null : postForm.endDate
                }).then(created => {
                    return res.status(200).json({success: `Institution Membership Created`});
                }).catch(err => {
                    return res.status(500).json({error: `Institution Membership Not Created - are you sure it's not a duplicate?`});
                })
            })
        } else {
            return res.status(403).json({error: `Not Authorised`});
        }
    }).catch(missingField => {
        return res.status(400).json({error: `Missing Field: ${missingField}`})
    })
});

//
// POST /api/people/me/clash
// 200 - added new personal conflict
//
router.post("/me/clash", (req, res) => {
    // TODO: Requires req.user, so must be authenticated or hard fail
    // TODO: Verify that the index uniquity constraint on this works
    ttlib.validation.objContainsFields(req.body, ["target", "type"]).then(postForm => {
        if (req.user) {
            models.PersonalClash.create({
                fromAccountId: req.user.id,
                targetAccountId: postForm.target,
                type: postForm.type
            }).then(success => {
                return res.status(200).json({success: `Created Personal Clash`});
            }).catch(failed => {
                return res.status(500).json({error: `Personal Clash Couldn't Be Created: ${failed}`});
            })
        } else {
            return res.status(403).json({error: `Not Authorised`});
        }
    }).catch(missingField => {
        return res.status(400).json({error: `Missing Field: ${missingField}`})
    })
});

module.exports = router;