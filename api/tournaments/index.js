const router = require('express').Router();
const ttlib = require("ttlib");
const models = require("../../models");
const crypto = require("crypto");

//
// GET /tournaments
// 200 - tournament list
//
router.get("/", (req, res) => {
    models.Tournament.findAll({
        include: [
            models.TournamentSetting,
            models.TournamentRole
        ]
    }).then(tournaments => {
        return res.status(200).json(tournaments);
    })
})

//
// POST /tournaments/create
// 200 - tournament created, provide slug
// 400 - missing field
//
router.post("/create", (req, res) => {
    ttlib.validation.objContainsFields(req.body,['name', 'startDate', 'endDate', 'rounds', 'tab', 'settings']).then(() => {
        const suffix = crypto.randomBytes(3).toString("hex");
        const slugGeneration = `${req.body.name}-${suffix}`.toLowerCase().split(" ").join("-");
        const settings = Object.keys(req.body.settings).map(key => {
                if (req.body.settings[key]) {
                    return {[key]: req.body.settings[key]}
                }
        });
        models.Tournament.create({
                name: req.body.name,
                slug: slugGeneration,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                TournamentSettings: settings
            },
            {
                include: [
                    models.TournamentSetting
                ]
            }

        ).then(tournament => {
            const TournamentId = tournament.id;
            ['tab', 'adjcore', 'equity', 'orgcomm'].forEach(role => {
                if (req.body[role]) {
                    req.body[role].forEach(id => (
                        models.TournamentRole.create({
                            AccountId: id,
                            TournamentId,
                            role
                        })
                    ))
                }

            });
            return res.status(200).json({success: `Tournament Created`, slug: slugGeneration});
        }).catch(failed => {
            return res.status(500).json({error: `Internal Server Error: ${failed}`});
        })
    }).catch(missing => {
        return res.status(400).json({error: `Missing ${missing}`});
    })
});


module.exports = router;