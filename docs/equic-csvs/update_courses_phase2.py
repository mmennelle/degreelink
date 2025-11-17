"""
Script to add Phase 2 columns (has_lab, course_type) to course CSV files.
Uses credit amounts as the primary method for determining course types:
- 1 credit: Lab only (or Research if title contains 'research/thesis/internship')
- 3 credits: Lecture (or Research if title contains 'research/thesis/internship', or Seminar if title contains 'seminar/colloquium')
- 4 credits: Lecture + Lab
- Variable (0-3): Research or Seminar based on title
"""
import csv
import re
from pathlib import Path

def determine_course_attributes(code, title, description, existing_credits):
    """
    Determine has_lab, course_type, and credits based on course information.
    Uses existing credits as primary indicator, with title-based overrides for research/seminar.
    
    Returns: (has_lab: bool, course_type: str, credits: int)
    Valid course_types: lecture, lecture_lab, lab_only, research, seminar
    """
    code_upper = code.upper()
    title_lower = title.lower()
    desc_lower = description.lower() if description else ""
    
    # Parse existing credits
    try:
        credits = int(existing_credits) if existing_credits else 3
    except (ValueError, TypeError):
        credits = 3
    
    
    # Parse existing credits
    try:
        credits = int(existing_credits) if existing_credits else 3
    except (ValueError, TypeError):
        credits = 3
    
    # Check for research courses (title-based, variable credits 1-3)
    research_keywords = ['research', 'thesis', 'dissertation', 'independent study', 'internship']
    if any(keyword in title_lower for keyword in research_keywords):
        return False, 'research', credits  # Keep existing credits
    
    # Check for seminar courses (title-based, variable credits 0-4)
    if 'seminar' in title_lower or 'colloquium' in title_lower:
        return False, 'seminar', credits  # Keep existing credits
    
    # Use credit amount to determine course type
    if credits == 1:
        # 1 credit = Lab only
        return True, 'lab_only', 1
    elif credits == 4:
        # 4 credits = Lecture + Lab
        return True, 'lecture_lab', 4
    elif credits == 3:
        # 3 credits = Regular lecture
        return False, 'lecture', 3
    elif credits == 2:
        # 2 credits = Lecture (uncommon but treat as lecture)
        return False, 'lecture', 2
    else:
        # Default: treat as lecture with existing credits
        return False, 'lecture', credits


def update_csv_file(input_file, output_file):
    """Update a course CSV file with Phase 2 columns using credit-based determination."""
    print(f"\nProcessing: {input_file}")
    
    updated_rows = []
    stats = {
        'total': 0,
        'lab_only': 0,
        'lecture_lab': 0,
        'lecture': 0,
        'research': 0,
        'seminar': 0,
        'credits_changed': 0,
    }
    
    with open(input_file, 'r', encoding='utf-8') as f:
        # Read all content and clean it
        content = f.read()
        # Remove any trailing commas and weird characters
        content = re.sub(r',+\s*$', '', content, flags=re.MULTILINE)
        
        # Parse CSV
        reader = csv.DictReader(content.splitlines())
        
        # Get fieldnames and add new columns if not present
        fieldnames = list(reader.fieldnames)
        # Remove any empty/None fieldnames
        fieldnames = [f for f in fieldnames if f and f.strip()]
        
        if 'has_lab' not in fieldnames:
            fieldnames.append('has_lab')
        if 'course_type' not in fieldnames:
            fieldnames.append('course_type')
        
        for row in reader:
            stats['total'] += 1
            
            # Get course info
            code = row.get('code', '').strip()
            title = row.get('title', '').strip()
            description = row.get('description', '').strip()
            old_credits = row.get('credits', '').strip()
            
            if not code:
                continue
            
            # Determine attributes based on existing credits
            has_lab, course_type, new_credits = determine_course_attributes(code, title, description, old_credits)
            
            # Update row
            row['has_lab'] = str(has_lab).lower()
            row['course_type'] = course_type
            
            # Track if credits would change (but we keep existing credits)
            if old_credits != str(new_credits):
                stats['credits_changed'] += 1
            
            # Always use the determined credits (which respects existing for research/seminar)
            row['credits'] = str(new_credits)
            
            # Update stats
            stats[course_type] += 1
            
            # Clean row - remove empty keys
            cleaned_row = {k: v for k, v in row.items() if k and k.strip()}
            updated_rows.append(cleaned_row)
            
            # Print notable courses (non-lecture or changed credits)
            if course_type != 'lecture' or old_credits != str(new_credits):
                credits_display = f"cr={row.get('credits', 'N/A')}"
                if old_credits != str(new_credits):
                    credits_display += f" (was {old_credits})"
                print(f"  {code:20} → has_lab={has_lab:5}, type={course_type:15}, {credits_display} | {title[:40]}")
    
    # Write updated CSV
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(updated_rows)
    
    # Print statistics
    print(f"\n✓ Updated {output_file}")
    print(f"  Total courses: {stats['total']}")
    print(f"  - Lecture only: {stats['lecture']} (typically 3 credits)")
    print(f"  - Lecture + Lab: {stats['lecture_lab']} (typically 4 credits)")
    print(f"  - Lab only: {stats['lab_only']} (typically 1 credit)")
    print(f"  - Research: {stats['research']} (variable 1-3 credits)")
    print(f"  - Seminar: {stats['seminar']} (variable 0-4 credits)")
    if stats['credits_changed'] > 0:
        print(f"  Credits changed: {stats['credits_changed']}")
    
    return stats


