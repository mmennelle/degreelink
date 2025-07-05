# models/requirement_group.py
class RequirementGroup(BaseModel):
    """A group of requirements within a program (e.g., General Education, Core Courses)"""
    
    def __init__(self, name: str = None, program_id: int = None, 
                 total_credits: int = None, description: str = None, 
                 sort_order: int = None, id: int = None):
        super().__init__()
        self.id = id
        self.name = name
        self.program_id = program_id
        self.total_credits = total_credits
        self.description = description
        self.sort_order = sort_order or 0
    
    @classmethod
    def table_name(cls) -> str:
        return "RequirementGroup"
    
    @classmethod
    def create_table_sql(cls) -> str:
        return '''
            CREATE TABLE IF NOT EXISTS RequirementGroup (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                program_id INTEGER NOT NULL,
                total_credits INTEGER,
                description TEXT,
                sort_order INTEGER DEFAULT 0,
                FOREIGN KEY (program_id) REFERENCES Program (id),
                UNIQUE(name, program_id)
            )
        '''
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'program_id': self.program_id,
            'total_credits': self.total_credits,
            'description': self.description,
            'sort_order': self.sort_order
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RequirementGroup':
        return cls(
            id=data.get('id'),
            name=data.get('name'),
            program_id=data.get('program_id'),
            total_credits=data.get('total_credits'),
            description=data.get('description'),
            sort_order=data.get('sort_order', 0)
        )
    
    @classmethod
    def find_by_program(cls, program_id: int) -> List['RequirementGroup']:
        """Find all requirement groups for a program"""
        conn = get_db_connection()
        rows = conn.execute(
            "SELECT * FROM RequirementGroup WHERE program_id = ? ORDER BY sort_order, name", 
            (program_id,)
        ).fetchall()
        conn.close()
        
        return [cls.from_dict(dict(row)) for row in rows]
