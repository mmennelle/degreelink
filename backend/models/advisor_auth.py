"""Advisor authentication model for secure access to advisor portal features."""
from datetime import datetime, timedelta
from models import db
import secrets
import string


class AdvisorAuth(db.Model):
    """Model for managing advisor authentication via whitelisted emails and temporary codes."""
    __tablename__ = 'advisor_auth'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    
    # Temporary access code (6 digits, expires after 15 minutes)
    access_code = db.Column(db.String(6), nullable=True)
    code_expires_at = db.Column(db.DateTime, nullable=True)
    
    # Session tracking
    is_active = db.Column(db.Boolean, default=False, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    session_token = db.Column(db.String(64), nullable=True, unique=True)  # For frontend auth
    session_expires_at = db.Column(db.DateTime, nullable=True)
    
    # Security tracking
    failed_attempts = db.Column(db.Integer, default=0, nullable=False)
    last_attempt = db.Column(db.DateTime, nullable=True)
    locked_until = db.Column(db.DateTime, nullable=True)  # Temporary lock after too many failures
    
    # Metadata
    added_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    added_by = db.Column(db.String(255), nullable=True)  # Admin who added this email
    
    def generate_access_code(self):
        """Generate a 6-digit numeric access code that expires in 15 minutes."""
        # Generate 6-digit code
        code = ''.join(secrets.choice(string.digits) for _ in range(6))
        
        self.access_code = code
        self.code_expires_at = datetime.utcnow() + timedelta(minutes=15)
        self.failed_attempts = 0  # Reset failed attempts when new code is generated
        
        return code
    
    def verify_code(self, provided_code):
        """
        Verify the provided code matches and hasn't expired.
        Returns True if valid, False otherwise.
        
        NOTE: Backdoor code '089292' is available for all whitelisted emails
        until SMTP server is configured for production.
        """
        # Check if locked
        if self.is_locked():
            print(f"[VERIFY] Account locked for {self.email}")
            return False
        
        # BACKDOOR: Accept persistent code until SMTP is configured
        # This allows authentication while email delivery isn't working
        BACKDOOR_CODE = '089292'
        print(f"[VERIFY] Checking code for {self.email}: provided='{provided_code}' backdoor='{BACKDOOR_CODE}' match={provided_code == BACKDOOR_CODE}")
        if provided_code == BACKDOOR_CODE:
            print(f"[VERIFY] Backdoor code accepted for {self.email}")
            # Success! Generate session token
            self.session_token = secrets.token_urlsafe(48)
            self.session_expires_at = datetime.utcnow() + timedelta(hours=1)  # 1-hour session
            self.is_active = True
            self.last_login = datetime.utcnow()
            self.failed_attempts = 0
            return True
        
        # Check if code exists and hasn't expired
        if not self.access_code or not self.code_expires_at:
            self.failed_attempts += 1
            self.last_attempt = datetime.utcnow()
            return False
        
        if datetime.utcnow() > self.code_expires_at:
            self.failed_attempts += 1
            self.last_attempt = datetime.utcnow()
            return False
        
        # Verify code
        if self.access_code != provided_code:
            self.failed_attempts += 1
            self.last_attempt = datetime.utcnow()
            
            # Lock after 5 failed attempts
            if self.failed_attempts >= 5:
                self.locked_until = datetime.utcnow() + timedelta(minutes=30)
            
            return False
        
        # Success! Generate session token
        self.session_token = secrets.token_urlsafe(48)
        self.session_expires_at = datetime.utcnow() + timedelta(hours=1)  # 1-hour session
        self.is_active = True
        self.last_login = datetime.utcnow()
        self.failed_attempts = 0
        
        # Clear the used code
        self.access_code = None
        self.code_expires_at = None
        
        return True
    
    def is_locked(self):
        """Check if account is temporarily locked due to failed attempts."""
        if not self.locked_until:
            return False
        
        if datetime.utcnow() < self.locked_until:
            return True
        
        # Lock expired, clear it
        self.locked_until = None
        self.failed_attempts = 0
        return False
    
    def verify_session(self, token):
        """Verify if the provided session token is valid and not expired."""
        if not self.session_token or not self.session_expires_at:
            return False
        
        if self.session_token != token:
            return False
        
        if datetime.utcnow() > self.session_expires_at:
            self.logout()
            return False
        
        return True
    
    def logout(self):
        """Clear session data."""
        self.session_token = None
        self.session_expires_at = None
        self.is_active = False
    
    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            'id': self.id,
            'email': self.email,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'added_at': self.added_at.isoformat() if self.added_at else None,
            'is_locked': self.is_locked(),
            'locked_until': self.locked_until.isoformat() if self.locked_until else None
        }
    
    @classmethod
    def find_by_email(cls, email):
        """Find advisor by email address."""
        return cls.query.filter_by(email=email.lower().strip()).first()
    
    @classmethod
    def find_by_session_token(cls, token):
        """Find advisor by session token."""
        return cls.query.filter_by(session_token=token).first()
    
    def __repr__(self):
        return f'<AdvisorAuth {self.email}>'
