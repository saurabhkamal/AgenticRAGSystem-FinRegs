# node.py
# The actual work done at each step of the graph.
# Each function takes the current state, does one job, and returns the updated state.
# LangGraph calls these in order: route -> retrieve (only if needed) -> generate

import json 
from rag.embedding import EuriEmbedder    # turns text into vector, so we can search Qdrant with it.
from rag.vector_store import VectorStore  # runs the similarity search against the stored chunks
from rag.chat_model import EuriChatModel
from graph.state import GraphState

TOP_K = 5   # how many chunks to pull back per retrieval

with open("data/manifest.json") as f:
    MANIFEST = json.load(f)      # Loaded once when this file is imported, not on every call, used only for citations


# 1. route
# This is the "agentic" part. Before doing anything else, the agent decides whether
# this question needs a lookup in the document database, or can be answered directly
# from general knowledge. Small talk and general questions skip retrieval entirely.

ROUTE_SYSTEM_PROMPT = (
    "You decide how to answer a question in a chat about payment industry and financial " \
    "regulation topics. The document database covers: cross-border payments, payment methods, " \
    "e-money regulation, PCI DSS card security, and financial market infrastructure principles. " \
    "Reply with ONLY one word: " \
    "'retrieve' if answering well needs a lookup in that document database, " \
    "'direct' if the question is general knowledge, small talk, or answerable from the " \
    "conversation so far without new documents."
)

def _format_history(history: list[dict]) -> str:
    # turns the list of past into plain text the chat model can read
    if not history:
        return "(no earlier turns)"
    lines = [f"Q: {turn['question']}\nA:{turn['answer']}" for turn in history]
    return "\n\n".join(lines)

def route(state: GraphState) -> GraphState:
    # first node: decide "retrieve" or "direct" for the current question
    history_text = _format_history(state["conversation_history"])
    user_prompt = f"Conversation so far: \n{history_text}\n\nNew question: {state['question']}"

    chat_model = EuriChatModel()
    reply = chat_model(ROUTE_SYSTEM_PROMPT, user_prompt).strip().lower()

    # fall back to "retrieve" on an unexpected reply because if it skips when it actually needed 
    # the documents → the answer could be wrong or made up, since the model is now guessing from 
    # general knowledge on a question about specific regulatory PDFs. 
    state["route"] = reply if reply in ("retrieve", "direct") else "retrieve"
    return state


# 2. retrieve:
# Only runs when route() decided "retrieve" 
# Same embed-then-search pattern. 
# Every chunk that comes back gets used.

def retrieve(state: GraphState) -> GraphState:
    embedder = EuriEmbedder()    # Creates the embedder which turns the text into a vector (a list of numbers), 
                                 # Qdrant compares the vector to find similar text
    vector = embedder([state["question"]])[0]
    # only embedding one question, so it is wrapped in a list then [0] pulls out that single vector

    store = VectorStore()    # creates the connection to Qdrant, where all the document chunks were saved during ingestion
    state["documents"] = store.query(vector=vector, top_k=TOP_K)
    # searches Qdrant for the TOP_K chunks whose vectors are closest to the question's vector
    # these are the chunks judged most likely to contain the answer
    # saved into state so generate() can use them to write the answer

    return state    # updated state back to the graph, now carrying the retrieved chunks

# 3. generate:
# Writes the final answer. Behaves differently depending on the route:
# - "retrieve": answers using the retrieved chunks, and attaches citations
# - "direct": answers from general knowledge and conversation history, no citations

GENERATE_WITH_CONTEXT_PROMPT = (
    "Answer the question using the provided context documents and the conversation so far. "
    "If the context doesn't contain the answer, say you don't have enough information. "
    "Do not include citation markers yourself; citations are added separately."
)

GENERATE_DIRECT_PROMPT = (
    "Answer the question directly, using the conversation so far for context. "
    "This question does not need document lookup."
)


def _build_citations(documents: list[dict]) -> list[str]:
    # turns each retrieved chunk's filename + page into a clean, readable citation
    citations = []     # one citation string per document

    for doc in documents:
        entry = MANIFEST.get(doc["source"])   # doc["source"] is the raw PDF filename, e.g. "PCIDSS_QRGv3.pdf"
        title = entry["title"] if entry else doc["source"]   # if the filename was found in MANIFEST, use its clean title
                                                             # if not found, fall back to the raw filename itself
                                                             # so a citation is still produced instead of crashing
        
        citations.append(f"{title}, p.{doc['page']}")    # builds the final citation text, and adds it to the list
    return citations

# final node: writes the answer, behaving differently depending on route()'s decision
def generate(state: GraphState) -> GraphState:
    history_text = _format_history(state["conversation_history"])     # turns past turns into plain text, so the model has conversation context either way

    chat_model = EuriChatModel()

    if state["route"] == "retrieve":
        context = "\n\n".join(f"[{doc['source']} p.{doc['page']}] {doc['text']}" for doc in state["documents"])
        user_prompt = (f"Conversation so far:\n{history_text}\n\n"
                       f"Question: {state['question']}\nContext:\n{context}")
        # combines conversation history, the current question, and the retrieved context
        # into one prompt the chat model will answer from
        
        state["answer"] = chat_model(GENERATE_WITH_CONTEXT_PROMPT, user_prompt).strip()     # .strip() removes stray whitespace/newlines from the reply
        state["citations"] = _build_citations(state["documents"])
    else:
        user_prompt = f"Conversation so far:\n{history_text}\n\nQuestion: {state['question']}"     # no context block this time, just conversation history and the question
        state["answer"] = chat_model(GENERATE_DIRECT_PROMPT, user_prompt).strip()
        state["citations"] = []

    return state



