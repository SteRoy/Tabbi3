module.exports = {
    isLoggedIn: (req, res, next) => {
        if (req.user) {
            next();
        } else {
            return res.status(401).json({error: `You must be logged in to do that.`});
        }
    },

    //
    // Accepts iff, Account for session is 'god' status
    //
    isGodUser: (models) => {
        return (req, res, next) => {

            if (!req.user) {
                return res.status(401).json({error: `You must be logged in.`});
            }
            models.Account.findOne({
                where: {
                    id: req.user.id
                }
            }).then(account => {
                if (account) {
                    if (account.god) {
                        next();
                    } else {
                        return res.status(401).json({error: `You must be a global super user to do that.`});
                    }
                } else {
                    return res.status(401).json({error: `Your account could not be found`})
                }
            }).catch(err => {
                return res.status(401).json({error: `Your account's access level could not be verified.`});
            })
        }
    },

    //
    // Accepts iff, Account for session is 'god' status or 'pro' status
    //
    isProUser: (models) => {
        return (req, res, next) => {

            if (!req.user) {
                return res.status(401).json({error: `You must be logged in.`});
            }
            models.Account.findOne({
                where: {
                    id: req.user.id
                }
            }).then(account => {
                if (account) {
                    if (account.god || account.pro) {
                        next();
                    } else {
                        return res.status(401).json({error: `You must be a PRO user to do that.`});
                    }
                } else {
                    return res.status(401).json({error: `Your account could not be found`})
                }
            }).catch(err => {
                return res.status(401).json({error: `Your account's access level could not be verified.`});
            })
        }
    },

    //
    // Accepts if Account for session is 'tab' role or @param role for slug tournament
    // ALSO accepts if account is 'god' status.
    //
    userHoldsTournamentRoleOrIsTab: (models, slug, role) => {
        return (req, res, next) => {
            if (slug === "inherit") {
                slug = req.params.slug;
            }
            if (!req.user) {
                return res.status(401).json({error: `You must be logged in.`});
            }
            models.Tournament.findOne({
                where: {
                    slug
                },
                include: [
                    {
                        model: models.TournamentRole,
                        where: {
                            AccountId: req.user.id,
                            role: {
                                [models.Sequelize.Op.or]: ["tab", role]
                            }
                        }
                    }
                ]
            }).then(tournament => {
                if (tournament) {
                    if (tournament.TournamentRoles.length > 0) {
                        next();
                    } else {
                        if (req.user.god) {
                            next();
                        } else {
                            return res.status(401).json({error: `You must have the ${role} role to do that.`});
                        }
                    }
                } else {
                    return res.status(401).json({error: `Your tournament could not be found`})
                }
            }).catch(err => {
                return res.status(401).json({error: `Your account's access level could not be verified. (${err})`});
            })
        }
    },

    userMaySubmitBallot: (models) => {
        return (req, res, next) => {
            const DebateId = parseInt(req.params.debateid);
            const isTabRequest = req.params.nature === "tab";
            const isAdjCreation = req.params.nature === "adjudicator";


            if (!req.user) {
                return res.status(401).json({error: `You must be logged in.`});
            }

            if (isTabRequest) {
                return module.exports.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab")(req, res, next);
            } else if (isAdjCreation) {
                models.Debate.findOne({
                    where: {
                        id: DebateId
                    },
                    include: [
                        {
                            model: models.AdjAlloc,
                            include: [
                                {
                                    model: models.Adjudicator,
                                    include: [
                                        {
                                            model: models.Person,
                                            include: [
                                                {
                                                    model: models.Account,
                                                    where: {
                                                        id: req.user.id
                                                    }
                                                }

                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                        ]
                    }).then(debate => {
                    if (debate) {
                        if (debate.AdjAllocs.length > 0) {
                            next();
                        } else {
                            if (req.user.god) {
                                next();
                            } else {
                                return res.status(401).json({error: `You must be an adjudicator in this debate to do that.`});
                            }
                        }
                    } else {
                        return res.status(401).json({error: `Your tournament could not be found`})
                    }
                }).catch(err => {
                    return res.status(401).json({error: `Your account's access level could not be verified.`});
                })
            } else {
                const BallotId = parseInt(req.params.nature);
                models.Ballot.findOne({
                    where: {
                        id: BallotId
                    },
                    include: [
                        {
                            model: models.Adjudicator,
                            include: [
                                {
                                    model: models.Person,
                                    include: [
                                        {
                                            model: models.Account
                                        }

                                    ]
                                }
                            ]
                        }
                    ]
                }).then(ballot => {
                    if (ballot) {
                        if (ballot.Adjudicator) {
                            if (ballot.Adjudicator.Person.Account.id === req.user.id) {
                                return next();
                            }
                        }
                        return module.exports.userHoldsTournamentRoleOrIsTab(models, "inherit", "tab")(req, res, next);
                    } else {
                        return res.status(404).json({error: `Ballot not found`});
                    }
                }).catch(err => {
                    return res.status(500).json({error: `Internal Server Error: ${err}`});
                })
            }
        }
    }
}