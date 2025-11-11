"""
Convert legacy program requirements CSV to unified format with embedded constraints.

This script:
1. Reads legacy requirements CSV (with course_option, courses_required, credits_required_group)
2. Reads legacy constraints CSV (if exists)
3. Combines them into unified format with constraint columns
4. Outputs new CSV with course_code and constraint columns on first row of each category
"""

import csv
import sys
from collections import defaultdict

def read_constraints(constraints_file):
    """Read constraints CSV and organize by (program_name, category)"""
    constraints = defaultdict(lambda: {
        'constraint_type': '',
        'description': '',
        'min_credits': '',
        'max_credits': '',
        'min_level': '',
        'min_courses': '',
        'max_courses': '',
        'tag': '',
        'tag_value': '',
        'scope_subject_codes': ''
    })
    
    try:
        with open(constraints_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                program = row.get('program_name', '').strip()
                # Handle both 'category' and 'requirement_category' column names
                category = row.get('category', row.get('requirement_category', '')).strip()
                constraint_type = row.get('constraint_type', '').strip()
                
                if not program or not category:
                    continue
                
                key = (program, category)
                
                # Store the constraint_type
                if constraint_type:
                    constraints[key]['constraint_type'] = constraint_type
                
                # Store description
                if row.get('description'):
                    constraints[key]['description'] = row['description'].strip()
                
                # Store all constraint columns
                if row.get('min_credits'):
                    constraints[key]['min_credits'] = row['min_credits'].strip()
                if row.get('max_credits'):
                    constraints[key]['max_credits'] = row['max_credits'].strip()
                if row.get('min_level'):
                    constraints[key]['min_level'] = row['min_level'].strip()
                if row.get('min_courses'):
                    constraints[key]['min_courses'] = row['min_courses'].strip()
                if row.get('max_courses'):
                    constraints[key]['max_courses'] = row['max_courses'].strip()
                if row.get('tag'):
                    constraints[key]['tag'] = row['tag'].strip()
                if row.get('tag_value'):
                    constraints[key]['tag_value'] = row['tag_value'].strip()
                if row.get('scope_subject_codes'):
                    constraints[key]['scope_subject_codes'] = row['scope_subject_codes'].strip()
    
    except FileNotFoundError:
        print(f"Warning: Constraints file {constraints_file} not found. Proceeding without constraints.")
    except Exception as e:
        print(f"Warning: Error reading constraints file: {e}. Proceeding without constraints.")
    
    return constraints

def convert_to_unified(input_file, output_file, constraints_file=None):
    """Convert legacy requirements CSV to unified format"""
    
    # Read constraints if provided
    constraints = {}
    if constraints_file:
        constraints = read_constraints(constraints_file)
    
    # Track which categories we've already written constraint columns for
    categories_written = set()
    
    rows_in = []
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows_in = list(reader)
    
    # Write unified format
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = [
            'program_name', 'category', 'requirement_type', 'semester', 'year', 'is_current',
            'group_name', 'course_code', 'institution', 'is_preferred',
            'constraint_type', 'description', 'min_credits', 'max_credits',
            'min_level', 'min_courses', 'max_courses', 'tag', 'tag_value', 'scope_subject_codes'
        ]
        
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for row in rows_in:
            program_name = row.get('program_name', '').strip()
            category = row.get('category', '').strip()
            requirement_type = row.get('requirement_type', '').strip()
            semester = row.get('semester', '').strip()
            year = row.get('year', '').strip()
            is_current = row.get('is_current', '').strip()
            group_name = row.get('group_name', '').strip()
            
            # Convert course_option to course_code
            course_code = row.get('course_option', '').strip()
            
            institution = row.get('institution', '').strip()
            is_preferred = row.get('is_preferred', '').strip()
            
            # Build output row
            out_row = {
                'program_name': program_name,
                'category': category,
                'requirement_type': requirement_type,
                'semester': semester,
                'year': year,
                'is_current': is_current,
                'group_name': group_name,
                'course_code': course_code,
                'institution': institution,
                'is_preferred': is_preferred,
                'constraint_type': '',
                'description': '',
                'min_credits': '',
                'max_credits': '',
                'min_level': '',
                'min_courses': '',
                'max_courses': '',
                'tag': '',
                'tag_value': '',
                'scope_subject_codes': ''
            }
            
            # Add constraint columns only on first row of each category
            category_key = (program_name, category)
            if category_key not in categories_written:
                categories_written.add(category_key)
                
                # Add constraints for this category
                if category_key in constraints:
                    cat_constraints = constraints[category_key]
                    out_row['constraint_type'] = cat_constraints['constraint_type']
                    out_row['description'] = cat_constraints['description']
                    out_row['min_credits'] = cat_constraints['min_credits']
                    out_row['max_credits'] = cat_constraints['max_credits']
                    out_row['min_level'] = cat_constraints['min_level']
                    out_row['min_courses'] = cat_constraints['min_courses']
                    out_row['max_courses'] = cat_constraints['max_courses']
                    out_row['tag'] = cat_constraints['tag']
                    out_row['tag_value'] = cat_constraints['tag_value']
                    out_row['scope_subject_codes'] = cat_constraints['scope_subject_codes']
            
            writer.writerow(out_row)
    
    print(f"✅ Converted {input_file} -> {output_file}")
    print(f"   Categories: {len(categories_written)}")
    print(f"   Rows: {len(rows_in)}")
    if constraints:
        print(f"   Constraints applied: {len([k for k in categories_written if k in constraints])}")

if __name__ == '__main__':
    # Convert DCC program requirements
    print("Converting DCC Associate program requirements...")
    convert_to_unified(
        'current_dcc_prog-reqs_associate_92525.csv',
        'current_dcc_prog-reqs_associate_92525_unified.csv',
        None  # No constraints file for DCC
    )
    
    print("\nConverting UNO Bachelor's program requirements...")
    convert_to_unified(
        'target_uno_prog-reqs_bachelors_92525.csv',
        'target_uno_prog-reqs_bachelors_92525_unified.csv',
        'sample_requirement_constraints.csv'
    )
    
    print("\n✅ Conversion complete!")
    print("\nNew files created:")
    print("  - current_dcc_prog-reqs_associate_92525_unified.csv")
    print("  - target_uno_prog-reqs_bachelors_92525_unified.csv")
