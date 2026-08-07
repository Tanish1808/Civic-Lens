# Civic Lens — ML Inference Service

> A FastAPI microservice that performs multi-label civic image analysis: issue category classification, severity assessment, perceptual hashing, and embedding-based duplicate detection — all served on-demand to the Django backend.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Dataset](#dataset)
- [Data Pipeline / Preprocessing](#data-pipeline--preprocessing)
- [Configuration](#configuration)
- [Training](#training)
- [Evaluation](#evaluation)
- [Inference / Prediction](#inference--prediction)
- [Model Artifacts](#model-artifacts)
- [Results Summary](#results-summary)
- [Testing](#testing)
- [Reproducibility Notes](#reproducibility-notes)
- [Contributing Guidelines](#contributing-guidelines)

---

## Problem Statement

Municipal civic issue reports are submitted as photos with a geolocation. Without automation, classifying each image's issue type and severity, and detecting visually duplicate reports of the same pothole or flooded road, requires manual labour that doesn't scale.

This service solves three sub-problems:

| Task | Output | Why it matters |
|---|---|---|
| **Category classification** | One of: `pothole`, `garbage`, `waterlogging`, `streetlight` | Routes each report to the correct resolution team |
| **Severity assessment** | One of: `low`, `medium`, `high` | Determines ticket priority and citizen notification urgency |
| **Duplicate / similarity detection** | 128-d unit-normalised embedding + perceptual hash | Merges duplicate citizen reports of the same physical defect into a single ticket |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.x |
| Serving framework | FastAPI 0.110 + Uvicorn 0.28 |
| Inference runtime | PyTorch (TorchScript `.pt` models) |
| Image I/O | Pillow >= 10.3 |
| Numerical ops | NumPy >= 2.0 |
| HTTP client | Requests 2.31 |
| Data validation | Pydantic (bundled with FastAPI) |

> **No training dependencies are bundled** in `requirements.txt` — training was performed offline. The service only runs inference against pre-trained `.pt` artifacts.

---

## Project Structure

```
civic_lens_ml/
|-- main.py             # FastAPI application: all inference endpoints, model loading,
|                       #   preprocessing, perceptual hashing, embedding generation
|-- requirements.txt    # Runtime-only dependencies (FastAPI, Uvicorn, Pillow, NumPy, Requests)
|-- metrics.json        # Saved evaluation results for all three models
|
|-- models/             # Serialised PyTorch model artifacts (committed to repo)
|   |-- classifier.pt   # Issue category classifier (TorchScript, ~10 MB)
|   |-- severity.pt     # Severity classifier (TorchScript, ~9.4 MB)
|   `-- similarity.pt   # Image similarity / embedding model (TorchScript, ~12.2 MB)
|
`-- logs/               # Per-epoch training logs (CSV) generated during offline training
    |-- classifier_log.csv  # epoch, train_loss, train_acc, val_loss, val_acc, val_f1_macro, val_f1_weighted, gap
    `-- severity_log.csv    # Same schema — 25 epochs
```

> There are no `data/`, `notebooks/`, `src/`, or `configs/` directories. This repository contains the **inference service only**. Training was performed offline; only the serialised artifacts and logs are committed.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.x | <!-- TODO: confirm with team — no `.nvmrc` or `python_requires` field present; 3.10+ recommended for Pydantic v2 compatibility --> |
| pip | any current | Use a virtual environment |
| PyTorch | any CPU-compatible release | Not in `requirements.txt` — must be installed separately; see below |
| GPU / CUDA | Not required | All models are loaded and run on **CPU** (`map_location=torch.device('cpu')`) |

---

## Environment Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/Civic-Lens.git
cd Civic-Lens/civic_lens_ml
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
```

### 3. Install runtime dependencies

```bash
pip install -r requirements.txt
```

### 4. Install PyTorch (CPU)

PyTorch is required for model inference but is intentionally excluded from `requirements.txt` because the correct wheel varies by platform and CUDA version. Install the CPU build:

```bash
# CPU-only (recommended — all models run on CPU)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### 5. Verify the setup

```bash
python -c "import torch, fastapi, PIL, numpy; print('All dependencies OK')"
```

---

## Dataset

> The training dataset is **not included in this repository**. Only the trained `.pt` model artifacts and per-epoch training logs are committed.

The models were trained on an image dataset with the following label structure:

### Category labels (4 classes)

| Label | Description |
|---|---|
| `pothole` | Road surface defects |
| `garbage` | Illegal dumping / overflowing bins |
| `waterlogging` | Flooded streets / drainage overflow |
| `streetlight` | Faulty or missing street lighting |

### Severity labels (3 classes)

| Label | Description |
|---|---|
| `low` | Minor issue; not an immediate hazard |
| `medium` | Moderate impact on public safety or mobility |
| `high` | Immediate hazard requiring urgent attention |

<!-- TODO: confirm with team — dataset source, size, licensing, and train/val/test split ratios are not documented in the repository -->

---

## Data Pipeline / Preprocessing

The inference preprocessing pipeline is fully implemented in `main.py` and mirrors the training-time transform. There is no separate preprocessing script.

### Inference preprocessing (per image)

```
Input image (URL or base64 data URI)
    |
    v
Download / decode image
    |
    v
Convert to RGB
    |
    v
Resize to 224 x 224 (bilinear)
    |
    v
Normalise to [0, 1] float32
    |
    v
Apply ImageNet normalisation:
    mean = [0.485, 0.456, 0.406]
    std  = [0.229, 0.224, 0.225]
    |
    v
Transpose HWC -> CHW  (shape: [1, 3, 224, 224])
    |
    v
torch.Tensor -> classifier_model / severity_model
```

### Perceptual hash (aHash)

A separate 64-bit average hash is computed from the raw image (before the model pipeline) for fast near-duplicate filtering:

```
Convert to grayscale -> resize to 8x8
Compute mean pixel value
Build 64-bit mask: bit[i] = 1 if pixel[i] > mean else 0
Encode as 16-char hex string
```

### Embedding vector

A 128-dimensional unit-normalised embedding is generated for each image. In production mode (PyTorch loaded), the `similarity.pt` model produces this vector. In sandbox/stub mode, a deterministic NumPy random vector seeded by the perceptual hash is used, ensuring identical images receive identical embeddings even without a GPU.

---

## Configuration

All runtime parameters are hardcoded in `main.py`. There are no external YAML or JSON config files. The following values are configurable at source level:

| Parameter | Location | Default | Description |
|---|---|---|---|
| `MODELS_DIR` | `main.py:18` | `<script_dir>/models/` | Directory scanned for `.pt` model files |
| Image resize | `main.py:148` | `224 x 224` | Input resolution for both classifier and severity models |
| ImageNet mean | `main.py:151` | `[0.485, 0.456, 0.406]` | Per-channel normalisation mean |
| ImageNet std | `main.py:152` | `[0.229, 0.224, 0.225]` | Per-channel normalisation standard deviation |
| Embedding size | `main.py:229` | `128` | Output embedding vector dimensionality |
| Similarity threshold | `metrics.json` | `0.85` | Cosine similarity threshold used by the backend for duplicate detection |
| Image download timeout | `main.py:121` | `5` seconds | HTTP request timeout for image URLs |
| Category labels | `main.py:165` | `pothole, garbage, waterlogging, streetlight` | Ordered class list matching classifier output indices |
| Severity labels | `main.py:177` | `low, medium, high` | Ordered class list matching severity output indices |

---

## Training

> Training scripts are **not present** in this repository. The models were trained offline and only the final serialised artifacts are committed.

<!-- TODO: confirm with team — training entry point, framework (PyTorch training loop / Lightning / HuggingFace Trainer), data augmentation strategy, optimiser, learning rate schedule, and hardware used are not documented in the repo. -->

The training logs in `logs/` show:

- **Classifier:** 24 epochs
- **Severity model:** 25 epochs
- Both tracked: `train_loss`, `train_acc`, `val_loss`, `val_acc`, `val_f1_macro`, `val_f1_weighted`, `gap` (train_acc - val_acc)

---

## Evaluation

Evaluation metrics are saved in [`metrics.json`](metrics.json) and per-epoch logs in [`logs/`](logs/).

### Summary from `metrics.json`

| Model | Metric | Value |
|---|---|---|
| Category classifier | F1-macro (validation) | **0.9832** |
| Severity classifier | F1-macro (validation) | **0.9936** |
| Similarity model | Type | Pretrained (threshold: 0.85) |

### Per-epoch logs

Best validation epoch results from the CSV logs:

**Classifier** (`logs/classifier_log.csv`, best epoch 10):

| Epoch | val_acc | val_f1_macro | val_f1_weighted |
|---|---|---|---|
| 10 | 0.9903 | 0.9816 | 0.9903 |

**Severity** (`logs/severity_log.csv`, best epoch 19):

| Epoch | val_acc | val_f1_macro | val_f1_weighted |
|---|---|---|---|
| 19 | 0.9935 | 0.9936 | 0.9935 |

<!-- TODO: confirm with team — test-set metrics (distinct from validation) are not present in the repo -->

---

## Inference / Prediction

### 1. Start the inference server

```bash
uvicorn main:app --host 0.0.0.0 --port 9000 --reload
```

The service will be available at `http://localhost:9000`.

> The Django backend's `ML_SERVICE_BASE_URL` environment variable must point to this address (default: `http://localhost:9000`).

### 2. Health check

```bash
curl http://localhost:9000/health
```

**Response:**

```json
{
  "status": "healthy",
  "models_loaded": true
}
```

`models_loaded` is `true` only if `classifier.pt` was successfully loaded via PyTorch. If `torch` is not installed, the service starts in **sandbox/stub mode** — it still returns valid-shaped responses using rule-based fallbacks, allowing the Django backend to operate without a GPU or PyTorch installation.

### 3. Run inference

**Endpoint:** `POST /infer`

**Request body:**

```json
{
  "image_url": "https://example.com/path/to/report-photo.jpg",
  "user_selected_category": "pothole"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `image_url` | `string` | Yes | Public HTTPS URL, HTTP URL, relative path (resolved against `localhost:8000`), or base64 data URI (`data:image/...`) |
| `user_selected_category` | `string` | No | Category hint from the citizen form; used as fallback in sandbox mode |

**Response body:**

```json
{
  "category": "pothole",
  "severity": "high",
  "confidence": 0.9714,
  "perceptual_hash": "a1b2c3d4e5f60789",
  "embedding": [0.032, -0.114, 0.087, "...", 0.061]
}
```

| Field | Type | Description |
|---|---|---|
| `category` | `string` | Predicted issue category (`pothole`, `garbage`, `waterlogging`, `streetlight`) |
| `severity` | `string` | Predicted severity level (`low`, `medium`, `high`) |
| `confidence` | `float` | Softmax probability of the top predicted category (0–1) |
| `perceptual_hash` | `string` | 16-character hex aHash of the image for fast near-duplicate lookup |
| `embedding` | `float[]` | 128-element unit-normalised embedding for cosine similarity comparison |

### 4. cURL example

```bash
curl -X POST http://localhost:9000/infer \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/pothole.jpg"}'
```

---

## Model Artifacts

All trained artifacts are committed directly to the repository under `models/`:

| File | Format | Size | Description |
|---|---|---|---|
| `models/classifier.pt` | PyTorch TorchScript | ~10.0 MB | 4-class issue category classifier |
| `models/severity.pt` | PyTorch TorchScript | ~9.4 MB | 3-class severity classifier |
| `models/similarity.pt` | PyTorch TorchScript | ~12.2 MB | Image embedding model for duplicate detection |

**Loading strategy** (implemented in `main.py`):

1. Attempt `torch.jit.load()` (TorchScript)
2. On failure, fall back to `torch.load()` (standard checkpoint)
3. If PyTorch is unavailable, start in sandbox/stub mode

All models are loaded to **CPU** (`map_location=torch.device('cpu')`).

<!-- TODO: confirm with team — model architecture (ResNet, EfficientNet, MobileNet, etc.), pre-training source, and versioning/naming convention for future model releases -->

---

## Results Summary

Results sourced from [`metrics.json`](metrics.json) and [`logs/`](logs/) — no numbers have been fabricated.

| Model | Classes | Epochs | Best val_acc | Best val_f1_macro |
|---|---|---|---|---|
| Category classifier | 4 | 24 | 0.9903 | 0.9832 |
| Severity classifier | 3 | 25 | 0.9935 | 0.9936 |
| Similarity model | — | Pretrained | — | threshold: 0.85 |

---

## Testing

<!-- TODO: confirm with team — no pytest, unittest, or great_expectations files were found in the repository. No automated data validation or model sanity checks exist yet. -->

Manual verification can be performed using the health and inference endpoints after starting the server:

```bash
# Start the server
uvicorn main:app --port 9000

# Health check
curl http://localhost:9000/health

# Smoke test with a public image URL
curl -X POST http://localhost:9000/infer \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/240px-PNG_transparency_demonstration_1.png"}'
```

---

## Reproducibility Notes

| Aspect | Status |
|---|---|
| Random seed | `np.random.seed(seed)` is called in the embedding stub path, seeded by the image's perceptual hash — deterministic for identical inputs |
| Model artifacts | `.pt` files are committed to the repository — no download step required |
| Runtime environment | `requirements.txt` pins major library versions (FastAPI, Uvicorn, Requests); Pillow and NumPy use `>=` lower bounds |
| PyTorch version | **Not pinned** — install the CPU wheel appropriate for your platform; inference should be stable across PyTorch 2.x releases |
| Training code | Not present in this repository — training reproducibility is not guaranteed without the original training scripts |
| Dockerfile | Not present — <!-- TODO: confirm with team — consider adding a Dockerfile for containerised deployment --> |
| CUDA | Not required; all inference runs on CPU |

---

## Contributing Guidelines

1. **Branch naming:** `feat/<short-description>`, `fix/<short-description>`, `chore/<short-description>`
2. **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
3. **Model updates:** When replacing a `.pt` artifact, update `metrics.json` with the new evaluation results and append a new entry to the corresponding `logs/` CSV.
4. **No data:** Do not commit raw training images or datasets — use `.gitignore` or DVC.
5. **No secrets:** Never commit API keys, Cloudinary credentials, or cloud storage tokens.
6. **Sandbox mode:** Ensure `main.py` continues to start and return valid responses even when `torch` is not installed, to keep CI and local dev environments lightweight.
7. **Pull Requests:** At least one reviewer approval is required before merging to `main`.

---

<!-- TODO: confirm with team — no LICENSE file was found in the repository root -->
