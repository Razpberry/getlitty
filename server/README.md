# GetLitty FastAPI Backend

FastAPI backend for PDF upload and analysis using Hugging Face AI models.

## Features

- Upload PDF files
- Extract text from PDFs
- Analyze documents with Hugging Face AI models
- Custom prompt support
- Configurable model selection
- CORS-enabled for frontend integration

## Setup

### 1. Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Hugging Face API key:

```
HUGGINGFACE_API_KEY=your_actual_api_key_here
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

You can use any text generation model from Hugging Face. Some popular options:
- `mistralai/Mistral-7B-Instruct-v0.2` (default)
- `meta-llama/Llama-2-7b-chat-hf`
- `tiiuae/falcon-7b-instruct`
- `HuggingFaceH4/zephyr-7b-beta`

### 3. Run the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### `GET /`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "GetLitty PDF API is running"
}
```

### `POST /upload-pdf`
Upload and analyze a PDF file

**Parameters:**
- `file` (required): PDF file to upload
- `analyze` (optional, default: true): Whether to analyze with Hugging Face
- `prompt` (optional): Custom prompt for analysis

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/upload-pdf?analyze=true" \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "success": true,
  "extracted_text": "Full extracted text from PDF...",
  "analysis": "Hugging Face model's analysis of the document..."
}
```

### `POST /analyze-text`
Analyze text directly with Hugging Face

**Parameters:**
- `text` (required): Text to analyze
- `prompt` (optional): Custom prompt for analysis

**Example:**
```bash
curl -X POST "http://localhost:8000/analyze-text" \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here", "prompt": "Summarize this"}'
```

## Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Getting a Hugging Face API Key

1. Visit [Hugging Face](https://huggingface.co/)
2. Sign up or log in
3. Go to Settings → Access Tokens
4. Create a new access token (select "Read" access)
5. Copy the token to your `.env` file as `HUGGINGFACE_API_KEY`

**Note:** Some models may require you to accept their license agreement on the model page before you can use them via the API.

## Frontend Integration

The API has CORS enabled for all origins. In production, update the `allow_origins` in [main.py:17](main.py#L17) to specify your frontend URL.

Example fetch from JavaScript:

```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('http://localhost:8000/upload-pdf', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.analysis);
```
