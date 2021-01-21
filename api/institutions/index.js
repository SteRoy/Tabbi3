const router = require('express').Router();
const models = require("../../models");
const ttlib = require("ttlib");

//
// GET /api/institutions
// 200 - obj {institutions, institutionsWithMembers}, returns all stored institutions with some aggregate data
//
router.get("/", (req, res) => {
    models
        .Institution
        .findAll({
            include: [
                models.InstitutionAlias
            ]
        })
        .then(institutions => {
            models
                .InstitutionMembership
                .findAll({
                    group: 'InstitutionId',
                    attributes: ['InstitutionId', [models.sequelize.fn('COUNT', 'InstitutionId'), 'Members']],
                    includes: [
                        models.Institution
                    ]
                }).then(institutionsWithMembers => {
                return res.status(200).json({institutions, institutionsWithMembers});
            })
    })
});

//
// GET /api/institutions/options
// 200 - obj {institutions}, returns all institutions and aliases for selection options
//
router.get("/options", (req, res) => {
   models.Institution.findAll({
        include: [
            models.InstitutionAlias
        ]
       }).then(institutions => {
           return res.status(200).json({institutions});
   })
});

//
// POST /api/institutions/create
// 200 - Institution added
//
router.post("/create", (req, res) => {
    ttlib.validation.objContainsFields(req.body, ["name", "shortName", "aliases"]).then(postForm => {
        models.Institution.create(
            {
                name: postForm.name,
                shortName: postForm.shortName,
                InstitutionAliases: postForm.aliases.map(alias => ({alias}))
            },
            {
                include: [
                    models.InstitutionAlias
                ]
            })
        return res.status(200).json({success: "Institution Created"});
    }).catch(error => {
        return res.status(400).json({error: `Missing ${error}`});
    });
})

module.exports = router;