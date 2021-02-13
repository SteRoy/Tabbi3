const router = require('express').Router();
const models = require("../../models");
const ttlib = require("ttlib");

//
// GET /api/tournaments/:slug/adjudicators
// 200 - List of tournament adjudicators
//
router.get(`/:slug/adjudicators`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"), (req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        }
    }).then(tournament => {
        if (tournament) {
            models.Adjudicator.findAll({
                where: {
                    TournamentId: tournament.id
                },
                include: [
                    {
                        attributes: ['name', 'AccountId'],
                        model: models.Person,
                        include: [
                            models.InstitutionMembership,
                        ]
                    }
                ]
            }).then(adjudicators => {
                    return res.status(200).json({adjudicators});
            })
        } else {
            return res.status(404).json({error: `Tournament not found`})
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`})
    })

})

//
// POST /api/tournaments/:slug/adjudicators/placeholder/create
// Creates a placeholder Adjudicator for a tournament (swing).
// 200 - Adjudicator created
// 400 - Malformed Request
// 404 - Tournament not found
//
router.post(`/:slug/adjudicators/placeholder/create`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"), (req, res) => {
    ttlib.validation.objContainsFields(req.body, ["name", "testScore"]).then(adjDetails => {
        models.Tournament.findOne({
            where: {
                slug: req.params.slug
            }
        }).then(tournament => {
            if (tournament) {
                models.Person.create(
                    {
                        name: adjDetails.name,
                        placeholder: true,
                        Adjudicators: [
                            {
                                testScore: adjDetails.testScore,
                                independent: adjDetails.independent,
                                placeholder: true,
                                TournamentId: tournament.id,
                                active: true
                            }
                        ]
                    },
                    {
                        include: [models.Adjudicator]
                    }
                ).then(person => {
                    return res.status(200).json({success: `Person Created`});
                }).catch(err => {
                    return res.status(500).json({error: `Internal Server Error: ${err}`});
                })
            } else {
                return res.status(404).json({error: `Tournament Not Found`});
            }
        }).catch(err => {
            return res.status(500).json({error: `Internal Server Error: ${err}`});
        })
    }).catch(missing => {
        return res.status(400).json({error: `Missing ${missing}`});
    })
});

//
// POST /api/tournaments/:slug/adjudicators/:adjudicatorid/active
// 200 - Toggle an adjudicator's active setting
//
router.post(`/:slug/adjudicators/:adjudicatorid/active`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"), (req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: models.Adjudicator,
                where: {
                    id: parseInt(req.params.adjudicatorid)
                }
            }
        ]
    }).then(tournament => {
        if (tournament) {
            if (tournament.Adjudicators) {
                const adj = tournament.Adjudicators[0];
                adj.active = !adj.active;
                adj.save();
                return res.status(200).json({success: `Adjudicator Active Status Toggled`});
            }
        } else {
            return res.status(404).json({error: `No matching tournament & adjudicator found`})
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`})
    })
})

