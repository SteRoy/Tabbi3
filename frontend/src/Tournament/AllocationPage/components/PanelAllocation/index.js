import React from "react";
import {Droppable, Draggable} from "react-beautiful-dnd";
import AllocationJudge from "../AllocationJudge";

class PanelAllocation extends React.Component {
    render() {
        const draggableStyle = (style) => ({
            marginRight: "20px",
            ...style
        });
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
                                style={{height: "60px", marginRight: "10px", display: "flex", padding: 8, overflow: 'auto'}}
                            >
                                {
                                    this.props.adj.filter(a => a.roomid === this.props.id).sort((a,b) => a.index < b.index ? -1 : 1).map((judge) => (
                                        <Draggable draggableId={judge.id} key={`draggable-${judge.id}`} index={judge.index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    style={draggableStyle(provided.draggableProps.style)}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <AllocationJudge
                                                        name={judge.name}
                                                        score={judge.score}
                                                        chair={judge.index === 0}
                                                        isDragged={snapshot.isDragging}
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