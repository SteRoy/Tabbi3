import React from "react";
import {Droppable, Draggable} from "react-beautiful-dnd";
import AllocationJudge from "../AllocationJudge";

class PanelAllocation extends React.Component {
    render() {
        return (
            <Droppable
                droppableId={this.props.id}
                key={this.props.id}
                direction="horizontal"
            >
                {(provided, snapshot) => {
                    return (
                        <div className={`${snapshot.isDraggingOver ? "alloc-drag-over" : "bg-light"}`}>
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{height: "60px", marginLeft: "10px", marginRight: "10px"}}
                            >
                                {
                                    this.props.adj.filter(a => a.roomid === this.props.id).map((judge, index) => (
                                        <Draggable draggableId={judge.id} key={`draggable-${judge.id}`} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <AllocationJudge
                                                        name={judge.name}
                                                        score={judge.score}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))
                                }
                                {provided.placeholder}
                            </div>
                        </div>
                    )
                }}
            </Droppable>
        )
    }
}

export default PanelAllocation;