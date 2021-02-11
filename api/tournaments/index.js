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
    {key: "eballots", description: "Enable chair submission of ballots via Tabbi3.", type: "boolean"},
    {key: "eballots-panel", description: "Enable panellist submission of ballots via Tabbi3.", type: "boolean"},
    {key: "prereg", description: "Open participant registration?", type: "boolean"},
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
// GET /tournaments/:slug/participant/me
// 200 - user is a valid participant of :slug, return PUBLIC information for them
//
router.get("/:slug/participant/me", ttlib.middleware.isLoggedIn,(req, res) => {
    models.Account.findOne({
        attributes: ["id"],
        where: {
            id: req.user.id
        },
        include: [
            {
                model: models.Person,
                attributes: ["name", "id"],
                include: [
                    {
                        model: models.Adjudicator,
                        attributes: ["active", "independent", "id"],
                        include: [
                            {
                                model: models.Tournament,
                                attributes: ["name", "slug"],
                                where: {
                                    slug: req.params.slug
                                }
                            }
                        ]
                    },
                    {
                        model: models.Speaker,
                        attributes: ["redacted"],
                        include: [
                            {
                                model: models.Team,
                                attributes: ["name", "codename", "swing", "active", "id"],
                                as: 'Speaker1',
                                include: [
                                    {
                                        model: models.Tournament,
                                        attributes: ["name", "slug"],
                                        where: {
                                            slug: req.params.slug
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: models.Speaker,
                        attributes: ["redacted"],
                        include: [
                            {
                                model: models.Team,
                                attributes: ["name", "codename", "swing", "active", "id"],
                                as: 'Speaker2',
                                include: [
                                    {
                                        model: models.Tournament,
                                        attributes: ["name", "slug"],
                                        where: {
                                            slug: req.params.slug
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: models.Preregistration,
                        as: 'registrant',
                        include: [
                            {
                                model: models.Person,
                                as: 'speakerTwo',
                                attributes: ["name"]
                            },
                            {
                                model: models.Tournament,
                                where: {
                                    slug: req.params.slug
                                }
                            }
                        ]
                    },
                    {
                        model: models.Preregistration,
                        as: 'speakerTwo',
                        include: [
                            {
                                model: models.Person,
                                as: 'registrant',
                                attributes: ["name"]
                            },
                            {
                                model: models.Tournament,
                                where: {
                                    slug: req.params.slug
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }).then(tournament => {
        return res.status(200).json({tournament});
    })
});

//
// GET /tournaments/:slug/participant/:personId
// 200 - personId is a valid participant of :slug, return their current, public allocation
//
router.get("/:slug/participant/:personId/allocation", ttlib.middleware.isLoggedIn,(req, res) => {
    if (parseInt(req.params.personId) !== req.user.Person.id) {
        return res.status(401).json({error: `You cannot access another person's allocations`});
    };

    models.Round.findOne({
        where: {
            completed: false
        },
        order: ["sequence"],
        limit: 1,
        attributes: ["title", "type", "motion", "infoslide", "id", "sequence", "drawReleased", "motionReleased"],
        include: [
            {
                model: models.Debate,
                include: [
                    {
                        model: models.TeamAlloc,
                        include: [
                            {
                                model: models.Team,
                                include: [
                                    {
                                        model: models.Speaker,
                                        as: 'Speaker1',
                                        where: {PersonId: req.user.Person.id}
                                    },
                                    {
                                        model: models.Speaker,
                                        as: 'Speaker2',
                                        where: {PersonId: req.user.Person.id}
                                    }
                                ]
                            }
                        ],
                        require: false
                    },
                    {
                        model: models.AdjAlloc,
                        include: [
                            {
                                model: models.Adjudicator,
                                where: {PersonId: req.user.Person.id}
                            }
                        ],
                        require: false
                    }
                ]
            }
        ]
    }).then(round => {
        if (round.Debates.length > 0) {
            if (round.drawReleased) {
                if (!round.motionReleased) {
                    round.motion = "";
                    round.infoslide = "";
                }
                models.Debate.findOne({
                    where: {
                        id: round.Debates[0].id
                    },
                    attributes: ["id"],
                    include: [
                        {
                            model: models.AdjAlloc,
                            include: {
                                model: models.Adjudicator,
                                attributes: ["id"],
                                include: models.Person
                            }
                        },
                        {
                            model: models.TeamAlloc,
                            include: models.Team
                        },
                        {
                            model: models.Venue
                        }
                    ]
                }).then(debate => {
                    return res.status(200).json({round, debate});
                })

            } else {
                return res.status(401).json({error: `The current round draw is not available.`});
            }
        } else {
            return res.status(400).json({error: `You are not a participant in this round.`});
        }
    });
});


//
// POST /tournaments/create
// 200 - tournament created, provide slug
// 400 - missing field
//
router.post("/create", ttlib.middleware.isLoggedIn, (req, res) => {
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
router.post(`/:slug/configuration`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"), (req, res) => {
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
                        if (proposedChange.key !== 'null') {
                            return res.status(400).json({error: `Unidentified configuration option: ${proposedChange.key}`})
                        }
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
router.use(`/`, require("./ballots"));
router.use(`/`, require("./rounds"));
router.use(`/`, require("./teams"));
router.use(`/`, require("./venues"));


module.exports = router;