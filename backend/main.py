"""
Scan ComfyUI image folders and extract metadata from embedded PNG chunks.
"""
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

print("=" * 60)
print("[CONFIG] Starting ComfyUI Gallery backend...")
print("=" * 60)

# Metadata extraction libraries
try:
    import PyExiv2
    HAS_PYEXIV2 = True
except ImportError:
    HAS_PYEXIV2 = False
    print("[CONFIG] PyExiv2: NOT INSTALLED (pip install PyExiv2)")

try:
    from sd_parsers.parsers.parser_registry import parse_workflow_from_workflow_node_bytes
    from sd_parsers.common.parsers import parse_raw_workflow, parse_prompts_from_raw_workflow
    HAS_SD_PARSERS = True
except ImportError:
    HAS_SD_PARSERS = False
    print("[CONFIG] SD-Parsers: NOT INSTALLED (pip install SD-Parsers)")

try:
    from PIL import Image as PILImage
    HAS_PILLOW = True
except ImportError:
    HAS_PILLOW = False
    print("[CONFIG] Pillow: NOT INSTALLED (pip install Pillow)")

# FastAPI app with CORS middleware
app = FastAPI(title="ComfyUI Gallery Viewer")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_scan_folder: str = ""
scanned_images: List[str] = []

class ScanRequest(BaseModel):
    folder_path: str

class TagsRequest(BaseModel):
    image: str
    tags: List[str]

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"[HTTP] {request.method} {request.url.path}")
    response = await call_next(request)
    return response

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "scan_folder": current_scan_folder or "none",
        "image_count": len(scanned_images),
        "features": {"pyexiv2": HAS_PYEXIV2, "pillow": HAS_PILLOW, "sd_parsers": HAS_SD_PARSERS},
    }

@app.post("/api/scan")
def api_scan(req: ScanRequest):
    global current_scan_folder, scanned_images
    path = os.path.normpath(req.folder_path.strip())
    
    if not os.path.isdir(path):
        raise HTTPException(status_code=400, detail=f"Folder not found: {path}")
    if not os.access(path, os.R_OK):
        raise HTTPException(status_code=403, detail=f"No read permission: {path}")
    
    current_scan_folder = path
    scanned_images = []
    base = Path(path).resolve()
    
    for root, _dirs, files in os.walk(path):
        for fn in files:
            if Path(fn).suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp'):
                fp = Path(root) / fn
                try: scanned_images.append(str(fp.relative_to(base)).replace(os.sep, '/'))
                except ValueError: pass
    
    scanned_images.sort()
    print(f"[SCAN] found {len(scanned_images)} images")
    return {"scan_folder": current_scan_folder, "images": scanned_images, "count": len(scanned_images)}

@app.get("/api/settings")
def get_settings():
    return {"scan_folder": current_scan_folder or None, "image_count": len(scanned_images)}

def validate_path(filename: str) -> str:
    if not current_scan_folder:
        raise HTTPException(status_code=400, detail="No folder scanned. Use /api/scan first")
    full = os.path.normpath(os.path.join(current_scan_folder, filename))
    if not full.startswith(os.path.normpath(current_scan_folder)):
        raise HTTPException(status_code=400, detail="Path traversal blocked")
    if not os.path.isfile(full):
        raise HTTPException(status_code=404, detail=f"File not found: {full}")
    return full

def extract_from_workflow_node(wn: str) -> Dict[str, Any]:
    r = {"prompt": "", "negative_prompt": "", "seed": None, "steps": None, "cfg": None,
         "sampler": None, "scheduler": None, "model": None, "loras": [], "vae": None, "clip_skip": None}
    if not HAS_SD_PARSERS:
        return r
    try:
        raw = wn.encode('latin-1') if isinstance(wn, str) else wn
        wf = parse_workflow_from_workflow_node_bytes(raw)
        raw_wf = wf.get_raw_workflow() if hasattr(wf, 'get_raw_workflow') else {}
        prompts = parse_prompts_from_raw_workflow(raw_wf)
        if prompts.get("prompt"): r["prompt"] = prompts["prompt"]
        if prompts.get("negative_prompt"): r["negative_prompt"] = prompts["negative_prompt"]
        nodes = getattr(wf, "nodes", {}) or {}
        for nid, node in nodes.items():
            ct = (getattr(node, "class_type", "") or "").lower()
            inp = getattr(node, "inputs", {}) or {}
            if "seed" in ct: r["seed"] = str(inp.get("seed", ""))
            if "steps" in ct and "seed" not in ct: r["steps"] = str(inp.get("steps", ""))
            if "cfg" in ct: r["cfg"] = str(inp.get("cfg", ""))
            if "sampler" in ct:
                s = inp.get("sampler_name", "")
                if s: r["sampler"] = str(s)
            if "scheduler" in ct:
                s = inp.get("scheduler", "")
                if s: r["scheduler"] = str(s)
            if any(x in ct for x in ("ckpt", "checkpoint")):
                c = inp.get("ckpt_name", "") or inp.get("ckpt", "")
                if c: r["model"] = str(c)
            if "lora" in ct:
                n = inp.get("lora_name", "") or inp.get("name", "")
                w = inp.get("strength_model", 1.0)
                if n: r["loras"].append({"name": str(n), "weight": float(w) if w else 1.0})
            if "vae" in ct:
                v = inp.get("vae_name", "")
                if v: r["vae"] = str(v)
            if "clip_skip" in ct:
                c = inp.get("clip_skip", "")
                if c is not None: r["clip_skip"] = str(c)
    except Exception as e:
        print(f"[METADATA] SD-Parsers error: {e}")
    return r

