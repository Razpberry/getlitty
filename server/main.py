# main.py
"""
FastAPI server to:
 - accept a PDF upload at POST /upload
 - immediately insert a pending row into Supabase 'documents' table (name, status)
 - extract text from PDF
 - call the AI model (DeepSeek/Hugging Face via OpenAI-compatible client)
 - update the same Supabase row with original (extracted text), translated (model output), and status='ready'

This version never writes an `error` column to the DB (useful if your table doesn't have that column).
Required env vars:
 - HUGGINGFACE_API_KEY
 - AI_MODEL (optional, defaults to "deepseek-ai/DeepSeek-V3")
 - SUPABASE_URL
 - SUPABASE_SERVICE_ROLE_KEY
"""

import os
import io
import traceback
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import PyPDF2

# OpenAI-compatible client that will talk to Hugging Face router
from openai import OpenAI

# Supabase python client (supabase-py v2)
from supabase import create_client

load_dotenv()

app = FastAPI(title="GetLitty PDF API (no-error-column)")

# CORS - adjust allow_origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration from environment ---
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
AI_MODEL = os.getenv("AI_MODEL", "deepseek-ai/DeepSeek-V3")
BASE_URL = "https://router.huggingface.co/v1"  # HF OpenAI-compatible router

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not HUGGINGFACE_API_KEY:
    raise ValueError("HUGGINGFACE_API_KEY environment variable is required")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")

# Initialize clients
openai_client = OpenAI(api_key=HUGGINGFACE_API_KEY, base_url=BASE_URL)
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# --- Response model ---
class AnalysisResponse(BaseModel):
    success: bool
    extracted_text: str
    analysis: Optional[str] = None
    message: Optional[str] = None

