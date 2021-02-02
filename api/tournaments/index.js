const router = require('express').Router();
const ttlib = require("ttlib");
const models = require("../../models");
const crypto = require("crypto");

const tournamentConfigOptions = [
    // Teams of People
    {key: "tab", description: "The tab team - they hold super user access to this tournament.", type: "people"},
    {key: "orgcomm", description: "The organisation committee - they approve teams and adjudicators as eligible to compete", type: "people"},
    {key: "equity", description: "The equity team - they moderate clash.", type: "people"},
    {key: "adjcore", description: "The adjudication core - they set motions, monitor adjudicator feedback, determine breaking adjudicators and allocate adjudicators.", type: "people"},

    // Boolean
    {key: "test", description: "This tournament is a 'test' - it won't have real participants or is simply a small internal competition. The tournament will not appear on the frontpage.", type: "boolean"},
    {key: "wudc", description: "Enforces WUDC constitutional restrictions.", type: "boolean"},

    //  Textarea
    {key: "description", description: "The Tournament Homepage description text.", type: "textarea"},
];

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
// GET /tournaments/configuration
// 200 - list of valid settings and value types
router.get("/configuration", (req, res) => {
    return res.status(200).json({
        TournamentSettings: tournamentConfigOptions
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
// POST /tournaments/:slug/configuration
// 200 - configuration updated
// 400 - missing or invalid field
// 404 - Tournament not found
// 500 - ISE
//
router.post(`/:slug/configuration`, (req, res) => {
    ttlib.validation.objContainsFields(req.body, ['settings']).then(body => {
        models.Tournament.findOne({
            where: {
                slug: req.params.slug
            },
            include: [
                models.TournamentSetting,
                models.TournamentRole
            ]
        }).then(tournament => {
            if (tournament) {
                body.settings.forEach(proposedChange => {
                    const template = tournamentConfigOptions.find(c => c.key === proposedChange.key);
                    // TODO: Value Validation
                    if (template) {
                        if (template.type === "people") {
                            // TournamentRole - note filter because TR is a 1:M
                            const currentAssignments = tournament.TournamentRoles.filter(tr => tr.role === proposedChange.key);
                            if (currentAssignments) {
                                // First, handle deletions - this reduces n O(n)
                                currentAssignments.forEach(tr => {
                                    if (!proposedChange.value.find(pcTr => pcTr.AccountId === tr.AccountId)) {
                                        tr.destroy();
                                    }
                                })

                                // Second, handle additions
                                proposedChange.value.forEach(tr => {
                                    if (!currentAssignments.find(pcTr => pcTr.AccountId === tr.AccountId)) {
                                        models.TournamentRole.create({
                                            role: proposedChange.key,
                                            AccountId: tr.AccountId,
                                            TournamentId: tournament.id
                                        })
                                    }
                                })
                            } else {
                                // Create only
                                proposedChange.value.forEach(newRole => {
                                    models.TournamentRole.create({
                                            role: proposedChange.key,
                                            AccountId: newRole.AccountId,
                                            TournamentId: tournament.id
                                        }).catch(err => {
                                            return res.status(500).json({error: `Internal Server Error: ${err}`})
                                    })
                                })
                            }
                        } else {
                            // TournamentSetting
                            const currentSetting = tournament.TournamentSettings.find(ts => ts.key === proposedChange.key);
                            if (currentSetting) {
                                // UPDATE
                                currentSetting.value = proposedChange.value;
                                currentSetting.save().catch(err => {
                                    return res.status(500).json({error: `Internal Server Error: ${err}`})
                                })
                            } else {
                                // Create
                                models.TournamentSetting.create({
                                        key: proposedChange.key,
                                        value: proposedChange.value,
                                        TournamentId: tournament.id
                                    }).catch(err => {
                                        return res.status(500).json({error: `Internal Server Error: ${err}`})
                                })
                            }
                        }
                    } else {
                        return res.status(400).json({error: `Unidentified configuration option: ${proposedChange.key}`})
                    }
                });
                return res.status(200).json({success: `TournamentSettings updated`});
            } else {
                return res.status(404).json({error: `Tournament not found`});
            }
        })

    }).catch(err => {
        return res.status(400).json({error: `Missing ${err}`});
    })
})

// Tournament specific routes for Adjudicators and Teams.
router.use(`/`, require("./adjudicators"));
router.use(`/`, require("./rounds"));
router.use(`/`, require("./teams"));
router.use(`/`, require("./venues"));


module.exports = router;