# scripts/generate_graph_image.py
# Run this once to save a picture of the compiled graph structure.
# Needs the graph already built in graph.py — this just asks it to draw itself.

from graph.graph import _compiled_graph

png_bytes = _compiled_graph.get_graph().draw_mermaid_png()
with open("images/graph.png", "wb") as f:
    f.write(png_bytes)

print("Saved to image/graph.png")