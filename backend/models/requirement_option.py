# models/requirement_option.py
class RequirementOption(BaseModel):
    """A specific requirement option within a requirement group"""
    
    def __init__(self, requirement_group_id: int = None, course_id: int = None,
                 credits: int = None, is_required: bool = None, 
                 constraint_type: str = None, constraint_value: int = None,
                 sort_order: int = None, id: int = None):
        super().__init__()
        self.id = id
        self.requirement_group_id = requirement_group_id
        self.course_id = course_id
        self.credits = credits
        self.is_required = is_required or False
        self.constraint_type = constraint_type  # 'choose_one', 'choose_n', 'required', 'elective'
        self.constraint_value = constraint_value  # number for 'choose_n'
        self.sort_order = sort_order or 0
    
    @classmethod
    def table_name(cls) -> str:
        return "RequirementOption"
    
    @classmethod
    def create_table_sql(cls) -> str:
        return '''
            CREATE TABLE IF NOT EXISTS RequirementOption (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                requirement_group_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                credits INTEGER,
                is_required BOOLEAN DEFAULT 0,
                constraint_type TEXT DEFAULT 'elective',
                constraint_value INTEGER,
                sort_order INTEGER DEFAULT 0,
                FOREIGN KEY (requirement_group_id) REFERENCES RequirementGroup (id),
                FOREIGN KEY (course_id) REFERENCES Course (id),
                UNIQUE(requirement_group_id, course_id)
            )
        '''
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'requirement_group_id': self.requirement_group_id,
            'course_id': self.course_id,
            'credits': self.credits,
            'is_required': self.is_required,
            'constraint_type': self.constraint_type,
            'constraint_value': self.constraint_value,
            'sort_order': self.sort_order
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RequirementOption':
        return cls(
            id=data.get('id'),
            requirement_group_id=data.get('requirement_group_id'),
            course_id=data.get('course_id'),
            credits=data.get('credits'),
            is_required=data.get('is_required', False),
            constraint_type=data.get('constraint_type', 'elective'),
            constraint_value=data.get('constraint_value'),
            sort_order=data.get('sort_order', 0)
        )
    
    @classmethod
    def find_by_requirement_group(cls, requirement_group_id: int) -> List['RequirementOption']:
        """Find all requirement options for a requirement group"""
        conn = get_db_connection()
        rows = conn.execute(
            "SELECT * FROM RequirementOption WHERE requirement_group_id = ? ORDER BY sort_order, id", 
            (requirement_group_id,)
        ).fetchall()
        conn.close()
        
        return [cls.from_dict(dict(row)) for row in rows]