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