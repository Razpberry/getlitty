from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import Optional
import PyPDF2
import io
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="GetLitty PDF API")

# CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Configuration - Using Hugging Face Inference API with OpenAI library
API_KEY = os.getenv("HUGGINGFACE_API_KEY")
AI_MODEL = os.getenv("AI_MODEL", "deepseek-ai/DeepSeek-V3")
# Hugging Face OpenAI-compatible inference endpoint
BASE_URL = "https://router.huggingface.co/v1"

if not API_KEY:
    raise ValueError("HUGGINGFACE_API_KEY environment variable is required")

# Initialize OpenAI client with Hugging Face endpoint
client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL
)

class AnalysisResponse(BaseModel):
    success: bool
    extracted_text: str
    analysis: Optional[str] = None
    error: Optional[str] = None

def extract_text_from_pdf(pdf_file: bytes) -> str:
    """Extract text from PDF file bytes"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting PDF text: {str(e)}")

def analyze_with_ai(text: str, prompt: Optional[str] = None) -> str:
    """Send text to AI for analysis using OpenAI-compatible API"""
    try:
        # Limit text length to avoid token limits
        max_text_length = 8000
        truncated_text = text[:max_text_length] if len(text) > max_text_length else text

        # Create the system and user messages
        system_message = "You are a helpful assistant that analyzes documents and provides clear, concise summaries."

        if prompt:
            user_message = f"{prompt}\n\nDocument:\n{truncated_text}"
        else:
            user_message = f"Please summarize and analyze the following document:\n\n{truncated_text}"

        print(f"Calling AI API with model: {AI_MODEL}")
        print(f"Text length: {len(truncated_text)} characters")
        print(f"Base URL: {BASE_URL}")

        # Make the API request using OpenAI client
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        print(f"Received response from AI")

        # Extract the generated text
        generated_text = response.choices[0].message.content
        return generated_text

    except Exception as e:
        print(f"Error in analyze_with_ai: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error calling AI API: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "GetLitty PDF API is running"}

@app.post("/upload-pdf", response_model=AnalysisResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    analyze: bool = True,
    prompt: Optional[str] = None
):
    """
    Upload a PDF file and optionally analyze it with AI

    - **file**: PDF file to upload
    - **analyze**: Whether to analyze with AI (default: True)
    - **prompt**: Custom prompt for AI analysis (optional)
    """
    print(f"Received upload request for file: {file.filename}")

    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    try:
        # Read file contents
        print("Reading file contents...")
        contents = await file.read()
        print(f"File size: {len(contents)} bytes")

        # Extract text from PDF
        print("Extracting text from PDF...")
        extracted_text = extract_text_from_pdf(contents)
        print(f"Extracted {len(extracted_text)} characters of text")

        if not extracted_text:
            return AnalysisResponse(
                success=False,
                extracted_text="",
                error="No text could be extracted from the PDF"
            )

        # Analyze with AI if requested
        analysis = None
        if analyze:
            print("Analyzing with AI...")
            analysis = analyze_with_ai(extracted_text, prompt)
            print("Analysis complete!")

        return AnalysisResponse(
            success=True,
            extracted_text=extracted_text,
            analysis=analysis
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in upload_pdf: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/analyze-text")
async def analyze_text(text: str, prompt: Optional[str] = None):
    """
    Analyze text directly with AI

    - **text**: Text to analyze
    - **prompt**: Custom prompt for analysis (optional)
    """
    try:
        analysis = analyze_with_ai(text, prompt)
        return {"success": True, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing text: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
