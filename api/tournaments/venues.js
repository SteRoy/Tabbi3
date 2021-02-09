const router = require('express').Router();
const models = require("../../models");
const ttlib = require("ttlib");

//
// GET /api/tournaments/:slug/venues
// 200 - List of tournament venues
//
router.get(`/:slug/venues`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"),(req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        }
    }).then(tournament => {
        if (tournament) {
            models.Venue.findAll({
                where: {
                    TournamentId: tournament.id
                }
            }).then(venues => {
                return res.status(200).json({venues});
            })
        } else {
            return res.status(404).json({error: `Tournament not found`})
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`})
    })

})

//
// POST /api/tournaments/:slug/venues/create
// Creates a Venue for a tournament.
// 200 - Venue created
// 400 - Malformed Request
// 404 - Tournament not found
router.post(`/:slug/venues/create`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"),(req, res) => {
    ttlib.validation.objContainsFields(req.body, ["name"]).then(venueDetails => {
        models.Tournament.findOne({
            where: {
                slug: req.params.slug
            }
        }).then(tournament => {
            if (tournament) {
                models.Venue.create({
                    TournamentId: tournament.id,
                    name: venueDetails.name,
                    active: true
                }).then((venue) => {
                    return res.status(200).json({success: `Venue Created`, venue})
                });
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
// POST /api/tournaments/:slug/venues/:venueid/active
// 200 - Toggle an team's active setting
//
router.post(`/:slug/venues/:venueid/active`, ttlib.middleware.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab"),(req, res) => {
    models.Tournament.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: models.Venue,
                where: {
                    id: parseInt(req.params.venueid)
                }
            }
        ]
    }).then(tournament => {
        if (tournament) {
            if (tournament.Venues) {
                const venue = tournament.Venues[0];
                venue.active = !venue.active;
                venue.save();
                return res.status(200).json({success: `Venue Active Status Toggled`});
            }
        } else {
            return res.status(404).json({error: `No matching tournament & venue found`})
        }
    }).catch(err => {
        return res.status(500).json({error: `Internal Server Error: ${err}`})
    })
})

module.exports = router;