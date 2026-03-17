#!/usr/bin/env python3
"""
Split files from a source directory into multiple subfolders,
each not exceeding the given size limit (in MB).

Usage:
    python split_files.py /path/to/your/folder 4500
    # → creates chunk_001, chunk_002, ... each ≤ 4500 MB
"""

import os
import sys
import shutil
from pathlib import Path
from typing import List

def human_size(bytes_size: int) -> str:
    """Convert bytes to human-readable format"""
    for unit in ['B', 'KiB', 'MiB', 'GiB', 'TiB']:
        if bytes_size < 1024:
            return f"{bytes_size:.1f} {unit}"
        bytes_size /= 1024
    return f"{bytes_size:.1f} PiB"


def split_directory(source_dir: str | Path, max_size_mb: float) -> None:
    source_path = Path(source_dir).resolve()
    if not source_path.is_dir():
        print(f"Error: {source_path} is not a directory")
        sys.exit(1)

    max_bytes = int(max_size_mb * 1_000_000)   # using 10⁶ (decimal megabytes)
    # If you prefer binary (MiB): max_bytes = int(max_size_mb * 1024**2)

    print(f"Source:       {source_path}")
    print(f"Target size:  ≤ {max_size_mb:.1f} MB  ({human_size(max_bytes)})")
    print()

    current_part = 1
    current_folder = source_path / f"chunk_{current_part:03d}"
    current_size = 0

    # We'll collect files sorted by name (or change to sorted by size, date, etc.)
    all_files: List[Path] = sorted(
        f for f in source_path.iterdir()
        if f.is_file() and f.name not in {".DS_Store", "Thumbs.db"}
    )

    if not all_files:
        print("No files found in the directory.")
        return

    current_folder.mkdir(exist_ok=True)

    moved_count = 0
    skipped_count = 0

    for file_path in all_files:
        try:
            file_size = file_path.stat().st_size

            # If file is larger than max size → we still move it, but warn
            if file_size > max_bytes:
                print(f"  ⚠  {file_path.name} is {human_size(file_size)} "
                      f"— larger than limit, moving anyway")

            # Would this file push us over the limit?
            if current_size + file_size > max_bytes and current_size > 0:
                # Start new chunk
                current_part += 1
                current_folder = source_path / f"chunk_{current_part:03d}"
                current_folder.mkdir(exist_ok=True)
                current_size = 0
                print(f"→ Starting {current_folder.name}")

            # Move file
            destination = current_folder / file_path.name

            # Avoid name collision (rare but possible)
            if destination.exists():
                stem, ext = file_path.stem, file_path.suffix
                counter = 1
                while destination.exists():
                    destination = current_folder / f"{stem} ({counter}){ext}"
                    counter += 1

            shutil.move(str(file_path), str(destination))
            current_size += file_size
            moved_count += 1

            print(f"  {moved_count:3d} | {human_size(file_size):>9} → {current_folder.name}/{file_path.name}")

        except Exception as e:
            print(f"  Failed to move {file_path.name}: {e}")
            skipped_count += 1

    print("\n" + "="*60)
    print(f"Done. Moved {moved_count} file(s) into {current_part} chunk(s)")
    if skipped_count:
        print(f"Skipped/failed: {skipped_count} file(s)")
    print(f"Last chunk size: {human_size(current_size)}")


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        print("Usage:  python split_files.py <directory> <max_size_MB>")
        sys.exit(1)

    directory = sys.argv[1]
    try:
        max_mb = float(sys.argv[2])
        if max_mb <= 0:
            raise ValueError
    except ValueError:
        print("Error: second argument must be a positive number (max MB)")
        sys.exit(1)

    split_directory(directory, max_mb)


if __name__ == "__main__":
    main()