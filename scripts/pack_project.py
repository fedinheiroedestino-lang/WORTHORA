import os
import zipfile
import sys

def create_project_zip():
    output_filename = "public/worthora-complete-project.zip"
    root_dir = os.path.abspath(".")
    
    # Files and folders to exclude
    exclude_dirs = {
        "node_modules",
        ".git",
        "dist",
        ".aistudio",
        "__pycache__",
        ".cache",
        ".npm"
    }
    
    exclude_extensions = {".zip", ".pyc"}
    
    print(f"📦 Packaging full project from: {root_dir}")
    print(f"🎯 Output zip destination: {output_filename}")
    
    # Ensure public folder exists
    os.makedirs(os.path.join(root_dir, "public"), exist_ok=True)
    temp_zip = os.path.join(root_dir, "public", "worthora-complete-project.tmp.zip")
    
    total_files = 0
    total_uncompressed_bytes = 0
    
    with zipfile.ZipFile(temp_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # Prune excluded directories in-place
            dirnames[:] = [d for d in dirnames if d not in exclude_dirs and not d.startswith(".git")]
            
            # Relative path from project root
            rel_dir = os.path.relpath(dirpath, root_dir)
            if rel_dir == ".":
                rel_dir = ""
                
            for filename in filenames:
                # Skip excluded files
                _, ext = os.path.splitext(filename)
                if ext in exclude_extensions:
                    continue
                if filename.startswith(".tmp-") or filename.endswith(".tmp.zip"):
                    continue
                    
                full_path = os.path.join(dirpath, filename)
                archive_name = os.path.join("worthora-project", rel_dir, filename) if rel_dir else os.path.join("worthora-project", filename)
                
                # Check file size (skip huge socket or lock files if any)
                try:
                    size = os.path.getsize(full_path)
                    total_uncompressed_bytes += size
                    zipf.write(full_path, archive_name)
                    total_files += 1
                except Exception as err:
                    print(f"Skipping {full_path}: {err}")
                    
    # Atomic rename
    final_zip = os.path.join(root_dir, output_filename)
    if os.path.exists(final_zip):
        os.remove(final_zip)
    os.rename(temp_zip, final_zip)
    
    zip_size_mb = os.path.getsize(final_zip) / (1024 * 1024)
    uncomp_mb = total_uncompressed_bytes / (1024 * 1024)
    print(f"✅ Success! Packed {total_files} files.")
    print(f"📊 Uncompressed: {uncomp_mb:.2f} MB -> Compressed ZIP: {zip_size_mb:.2f} MB")
    print(f"📁 Verified file: {final_zip}")

if __name__ == "__main__":
    create_project_zip()
