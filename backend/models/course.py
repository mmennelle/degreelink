from . import db
from datetime import datetime

class Course(db.Model):
    """
    Course model representing an individual course offering.

    Historically the application stored the entire course code (e.g. "BIOL 104")
    in a single column.  In order to support searching and grouping courses by
    subject and level (e.g. 1000‑, 2000‑level) the code has been split into
    two components: a subject prefix and a course number.  A derived
    numeric level is also stored to make range queries efficient.

    The original `code` column is still maintained for backwards
    compatibility and is kept in sync with `subject_code` and
    `course_number`.
    """

    __tablename__ = 'courses'

    # Surrogate primary key.  Keeping this allows foreign keys in other
    # tables (e.g. plan_courses) to remain unchanged.
    id = db.Column(db.Integer, primary_key=True)

    # Full course code (e.g. "BIOL 104" or "CSCI 1583").  Retained for
    # backwards compatibility and display purposes.  This column is
    # automatically assembled from `subject_code` and `course_number` when
    # either is set.
    code = db.Column(db.String(20), nullable=False, index=True)

    # New composite key components.
    # Subject prefix (e.g. "BIOL", "CSCI").  Stored in uppercase to
    # normalise comparisons and indexing.
    subject_code = db.Column(db.String(20), nullable=False, index=True)
    # Course number (e.g. "104", "6500G").  Stored as a string because
    # alphanumeric suffixes (such as the "G" in 6500G) must be preserved.
    course_number = db.Column(db.String(20), nullable=False, index=True)
    # Integer representation of the numeric portion of the course number.
    # Non‑digit characters are stripped.  Null if no numeric component
    # exists.  This is useful for sorting and determining levels.
    course_number_numeric = db.Column(db.Integer)
    # Course level rounded down to the nearest thousand (e.g. 1583 → 1000,
    # 6500 → 6000).  This allows clients to query for all 2000‑level
    # courses by filtering on this field.  Courses with numeric values
    # below 1000 will be grouped into level 0.
    course_level = db.Column(db.Integer)

    # Unique constraint on subject, number and institution ensures that
    # within a given institution the same course identifier cannot be
    # entered twice.
    __table_args__ = (
        db.UniqueConstraint('subject_code', 'course_number', 'institution', name='uq_subject_course_institution'),
    )

    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    credits = db.Column(db.Integer, nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100))
    prerequisites = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    equivalent_from = db.relationship('Equivalency', foreign_keys='Equivalency.from_course_id', backref='from_course')
    equivalent_to = db.relationship('Equivalency', foreign_keys='Equivalency.to_course_id', backref='to_course')

    # --- Parsing utilities ----------------------------------------------------
    @staticmethod
    def _split_code(code: str):
        """
        Split a course code into (subject, number) parts.

        Accepts strings like "BIOL 104", "bio1004", or "BIO 6500G".
        If no digits are present, the entire string is treated as the
        subject and the number portion will be an empty string.

        Returns a tuple (subject: str, number: str).  Both are returned in
        uppercase for consistency.
        """
        import re

        if not code:
            return '', ''
        # Normalize whitespace
        code = code.strip()
        # Try to match a subject followed by optional whitespace then a number
        # with optional trailing letters.  The subject portion must start
        # with at least one letter.
        match = re.match(r'^([A-Za-z]+)[\s-]*([0-9]+[A-Za-z]*)?$', code)
        if match:
            subject = match.group(1) or ''
            number = match.group(2) or ''
        else:
            # Fallback: treat the entire string as the subject
            subject = code
            number = ''
        return subject.upper(), number.upper()

    @staticmethod
    def _extract_numeric(number: str):
        """
        Extract the leading numeric portion of a course number.  Returns
        None if no digits are present.
        """
        import re
        if not number:
            return None
        m = re.match(r'^(\d+)', number)
        return int(m.group(1)) if m else None

    @staticmethod
    def _calculate_level(numeric: int | None) -> int | None:
        """
        Determine a course's level based on the leading digit of its numeric
        identifier.  The level is derived by multiplying the first digit of
        the course number by 1000, regardless of the total number of
        digits.  For example:

          * 1583 → 1×1000 = 1000
          * 6500 → 6×1000 = 6000
          * 101 → 1×1000 = 1000
          * 250 → 2×1000 = 2000

        If the numeric part is missing or does not start with a digit in
        the range 1–9, the level cannot be determined and None is returned.
        """
        if numeric is None:
            return None
        # Convert to string to inspect the first digit
        numeric_str = str(numeric).lstrip()
        if not numeric_str:
            return None
        first_char = numeric_str[0]
        if first_char.isdigit():
            first_digit = int(first_char)
            # Only return meaningful levels for digits 1–9.  Levels below 1000
            # (e.g. a leading 0) will yield None so that such courses can be
            # handled separately if needed.
            if 1 <= first_digit <= 9:
                return first_digit * 1000
        return None

    # --- Instance methods -----------------------------------------------------
    def __repr__(self):
        return f'<Course {self.code}: {self.title}>'

    def to_dict(self):
        """
        Serialize the course instance to a dictionary.  Includes both
        legacy `code` and newly added composite fields to support clients
        migrating gradually.  Numeric helpers are also included.
        """
        return {
            'id': self.id,
            'code': self.code,
            'subject_code': self.subject_code,
            'course_number': self.course_number,
            'course_number_numeric': self.course_number_numeric,
            'course_level': self.course_level,
            'title': self.title,
            'description': self.description,
            'credits': self.credits,
            'institution': self.institution,
            'department': self.department,
            'prerequisites': self.prerequisites,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def sync_composite_fields(self):
        """
        Ensure that composite fields (subject_code, course_number,
        course_number_numeric, course_level) and the legacy code field are
        all kept consistent.  This should be called whenever `code`,
        `subject_code` or `course_number` are changed.
        """
        # If subject_code/course_number are not set but code is, derive them
        if (not self.subject_code or not self.course_number) and self.code:
            subj, num = self._split_code(self.code)
            self.subject_code = subj
            self.course_number = num
        # If subject_code and course_number are set, rebuild code
        if self.subject_code:
            num_part = self.course_number or ''
            # Join with a space only if both parts exist
            self.code = f"{self.subject_code} {num_part}".strip()
        # Calculate numeric and level
        numeric = self._extract_numeric(self.course_number)
        self.course_number_numeric = numeric
        self.course_level = self._calculate_level(numeric)

    def validate(self) -> list[str]:
        """
        Validate required fields.  Ensures that subject_code and
        course_number are derived correctly.  Returns a list of error
        messages if validation fails.

        This method should be called before committing a Course to the
        database or returning it to the client.  It synchronises the
        composite fields from the legacy code if necessary and then
        checks for missing or invalid data.
        """
        # Synchronize composite fields before validation so that any
        # user‑supplied `code` is parsed.  This allows validation to
        # operate on normalised attributes.
        self.sync_composite_fields()
        errors: list[str] = []
        # Subject and course number are required
        if not self.subject_code or len(self.subject_code.strip()) == 0:
            errors.append("Course subject is required")
        if not self.course_number or len(self.course_number.strip()) == 0:
            errors.append("Course number is required")
        # Title and institution are required
        if not self.title or len(self.title.strip()) == 0:
            errors.append("Course title is required")
        if not self.institution or len(self.institution.strip()) == 0:
            errors.append("Institution is required")
        # Credits must be positive
        if self.credits is None or self.credits <= -1:
            errors.append("Credits must be a positive number")
        return errors

# Automatically synchronise composite fields before inserting or updating.
from sqlalchemy import event


@event.listens_for(Course, 'before_insert')
def _before_insert(mapper, connection, target):
    """
    SQLAlchemy event listener that ensures the composite fields are kept
    in sync before a new Course row is inserted.  Without this
    callback, subject_code and course_number would remain unset when
    creating a Course using only the legacy `code` field.
    """
    if isinstance(target, Course):
        target.sync_composite_fields()


@event.listens_for(Course, 'before_update')
def _before_update(mapper, connection, target):
    """
    SQLAlchemy event listener that ensures the composite fields are kept
    in sync before an existing Course row is updated.
    """
    if isinstance(target, Course):
        target.sync_composite_fields()

    # Note: do not define methods within this listener; see the Course class for validation logic.