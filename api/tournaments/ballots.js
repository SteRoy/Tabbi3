const router = require('express').Router();
const models = require("../../models");
const ttlib = require("ttlib");

//
// GET /api/tournaments/:slug/ballots/round/:roundid
// Return Round and Ballot information
// 200 - the Round with Ballot information
// 404 - tournament or round not found
//
// TODO: validate roundid is a Number
router.get(`/:slug/ballots/round/:roundid`, (req, res) => {
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
                                    models.Team
                                ]
                            },
                            {
                                model: models.Venue
                            },
                            {
                                model: models.Ballot
                            },
                            {
                                model: models.AdjAlloc,
                                include: [
                                    {
                                        model: models.Adjudicator,
                                        include: [
                                            models.Person
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
// GET /api/tournaments/:slug/ballots/debate/:debateid/:specificBallotOrTab
// Returns the (tab iff specificBallotOrTab === "tab") entered ballot (if it exists) for a given Debate
// 200 - the Debate information with Ballot if it exists
// 404 - debate could not be found
// TODO: Migrate to a non-slug dependent endpoint?
router.get(`/:slug/ballots/debate/:debateid/:specificBallotOrTab`, (req, res) => {
    let conditions = {};
    if (req.params.specificBallotOrTab === "tab") {
        conditions.enteredByTab = true;
    } else {
        conditions.id = parseInt(req.params.specificBallotOrTab);
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
            {model: models.Round, include: models.Tournament},
            {model: models.Venue}
        ]
    }).then(debate => {
        if (debate) {
            if (conditions.enteredByTab) {
                return res.status(200).json({debate});
            }
        } else {
            return res.status(404).json({error: `Debate Not Found`});
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`});
    })
});


module.exports = router;