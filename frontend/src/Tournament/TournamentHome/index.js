import React from "react";
import NavBar from "../../NavBar";
import {Card} from "primereact/card";
import TournamentToolBar from "../../components/TournamentToolBar";
import PersonCard from "../../components/PersonCard";

class TournamentHome extends React.Component {
    render() {
        return (
            <div>
                <NavBar active=""/>
                <div className="p-grid p-justify-center p-align-center p-mt-5">
                    <div className="p-col-11">
                        <TournamentToolBar/>
                        <Card>
                            <div className="display-4 text-center w-100">Doxbridge Worlds 2021</div>
                            <hr/>
                            <div className="p-grid">
                                <div className="p-col p-justify-center" style={{borderRight: "1px solid rgb(0,0,0,.1)"}}>
                                    <img
                                        alt={"Doxbridge Worlds 2021"}
                                        src={"https://scontent.fdsa1-1.fna.fbcdn.net/v/t1.0-9/s960x960/118215732_448142762751434_3584822132726396335_o.jpg?_nc_cat=101&ccb=2&_nc_sid=340051&_nc_ohc=ICKy43wgZQoAX9g9p8F&_nc_ht=scontent.fdsa1-1.fna&tp=7&oh=c2807d21f734b569ae39ce06cf112855&oe=601FF2B9"}
                                        onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'}
                                        className="card-tournament-logo p-mb-3"
                                    />
                                    <p>
                                        Doxbridge Worlds 2021 aims to be the largest ever debating tournament, and a post-NYE filler for those of you who haven't managed to get your competitive debating fix over the holidays.
                                    </p>
                                    <p>
                                        The tournament will be split into two divisions for the 9 preliminary rounds, to allow for maximum global coverage. Each division will have its own schedule, and you can elect which division best suits your timezone when you reg. Each division will then break the same number of teams to a combined set of outrounds.
                                    </p>
                                </div>

                                <div className="p-col">
                                    <div className="text-center display-5">Organisation Committee</div>
                                    <div className="p-grid">
                                            <PersonCard
                                                img="https://i.imgur.com/ymNEaeF.png"
                                                name="Matthew Hazell"
                                                description={"Cambridge Union Society"}
                                            />
                                            <PersonCard
                                                img="https://i.imgur.com/Ri4tYBc.png"
                                                name="Steven Roy"
                                                description={"Durham Union Society"}
                                            />
                                    </div>
                                    <hr/>
                                    <div className="text-center display-5">Adjudication Core</div>
                                    <div className="p-grid">
                                        <div className="p-col">
                                            <PersonCard
                                                img="https://i.imgur.com/AJXabvo.png"
                                                name="Jess Musulin"
                                                description={"Too Old For A Society"}
                                            />
                                        </div>
                                    </div>
                                    <hr/>
                                    <div className="text-center display-5">Tabulation Team</div>
                                    <div className="p-grid">
                                        <div className="p-col">
                                            <PersonCard
                                                img="https://i.imgur.com/Ri4tYBc.png"
                                                name="Steven Roy"
                                                description={"Durham Union Society"}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }
}

export default TournamentHome;