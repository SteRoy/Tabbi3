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

module.exports = router;