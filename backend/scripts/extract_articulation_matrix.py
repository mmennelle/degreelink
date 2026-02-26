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

The PDF is split into four horizontal column-groups (each spanning 22 pages)
that share the same row set, plus a 2-column CCN index at the end.
Groups 2-4 have NO CCN column — they are merged by positional alignment with
Group 1.

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

# Canonical institution column names for the output CSV.
ALL_INSTITUTIONS = [
    'BPCC', 'BRCC', 'CLTCC', 'DCC', 'FTCC', 'LDCC',
    'NCC', 'NTCC', 'RPCC', 'SLCC', 'STCC', 'LSU_AM', 'LSUA', 'LSUE',
    'LSUS', 'GSU', 'LA_TECH', 'MCNEESE', 'NICHOLLS', 'NSU', 'SLU', 'ULL', 'ULM',
    'UNO', 'SU_AM', 'SUNO', 'SUSLA',
]

# ---------------------------------------------------------------------------
# The four horizontal column-groups in the PDF.
#
# Each group spans 22 content pages (plus a blank/notes page before the next).
# The first page of each group has header rows; remaining pages are data only.
#
#   columns:   canonical names for the institution columns, in order.
#              For Group 1 the first two columns are CCN and title (implicit).
#   pages:     (first_page, last_page)  — 1-indexed, inclusive.
#   data_row:  row index (0-based) where data starts on the header page.
#              On all subsequent pages, data starts at row 0.
# ---------------------------------------------------------------------------
GROUPS = [
    {   # Group 1: CCN + title + 6 LCTCS institutions
        'columns': ['BPCC', 'BRCC', 'CLTCC', 'DCC', 'FTCC', 'LDCC'],
        'pages': (1, 22),
        'data_row': 2,     # page 1: row0=title, row1=header, row2+=data
        'has_ccn': True,
    },
    {   # Group 2: 9 columns (NCC..LSUE).  Column "NLTCC" in the PDF is
        #          always empty — we drop it.
        'columns': ['NCC', '_NLTCC', 'NTCC', 'RPCC', 'SLCC', 'STCC', 'LSU_AM', 'LSUA', 'LSUE'],
        'pages': (24, 45),
        'data_row': 3,     # page 24: row0=empty, row1=system, row2=header, row3+=data
        'has_ccn': False,
    },
    {   # Group 3: 9 columns (LSUS..ULM)
        'columns': ['LSUS', 'GSU', 'LA_TECH', 'MCNEESE', 'NICHOLLS', 'NSU', 'SLU', 'ULL', 'ULM'],
        'pages': (47, 68),
        'data_row': 2,     # page 47: row0=empty, row1=header, row2+=data
        'has_ccn': False,
    },
    {   # Group 4: 8 columns — first 4 are public (UNO..SUSLA), last 4 are
        #          private institutions (excluded from output).
        'columns': ['UNO', 'SU_AM', 'SUNO', 'SUSLA', '_FRAN_U', '_LA_CHRISTIAN', '_LOYOLA', '_HOLY_CROSS'],
        'pages': (70, 91),
        'data_row': 2,     # page 70: row0=empty, row1=header, row2+=data
        'has_ccn': False,
    },
]


# ---------------------------------------------------------------------------
# Cell normalisation
# ---------------------------------------------------------------------------

