# server.py
# Thin FastAPI wrapper around the existing LangGraph pipeline (graph/graph.py),
# so the React frontend has something to call. All the actual RAG logic
# (routing, retrieval, generation, citations) still lives in graph/ and rag/ untouched.

import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from graph.graph import run as run_graph
from rag.chat_model import get_token_count, reset_token_count

load_dotenv()

app = FastAPI(title="Agentic RAG API")

# frontend runs on Vite's default dev port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEMO_USER = os.environ.get("DEMO_USER", "demo")
DEMO_PASSWORD = os.environ.get("DEMO_PASSWORD", "demo1234")


class LoginRequest(BaseModel):
    username: str
    password: str


class Turn(BaseModel):
    question: str
    answer: str


class ChatRequest(BaseModel):
    question: str
    history: list[Turn] = []


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/login")
def login(payload: LoginRequest):
    if payload.username == DEMO_USER and payload.password == DEMO_PASSWORD:
        return {"ok": True, "username": payload.username}
    raise HTTPException(status_code=401, detail="Invalid username or password")


@app.post("/api/chat")
def chat(payload: ChatRequest):
    reset_token_count()
    start = time.perf_counter()

    history = [{"question": t.question, "answer": t.answer} for t in payload.history]
    result = run_graph(payload.question, history)

    elapsed = time.perf_counter() - start

    return {
        "answer": result["answer"],
        "route": result["route"],
        "citations": result["citations"],
        "tokens": get_token_count(),
        "time": round(elapsed, 2),
    }
