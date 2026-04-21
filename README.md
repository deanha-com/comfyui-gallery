# ComfyUI Gallery

A full-stack gallery viewer for ComfyUI-generated images with embedded metadata extraction.

## Features

- **Auto-scan** any ComfyUI output folder for PNG/JPG/WEBP images
- **Extract metadata** from embedded PNG chunks (prompts, settings, model info, LoRAs)
- **Masonry gallery** with lazy-loaded thumbnails
- **Full-resolution lightbox** with navigation
- **Collapsible metadata panel** showing all extracted information
- **Sort & filter** by date, name, dimensions, megapixels, tags, or search text
- **User tags** saved as sidecar `.tags.txt` files
- **Dark theme** inspired by ComfyUI

## Requirements

- Python 3.10+
- Node.js 18+ / npm 9+
- Windows 10/11 (folder picker uses `showDirectoryPicker` API)

## Quick Start

### 1. Install dependencies

**Backend:**
```bash
cd comfyui-gallery/backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd comfyui-gallery/frontend
npm install
```

### 2. Start the dev server

**Option A: One-click launcher (recommended on Windows)**
```bash
cd comfyui-gallery
scripts\start.bat
```

**Option B: Manual start (two terminals)**

Terminal 1 - Backend:
```bash
cd comfyui-gallery/backend
python -m uvicorn main:app --reload --port 8000
```

Terminal 2 - Frontend:
```bash
cd comfyui-gallery/frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Connect a folder

1. Enter your ComfyUI output folder path (e.g., `C:\ComfyUI\output\images`)
2. Click **Browse** to pick a folder, or paste the path
3. Click **Scan** to load all images

## Project Structure

```
comfyui-gallery/
├── backend/
│   ├── main.py              # FastAPI server with metadata extraction
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html           # HTML entry point
│   ├── package.json         # Node dependencies
│   ├── vite.config.js       # Vite config with proxy to FastAPI
│   ├── tailwind.config.js   # TailwindCSS config
│   └── src/
│       ├── main.jsx         # React entry point
│       ├── App.jsx          # Root component + state management
│       ├── components/      # All React components
│       │   ├── FolderSelector.jsx
│       │   ├── GalleryGrid.jsx
│       │   ├── GalleryCard.jsx
│       │   ├── Lightbox.jsx
│       │   ├── SortControls.jsx
│       │   ├── FilterInput.jsx
│       │   └── MetadataPanel.jsx
│       ├── hooks/           # Custom React hooks
│       │   ├── useGallery.js
│       │   └── useLightbox.js
│       ├── lib/             # API client
│       │   └── api.js
│       └── styles/          # Global styles
│           ├── custom.css
│           └── tailwind.css
└── scripts/
    └── start.bat            # Windows one-click launcher
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Check server status & available features |
| `POST` | `/api/scan` | Scan a folder for images. Body: `{ "folder_path": "path" }` |
| `POST` | `/api/metadata/{filename}` | Extract full metadata for an image |
| `GET`  | `/api/settings` | Current scan state (folder, count) |
| `POST` | `/api/tags/save` | Save user tags. Body: `{ "image": "file.png", "tags": ["tag1","tag2"] }` |
| `GET`  | `/images/{filename}` | Serve image file for preview/lightbox |

## Metadata Extraction

The backend extracts metadata using this pipeline:

1. **PyExiv2** reads PNG iTXt/EXIF chunks for workflow_node bytes and text metadata
2. **SD-Parsers** decodes workflow_node bytes into ComfyUI workflow JSON
3. **Pillow** confirms image dimensions and reads text chunks as fallback

Successfully extracted fields:
- Dimensions (width, height)
- Positive/negative prompts
- Sampling settings (steps, CFG, sampler, scheduler, seed)
- Model checkpoint and LoRA info
- Clip skip value
- VAE name

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python |
| Metadata | PyExiv2, SD-Parsers, Pillow |
| Frontend | React 19 |
| Build | Vite 7 |
| Styling | TailwindCSS 4 |
| Dev proxy | Vite dev server proxies `/api` → FastAPI |

## Troubleshooting

- **"No images found"**: Make sure the folder contains PNG/JPG/WEBP files with metadata
- **Metadata not extracting**: Ensure `SD-Parsers` and `PyExiv2` are installed (check `/api/health`)
- **Port conflicts**: Change the port in `vite.config.js` (frontend) and `uvicorn` command (backend)
- **Folder picker not working**: Use manual path input instead (works on all browsers)
