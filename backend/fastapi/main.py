"""
FastAPI Backend for Ekhana Takst

This module provides the backend API for processing takst bundles,
generating reports, and handling 3D scan uploads.

Docs: ./docs/functions/fastapi-backend.md
SPOT: ./SPOT.md#function-catalog
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import shutil
from pathlib import Path
import uuid

app = FastAPI(
    title="Ekhana Takst API",
    description="Backend API for property assessment bundles and 3D processing",
    version="0.1.0"
)

# Configuration
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class BundleResponse(BaseModel):
    project_id: str
    status: str
    report_url: Optional[str] = None
    message: str

@app.post("/api/takst/submit", response_model=BundleResponse)
async def submit_bundle(
    project_data: UploadFile = File(...),
    observations_data: UploadFile = File(...),
    media_files: list[UploadFile] = File(None)
):
    """
    Submit a takst bundle for processing.

    Bundle contains:
    - project.json: Project metadata
    - observations.json: Inspection observations
    - media/: Optional media files (images, videos)
    """

    # Generate unique project ID if not provided
    project_id = str(uuid.uuid4())

    # Create project directory
    project_dir = UPLOAD_DIR / project_id
    project_dir.mkdir(exist_ok=True)

    try:
        # Save project data
        with open(project_dir / "project.json", "wb") as f:
            shutil.copyfileobj(project_data.file, f)

        # Save observations data
        with open(project_dir / "observations.json", "wb") as f:
            shutil.copyfileobj(observations_data.file, f)

        # Save media files
        if media_files:
            media_dir = project_dir / "media"
            media_dir.mkdir(exist_ok=True)
            for media_file in media_files:
                with open(media_dir / media_file.filename, "wb") as f:
                    shutil.copyfileobj(media_file.file, f)

        # TODO: Generate HTML report
        # TODO: Convert to PDF
        # For now, return success

        return BundleResponse(
            project_id=project_id,
            status="processing",
            message="Bundle received and processing started",
            report_url=f"/reports/{project_id}/report.html"
        )

    except Exception as e:
        # Cleanup on error
        shutil.rmtree(project_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Failed to process bundle: {str(e)}")

@app.post("/api/projects/{project_id}/scans")
async def upload_scan(project_id: str, scan_file: UploadFile = File(...)):
    """
    Upload a 3D scan file (.e57) for processing.

    Triggers background processing pipeline for point cloud conversion.
    """

    # Validate file extension
    if not scan_file.filename.lower().endswith('.e57'):
        raise HTTPException(status_code=400, detail="Only .e57 files are accepted")

    # Ensure project directory exists
    project_dir = UPLOAD_DIR / project_id
    project_dir.mkdir(exist_ok=True)

    scans_dir = project_dir / "scans"
    scans_dir.mkdir(exist_ok=True)

    # Save scan file
    scan_path = scans_dir / scan_file.filename
    with open(scan_path, "wb") as f:
        shutil.copyfileobj(scan_file.file, f)

    # TODO: Trigger background processing with PDAL/Entwine
    # TODO: Queue job for point cloud conversion to Potree format
    # For now, return success

    return {
        "project_id": project_id,
        "scan_filename": scan_file.filename,
        "status": "processing",
        "message": "Scan uploaded and processing started",
        "viewer_url": f"/projects/{project_id}/pointcloud"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