# --- Helpers ---
def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes using PyPDF2. Returns empty string if none found."""
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        parts = []
        for i, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()
            except Exception:
                page_text = None
            if page_text:
                parts.append(page_text)
        return "\n".join(parts).strip()
    except Exception as e:
        # Raise HTTPException so the caller can catch and update status appropriately
        raise HTTPException(status_code=400, detail=f"Error extracting PDF text: {str(e)}")

def analyze_with_ai(text: str, prompt: Optional[str] = None) -> str:
    """
    Call the OpenAI-compatible API (Hugging Face router) using chat.completions.create,
    mirroring your previous usage.
    """

    instructions = """
        Do not add explanations, summaries, or commentary. Do not add explanations, summaries, or commentary. 

        You will receive the answers to a reading accessibility survey. Your only task is to make the text as easy to understand as possible. Do this by:

        Rewriting sentences with simpler vocabulary

        Breaking long sentences into shorter ones

        Using bold, italics, headings, bullet points, or other Markdown formatting to make the text easier to read

        Highlighting key points visually

        Important:

        Do not add explanations, summaries, or commentary. Do not add explanations, summaries, or commentary. Do not add explanations, summaries, or commentary. Do not add explanations, summaries, or commentary. 

        Only return the Markdown-formatted text.

        Keep the meaning intact while improving readability.

        Here are the survey questions for context (do not repeat them; just use them to guide your simplification):

        Challenges reading documents:

        Difficulty focusing on long or dense text

        English is not my first language

        Trouble understanding complex vocabulary

        Slow reading speed

        Problems with font size, spacing, or visual clutter

        Letters/words appear jumbled (dyslexia or similar)

        Difficulty with long paragraphs

        Trouble remembering or summarizing what I read

        Other

        What would help improve your reading experience:

        Simpler vocabulary

        Shortened/summarized versions

        Clearer layout (spacing, headings, bullet points)

        Dyslexia-friendly formatting (fonts, alignment)

        Larger text size

        Colour contrast adjustments

        Visual summaries (key points highlighted)

        Bilingual support or translation

        Definitions for difficult words

        Audio version of text

        Documents you struggle with most:

        School assignments or research papers

        PDF forms

        PowerPoint presentations

        Text-heavy articles or textbooks

        Instructions or manuals

        Other

        Optional reading disabilities or accessibility needs:

        ADHD

        Dyslexia

        Vision impairment

        None

        Prefer not to say

        Other changes you want implemented:

        Free text

        Task: Receive the answers and return only the Markdown-formatted simplified text, making it as readable and clear as possible.
    """

    try:
        max_text_length = 8000
        truncated_text = text[:max_text_length] if len(text) > max_text_length else text

        if prompt:
            user_message = f"{prompt}\n\nDocument:\n{truncated_text}"
        else:
            user_message = f"Please summarize and analyze the following document:\n\n{truncated_text}"

        resp = openai_client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": instructions},
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # The HF OpenAI-compatible response should include text in:
        # resp.choices[0].message.content
        generated = None
        try:
            generated = resp.choices[0].message.content
        except Exception:
            # Fallback: some clients return a slightly different shape
            generated = getattr(resp, "text", None) or str(resp)

        return generated or ""
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling AI API: {str(e)}")

# --- Routes ---
@app.get("/")
async def root():
    return {"status": "ok", "message": "GetLitty PDF API (no-error-column) is running"}

@app.post("/upload", response_model=AnalysisResponse)
async def upload(
    file: UploadFile = File(...),
    name: Optional[str] = None,
    analyze: bool = True,
    prompt: Optional[str] = None
):
    """
    Upload a PDF and process it end-to-end, writing only these columns to Supabase:
      - initial insert: name, status='pending'
      - final update: original, translated, status='ready'
    On failure the DB update only writes status='error' (no 'error' column used).
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    record_id = None
    try:
        # 1) Insert pending row immediately
        name_value = name or file.filename
        insert_payload = {"name": name_value, "status": "Pending"}

        # supabase-py v2: just .insert(...).execute()
        insert_resp = supabase.table("documents").insert(insert_payload).execute()

        # Check for error in a robust way
        if getattr(insert_resp, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase insert error: {insert_resp.error}")

        if not getattr(insert_resp, "data", None) or len(insert_resp.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to insert pending document row")

        record = insert_resp.data[0]
        record_id = record.get("id")
        if not record_id:
            # some setups may not return id; still proceed but we can't update the row later
            raise HTTPException(status_code=500, detail="Inserted row did not return an id")

        # 2) Read file bytes and extract text
        file_bytes = await file.read()
        extracted_text = extract_text_from_pdf(file_bytes)

        if not extracted_text:
            # update status to error (no error column write)
            supabase.table("documents").update({"status": "error"}).eq("id", record_id).execute()
            return AnalysisResponse(success=False, extracted_text="", message="No text extracted from PDF")

        # 3) Call AI model if requested
        translated_text = None
        if analyze:
            translated_text = analyze_with_ai(extracted_text, prompt)

        # 4) Update Supabase row with results (no 'error' column)
        update_payload = {
            "original": extracted_text,
            "translated": translated_text,
            "status": "Ready"
        }
        update_resp = supabase.table("documents").update(update_payload).eq("id", record_id).execute()

        if getattr(update_resp, "error", None):
            # If DB update fails, at least return the analysis to the client
            return AnalysisResponse(
                success=True,
                extracted_text=extracted_text,
                analysis=translated_text,
                message=f"Processed OK but failed to update DB: {update_resp.error}"
            )

        return AnalysisResponse(success=True, extracted_text=extracted_text, analysis=translated_text)

    except HTTPException:
        # Re-raise HTTPExceptions as-is
        raise
    except Exception as e:
        # log stacktrace
        traceback.print_exc()

        # Attempt to mark status='error' in the DB (no 'error' column is used)
        try:
            if record_id:
                supabase.table("documents").update({"status": "error"}).eq("id", record_id).execute()
        except Exception:
            traceback.print_exc()

        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # If your file name is main.py, keep "main:app". If you rename this file, update accordingly.
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
