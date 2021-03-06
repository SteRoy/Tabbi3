const router = require('express').Router();
const models = require("../../models");
const ttlib = require("ttlib");

const RoundSettings = [
    {key: "silent", description: "Should these round results be used in public aggregated/individual results before the competition is completed.", type: "boolean", required: true},
    {key: "powerpairing", description: "Should this round draw use Power Pairing?", type: "boolean", required: true},
    {key: "breakcategory", description: "[Elimination Rounds Only] Should the Round seed only teams qualifying in a particular break category?", type: "text", required: false}
];

//
// GET /api/tournaments/rounds/settings
// Return a list of all valid configurations
//
router.get("/rounds/settings", ttlib.middleware.isLoggedIn, (req, res) => {
    return res.status(200).json({
        RoundSettings
    });
});

//
// GET /api/tournaments/:slug/rounds
// Return Tournament with Rounds.
// 200 - the list of rounds
// 404 - tournament not found
//
router.get(`/:slug/rounds`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "adjcore"), (req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            models.Round
        ]
    }).then(tournament => {
        if (tournament) {
            return res.status(200).json({tournament});
        } else {
            return res.status(404).json({error: `Tournament Not Found`});
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`});
    })
})

//
// GET /api/tournaments/:slug/public/rounds
// Return Tournament with Rounds that are completed.
// 200 - the list of rounds
// 404 - tournament not found
//
router.get(`/:slug/public/rounds`, (req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                attributes: ["title", "sequence", "id"],
                model: models.Round,
                where: {
                    completed: true
                },
                required: false
            }
        ]
    }).then(tournament => {
        if (tournament) {
            return res.status(200).json({tournament});
        } else {
            return res.status(404).json({error: `Tournament Not Found`});
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`});
    })
})


