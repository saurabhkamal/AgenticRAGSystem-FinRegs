# test_queries.py
# Runs a fixed set of questions through the full pipeline, one after another, as one conversation.
# Demonstrates every requirement at once: retrieval, generation, citations, routing, and
# conversation handling (the follow-up questions at the end only work if history is carried over).

from graph.graph import run
from rag.chat_model import get_token_count, reset_token_count
import time

QUERIES = [
    # group A: domain-specific, should route to "retrieve" — only the PDFs know these answers
    "What are the core principles for financial market infrastructures?",
    "What are the key security requirements in the PCI DSS quick reference guide?",
    "What building blocks does the roadmap propose for enhancing cross-border payments?",
    "How does the FCA define e-money under its approach document?",
    "What payment methods does the Stripe guide describe for online transactions?",

    # group B: general knowledge / small talk, should route to "direct" — no lookup needed
    "Hi, how are you?",
    "What is 15% of 200?",
    "What is the capital of France?",
    "Can you tell me a fun fact about the moon?",

    # group C: edge case — sounds domain-related, but is general knowledge, not document-specific
    "What does PCI DSS stand for?",

    # group D: follow-ups — test conversation handling (requirement 9)
    # each only makes sense if the agent remembers the earlier turn it refers to
    "Which of those principles relates to operational risk?",
    "What did I just ask you about the moon?",
]

def run_all():
    conversation_history = []
    # one shared conversation across all 12 questions, same as a real main.py session
    # this is what lets the group D follow-ups actually reference earlier turns

    for i, question in enumerate(QUERIES, start=1):
        reset_token_count()
        start = time.perf_counter()
        result = run(question, conversation_history)
        elapsed = time.perf_counter() - start

        print(f"\n[{i}] Question: {question}")
        print(f"Route: {result['route']}")
        print(f"Answer: {result['answer']}")

        if result["citations"]:
            print("Sources:")
            for citation in result["citations"]:
                print(f"  - {citation}")
            # only present when route was "retrieve"

        print(f"Tokens: {get_token_count()}   Time: {elapsed:.1f}s")
        print("-" * 60)

        conversation_history.append({"question": question, "answer": result["answer"]})
        # saved after printing, so it's ready for the next question in the loop


if __name__ == "__main__":
    run_all()
    # run directly: python -m tests.test_queries