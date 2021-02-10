const router = require('express').Router();
const models = require("../../models");
const ttlib = require("ttlib");


//
// GET /api/preregistration/:slug/:type
// Returns all unprocessed preregistrations for a given tournament of a particular type
//
router.get(`/:slug/:type`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "orgcomm"), (req, res) => {
    models.Tournament.findOne({
       where: {
           slug: req.params.slug
       },
       include: [
           {
               model: models.Preregistration,
               where: {
                   speakerTwoAccepted: true,
                   type: req.params.type
               },
               include: [
                   {
                       model: models.Person,
                       as: 'registrant',
                       attributes: ["name", "id"]
                   },
                   {
                       model: models.Person,
                       as: 'speakerTwo',
                       required: false,
                       attributes: ["name", "id"]
                   }
               ]
           }
       ]
   }).then(tournament => {
       if (tournament) {
           return res.status(200).json({tournament});
       } else {
           return res.status(404).json({error: `Could not find Tournament`});
       }
   }).catch(err => {
       return res.status(500).json({error: `Internal Server Error: ${err}`})
    });
});

//
// POST /api/preregistration/:slug
// Create a Preregistration object for a given registrant (Person)
// 200 - Created
// 404 - Tournament Not Found
// 400 - Malformatted or already exists
//
router.post(`/:slug`, ttlib.middleware.isLoggedIn, (req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        },
        include: [models.TournamentSetting]
    }).then(tournament => {
        if (tournament) {
            const tournamentSetting = tournament.TournamentSettings.find(ts => ts.key === "prereg");
            if (tournamentSetting) {
                if (tournamentSetting.value) {
                    models.Preregistration.findOne({
                            where: {
                                [models.Sequelize.Op.or]: [
                                    {
                                        registrantId: req.user.Person.id,
                                    },
                                    {
                                        speakerTwoId: req.user.Person.id
                                    }
                                ]
                            }
                        }
                    ).then((preregistration) => {
                        if (preregistration) {
                            return res.status(400).json({error: `Preregistration already exists for user.`});
                        } else {
                            let required = ["reference"];
                            if (req.body.type === "team") {
                                required = required.concat(["speakerTwoId", "teamName"]);
                            }

                            ttlib.validation.objContainsFields(req.body, required).then(body => {
                                models.Preregistration.create({
                                    ...req.body,
                                    TournamentId: tournament.id,
                                    registrantId: req.user.Person.id,
                                    speakerTwoAccepted: req.body.type !== "team"
                                }).then(createdPR => {
                                    return res.status(200).json({preregistration: createdPR});
                                });
                            })
                        }
                    }).catch(err => {
                        return res.status(500).json({error: `Internal Server Error: ${err}`});
                    });
                } else {
                    return res.json(400).json({error: `Preregistration is not open.`});
                }
            } else {
                return res.json(400).json({error: `Preregistration is not open.`});
            }
        } else {
            return res.status(404).json({error: `Tournament not found`})
        }
    })
});

//
// POST /api/preregistration/invite/:preregistrationid/:status
// @param status - 'accept' or 'reject'
// 200 - For team invites, speakerTwo has accepted/rejected a Preregistration request
// 401 - Not speakerTwo
//
router.post(`/invite/:preregistrationid/:status`, ttlib.middleware.isLoggedIn, (req, res) => {
    if (!['accept', 'reject'].includes(req.params.status)) {
        return res.status(400).json({error: `Invalid status parameter`});
    }
    models.Preregistration.findOne({
        where: {
            id: req.params.preregistrationid,
            type: "team",
            speakerTwoAccepted: false
        }
    }).then(prereg => {
        if (prereg) {
            if (prereg.speakerTwoId === req.user.Person.id) {
                if (req.params.status === 'accept') {
                    prereg.speakerTwoAccepted = true;
                    prereg.save().then(() => {
                        return res.status(200).json({success: `Preregistration invite accepted`});
                    });
                } else {
                    prereg.destroy().then(() => {
                        return res.status(200).json({success: `Preregistration invite rejected`});
                    });
                }
            } else {
                return res.status(401).json({error: `You must be the invitee to accept an invite.`})
            }
        } else {
            return res.status(404).json({error: `Preregistration could not be found.`});
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`});
    })
})



module.exports = router;