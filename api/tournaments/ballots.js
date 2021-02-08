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
                                model: models.Ballot,
                                include: [
                                    models.TeamResult
                                ]
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
                const round = tournament.Rounds.find(roundObj => roundObj.id === parseInt(req.params.roundid));
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


module.exports = router;