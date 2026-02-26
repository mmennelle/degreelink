"""
Degree Link - Course Equivalency and Transfer Planning System
Copyright (c) 2025 University of New Orleans - Computer Science Department
Author: Mitchell Mennelle

Extract Louisiana Articulation Matrix from PDF into a machine-readable CSV.

Usage:
    python extract_articulation_matrix.py [PDF_PATH] [OUTPUT_CSV]

Defaults:
    PDF_PATH  = docs/FINAL-Proposed-Articulation-Matrix-AY-2022-2023-sent-for-BoR-Review.pdf
    OUTPUT_CSV = docs/articulation_matrix.csv

The PDF is split into three horizontal column-groups (each spanning ~23 pages)
that share the same row set.  This script merges all three groups so the final
CSV has one row per Common Course Number with one column per institution.

Output columns:
    ccn, ccn_title,
    BPCC, BRCC, CLTCC, DCC, FTCC, LDCC,
    NCC, NTCC, RPCC, SLCC, STCC, LSU_AM, LSUA, LSUE,
    LSUS, GSU, LA_TECH, MCNEESE, NICHOLLS, NSU, SLU, ULL, ULM,
    UNO, SU_AM, SUNO, SUSLA

Cell value conventions:
    - Normal local code  → "ACCT 2113"
    - No direct equiv    → "ACCT ***"   (subject kept, number is ***)
    - Generic credit     → "GSOC 3"     (generic subject + credit hours)
    - Truly unavailable  → ""           (empty)
    - Combined courses   → "ACCT 2101 & ACCT 2***"
"""

import sys
import csv
import re
import os

try:
    import pdfplumber
except ImportError:
    print("pdfplumber is required.  Install it with:  pip install pdfplumber")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))

DEFAULT_PDF = os.path.join(
    PROJECT_ROOT, 'docs',
    'FINAL-Proposed-Articulation-Matrix-AY-2022-2023-sent-for-BoR-Review.pdf'
)
DEFAULT_OUT = os.path.join(PROJECT_ROOT, 'docs', 'articulation_matrix.csv')

# The three institution groups that appear in the three horizontal slabs.
# These strings must match (case-insensitively) what pdfplumber extracts as
# column header cells.  Adjust if the extracted headers differ slightly.
INSTITUTION_GROUPS = [
    ['BPCC', 'BRCC', 'CLTCC', 'DCC', 'FTCC', 'LDCC'],
    ['NCC', 'NTCC', 'RPCC', 'SLCC', 'STCC', 'LSU_AM', 'LSUA', 'LSUE'],
    ['LSUS', 'GSU', 'LA_TECH', 'MCNEESE', 'NICHOLLS', 'NSU', 'SLU', 'ULL', 'ULM', 'UNO', 'SU_AM', 'SUNO', 'SUSLA'],
]

ALL_INSTITUTIONS = [inst for group in INSTITUTION_GROUPS for inst in group]

# Raw header strings that pdfplumber may return vs the canonical column names
# we want in the output CSV.  Keys are lowercase variations; values are the
# canonical names from INSTITUTION_GROUPS.
HEADER_ALIASES = {
    'bpcc': 'BPCC',
    'brcc': 'BRCC',
    'cltcc': 'CLTCC',
    'dcc': 'DCC',
    'ftcc': 'FTCC',
    'ldcc': 'LDCC',
    'l dcc': 'LDCC',
    'nunez': 'NCC',
    'ncc': 'NCC',
    'nunez community college': 'NCC',
    'ntcc': 'NTCC',
    'northshore': 'NTCC',
    'northshore technical': 'NTCC',
    'rpcc': 'RPCC',
    'slcc': 'SLCC',
    'sowela': 'STCC',
    'stcc': 'STCC',
    'sowela technical': 'STCC',
    'lsu a&m': 'LSU_AM',
    'lsu a & m': 'LSU_AM',
    'lsua&m': 'LSU_AM',
    'lsu am': 'LSU_AM',
    'louisiana state university': 'LSU_AM',
    'lsua': 'LSUA',
    'lsu alexandria': 'LSUA',
    'lsue': 'LSUE',
    'lsu eunice': 'LSUE',
    'lsus': 'LSUS',
    'lsu shreveport': 'LSUS',
    'gsu': 'GSU',
    'grambling': 'GSU',
    'la tech': 'LA_TECH',
    'latech': 'LA_TECH',
    'louisiana tech': 'LA_TECH',
    'louisiana tech university': 'LA_TECH',
    'mcneese': 'MCNEESE',
    'mcneese state': 'MCNEESE',
    'nicholls': 'NICHOLLS',
    'nicholls state': 'NICHOLLS',
    'nsu': 'NSU',
    'northwestern state': 'NSU',
    'slu': 'SLU',
    'southeastern': 'SLU',
    'ull': 'ULL',
    'university of louisiana lafayette': 'ULL',
    'university of louisiana, lafayette': 'ULL',
    'uno': 'UNO',
    'university of new orleans': 'UNO',
    'su a&m': 'SU_AM',
    'su a & m': 'SU_AM',
    'southern university': 'SU_AM',
    'southern university and a&m': 'SU_AM',
    'suno': 'SUNO',
    'southern university new orleans': 'SUNO',
    'susla': 'SUSLA',
    'southern university shreveport': 'SUSLA',
    'ulm': 'ULM',
    'university of louisiana monroe': 'ULM',
    'university of louisiana, monroe': 'ULM',
    'common course number': 'ccn',
    'common course title': 'ccn_title',
}

