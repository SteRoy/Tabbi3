const router = require('express').Router();
const models = require("../../models");
const ttlib = require("ttlib");

const roundSettings = [
    {id: "silent", description: "Should these round results be used in public aggregated/individual results before the competition is completed.", type: "boolean", required: true},
    {id: "breakcategory", description: "[Elimination Rounds Only] Should the Round seed only teams qualifying in a particular break category?", type: "text", required: true}
];

//
// GET /api/tournaments/rounds/settings
// Return a list of all valid configurations
//
router.get("/rounds/settings", (req, res) => {
    return res.status(200).json({
        settings: roundSettings
    });
});

//
// GET /api/tournaments/:slug/rounds
// Return Tournament with Rounds.
// 200 - the list of rounds
// 404 - tournament not found
//
router.get(`/:slug/rounds`, (req, res) => {
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
// GET /api/tournaments/:slug/round/:roundid
// Return Round information
// 200 - the Round
// 404 - tournament or round not found
//
// TODO: validate roundid is a Number
router.get(`/:slug/round/:roundid`, (req, res) => {
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
router.post(`/:slug/round/:roundid/motion`, (req, res) => {
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
// POST /api/tournaments/:slug/rounds/create
// Create a new round
//
router.post(`/:slug/rounds/create`, (req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: models.Round,
                order: ['sequence', 'DESC']
            }
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
                    {key: 'silent', value: 'true'}
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