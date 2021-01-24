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
            {
                model: models.TournamentRole,
                include: [
                    {
                        model: models.Account,
                        include: models.Person
                    }
                ]
            }
        ]
    }).then(tournaments => {
        return res.status(200).json(tournaments);
    })
})

//
// GET /tournaments/:slug/public
// 200 - return public info about tournament
// 404 - tournament not found
// 500 - ISE
//
router.get(`/:slug/public`, (req, res) => {
    models.Tournament.findOne({
            where: {
                slug: req.params.slug
            },
            include: [
                // include Tournament->TournamentRole
                {
                    model: models.TournamentRole,
                    include: [
                        {
                            attributes: ['id'],
                            model: models.Account,
                            include: [
                                {
                                    model: models.Person,
                                    attributes: ['name']
                                }
                            ]
                        }
                    ]
                },
                // include Tournament->TournamentSetting
                {
                    model: models.TournamentSetting
                }
            ]
        }).then(tournament => {
        if (tournament) {
            return res.status(200).json({tournament});
        } else {
            return res.status(404).json({error: `Tournament not found`});
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`});
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

        // Add default settings/keys here.
        const defaultSettings = [
            {key: "description", value: `This tournament is running on Tabbi3 and this text can be changed in the Configuration page.`}
        ];

        let settings = Object.keys(req.body.settings).map(key => {
                if (req.body.settings[key]) {
                    return {key: key, value: req.body.settings[key]}
                }
        });
        settings = settings.concat(defaultSettings);
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