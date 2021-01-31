module.exports = {
    // Optimisations
    // - institution membership should only contain adj->team relevant clashes

    //https://gitlab.com/tabbie/tabbie3/-/blob/master/classes/DrawLine.js

    // personalClash: {[adjPersonID]: {[teamID]: typeOfClash}}
    adjudicatorAllocation: (rooms, personalClash, institutionMemberships) => {
        const energyConfig = {
            personal: {
                'soft': 5000,
                'hard': 9999
            },
            institution: 5000
        }

        const evaluateSinglePanel = (panel, room) => {
            let energy = 0;
            let institutionsPanel = [];

            // probs max O(5) * O(4) = O(20)
            panel.forEach(adj => {
                institutionsPanel = institutionsPanel.concat(institutionMemberships['adjudicators'][adj]);

                room.teams.forEach(team => {
                    const clashed = personalClash[adj][team];
                    if (clashed) {
                        energy += energyConfig['personal'][clashed];
                    }
                })
            });

            // O(4) * O(3) * O(15) = O(180)
            room.teams.forEach(team => {
                institutionMemberships['teams'][team].forEach(inst => {
                    if (institutionsPanel.includes(inst)) {
                        energy += energyConfig['institution'];
                    }
                });
            })
        }

        const evaluateAllocation = (alloc) => {
        }

        const getTemperature = (curTemp) => {
        }

        const selectAdjacentState = (alloc) => {
        }
    }
}