//
// GET /api/tournaments/:slug/round/:roundid
// Return Round information
// 200 - the Round
// 404 - tournament or round not found
//
router.get(`/:slug/round/:roundid`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "adjcore"),(req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: models.Round,
                include: [
                    {
                        model: models.RoundSetting
                    },
                    {
                        model: models.Debate,
                        include: [
                            {
                                model: models.TeamAlloc,
                                include: [
                                    {
                                        model: models.Team
                                    }
                                ]
                            },
                            {
                                model: models.Venue
                            },
                            {
                                model: models.AdjAlloc,
                                include: [
                                    {
                                        model: models.Adjudicator,
                                        include: [
                                            {
                                                model: models.Person
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }).then(tournament => {
        if (tournament) {
            if (tournament.Rounds) {
                const round = tournament.Rounds.find(roundObj => roundObj.id === Number(req.params.roundid));
                if (round) {
                    return res.status(200).json({round, tournament});
                } else {
                    return res.status(404).json({error: `Round not found`});
                }
            } else {
                return res.status(404).json({error: `No Rounds found`});
            }
        } else {
            return res.status(404).json({error: `Tournament Not Found`});
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`});
    })
})

//
// POST /api/tournaments/:slug/round/:roundid/motion
// Set motion and info slide
// 200 - updated sucessfully
// 404 - round/tournament not found
// 400 - missing field
//
router.post(`/:slug/round/:roundid/motion`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"),(req, res) => {
    ttlib.validation.objContainsFields(req.body, ['motion']).then(() => {
        models.Round.findOne({
            where: {
                id: req.params.roundid
            }
        }).then(round => {
            if (round) {
                round.motion = req.body.motion;
                if (req.body.infoslide) {
                    round.infoslide = req.body.infoslide;
                }
                round.save().then(() => {
                    return res.status(200).json({success: `Motion Updated`});
                }).catch(err => {
                    return res.status(500).json({error: `Internal Server Error: ${err}`})
                })
            } else {
                return res.status(404).json({error: `Round Not Found`})
            }
        }).catch(err => {
            return res.status(500).json({error: `Internal Server Error: ${err}`})
        })
    }).catch(missing => {
        return res.status(400).json({error: `Missing ${missing}`})
    })

})

//
// POST /api/tournaments/:slug/round/:roundid/release/:drawOrMotion
// 200 - toggle release of :drawOrMotion
//
router.post(`/:slug/round/:roundid/release/:drawOrMotion`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"), (req, res) => {
   if (!["draw", "motion"].includes(req.params.drawOrMotion)) {
       return res.status(400).json({error: `Malformed drawOrMotion parameter`});
   }

   models.Round.findOne({
       where: {
           id: req.params.roundid
       }
   }).then(round => {
        if (round) {
            if (req.params.drawOrMotion === "draw") {
                round.drawReleased = !round.drawReleased;
            } else {
                round.motionReleased = !round.motionReleased;
            }
            round.save().then(() => {
                return res.status(200).json({success: `Round ${req.params.drawOrMotion} release status updated.`})
            });
        } else {
            return res.status(404).json({error: `Round not found`});
        }
   }).catch(error => {
       return res.status(500).json({error})
   })
});

//
// POST /tournaments/:slug/round/:roundid/configuration
// 200 - configuration updated
// 400 - missing or invalid field
// 404 - Tournament not found
// 500 - ISE
//
router.post(`/:slug/round/:roundid/configuration`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"),(req, res) => {
    ttlib.validation.objContainsFields(req.body, ['settings']).then(body => {
        models.Round.findOne({
            where: {
                id: req.params.roundid
            },
            include: [
                models.RoundSetting
            ]
        }).then(round => {
            if (round) {
                body.settings.forEach(proposedChange => {
                    const template = RoundSettings.find(c => c.key === proposedChange.key);
                    // TODO: Value Validation
                    if (template) {
                            // TournamentSetting
                            const currentSetting = round.RoundSettings.find(ts => ts.key === proposedChange.key);
                            if (currentSetting) {
                                // UPDATE
                                currentSetting.value = proposedChange.value;
                                currentSetting.save().catch(err => {
                                    return res.status(500).json({error: `Internal Server Error: ${err}`})
                                })
                            } else {
                                // Create
                                models.RoundSetting.create({
                                    key: proposedChange.key,
                                    value: proposedChange.value,
                                    RoundId: round.id
                                }).catch(err => {
                                    return res.status(500).json({error: `Internal Server Error: ${err}`})
                                })
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

//
// POST /tournaments/:slug/round/:roundid/draw
// Create a round draw
// 200 - draw created
//
router.post(`/:slug/round/:roundid/draw`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"), (req, res) => {
    models.Round.findOne({
        where: {
            id: req.params.roundid
        },
        include: [
            models.Debate,
            models.RoundSetting
        ]
    }).then(async round => {
        if (round) {
        // Round Found
            if (round.Debates) {
                if (round.Debates.length > 0) {
                //    Delete previous debates
                    round.Debates.map(debate => debate.destroy());
                }
            }
        // Determine if we need to use Power Pairing
            let powerpairing = round.RoundSettings.find(setting => setting.key === 'powerpairing');
            if (powerpairing) {
                powerpairing = powerpairing.value;
            } else {
                // Default to not consider power pairing, although this should never be the case.
                powerpairing = false;
            }

        //    We need to grab all of the teams and adjudicators
        //    TODO: clash and institution will need to come through here too
            models.Tournament.findOne({
                where: {
                    slug: req.params.slug
                },
                include: [
                    models.Adjudicator,
                    {
                        model: models.Team,
                        include: [
                            {
                                model: models.TeamResult,
                                include: [
                                    {
                                        model: models.Ballot,
                                        where: {finalised: true},
                                        required: true
                                    },
                                ]
                            }
                        ]
                    },
                    models.Venue
                ]
            }).then(tournament => {
                if (tournament) {
                    if (tournament.Teams) {
                        let teams = tournament.Teams.filter(t => t.active);
                        if (teams.length % 4 !== 0) {
                            return res.status(400).json({error: `Tournament Team Count not divisible by 4.`})
                        }

                        let adjudicators = tournament.Adjudicators.filter(a => a.active);
                        if (adjudicators.length < teams.length/4) {
                            return res.status(400).json({error: `Tournament has insufficient active adjudicators. Has: ${adjudicators.length}, Needs: ${teams.length/4}`})
                        }

                        let venues = tournament.Venues.filter(v => v.active);
                        if (venues.length < teams.length/4) {
                            return res.status(400).json({error: `Tournament has insufficient active venues. Has: ${venues.length}, Needs: ${teams.length/4}`});
                        }

                    //  Powerpairing determines if we shuffle or group
                        if (powerpairing) {
                            // TODO: handle abnormality
                            teams = ttlib.array.shuffle(teams);
                            teams = teams.map(t => {
                                let team = t;
                                const teamPoints = t.TeamResults.reduce((acc, val) => acc + val.teamPoints, 0);
                                team.teamPoints = teamPoints || 0;
                                return team;
                            }).sort((a,b) => a.teamPoints < b.teamPoints ? -1 : 1);
                        } else {
                        //    Random allocation
                            teams = ttlib.array.shuffle(teams);
                        }

                        const rooms = ttlib.array.partition(teams, 4);
                        const panels = ttlib.array.chunkify(adjudicators, rooms.length);

                        let debatePromises = [];
                        let roomRanking = 1;
                        rooms.forEach(room => {
                            let i = 0;
                            room = ttlib.array.shuffle(room);
                            const TAllocs = ["OG", "OO", "CG", "CO"].map(position => {
                                const team = room[i];
                                i++;
                                return {
                                    position,
                                    TeamId: team.id
                                }
                            });
                            const panel = panels[roomRanking - 1].map((adj, index) => ({
                                    chair: index === 0,
                                    index,
                                    AdjudicatorId: adj.id
                                }
                            ));

                            debatePromises.push(
                                models.Debate.create({
                                    ranking: roomRanking,
                                    RoundId: round.id,
                                    TeamAllocs: TAllocs,
                                    AdjAllocs: panel,
                                    VenueId: venues[roomRanking - 1].id
                                }, {
                                    include: [
                                        models.TeamAlloc,
                                        models.AdjAlloc
                                    ]
                                })
                            )
                            roomRanking++;
                        });
                        Promise.all(debatePromises).then((debates) => {
                        //    Debates are created with teams!
                        //    TODO: we will next allocate adjudicators
                            return res.status(200).json({debates});
                        })
                    } else {
                        return res.status(400).json({error: `Tournament has no teams.`});
                    }
                } else {
                    return res.status(404).json({error: `Tournament Not Found`});
                }
            }).catch(err => {
                console.log(err);
                return res.status(500).json({error: `Internal Server Error ${err}`})
            })
        } else {
            return res.status(404).json({error: `Round not found`});
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`})
    })
})

//
// POST /tournaments/:slug/round/:roundid/complete
// Toggle a round as completed
//
router.post(`/:slug/round/:roundid/complete`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"), (req, res) => {
    models.Round.findOne({
        where: {
            id: req.params.roundid
        },
        include: [
            {
                model: models.Debate,
                include: [
                    {
                        model: models.Ballot
                    }
                ]
            }
        ]
    }).then(round => {
        if (round) {
            round.completed = round.Debates.map(deb => deb.Ballots.some(b => b.finalised)).every(v => v);
            round.save().then(() => {
                return res.status(200).json({success: `Round Status Updated`});
            });
        } else {
            return res.status(404).json({error: `Round not found`});
        }
    }).catch(error => {
        return res.status(500).json({error})
    })
});

//
// POST /api/tournaments/:slug/rounds/create
// Create a new round
//
router.post(`/:slug/rounds/create`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"),(req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: models.Round,
            }
        ],
        order: [
            [ models.Round, 'sequence', 'DESC']
        ]
    }).then(tournament => {
        if (tournament) {
            let newRound = 1;
            if (tournament.Rounds.length > 0) {
                newRound = tournament.Rounds[0].sequence + 1;
            }
            models.Round.create({
                title: `Round ${newRound}`,
                sequence: newRound,
                type: 'inround',
                completed: false,
                RoundSettings: [
                    {key: 'silent', value: 'true'},
                    {key: 'powerpairing', value: `${newRound === 1 ? 'false' : 'true'}`}
                ],
                TournamentId: tournament.id
            },
                {
                    include: [
                        models.RoundSetting
                    ]
                }).then(round => {
                return res.status(200).json({success: `Round Created`, round});
            }).catch((error) => {
                return res.status(500).json({error: `Internal Server Error: ${error}`});
            })
        } else {
            return res.status(404).json({error: `Tournament Not Found`});
        }
    }).catch((error) => {
        return res.status(500).json({error: `Internal Server Error: ${error}`});
    })
})


module.exports = router;