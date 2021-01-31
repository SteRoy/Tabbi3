const router = require('express').Router();

const models = require("../../models");
const ttlib = require("ttlib");

//
// GET /api/tournaments/:slug/teams
// 200 - List of tournament teams
//
router.get(`/:slug/teams`, (req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        }
    }).then(tournament => {
        if (tournament) {
            models.Team.findAll({
                where: {
                    TournamentId: tournament.id
                },
                include: [
                    {
                        model: models.Speaker,
                        as: 'Speaker1',
                        include: [
                            {
                                model: models.Person,
                                attributes: ['name', 'AccountId'],
                                include: [
                                    models.InstitutionMembership
                                ]
                            }
                        ]
                    },
                    {
                        model: models.Speaker,
                        as: 'Speaker2',
                        include: [
                            {
                                model: models.Person,
                                attributes: ['name', 'AccountId'],
                                include: [
                                    models.InstitutionMembership
                                ]
                            }
                        ]
                    }
                ]
            }).then(teams => {
                return res.status(200).json({teams});
            })
        } else {
            return res.status(404).json({error: `Tournament not found`})
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`})
    })

})

//
// POST /api/tournaments/:slug/teams/placeholder/create
// Creates a placeholder Team for a tournament (swing).
// 200 - Team created
// 400 - Malformed Request
// 404 - Tournament not found
// TODO: Promisify because this is dumb
router.post(`/:slug/teams/placeholder/create`, (req, res) => {
    ttlib.validation.objContainsFields(req.body, ["name", "codename", "s1name", "s2name"]).then(teamDetails => {
        models.Tournament.findOne({
            where: {
                slug: req.params.slug
            }
        }).then(tournament => {
            if (tournament) {
                models.Person.create(
                    {
                        name: teamDetails.s1name,
                        placeholder: true,
                        Speakers: [
                            {
                                redacted: false,
                                TournamentId: tournament.id
                            }
                        ]
                    },
                    {
                        include: [models.Speaker]
                    }
                ).then(personOne => {
                    models.Person.create(
                        {
                            name: teamDetails.s2name,
                            placeholder: true,
                            Speakers: [
                                {
                                    redacted: false,
                                    TournamentId: tournament.id
                                }
                            ]
                        },
                        {
                            include: [models.Speaker]
                        }
                    ).then(personTwo => {
                        models.Team.create({
                            name: teamDetails.name,
                            codename: teamDetails.codename,
                            Speaker1Id: personOne.Speakers[0].id,
                            Speaker2Id: personTwo.Speakers[0].id,
                            TournamentId: tournament.id,
                            swing: true,
                            active: true
                        }).then(team => {
                            return res.status(200).json({success: `Team Created`, team})
                        }).catch(err => {
                            return res.status(500).json({error: `Internal Server Error: ${err}`})
                        })
                    }).catch(err => {
                        return res.status(500).json({error: `Internal Server Error: ${err}`});
                    });
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

module.exports = router;