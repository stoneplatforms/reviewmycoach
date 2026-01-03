#!/usr/bin/env python3
"""
Script to rename files with Windows-incompatible characters.
Replaces: smart quotes ('), en-dashes (–), accented characters (é), colons (:)
"""

import subprocess
import sys
import os

def sanitize_filename(filename):
    """Convert a filename to Windows-compatible format."""
    # Replace smart quotes with regular apostrophe
    filename = filename.replace('\u2019', "'")  # '
    filename = filename.replace('\u2018', "'")  # '

    # Replace en-dash and em-dash with hyphen
    filename = filename.replace('\u2013', '-')  # –
    filename = filename.replace('\u2014', '-')  # —

    # Replace accented e with regular e
    filename = filename.replace('\u00e9', 'e')  # é
    filename = filename.replace('\u00e8', 'e')  # è

    # Replace colon-space with space-hyphen-space for readability
    filename = filename.replace(': ', ' - ')
    filename = filename.replace(':', '-')

    # Replace other problematic Windows characters
    for char in '*?"<>|':
        filename = filename.replace(char, '-')

    return filename

def main():
    repo_root = '/Users/kevinvera/Documents/GitHub/reviewmycoach'
    base_path = os.path.join(repo_root, 'reviewmycoach-python-venv/pdfs-n-csvs')

    # Walk the directory tree to find files with special characters
    renames = []

    for root, dirs, files in os.walk(base_path):
        for filename in files:
            # Check if filename has Windows-incompatible characters
            if any(ord(c) > 127 or c in ':"*?<>|' for c in filename):
                old_filename = filename
                new_filename = sanitize_filename(filename)

                if old_filename != new_filename:
                    old_path = os.path.join(root, old_filename)
                    new_path = os.path.join(root, new_filename)

                    # Convert to relative paths from repo root
                    old_rel = os.path.relpath(old_path, repo_root)
                    new_rel = os.path.relpath(new_path, repo_root)

                    renames.append((old_rel, new_rel, old_path, new_path))

    if not renames:
        print("No files need renaming.")
        return

    print(f"Found {len(renames)} files to rename\n")

    # Perform renames
    success_count = 0
    error_count = 0

    for old_rel, new_rel, old_abs, new_abs in renames:
        print(f"Renaming:")
        print(f"  FROM: {old_rel}")
        print(f"  TO:   {new_rel}")

        # Use git mv to rename (preserves history)
        result = subprocess.run(
            ['git', 'mv', old_rel, new_rel],
            capture_output=True,
            text=True,
            cwd=repo_root
        )

        if result.returncode == 0:
            print("  ✓ Success\n")
            success_count += 1
        else:
            print(f"  ✗ Error: {result.stderr.strip()}")
            print(f"  Trying regular mv instead...")

            # Try using os.rename if git mv fails
            try:
                os.rename(old_abs, new_abs)
                # Then stage the change
                subprocess.run(['git', 'add', new_rel], cwd=repo_root)
                subprocess.run(['git', 'rm', old_rel], cwd=repo_root)
                print("  ✓ Success (using mv + git add)\n")
                success_count += 1
            except Exception as e:
                print(f"  ✗ Also failed with mv: {e}\n")
                error_count += 1

    print(f"\nSummary:")
    print(f"  Successfully renamed: {success_count}")
    print(f"  Errors: {error_count}")

    if success_count > 0:
        print("\nFiles have been renamed and staged in git.")
        print("Run 'git status' to see the changes.")

if __name__ == '__main__':
    main()
