#!/usr/bin/env python3
import argparse
import asyncio
import csv
import os
import re
import sys
import time
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from typing import List, Dict, Optional

# -------- Utilities --------

def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-") or "file"

def read_rows(csv_path: Path) -> List[Dict[str, str]]:
    rows = []
    with csv_path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        required = {"print_url"}
        missing = required - set([c.strip() for c in reader.fieldnames or []])
        if missing:
            sys.exit(f"ERROR: CSV is missing required column(s): {', '.join(sorted(missing))}")
        for row in reader:
            # Normalize keys
            row = { (k or "").strip(): (v or "").strip() for k, v in row.items() }
            rows.append(row)
    if not rows:
        sys.exit("ERROR: CSV has no data rows.")
    return rows

def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def build_output_filename(row: Dict[str, str]) -> str:
    if row.get("filename"):
        name = row["filename"].strip()
        if not name.lower().endswith(".pdf"):
            name += ".pdf"
        return name
    base = row.get("college") or row.get("state") or row.get("print_url") or "output"
    return f"{slugify(base)}.pdf"

def zip_folder(folder: Path, zip_path: Path):
    with ZipFile(zip_path, "w", ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(folder):
            for fn in files:
                full = Path(root) / fn
                arc = full.relative_to(folder)
                zf.write(full, arcname=str(arc))

# -------- Playwright worker --------

async def render_pdf(browser, task, out_dir: Path, timeout_ms: int) -> Dict[str, str]:
    """
    task: { 'print_url': str, 'outfile': str, 'college': str?, 'state': str? }
    """
    page = await browser.new_page()
    url = task["print_url"]
    outfile = out_dir / task["outfile"]
    info = {"url": url, "outfile": str(outfile), "status": "ok", "error": ""}

    try:
        # Extra headers help some sites avoid blocking
        await page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (PDFBot) Playwright"})
        await page.goto(url, wait_until="networkidle", timeout=timeout_ms)
        # Try to apply print CSS
        await page.emulate_media(media="print")

        # Some print pages need a small delay for JS-driven content
        await page.wait_for_timeout(800)

        # Create parent dir
        ensure_dir(outfile.parent)

        # High quality PDF (tweak as needed)
        await page.pdf(
            path=str(outfile),
            format="Letter",           # or "A4"
            print_background=True,
            margin={"top": "0.4in", "right": "0.4in", "bottom": "0.4in", "left": "0.4in"},
            prefer_css_page_size=True
        )
    except Exception as e:
        info["status"] = "error"
        info["error"] = str(e)
    finally:
        await page.close()
    return info

async def run_all(rows: List[Dict[str, str]], out_dir: Path, concurrency: int, timeout_ms: int) -> List[Dict[str, str]]:
    from playwright.async_api import async_playwright

    # Prepare tasks
    tasks = []
    for r in rows:
        url = r.get("print_url", "")
        if not url:
            continue
        tasks.append({
            "print_url": url,
            "outfile": build_output_filename(r),
        })

    results: List[Dict[str, str]] = []
    sem = asyncio.Semaphore(concurrency)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        async def worker(t):
            async with sem:
                return await render_pdf(browser, t, out_dir, timeout_ms)
        coros = [worker(t) for t in tasks]
        for f in asyncio.as_completed(coros):
            res = await f
            results.append(res)
        await browser.close()
    return results

# -------- CLI --------

def main():
    parser = argparse.ArgumentParser(description="Render athletics staff directory print pages to PDFs and zip them.")
    parser.add_argument("csv", help="Path to CSV with columns: print_url (required), college/state/division/filename (optional).")
    parser.add_argument("--out", default="pdf_output", help="Output folder for PDFs (default: pdf_output)")
    parser.add_argument("--zip", default="athletics_staff_pdfs.zip", help="Zip file name to create (default: athletics_staff_pdfs.zip)")
    parser.add_argument("--concurrency", type=int, default=4, help="Parallel renderers (default: 4)")
    parser.add_argument("--timeout", type=int, default=30000, help="Page timeout in ms (default: 30000)")
    args = parser.parse_args()

    csv_path = Path(args.csv).resolve()
    out_dir = Path(args.out).resolve()
    zip_path = Path(args.zip).resolve()

    rows = read_rows(csv_path)

    print(f"-> Reading {len(rows)} rows from {csv_path}")
    print(f"-> Output PDFs to {out_dir}")
    ensure_dir(out_dir)

    t0 = time.time()
    try:
        results = asyncio.run(run_all(rows, out_dir, concurrency=max(1, args.concurrency), timeout_ms=args.timeout))
    except KeyboardInterrupt:
        sys.exit("Interrupted.")
    except Exception as e:
        sys.exit(f"Fatal error: {e}")

    ok = [r for r in results if r["status"] == "ok"]
    err = [r for r in results if r["status"] != "ok"]

    print(f"\nCompleted in {time.time()-t0:.1f}s")
    print(f"Success: {len(ok)} | Errors: {len(err)}")

    if err:
        print("\nErrors:")
        for r in err:
            print(f"- {r['url']} -> {r['error']}")

    # Always zip whatever succeeded
    if ok:
        print(f"\nZipping PDFs to: {zip_path}")
        zip_folder(out_dir, zip_path)
        print("Done.")

if __name__ == "__main__":
    main()