def main():
    """Main function to update both course CSV files."""
    script_dir = Path(__file__).parent
    
    # Define input and output files
    files_to_update = [
        ('Dcc_courses_92525.csv', 'Dcc_courses_92525_updated.csv'),
        ('Uno_courses_92525.csv', 'Uno_courses_92525_updated.csv'),
    ]
    
    print("=" * 80)
    print("Course CSV Phase 2 Update Script")
    print("Credit-based course type determination:")
    print("  1 credit → Lab only (unless title indicates research)")
    print("  3 credits → Lecture (unless title indicates research/seminar)")
    print("  4 credits → Lecture + Lab")
    print("=" * 80)
    
    total_stats = {
        'total': 0,
        'lab_only': 0,
        'lecture_lab': 0,
        'lecture': 0,
        'research': 0,
        'seminar': 0,
        'credits_changed': 0,
    }
    
    for input_name, output_name in files_to_update:
        input_path = script_dir / input_name
        output_path = script_dir / output_name
        
        if not input_path.exists():
            print(f"\n⚠️  File not found: {input_path}")
            continue
        
        stats = update_csv_file(input_path, output_path)
        
        # Aggregate stats
        for key in total_stats:
            total_stats[key] += stats[key]
    
    print("\n" + "=" * 80)
    print("OVERALL STATISTICS")
    print("=" * 80)
    print(f"Total courses processed: {total_stats['total']}")
    print(f"  - Lecture only: {total_stats['lecture']} ({total_stats['lecture']/total_stats['total']*100:.1f}%) → typically 3 credits")
    print(f"  - Lecture + Lab: {total_stats['lecture_lab']} ({total_stats['lecture_lab']/total_stats['total']*100:.1f}%) → typically 4 credits")
    print(f"  - Lab only: {total_stats['lab_only']} ({total_stats['lab_only']/total_stats['total']*100:.1f}%) → typically 1 credit")
    print(f"  - Research: {total_stats['research']} ({total_stats['research']/total_stats['total']*100:.1f}%) → variable 1-3 credits")
    print(f"  - Seminar: {total_stats['seminar']} ({total_stats['seminar']/total_stats['total']*100:.1f}%) → variable 0-4 credits")
    if total_stats['credits_changed'] > 0:
        print(f"\nTotal credits changed: {total_stats['credits_changed']}")
    print("\n✓ Done! Review the *_updated.csv files and rename them when satisfied.")


if __name__ == '__main__':
    main()