//
// POST /api/tournaments/:slug/adjudicators/clash
// Returns a mapping of Adjudicator -> Teams & Adjudicators from whom they are clashed
//
// TODO: This can be cached and updated only on new clash inserted.
router.get(`/:slug/adjudicators/clash`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "adjcore"), (req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                attributes: ["id"],
                model: models.Adjudicator,
                where: {placeholder: false},
                include: [
                    {
                        model: models.Person,
                        attributes: ["id"],
                        include: [
                            {
                                model: models.InstitutionMembership,
                            },
                            {
                                attributes: ["id"],
                                model: models.Account,
                                include: [
                                    {
                                        model: models.PersonalClash,
                                        as: 'myClash'
                                    },
                                    {
                                        model: models.PersonalClash,
                                        as: 'otherClash'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                attributes: ["id"],
                model: models.Team,
                where: {swing: false},
                include: [
                    {
                        model: models.Speaker,
                        attributes: ["id"],
                        as: 'Speaker1',
                        include: {
                            model: models.Person,
                            attributes: ["id"],
                            include: [
                                {
                                    attributes: ["id"],
                                    model: models.Account
                                },
                                {
                                    model: models.InstitutionMembership
                                }
                            ]
                        }
                    },
                    {
                        model: models.Speaker,
                        attributes: ["id"],
                        as: 'Speaker2',
                        include: {
                            model: models.Person,
                            attributes: ["id"],
                            include: [
                                {
                                    attributes: ["id"],
                                    model: models.Account
                                },
                                {
                                    model: models.InstitutionMembership
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }).then(tournament => {
        const isInsitutionActive = (institutionMembership) => {
            if (!institutionMembership.startDate && !institutionMembership.endDate) {
                return true;
            } else if (institutionMembership.startDate && !institutionMembership.endDate) {
                return true;
            } else if (!institutionMembership.startDate && institutionMembership.endDate) {
                const endDate = new Date(institutionMembership.endDate);
                if (new Date() < endDate) {
                    return true;
                }
            } else {
                const startDate = new Date(institutionMembership.startDate);
                const endDate = new Date(institutionMembership.endDate);
                const now = new Date();
                if (startDate < now && endDate > now) {
                    return true;
                }
            }
            return false;
        }
        let adjudicatorClashMappings = {};
        let teamClashObjs = {};
        let adjClashObjs = {};
        let institutionObjs = {};

        tournament.Teams.forEach(team => {
            let teamClashObj = {
                id: team.id,
                accounts: []
            };

            ["Speaker1", "Speaker2"].forEach(speakerKey => {
                team[speakerKey].Person.InstitutionMemberships.forEach(institution => {
                    if (isInsitutionActive(institution)) {
                        if (institutionObjs[institution.InstitutionId]) {
                            console.log(`Pushing ${institution.InstitutionId} for ${team.id}`)
                            institutionObjs[institution.InstitutionId].push(team.id);
                        } else {
                            institutionObjs[institution.InstitutionId] = [team.id];
                        }
                    }
                });
                teamClashObj['accounts'].push(team[speakerKey].Person.Account.id);
            });
            teamClashObj.accounts.forEach(acc => {
                teamClashObjs[acc] = teamClashObj;
            });
        });

        const adjudicators = tournament.Adjudicators.map(adj => {
            let adjClashObj = {
                id: adj.id,
                institutions: [],
                account: adj.Person.Account.id,
                personalClash: []
            };

            adj.Person.InstitutionMemberships.forEach(institution => {
                if (isInsitutionActive(institution)) {
                    adjClashObj.institutions.push(institution.InstitutionId);
                }
            });

            adj.Person.Account.myClash.forEach(pc => {
                adjClashObj.personalClash.push({AccountId: pc.targetAccountId, type: pc.type});
            });

            adj.Person.Account.otherClash.forEach(pc => {
                adjClashObj.personalClash.push({AccountId: pc.fromAccountId, type: pc.type});
            });
            adjClashObjs[adj.Person.Account.id] = adjClashObj;
            return adjClashObj;
        });

        adjudicators.forEach(adjudicator => {
            let adjudicatorClashMap = {
                teams: {},
                adjudicators: {}
            }

            adjudicator.institutions.forEach(inst => {
                const teamIDsAtInstitution = institutionObjs[inst];
                if (teamIDsAtInstitution) {
                    teamIDsAtInstitution.forEach(teamId => {
                        adjudicatorClashMap.teams[teamId] = "institutional";
                    });
                }

            });

            adjudicator.personalClash.forEach(personalClashObj => {
                const teamClash = teamClashObjs[personalClashObj.AccountId];
                const adjClash = adjClashObjs[personalClashObj.AccountId];
                if (teamClash) {
                    if (!(adjudicatorClashMap.teams[teamClash.id] === "hard" && personalClashObj.type === "soft")) {
                        adjudicatorClashMap.teams[teamClash.id] = personalClashObj.type;
                    }
                } else if (adjClash) {
                    adjudicatorClashMap.adjudicators[adjClash.id] = personalClashObj.type;
                }
            });

            adjudicatorClashMappings[adjudicator.id] = adjudicatorClashMap;
        })

        return res.status(200).json({adjudicatorClashMappings});
    }).catch(err => {
        return res.status(500).json({error: `ISE: ${err}`})
    })
});

module.exports = router;