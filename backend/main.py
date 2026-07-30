from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from database import init_db
from routers.analyze import router as analyze_router
from config import HOST, PORT

app = FastAPI(
    title="Reddit Brand Sentiment Analyzer",
    description="Analyze brand sentiment across Reddit with advanced NLP",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)


@app.on_event("startup")
async def startup():
    await init_db()
    print("[OK] Database initialized")
    print("[OK] Reddit Brand Sentiment Analyzer API is running!")
    print("[OK] Docs at: http://localhost:8000/docs")


@app.get("/")
async def root():
    return {
        "app": "Reddit Brand Sentiment Analyzer",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