@app.get("/api/metadata/{filename:path}")
def get_metadata(filename: str):
    full_path = validate_path(filename)
    
    result = {
        "file_path": filename,
        "file_size": os.path.getsize(full_path),
        "modified_time": datetime.fromtimestamp(os.path.getmtime(full_path)).isoformat(),
        "width": None, "height": None,
        "prompt": "", "negative_prompt": "", "tags": [],
        "workflow_node": "", "seed": None, "steps": None, "cfg": None,
        "sampler": None, "scheduler": None, "model": None, "loras": [],
        "vae": None, "clip_skip": None, "error": None, "original_user_tags": [],
    }
    
    # Pillow: dimensions + text chunks
    if HAS_PILLOW:
        try:
            with PILImage.open(full_path) as img:
                result["width"], result["height"] = img.size
                text = getattr(img, "text", {}) or {}
                for k, v in text.items():
                    kl = k.lower()
                    if kl == "prompt": result["prompt"] = str(v)
                    elif kl == "negative_prompt": result["negative_prompt"] = str(v)
                    elif kl == "workflow_node": result["workflow_node"] = str(v)
        except Exception as e:
            result["error"] = f"Pillow: {e}"
    
    # SD-Parsers from workflow_node
    if result["workflow_node"] and HAS_SD_PARSERS:
        extracted = extract_from_workflow_node(result["workflow_node"])
        for k, v in extracted.items():
            if v: result[k] = v
    
    # PyExiv2
    if HAS_PYEXIV2:
        try:
            exif = PyExiv2.ImageMetadata(full_path)
            exif.read()
            png_info = exif.get_png_info() or []
            for chunk in png_info:
                kw = (chunk.get("keyword") or "").lower()
                data = chunk.get("data") or chunk.get("content") or ""
                data = data.decode("latin-1", errors="replace") if isinstance(data, bytes) else str(data)
                if kw == "negative_prompt" and not result["negative_prompt"]:
                    result["negative_prompt"] = data
        except Exception as e:
            print(f"[METADATA] PyExiv2 error: {e}")
    
    # Tags from prompt pattern
    if result["prompt"] and not result["tags"]:
        tags = re.findall(r"\(([^():]+?)\)[\:\s]?", result["prompt"]) or re.findall(r"\(([^():]+?)(?::([\d.]+))?\)", result["prompt"])
        result["tags"] = [t.strip() for t in tags if t.strip()]
    
    # User tags from sidecar file
    sidecar = f"{full_path}.tags.txt"
    if os.path.exists(sidecar):
        try:
            with open(sidecar) as f:
                result["original_user_tags"] = [t.strip() for t in f.read().strip().split("\n") if t.strip()]
        except:
            pass
    
    return result

@app.post("/api/tags/save")
def save_tags(req: TagsRequest):
    if not current_scan_folder:
        raise HTTPException(status_code=400, detail="No folder scanned")
    sidecar = os.path.normpath(os.path.join(current_scan_folder, f"{req.image}.tags.txt"))
    if not sidecar.startswith(os.path.normpath(current_scan_folder)):
        raise HTTPException(status_code=400, detail="Invalid path")
    os.makedirs(os.path.dirname(sidecar), exist_ok=True)
    with open(sidecar, "w") as f:
        f.write("\n".join(req.tags))
    return {"status": "ok", "tags": req.tags, "path": sidecar}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
