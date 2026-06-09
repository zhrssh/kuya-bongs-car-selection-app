import logging
import os
import secrets
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required

from flaskr import status

bp = Blueprint("uploads", __name__, url_prefix="/api/uploads")
logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
}
MAX_FILE_SIZE = 5 * 1024 * 1024


def _get_upload_folder():
    return current_app.config["UPLOAD_FOLDER"]


@bp.route("", methods=["POST"])
@login_required
def upload_files():
    """Upload image files. Returns absolute URLs for saved files."""
    logger.info("Request to upload files")

    if "files" not in request.files:
        return (
            jsonify({"status": "fail", "data": {"files": "No files provided."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    files = request.files.getlist("files")
    if not files or all(f.filename == "" for f in files):
        return (
            jsonify({"status": "fail", "data": {"files": "No files selected."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    upload_folder = _get_upload_folder()
    uploaded_urls = []
    errors = {}

    for file in files:
        if file.filename == "" or file.filename is None:
            continue

        if file.content_type not in ALLOWED_MIME_TYPES:
            errors[file.filename] = f"File type '{file.content_type}' not allowed."
            continue

        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        if size > MAX_FILE_SIZE:
            errors[file.filename] = "File exceeds 5 MB limit."
            continue

        ext = os.path.splitext(file.filename)[1].lower()
        hex_name = secrets.token_hex(16) + ext
        save_path = os.path.join(upload_folder, hex_name)

        data = file.read()
        with open(save_path, "wb") as f:
            f.write(data)

        url = request.host_url.rstrip("/") + f"/public/images/{hex_name}"
        uploaded_urls.append(url)
        logger.debug("Saved uploaded file: %s (%d bytes)", hex_name, size)

    if not uploaded_urls and errors:
        return (
            jsonify(
                {
                    "status": "fail",
                    "data": {"files": "No files were uploaded successfully."},
                    "errors": errors,
                }
            ),
            status.HTTP_400_BAD_REQUEST,
        )

    return (
        jsonify(
            {
                "status": "success",
                "data": {"urls": uploaded_urls},
                "errors": errors if errors else None,
            }
        ),
        status.HTTP_200_OK,
    )


@bp.route("/<path:filename>", methods=["DELETE"])
@login_required
def delete_file(filename):
    """Delete an uploaded image file."""
    logger.info("Request to delete file: %s", filename)

    if ".." in filename or "/" in filename:
        return (
            jsonify({"status": "fail", "data": {"filename": "Invalid filename."}}),
            status.HTTP_400_BAD_REQUEST,
        )

    upload_folder = _get_upload_folder()
    file_path = os.path.join(upload_folder, filename)

    if not os.path.exists(file_path):
        return (
            jsonify({"status": "fail", "data": {"filename": "File not found."}}),
            status.HTTP_404_NOT_FOUND,
        )

    os.remove(file_path)
    logger.debug("Deleted uploaded file: %s", filename)

    return (
        jsonify({"status": "success", "data": {"message": "File deleted."}}),
        status.HTTP_200_OK,
    )