# ---------------------------------------------------------------------------
# Cell normalisation
# ---------------------------------------------------------------------------

def normalise_cell(raw: str) -> str:
    """
    Clean up a raw cell value extracted from the PDF.

    Transforms:
        "ACCT\n2113"     → "ACCT 2113"
        "_ _ _"          → ""
        "___"            → ""
        "GSOC (3)"       → "GSOC 3"
        "GNAT (1)"       → "GNAT 1"
        "ACCT ***"       → "ACCT ***"
        "ACCT\n***"      → "ACCT ***"
        "ACCT 2101\n&\nACCT 2***" → "ACCT 2101 & ACCT 2***"
    """
    if not raw:
        return ''
    # Collapse all internal whitespace/newlines to single space
    value = re.sub(r'\s+', ' ', raw.strip())
    # Treat any variant of "_ _ _" as empty
    if re.match(r'^[_\s]+$', value):
        return ''
    # Remove parentheses from generic designations: "GSOC (3)" → "GSOC 3"
    value = re.sub(r'\((\d+)\)', r'\1', value)
    return value.strip()


def normalise_ccn(raw: str) -> str:
    """Ensure CCN codes like 'CACC\n2113' become 'CACC 2113'."""
    return re.sub(r'\s+', ' ', (raw or '').strip())


# ---------------------------------------------------------------------------
# Header detection
# ---------------------------------------------------------------------------

def resolve_header(cell: str) -> str | None:
    """Return the canonical column name for a raw header cell, or None."""
    if not cell:
        return None
    key = re.sub(r'\s+', ' ', cell.strip()).lower()
    return HEADER_ALIASES.get(key)


# ---------------------------------------------------------------------------
# Table extraction
# ---------------------------------------------------------------------------

def extract_tables_from_pdf(pdf_path: str) -> list[dict]:
    """
    Open the PDF and extract all tables as a list of row-dicts.
    Each dict has whatever column headers pdfplumber found on that page.
    """
    rows = []
    with pdfplumber.open(pdf_path) as pdf:
        total = len(pdf.pages)
        print(f"[extract] PDF has {total} pages")
        for page_num, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables()
            if not tables:
                continue
            for table in tables:
                if not table or len(table) < 2:
                    continue
                # First non-empty row is the header
                header_row = table[0]
                headers = [resolve_header(str(cell) if cell else '') for cell in header_row]

                for raw_row in table[1:]:
                    if not any(raw_row):
                        continue
                    row_dict = {'_page': page_num}
                    for col_idx, cell in enumerate(raw_row):
                        if col_idx >= len(headers):
                            break
                        col_name = headers[col_idx]
                        if col_name:
                            row_dict[col_name] = normalise_cell(str(cell) if cell else '')
                    rows.append(row_dict)

    return rows


# ---------------------------------------------------------------------------
# Merging the three column groups
# ---------------------------------------------------------------------------

def merge_groups(raw_rows: list[dict]) -> list[dict]:
    """
    The PDF repeats the same CCN rows three times (one per institution-group
    slab).  We identify each row by its CCN and merge the institution columns
    across all three groups into a single row.
    """
    merged: dict[str, dict] = {}   # ccn → merged row

    for row in raw_rows:
        ccn = normalise_ccn(row.get('ccn', ''))
        if not ccn:
            continue

        if ccn not in merged:
            merged[ccn] = {
                'ccn': ccn,
                'ccn_title': row.get('ccn_title', ''),
            }
            # Initialise all institution columns as empty
            for inst in ALL_INSTITUTIONS:
                merged[ccn][inst] = ''

        # Copy over any institution columns present in this row
        base = merged[ccn]
        for inst in ALL_INSTITUTIONS:
            val = row.get(inst, '')
            if val:
                # Only overwrite if we don't already have a value
                # (first occurrence wins; all groups should agree)
                if not base[inst]:
                    base[inst] = val

        # Update title if we got one and didn't have one
        if not base['ccn_title'] and row.get('ccn_title'):
            base['ccn_title'] = row['ccn_title']

    return list(merged.values())


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PDF
    out_path = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUT

    if not os.path.exists(pdf_path):
        print(f"[error] PDF not found: {pdf_path}")
        sys.exit(1)

    print(f"[extract] Reading: {pdf_path}")
    raw_rows = extract_tables_from_pdf(pdf_path)
    print(f"[extract] Raw rows extracted: {len(raw_rows)}")

    merged = merge_groups(raw_rows)
    print(f"[extract] Unique CCN entries after merge: {len(merged)}")

    # Sort by CCN for readability
    merged.sort(key=lambda r: r.get('ccn', ''))

    fieldnames = ['ccn', 'ccn_title'] + ALL_INSTITUTIONS

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(merged)

    print(f"[extract] Written to: {out_path}")
    print(f"[extract] Columns: {fieldnames}")
    print("[extract] Done.")


if __name__ == '__main__':
    main()
