# graph.py
# Builds the graph out of the node functions and defines how they connect
# node.py has the logic for each step; this file only decides the order and branching.

from langgraph.graph import StateGraph, END
from graph.state import GraphState
from graph.node import route, retrieve, generate

def build_graph():
    graph = StateGraph(GraphState)

    graph.add_node("route", route)
    graph.add_node("retrieve", retrieve)
    graph.add_node("generate", generate)
    # registers each function from the node.py

    graph.set_entry_point("route")    # every question starts at route(), since that's what decides what happens next

    graph.add_conditional_edges(
        "route",
        lambda state: state["route"],
        # reads the route node's decision straight out of state
        {"retrieve": "retrieve", "direct": "generate"},
        # if state["route"] is "retrieve", go to the retrieve node
        # if it's "direct", skip straight to generate — this is what "agentic routing" is in practice
    )

    graph.add_edge("retrieve", "generate")     # after retrieving, always move on to generate
    graph.add_edge("generate", END)            # generate is always the last step, for both routes

    return graph.compile()

_compiled_graph = build_graph()  # built once when this file is first imported, so run() below doesn't rebuild it on every question

def run(question: str, conversation_history: list[dict]) -> GraphState:
    # entry point main.py calls for each question
    initial_state: GraphState = {
        "question": question,
        "conversation_history": conversation_history,   # history comes in from main.py, so this run can see earlier turns
        "route": "",
        "documents":[],
        "citations":[],
        "answer": "",
        # these start empty; each node fills in its own part as the graph runs
    }

    return _compiled_graph.invoke(initial_state)  # runs route -> (retrieve) -> generate, and returns the final state with the answer filled in


