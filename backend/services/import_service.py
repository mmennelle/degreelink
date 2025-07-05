# services/import_service.py - Missing service
import csv
import io
from typing import Dict, Any, List
from .base_service import BaseService
from models.institution import Institution
from models.department import Department
from models.course import Course
from models.equivalency import CourseEquivalency

class ImportService(BaseService):
    """Service for importing course data"""
    
    def import_csv_file(self, file) -> Dict[str, Any]:
        """Import course equivalencies from CSV file"""
        try:
            content = io.StringIO(file.stream.read().decode("utf-8"))
            reader = csv.DictReader(content)
            
            rows_processed = 0
            rows_skipped = 0
            errors = []
            
            for row_num, row in enumerate(reader, start=1):
                try:
                    result = self._process_csv_row(row)
                    if result['success']:
                        rows_processed += 1
                    else:
                        rows_skipped += 1
                        errors.append(f"Row {row_num}: {result['error']}")
                        
                except Exception as e:
                    rows_skipped += 1
                    errors.append(f"Row {row_num}: {str(e)}")
            
            message = f'Successfully processed {rows_processed} course equivalencies'
            if rows_skipped > 0:
                message += f', skipped {rows_skipped} rows'
            
            return {
                'success': True,
                'message': message,
                'processed': rows_processed,
                'skipped': rows_skipped,
                'errors': errors[:10] if errors else []  # Limit to 10 errors
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Import failed: {str(e)}',
                'processed': 0,
                'skipped': 0,
                'errors': [str(e)]
            }
    
    def validate_csv_file(self, file) -> Dict[str, Any]:
        """Validate CSV file without importing"""
        try:
            content = io.StringIO(file.stream.read().decode("utf-8"))
            reader = csv.DictReader(content)
            
            required_fields = [
                'source_institution', 'target_institution',
                'source_department', 'target_department',
                'source_code', 'source_title',
                'target_code', 'target_title'
            ]
            
            valid_rows = 0
            invalid_rows = 0
            errors = []
            
            for row_num, row in enumerate(reader, start=1):
                missing_fields = [field for field in required_fields if not row.get(field, '').strip()]
                if missing_fields:
                    invalid_rows += 1
                    errors.append(f"Row {row_num}: Missing fields: {', '.join(missing_fields)}")
                else:
                    valid_rows += 1
            
            return {
                'valid': True,
                'total_rows': valid_rows + invalid_rows,
                'valid_rows': valid_rows,
                'invalid_rows': invalid_rows,
                'errors': errors[:10] if errors else []
            }
            
        except Exception as e:
            return {
                'valid': False,
                'message': f'Validation failed: {str(e)}',
                'errors': [str(e)]
            }
    
    def _process_csv_row(self, row: Dict[str, str]) -> Dict[str, Any]:
        """Process a single CSV row"""
        required_fields = [
            'source_institution', 'target_institution',
            'source_department', 'target_department',
            'source_code', 'source_title',
            'target_code', 'target_title'
        ]
        
        # Check for missing fields
        missing_fields = [field for field in required_fields if not row.get(field, '').strip()]
        if missing_fields:
            return {
                'success': False,
                'error': f"Missing fields: {', '.join(missing_fields)}"
            }
        
        try:
            # Get or create institutions
            source_inst = Institution.get_or_create(row['source_institution'].strip())
            target_inst = Institution.get_or_create(row['target_institution'].strip())
            
            # Get or create departments
            source_dept = Department.get_or_create(row['source_department'].strip(), source_inst.id)
            target_dept = Department.get_or_create(row['target_department'].strip(), target_inst.id)
            
            # Get or create courses
            source_course = Course.get_or_create(
                row['source_code'].strip(),
                row['source_title'].strip(),
                source_dept.id,
                source_inst.id
            )
            
            target_course = Course.get_or_create(
                row['target_code'].strip(),
                row['target_title'].strip(),
                target_dept.id,
                target_inst.id
            )
            
            # Create equivalency relationship
            CourseEquivalency.create_equivalency(source_course.id, target_course.id)
            
            return {'success': True}
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }