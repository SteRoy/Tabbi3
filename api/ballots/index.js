const router = require('express').Router();
const models = require("../../models");
const ttlib = require("ttlib");

//
// GET /api/ballots/:slug/debate/:debateid/:nature
// Returns the  entered ballot (if it exists) for a given Debate
// @param nature - ["tab", "adjudicator", BallotId]
// 200 - the Debate information with Ballot if it exists
// 404 - debate could not be found
router.get(`/:slug/debate/:debateid/:nature`, ttlib.middleware.userMaySubmitBallot(models), async (req, res) => {
    let conditions = {};
    if (req.params.nature === "tab") {
        conditions.enteredByTab = true;
    } else if (req.params.nature === "adjudicator") {
        const adj = await models.Adjudicator.findOne({where: {PersonId: req.user.Person.id}});
        if (adj) {
            conditions.AdjudicatorId = adj.id;
        }
    } else {
        conditions.id = parseInt(req.params.nature);
    }

    models.Debate.findOne({
        where: {
            id: parseInt(req.params.debateid)
        },
        include: [
            {
                model: models.Ballot,
                where: conditions,
                include: [
                    {
                        model: models.TeamResult
                    },
                    {
                        model: models.Adjudicator,
                        include: models.Person
                    }
                ],
                required: false
            },
            {
                model: models.TeamAlloc,
                include: [
                    {
                        model: models.Team,
                        include: [
                            {
                                model: models.Speaker,
                                as: "Speaker1",
                                include: models.Person
                            },

                            {
                                model: models.Speaker,
                                as: "Speaker2",
                                include: models.Person
                            }
                        ]
                    }
                ]
            },
            {model: models.AdjAlloc},
            {model: models.Round, include: models.Tournament},
            {model: models.Venue}
        ]
    }).then(debate => {
        if (debate) {
            if (conditions.AdjudicatorId) {
                const adjAlloc = debate.AdjAllocs.find(aa => aa.AdjudicatorId === conditions.AdjudicatorId);
                if (adjAlloc) {
                    return res.status(200).json({debate});
                }
            } else if (conditions.enteredByTab || conditions.id) {
                return res.status(200).json({debate});
            } else {
                return res.status(401).json({error: `You must be on the Tab team.`});
            }
        } else {
            return res.status(404).json({error: `Debate Not Found`});
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`});
    })
});

//
// POST /api/ballots/:slug/debate/:debateid/:nature
// Create or Update a Ballot for a specified Debate
// @param nature - ["tab", "adjudicator", BallotId]
// 200 - the Ballot was created or Updated
// 404 - debate could not be found
router.post(`/:slug/debate/:debateid/:nature`, ttlib.middleware.userMaySubmitBallot(models), (req, res) => {
    ttlib.validation.objContainsFields(req.body, ['ballot']).then(body => {
        models.Debate.findOne({
            where: {
                id: parseInt(req.params.debateid)
            },
            include: [
                {
                    model: models.Ballot,
                    required: false,
                    include: [
                        {
                            model: models.TeamResult
                        }
                    ]
                }
            ]
        }).then(async debate => {
            if (debate) {
                let adj;
                if (debate.Ballots.length > 0) {
                //    If it already exists, we'll eliminate it and create it again for s a f e t y.
                    const isTab = req.params.nature === "tab";
                    let ballot;
                    if (req.params.nature === "adjudicator") {
                        adj = await models.Adjudicator.findOne({where: {PersonId: req.user.Person.id}});
                        ballot = debate.Ballots.find(b => b.AdjudicatorId === adj.id);
                    } else {
                        ballot = debate.Ballots.find(b => isTab ? b.enteredByTab : b.id === parseInt(req.params.nature));
                    }
                    if (ballot) {
                        ballot.destroy();
                    }
                }

                let error = false;
                let rankedTeamResults = body.ballot.TeamResults.map(teamResultObj => {
                    ["speakerOneSpeaks", "speakerTwoSpeaks"].forEach(key => {
                        if (teamResultObj[key] < 50 || teamResultObj[key] > 100) {
                            error = "Speaker points must fall within the 50-100 range.";
                        }
                    })
                    return {
                        teamPoints: 0,
                        speakerOneSpeaks: teamResultObj.speakerOneSpeaks,
                        speakerTwoSpeaks: teamResultObj.speakerTwoSpeaks,
                        speakerPoints: teamResultObj.speakerOneSpeaks + teamResultObj.speakerTwoSpeaks,
                        abnormality: teamResultObj.abnormality,
                        TeamId: parseInt(teamResultObj.TeamId)
                    }
                }).sort((a, b) => a.speakerPoints <= b.speakerPoints? 1 : -1);

                if (error) {
                    return res.status(400).json({error})
                }

                let previousPoints = 4;
                for (let i = 0; i < rankedTeamResults.length; i++) {
                    previousPoints--;
                    if ((i + 1) < rankedTeamResults.length ? rankedTeamResults[i].speakerPoints === rankedTeamResults[i + 1].speakerPoints : false) {
                        return res.status(400).json({error: `BP does not allow tied teams.`});
                    } else {
                        rankedTeamResults[i].teamPoints = previousPoints;
                        delete rankedTeamResults[i].speakerPoints;
                    }
                }

                let ballotObj = {
                    enteredByTab: req.params.nature === "tab",
                    finalised: false,
                    TeamResults: rankedTeamResults,
                    DebateId: debate.id
                };

                if (req.params.nature === "adjudicator") {
                    ballotObj.AdjudicatorId = adj.id;
                }

                models.Ballot.create(ballotObj,
                {
                    include: [
                        models.TeamResult
                    ]
                }).then(() => {
                        return res.status(200).json({success: `Ballot Created`});
                }).catch(err => {
                    return res.status(500).json({error: `Internal Server Error: ${err}`});
                })

            } else {
                return res.status(404).json({error: `Debate not found.`})
            }
        });
    }).catch(missing => {
        return res.status(500).json({error: `Missing: ${missing}`});
    })
});

//
// POST /api/ballots/:slug/debate/:debateid/ballot/:ballotid/finalise
// Toggle a ballot's finalised status, if there's already a finalised ballot - we will unfinalise it.
// 200 - the Ballot's finalised field was toggled
// 404 - debate could not be found
router.post(`/:slug/debate/:debateid/ballot/:ballotid/finalise`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"), (req, res) => {
   models.Debate.findOne({
       where: {
           id: parseInt(req.params.debateid)
       },
       include: [
           {
               model: models.Ballot
           }
       ]
   }).then(debate => {
       if (debate) {
           let ballotToModify = debate.Ballots.find(b => b.id === parseInt(req.params.ballotid));
           if (ballotToModify) {
               if (ballotToModify.finalised) {
                   ballotToModify.finalised = false;
                   ballotToModify.save();
                   return res.status(200).json({success: `Ballot marked as unfinalised.`});
               } else {
                    ballotToModify.finalised = true;
                    debate.Ballots.forEach(b => {
                        if (b.id !== parseInt(req.params.ballotid) && b.finalised) {
                            b.finalised = false;
                            b.save();
                        }
                    })
                    ballotToModify.save();
                    return res.status(200).json({success: `Ballot marked as finalised.`});
               }
           } else {
               return res.status(404).json({error: `Ballot not found`})
           }
       } else {
           return res.status(404).json({error: `Debate not found`})
       }
   }).catch(err => {
       return res.status(500).json({error: `Internal Server Error: ${err}`})
   })
});

module.exports = router;