# main.py
# Command-line entry point for the finished pipeline.
# Keeps asking questions in a loop, so later questions can refer back to earlier ones.
# Requires ingest.py to have already been run, so Qdrant has chunks to search.

from graph.graph import run     # this function builds the initial state and runs the whole graph
from rag.chat_model import get_token_count, reset_token_count
import time

EXIT_WORDS = {"exit", "quit"}    # typing either of these, in any case, ends the loop

def main():
    conversation_history = []
    # grows by one {"question": ..., "answer": ...} entry after every turn
    # passed into run() each time, so later questions can refer back to earlier ones

    print("Type a question, or 'exit' to quit.\n")

    while True:
        question = input("Question: ").strip()

        if question.lower() in EXIT_WORDS:
            break
            # ends the loop; the script finishes normally after this

        if not question:
            continue
            # empty input, e.g. pressing enter by mistake — just ask again

        reset_token_count()
        # starts the token counter fresh for this question, so the total printed below
        # only reflects this turn, not every turn added together

        start = time.perf_counter()    # returns the current time from a very precise clock
        result = run(question, conversation_history)    # passing in the current question and the conversation history
                                                        # runs route -> (retrieve) -> generate for this one question
        elapsed = time.perf_counter() - start    # how long this one question took

        print(f"\nRoute: {result['route']}")  # Prints the routing decision the agent made for this question - retieve or direct
        print(f"\nAnswer:\n{result['answer']}")

        if result['citations']:
            print("\nSources:")
            for citation in result['citations']:
                print(f" - {citation}")
            # only printed when route was "retrieve"; a direct answer has no citations

        print(f"\nTokens used: {get_token_count()}")
        print(f"Time: {elapsed:.1f}s")
        print("-" * 40)

        conversation_history.append({"question": question, "answer": result["answer"]})
        # saves this turn, so the next call to run() can see it.

if __name__ == "__main__":
    main()
    # this file can be run directly: python main.py