import os
import zipfile
import sys

def make_clean_zip(output_path, root_dir):
    exclude_dirs = {
        'node_modules', '.next', '.venv', '.git', '__pycache__', 
        '.pytest_cache', '.turbo', 'temp_zip_staging'
    }
    exclude_extensions = {'.zip', '.log', '.pyc', '.pyo'}
    exclude_files = {'create_clean_zip.py'}

    print(f"Creating clean zip: {output_path} from {root_dir}")
    file_count = 0
    total_size = 0

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
        for root, dirs, files in os.walk(root_dir):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files:
                    continue
                ext = os.path.splitext(file)[1].lower()
                if ext in exclude_extensions:
                    continue
                
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_dir)
                
                zipf.write(full_path, rel_path)
                file_count += 1
                total_size += os.path.getsize(full_path)

    zip_size = os.path.getsize(output_path)
    print(f"Archived {file_count} files.")
    print(f"Uncompressed size: {total_size / (1024*1024):.2f} MB")
    print(f"Compressed zip size: {zip_size / (1024*1024):.2f} MB")
    return zip_size

if __name__ == '__main__':
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    out_file = os.path.join(root_dir, 'zanjirzan_full_project_v2.zip')
    make_clean_zip(out_file, root_dir)
