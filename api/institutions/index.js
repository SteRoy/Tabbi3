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
// 400 - Missing Field
// 500 - ISE, create object failed
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
            }).then(() => {
            return res.status(200).json({success: "Institution Created"});
        }).catch(() => {
            return res.status(500).json({error: "Internal Server Error"});
        })
    }).catch(error => {
        return res.status(400).json({error: `Missing ${error}`});
    });
});

//
// POST /api/institutions/:identifier/alias
// 200 - Institution Alias created
// 400 - Missing Field
//
router.post(`/:identifier/alias`, (req, res) => {
    ttlib.validation.objContainsFields(req.body, ["alias"]).then(postForm => {
        const titleCaseAlias = ttlib.string.toTitleCase(postForm.alias);
        models.InstitutionAlias.findOrCreate({
            where: {
                InstitutionId: req.params.identifier,
                alias: titleCaseAlias
            }
        }).then(() => {
            return res.status(200).json({success: `Alias Created`});
        }).catch(() => {
            return res.status(500).json({error: `Internal Server Error`});
        })
    }).catch(error => {
        return res.status(400).json({error: `Missing ${error}`});
    })
});

module.exports = router;