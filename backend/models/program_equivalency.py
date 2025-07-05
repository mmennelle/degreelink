# models/program_equivalency.py
class ProgramEquivalency(BaseModel):
    """Maps programs between institutions (e.g., DCC Biology AS -> UNO Biology BS)"""
    
    def __init__(self, source_program_id: int = None, target_program_id: int = None,
                 equivalency_type: str = None, notes: str = None, id: int = None):
        super().__init__()
        self.id = id
        self.source_program_id = source_program_id
        self.target_program_id = target_program_id
        self.equivalency_type = equivalency_type  # 'direct', 'partial', 'pathway'
        self.notes = notes
    
    @classmethod
    def table_name(cls) -> str:
        return "ProgramEquivalency"
    
    @classmethod
    def create_table_sql(cls) -> str:
        return '''
            CREATE TABLE IF NOT EXISTS ProgramEquivalency (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_program_id INTEGER NOT NULL,
                target_program_id INTEGER NOT NULL,
                equivalency_type TEXT DEFAULT 'direct',
                notes TEXT,
                FOREIGN KEY (source_program_id) REFERENCES Program (id),
                FOREIGN KEY (target_program_id) REFERENCES Program (id),
                UNIQUE(source_program_id, target_program_id)
            )
        '''
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'source_program_id': self.source_program_id,
            'target_program_id': self.target_program_id,
            'equivalency_type': self.equivalency_type,
            'notes': self.notes
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ProgramEquivalency':
        return cls(
            id=data.get('id'),
            source_program_id=data.get('source_program_id'),
            target_program_id=data.get('target_program_id'),
            equivalency_type=data.get('equivalency_type', 'direct'),
            notes=data.get('notes')
        )
