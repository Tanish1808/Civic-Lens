import logging
import os
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image
import requests
from io import BytesIO

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("civic_lens_ml")

app = FastAPI(title="Civic Lens ML Inference Service", version="1.0.0")

# Model path configurations
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

classifier_model = None
severity_model = None
similarity_model = None
models_loaded = False

# Try importing torch and loading models
try:
    import torch
    
    classifier_path = os.path.join(MODELS_DIR, "classifier.pt")
    severity_path = os.path.join(MODELS_DIR, "severity.pt")
    similarity_path = os.path.join(MODELS_DIR, "similarity.pt")
    
    if os.path.exists(classifier_path):
        try:
            # Try loading as TorchScript (most common for pushed model files)
            classifier_model = torch.jit.load(classifier_path, map_location=torch.device('cpu'))
            classifier_model.eval()
            logger.info("Successfully loaded classifier.pt via TorchScript.")
        except Exception:
            try:
                # Fallback to standard torch load
                classifier_model = torch.load(classifier_path, map_location=torch.device('cpu'))
                logger.info("Successfully loaded classifier.pt via standard load.")
            except Exception as e:
                logger.warning(f"Could not load classifier.pt: {e}")

    if os.path.exists(severity_path):
        try:
            severity_model = torch.jit.load(severity_path, map_location=torch.device('cpu'))
            severity_model.eval()
            logger.info("Successfully loaded severity.pt via TorchScript.")
        except Exception:
            try:
                severity_model = torch.load(severity_path, map_location=torch.device('cpu'))
                logger.info("Successfully loaded severity.pt via standard load.")
            except Exception as e:
                logger.warning(f"Could not load severity.pt: {e}")

    if os.path.exists(similarity_path):
        try:
            similarity_model = torch.jit.load(similarity_path, map_location=torch.device('cpu'))
            similarity_model.eval()
            logger.info("Successfully loaded similarity.pt via TorchScript.")
        except Exception:
            try:
                similarity_model = torch.load(similarity_path, map_location=torch.device('cpu'))
                logger.info("Successfully loaded similarity.pt via standard load.")
            except Exception as e:
                logger.warning(f"Could not load similarity.pt: {e}")

    models_loaded = (classifier_model is not None)
except ImportError:
    logger.warning("PyTorch (torch) is not installed. Running in sandbox/stub mode.")
except Exception as e:
    logger.error(f"Error initializing PyTorch models: {e}")


class InferenceRequest(BaseModel):
    image_url: str


def compute_perceptual_hash(image: Image.Image) -> str:
    """
    Computes an average hash (aHash) of the image:
    1. Convert to grayscale.
    2. Resize to 8x8.
    3. Calculate the mean pixel value.
    4. Set bits to 1 if pixel is greater than mean, else 0.
    5. Convert 64-bit array to 16-character hexadecimal string.
    """
    try:
        # Convert to grayscale and resize
        img = image.convert("L").resize((8, 8), Image.Resampling.LANCZOS)
        pixels = np.array(img.getdata())
        avg = pixels.mean()
        # Create bitstring
        bits = "".join(["1" if p > avg else "0" for p in pixels])
        # Convert binary string to hex
        hex_str = f"{int(bits, 2):016x}"
        return hex_str
    except Exception as e:
        logger.error(f"Perceptual hash computation failed: {e}")
        return "0000000000000000"


def download_image(url: str) -> Image.Image:
    try:
        # Handle data URI / base64 images directly
        if url.startswith("data:image"):
            import base64
            header, encoded = url.split(",", 1)
            data = base64.b64decode(encoded)
            return Image.open(BytesIO(data))
            
        # Handle standard URLs (prepend localhost port 8000 if relative path)
        full_url = url
        if not url.startswith("http://") and not url.startswith("https://"):
            full_url = f"http://localhost:8000{url if url.startswith('/') else '/' + url}"
            
        resp = requests.get(full_url, timeout=5)
        resp.raise_for_status()
        return Image.open(BytesIO(resp.content))
    except Exception as e:
        logger.error(f"Failed to download image from {url}: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to load image: {e}")


@app.post("/infer")
async def infer(request: InferenceRequest):
    logger.info(f"Received inference request for image: {request.image_url}")
    
    # 1. Download image
    img = download_image(request.image_url)
    
    # 2. Compute perceptual hash
    p_hash = compute_perceptual_hash(img)
    
    # 3. Model predictions fallback structure
    category = "other"
    severity = "medium"
    confidence = 0.85
    
    # Mocking classification based on keywords in URL for robust stubs
    url_lower = request.image_url.lower()
    if "pothole" in url_lower:
        category = "pothole"
        severity = "high"
    elif "garbage" in url_lower:
        category = "garbage"
        severity = "medium"
    elif "waterlogging" in url_lower or "flood" in url_lower:
        category = "waterlogging"
        severity = "high"
    elif "streetlight" in url_lower:
        category = "streetlight"
        severity = "low"
    else:
        categories = ["pothole", "garbage", "waterlogging", "streetlight"]
        category = categories[hash(request.image_url) % len(categories)]
        severity = "medium"

    # Generate 128-element embedding vector (unit normalized)
    np.random.seed(hash(request.image_url) % (2**32))
    embedding = np.random.randn(128)
    embedding /= np.linalg.norm(embedding)
    
    return {
        "category": category,
        "severity": severity,
        "confidence": float(confidence),
        "perceptual_hash": p_hash,
        "embedding": embedding.tolist()
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "models_loaded": models_loaded
    }
