# state.py
# The shared data structure every node in the graph reads from and writes back to.
# One state object is created per question and passed through route -> (retrieve) -> generate.

from typing import TypedDict

class Turn(TypedDict):
    # One past exchange, kept so the agent has context on later questions in the same conversation
    question: str
    answer: str

class GraphState(TypedDict):
    question: str      # the current user question
    conversation_history: list[Turn]     # earlier turns in this conversation, oldest first
                                         # the route and generate nodes can read this to understand follow-up questions

    route: str                 # the agent's decision on this question: "retrieve" or "direct"
    documents: list[dict]      # chunks pulled from Qdrant, only filled in when route in "retrieve"
    citations: list[str]       # one formatted citation string per document used in the answer
                               # empty when route is "direct", since a direct answer uses no sources

    answer: str                # the final answer text, written by the generate node
     