def normalise_cell(raw: str) -> str:
    """
    Clean up a raw cell value extracted from the PDF.

    Transforms:
        "ACCT\\n2113"     → "ACCT 2113"
        "_ _ _"          → ""
        "___"            → ""
        "GSOC (3)"       → "GSOC 3"
        "GNAT (1)"       → "GNAT 1"
        "ACCT ***"       → "ACCT ***"
        "ACCT\\n***"      → "ACCT ***"
        "ACCT 2101\\n&\\nACCT 2***" → "ACCT 2101 & ACCT 2***"
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
    """Ensure CCN codes like 'CACC\\n2113' become 'CACC 2113'."""
    return re.sub(r'\s+', ' ', (raw or '').strip())


# Pattern for a valid CCN code: 4-letter prefix + space + digits (e.g. "CACC 2113")
CCN_PATTERN = re.compile(r'^C[A-Z]{2,4}\s+\d{3,4}')


def is_data_row(cells: list[str], has_ccn: bool) -> bool:
    """
    Determine if a row extracted from the table is an actual data row
    (as opposed to a category header like "Accounting" or an empty row).

    For Group 1 (has_ccn=True): the first cell must look like a CCN code.
    For Groups 2-4: at least one cell must be non-empty.
    """
    if not cells:
        return False
    if has_ccn:
        first = normalise_ccn(str(cells[0]) if cells[0] else '')
        return bool(CCN_PATTERN.match(first))
    else:
        return any(normalise_cell(str(c) if c else '') for c in cells)


# ---------------------------------------------------------------------------
# Group extraction
# ---------------------------------------------------------------------------

def extract_group(pdf, group: dict) -> list[list[str]]:
    """
    Extract all content rows from one horizontal group as a flat list of
    cell-lists, preserving page order.

    Category-header rows (e.g. "Accounting") and fully-empty rows are
    included as empty placeholders to keep positional alignment with the
    other groups.
    """
    first_page, last_page = group['pages']
    data_start = group['data_row']
    has_ccn = group['has_ccn']
    ncols = (2 + len(group['columns'])) if has_ccn else len(group['columns'])
    rows: list[list[str]] = []

    for page_num in range(first_page, last_page + 1):
        page = pdf.pages[page_num - 1]  # 0-indexed
        tables = page.extract_tables()
        if not tables:
            continue
        table = tables[0]

        # On the header page, skip header rows
        start = data_start if page_num == first_page else 0
        for raw_row in table[start:]:
            # Pad or trim to expected column count
            cells = [(str(c).strip() if c else '') for c in raw_row]
            while len(cells) < ncols:
                cells.append('')
            cells = cells[:ncols]

            if is_data_row(cells, has_ccn):
                rows.append(cells)
            else:
                # Placeholder to maintain positional alignment
                rows.append([''] * ncols)

    return rows


# ---------------------------------------------------------------------------
# Merge groups by positional alignment
# ---------------------------------------------------------------------------

def merge_groups(group_rows: list[list[list[str]]]) -> list[dict]:
    """
    Merge the four groups into a single list of row-dicts.

    Group 1 provides CCN + title + 6 institutions.
    Groups 2-4 provide institution columns at the same row positions.
    Rows that are placeholders in Group 1 (no valid CCN) are dropped.
    """
    g1 = group_rows[0]
    others = group_rows[1:]

    # Verify row counts align (warn if not)
    for idx, g in enumerate(others, start=2):
        if len(g) != len(g1):
            print(f"[warn] Group {idx} has {len(g)} rows vs Group 1 has {len(g1)} rows — will align to min")

    min_len = min(len(g1), *(len(g) for g in others))
    merged: list[dict] = []

    for i in range(min_len):
        row1 = g1[i]
        ccn = normalise_ccn(row1[0])
        if not CCN_PATTERN.match(ccn):
            continue  # skip category/empty rows

        title = normalise_cell(row1[1]) if len(row1) > 1 else ''

        entry = {'ccn': ccn, 'ccn_title': title}
        # Initialise all institution columns empty
        for inst in ALL_INSTITUTIONS:
            entry[inst] = ''

        # Fill Group 1 institutions (columns 2+)
        g1_cols = GROUPS[0]['columns']
        for col_idx, inst in enumerate(g1_cols):
            cell_idx = 2 + col_idx  # skip CCN and title
            if cell_idx < len(row1):
                entry[inst] = normalise_cell(row1[cell_idx])

        # Fill Groups 2-4
        for g_idx, g_other in enumerate(others):
            if i >= len(g_other):
                continue
            row_other = g_other[i]
            col_names = GROUPS[g_idx + 1]['columns']
            for col_idx, inst in enumerate(col_names):
                if inst.startswith('_'):
                    continue  # skip private/unused columns
                if col_idx < len(row_other):
                    val = normalise_cell(row_other[col_idx])
                    if val:
                        entry[inst] = val

        merged.append(entry)

    return merged


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

    with pdfplumber.open(pdf_path) as pdf:
        total = len(pdf.pages)
        print(f"[extract] PDF has {total} pages")

        # Extract each group
        all_group_rows = []
        for g_idx, group in enumerate(GROUPS, start=1):
            rows = extract_group(pdf, group)
            print(f"[extract] Group {g_idx} ({group['pages'][0]}-{group['pages'][1]}): "
                  f"{len(rows)} rows, {len(group['columns'])} institution cols")
            all_group_rows.append(rows)

    # Merge by positional alignment
    merged = merge_groups(all_group_rows)
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

    # Quick stats
    filled = sum(1 for row in merged for inst in ALL_INSTITUTIONS if row.get(inst))
    total_cells = len(merged) * len(ALL_INSTITUTIONS)
    print(f"[extract] Fill rate: {filled}/{total_cells} ({100*filled/total_cells:.1f}%)")
    print("[extract] Done.")


if __name__ == '__main__':
    main()
