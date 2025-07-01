# Course Equivalency Finder

A comprehensive web application for managing and discovering course equivalencies between educational institutions, with advanced plan generation and sharing capabilities.

## 🎯 Project Overview

The Course Equivalency Finder is a full-stack web application designed to help students, academic advisors, and educational institutions manage course transfer equivalencies. The system allows users to browse course catalogs, discover equivalent courses across institutions, and create shareable transfer plans with unique access codes.

## 🏗️ System Architecture

### Backend Architecture (Flask)
- **Framework**: Flask with CORS support
- **Database**: SQLite with relational design
- **Data Storage**: Normalized database with foreign key constraints
- **File Processing**: CSV import functionality with robust error handling
- **Plan Management**: Unique code generation with automatic expiration

### Frontend Architecture (React + Vite)
- **Framework**: React 18 with functional components and hooks
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: Local component state with useState and useEffect
- **API Communication**: Axios for HTTP requests
- **UI Pattern**: Single-page application with component-based navigation
- **Styling**: Inline CSS with responsive design principles
- **Asset Management**: Vite-based static asset handling

## 📊 Database Schema

### Core Tables

#### Institution
```sql
CREATE TABLE Institution (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);
```

#### Department
```sql
CREATE TABLE Department (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    institution_id INTEGER NOT NULL,
    FOREIGN KEY (institution_id) REFERENCES Institution (id),
    UNIQUE(name, institution_id)
);
```

#### Course
```sql
CREATE TABLE Course (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    department_id INTEGER NOT NULL,
    institution_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES Department (id),
    FOREIGN KEY (institution_id) REFERENCES Institution (id),
    UNIQUE(code, department_id, institution_id)
);
```

#### CourseEquivalency
```sql
CREATE TABLE CourseEquivalency (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_course_id INTEGER NOT NULL,
    target_course_id INTEGER NOT NULL,
    FOREIGN KEY (source_course_id) REFERENCES Course (id),
    FOREIGN KEY (target_course_id) REFERENCES Course (id),
    UNIQUE(source_course_id, target_course_id)
);
```

#### TransferPlan
```sql
CREATE TABLE TransferPlan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    plan_name TEXT NOT NULL,
    source_institution_id INTEGER NOT NULL,
    target_institution_id INTEGER NOT NULL,
    selected_courses TEXT NOT NULL,
    plan_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_institution_id) REFERENCES Institution (id),
    FOREIGN KEY (target_institution_id) REFERENCES Institution (id)
);
```

## 🔗 API Endpoints

### Data Retrieval Endpoints

#### `GET /api/institutions`
- **Purpose**: Retrieve all institutions with automatic cleanup of expired plans
- **Response**: Array of institution objects
- **Features**: Alphabetically sorted results

#### `GET /api/departments?institution_id={id}`
- **Purpose**: Get departments for a specific institution
- **Parameters**: `institution_id` (required)
- **Response**: Array of department objects

#### `GET /api/courses?department_id={id}`
- **Purpose**: Get courses for a specific department
- **Parameters**: `department_id` (required)
- **Response**: Array of course objects sorted by course code

#### `GET /api/equivalents?course_id={id}`
- **Purpose**: Find equivalent courses using bidirectional search
- **Parameters**: `course_id` (required)
- **Response**: Array of equivalent courses with institution and department details
- **Algorithm**: UNION query to find both source→target and target→source relationships

### Plan Management Endpoints

#### `POST /api/create-plan`
- **Purpose**: Create a new transfer plan with unique code generation
- **Request Body**:
  ```json
  {
    "plan_name": "string",
    "source_institution_id": "integer",
    "target_institution_id": "integer",
    "selected_courses": ["array of course IDs"],
    "additional_data": "object"
  }
  ```
- **Response**: Plan code and success confirmation
- **Features**: 
  - 8-character alphanumeric code generation
  - Collision detection and regeneration
  - JSON serialization of course data

#### `GET /api/get-plan/{plan_code}`
- **Purpose**: Retrieve complete plan details by code
- **Parameters**: `plan_code` (case-insensitive)
- **Response**: Full plan object with expanded course details
- **Error Handling**: 404 for non-existent plans

#### `PUT /api/update-plan/{plan_code}`
- **Purpose**: Update existing plan while preserving the original code
- **Parameters**: `plan_code` (case-insensitive)
- **Request Body**: Same format as create-plan
- **Features**: Validates plan existence before updates

#### `DELETE /api/delete-plan/{plan_code}`
- **Purpose**: Permanently delete a transfer plan
- **Parameters**: `plan_code` (case-insensitive)
- **Response**: Success confirmation
- **Security**: No authentication required (code-based access)

#### `POST /api/search-equivalents`
- **Purpose**: Batch search for multiple course equivalents
- **Request Body**: `{"course_ids": ["array of IDs"]}`
- **Response**: Object mapping course IDs to their equivalents
- **Use Case**: Efficient bulk operations for plan analysis

### Data Import Endpoint

#### `POST /api/import`
- **Purpose**: Bulk import course equivalencies from CSV
- **Request**: Multipart form data with CSV file
- **CSV Format**:
  ```csv
  source_institution,source_department,source_code,source_title,target_institution,target_department,target_code,target_title
  ```
- **Features**:
  - Enhanced duplicate handling with `get_or_create` pattern
  - Row-by-row error tracking and reporting
  - Comprehensive validation and detailed error messages
  - Transaction-based processing for data integrity
  - Graceful handling of UNIQUE constraint violations

## 🎨 Frontend Components

### Component Architecture

The application uses a modular component structure for maintainability:

1. **App.jsx** (Root Component)
   - State management hub
   - API communication layer
   - Route coordination
   - Logo display with fallback system

2. **Navigation.jsx**
   - View switching interface
   - Edit mode indicators
   - Plan code search functionality

3. **BrowseView.jsx**
   - Hierarchical institution/department/course tree
   - Course selection interface
   - Equivalent course display with action buttons

4. **CreatePlanView.jsx**
   - Form-based plan creation
   - Institution selection dropdowns
   - Course review and management interface

5. **EditPlanView.jsx**
   - Plan modification interface
   - Change detection and confirmation
   - Preserve-code update functionality

6. **ViewPlanView.jsx**
   - Plan detail display
   - Course list with metadata
   - Plan management actions

7. **ImportSection.jsx**
   - CSV file upload interface
   - Import progress feedback

### State Management Architecture

```javascript
// Core browsing state
const [institutions, setInstitutions] = useState([]);
const [departments, setDepartments] = useState([]);
const [courses, setCourses] = useState([]);
const [equivalents, setEquivalents] = useState([]);

// Navigation state
const [expandedInstitution, setExpandedInstitution] = useState(null);
const [expandedDepartment, setExpandedDepartment] = useState(null);
const [selectedCourse, setSelectedCourse] = useState(null);

// Plan management state
const [selectedCourses, setSelectedCourses] = useState([]);
const [planName, setPlanName] = useState('');
const [currentView, setCurrentView] = useState('browse');
const [isEditMode, setIsEditMode] = useState(false);
```

### User Interface Features

#### Institutional Branding
- **Dual Logo Display**: Configurable logos for partner institutions
- **Asset Management**: Logos stored in `src/assets/` with import-based loading
- **Fallback System**: Colored text badges when logos fail to load
- **Responsive Design**: Logos scale appropriately on mobile devices

#### User Interaction Patterns

**Course Discovery Flow**
1. User expands institution to view departments
2. User expands department to view courses
3. User clicks course to view equivalents
4. User adds equivalent courses to plan using action buttons

**Plan Creation Flow**
1. User accumulates courses in selection state
2. User navigates to "Create Plan" view
3. User fills plan metadata (name, institutions)
4. System generates unique 8-character code
5. User receives shareable plan code

**Plan Editing Flow**
1. User loads existing plan by code
2. User enters edit mode with visual indicators
3. User modifies plan details and course selection
4. System detects changes and prompts for confirmation
5. Updated plan retains original access code

## 🔧 Technical Implementation Details

### Enhanced CSV Import System
```python
def get_or_create(table, fields, values):
    """Get existing record or create new one, handling duplicates gracefully"""
    # Query for existing record
    # Attempt insert with error handling
    # Handle UNIQUE constraint failures
    # Return ID for relationship building
```
- **Robust Duplicate Handling**: Try-insert-then-find pattern
- **Detailed Error Reporting**: Row-by-row error tracking
- **Comprehensive Validation**: Required field checking
- **Graceful Degradation**: Processes valid rows even when some fail

### Plan Management System
```python
def generate_plan_code():
    """Generate a unique 8-character alphanumeric code"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
```
- **Cryptographically Secure**: Uses `secrets` module for randomization
- **Collision Detection**: Automatic regeneration for duplicate codes
- **Case Insensitive**: User-friendly code lookup
- **Automatic Expiration**: 365-day retention policy

### Edit Mode Implementation
- **Change Detection**: Comprehensive comparison of form state
- **Visual Indicators**: Clear UI feedback for editing mode
- **Code Preservation**: Updates maintain original plan codes
- **Confirmation Dialogs**: Prevents accidental data loss

## 🚀 Deployment Instructions

### Backend Setup
```bash
# Install dependencies
pip install flask flask-cors

# Run development server (database auto-initializes)
python course_equiv_backend.py
```

### Frontend Setup (Vite)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Configuration

#### Vite Configuration (`vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

#### File Structure
```
project/
├── course_equiv_backend.py    # Flask backend
├── vite.config.js            # Vite configuration
├── index.html                # Entry point (root level)
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Main component
│   ├── assets/               # Logo files
│   │   ├── delgado-logo.png
│   │   └── uno-logo.png
│   └── components/           # React components
│       ├── Navigation.jsx
│       ├── BrowseView.jsx
│       ├── CreatePlanView.jsx
│       ├── EditPlanView.jsx
│       ├── ViewPlanView.jsx
│       └── ImportSection.jsx
└── package.json
```

### Production Considerations
- Configure CORS for production domains
- Implement database connection pooling
- Add authentication for administrative functions
- Set up automated database backups
- Configure logging and monitoring

## 📱 Mobile Compatibility

### Testing Methods
- **Browser DevTools**: Chrome/Firefox responsive design mode
- **Network Access**: Configure Vite host for local network testing
- **Touch Optimization**: Minimum 44px touch targets
- **Responsive Layout**: Flexible container sizing

### Mobile Optimizations
- Logo scaling for smaller screens
- Touch-friendly navigation elements
- Readable text sizing
- Optimized form layouts

## 🔒 Security Features

### Data Validation
- Required field validation on all endpoints
- SQL injection prevention through parameterized queries
- File upload validation for CSV imports
- Input sanitization and trimming

### Plan Security
- Cryptographically secure code generation
- No personal information required for plan access
- Automatic expiration prevents indefinite storage
- Case-insensitive code lookup for usability

## 📈 Performance Characteristics

### Database Performance
- Indexed foreign key relationships
- Efficient UNION queries for equivalency search
- Automatic cleanup prevents table bloat
- SQLite suitable for moderate concurrent users

### Frontend Performance
- **Vite Benefits**: Fast HMR and optimized builds
- **Lazy Loading**: Hierarchical data loading on demand
- **Efficient State Updates**: Proper dependency arrays
- **Asset Optimization**: Vite's automatic asset processing

## 🧪 Database Visualization

The application includes SQLite database files that can be explored using:
- **DB Browser for SQLite** (recommended)
- **VS Code SQLite extensions**
- **Command line SQLite tools**
- **Online SQLite viewers**

Example queries for data exploration:
```sql
-- View all course equivalencies with details
SELECT 
    s_course.code as source_code,
    s_course.title as source_title,
    s_inst.name as source_school,
    t_course.code as target_code,
    t_course.title as target_title,
    t_inst.name as target_school
FROM CourseEquivalency e
JOIN Course s_course ON s_course.id = e.source_course_id
JOIN Course t_course ON t_course.id = e.target_course_id
JOIN Institution s_inst ON s_inst.id = s_course.institution_id
JOIN Institution t_inst ON t_inst.id = t_course.institution_id;
```

## 🚀 Next Steps: Production Deployment

### Self-Hosted Server Deployment with Nginx + WSGI

#### Prerequisites
- Linux server (Ubuntu 20.04+ or CentOS 8+)
- Root or sudo access
- Domain name (optional but recommended)

#### 1. Server Preparation

**Update system and install dependencies:**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv nginx supervisor git -y

# For CentOS/RHEL
sudo yum update -y
sudo yum install python3 python3-pip nginx supervisor git -y
```

**Create application user:**
```bash
sudo useradd --system --shell /bin/bash --home /var/www/course-equiv courseequiv
sudo mkdir -p /var/www/course-equiv
sudo chown courseequiv:courseequiv /var/www/course-equiv
```

#### 2. Application Setup

**Clone and prepare application:**
```bash
sudo -u courseequiv git clone https://github.com/yourusername/course-equiv-finder.git /var/www/course-equiv
cd /var/www/course-equiv

# Create Python virtual environment
sudo -u courseequiv python3 -m venv venv
sudo -u courseequiv ./venv/bin/pip install --upgrade pip

# Install Python dependencies
sudo -u courseequiv ./venv/bin/pip install flask flask-cors gunicorn
```

**Build frontend:**
```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Build React application
sudo -u courseequiv npm install
sudo -u courseequiv npm run build
```

#### 3. WSGI Configuration

**Create WSGI entry point (`wsgi.py`):**
```python
#!/usr/bin/env python3
import sys
import os

# Add the application directory to Python path
sys.path.insert(0, '/var/www/course-equiv')

# Import the Flask application
from course_equiv_backend import app

if __name__ == "__main__":
    app.run()
```

**Create Gunicorn configuration (`gunicorn.conf.py`):**
```python
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
```

#### 4. Supervisor Configuration

**Create supervisor configuration (`/etc/supervisor/conf.d/courseequiv.conf`):**
```ini
[program:courseequiv]
command=/var/www/course-equiv/venv/bin/gunicorn --config /var/www/course-equiv/gunicorn.conf.py wsgi:app
directory=/var/www/course-equiv
user=courseequiv
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/courseequiv.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5
environment=PYTHONPATH="/var/www/course-equiv"
```

**Start supervisor service:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start courseequiv
sudo supervisorctl status courseequiv
```

#### 5. Nginx Configuration

**Create Nginx site configuration (`/etc/nginx/sites-available/courseequiv`):**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your domain
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Serve static frontend files
    location / {
        root /var/www/course-equiv/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Proxy API requests to Flask backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for API
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # Security: Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~* \.(conf|db)$ {
        deny all;
    }
}
```

**Enable site and restart Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/courseequiv /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### 6. SSL/HTTPS Setup with Let's Encrypt

**Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

**Obtain SSL certificate:**
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

**Auto-renewal setup:**
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

#### 7. Database Management

**Create production database setup script (`setup_production.py`):**
```python
import sqlite3
import os
from datetime import datetime

def setup_production_db():
    db_path = '/var/www/course-equiv/database.db'
    
    # Ensure proper permissions
    if os.path.exists(db_path):
        os.chmod(db_path, 0o664)
    
    conn = sqlite3.connect(db_path)
    # Database initialization will happen automatically through Flask app
    conn.close()
    
    # Set proper ownership
    os.chown(db_path, pwd.getpwnam('courseequiv').pw_uid, grp.getgrnam('courseequiv').gr_gid)

if __name__ == '__main__':
    setup_production_db()
```

**Setup database permissions:**
```bash
sudo -u courseequiv python3 setup_production.py
sudo chmod 664 /var/www/course-equiv/database.db
sudo chown courseequiv:www-data /var/www/course-equiv/database.db
```

#### 8. Backup Strategy

**Create backup script (`/usr/local/bin/backup-courseequiv.sh`):**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/courseequiv"
DB_PATH="/var/www/course-equiv/database.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
sqlite3 $DB_PATH ".backup '$BACKUP_DIR/database_$DATE.db'"

# Compress and keep only last 30 days
gzip $BACKUP_DIR/database_$DATE.db
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

**Setup automated backups:**
```bash
sudo chmod +x /usr/local/bin/backup-courseequiv.sh
sudo crontab -e
# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-courseequiv.sh
```

#### 9. Monitoring and Logging

**Configure log rotation (`/etc/logrotate.d/courseequiv`):**
```
/var/log/courseequiv.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 courseequiv courseequiv
    postrotate
        supervisorctl restart courseequiv
    endscript
}
```

**Basic monitoring script (`/usr/local/bin/check-courseequiv.sh`):**
```bash
#!/bin/bash
if ! curl -f http://localhost:8000/api/institutions > /dev/null 2>&1; then
    echo "Course Equiv API is down!" | mail -s "Service Alert" admin@your-domain.com
    supervisorctl restart courseequiv
fi
```

#### 10. Firewall Configuration

**Setup UFW firewall:**
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

#### 11. Production Environment Variables

**Create environment configuration (`.env`):**
```bash
FLASK_ENV=production
FLASK_DEBUG=False
DATABASE_URL=/var/www/course-equiv/database.db
SECRET_KEY=your-secret-key-here
```

**Update Flask app to use environment variables:**
```python
import os
from dotenv import load_dotenv

load_dotenv()

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-key')
app.config['DEBUG'] = False
```

#### 12. Deployment Checklist

- [ ] Server hardened with SSH keys and disabled password auth
- [ ] Firewall configured with minimal required ports
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Database backed up and permissions set correctly
- [ ] Application running under non-root user
- [ ] Logs configured with rotation
- [ ] Monitoring script checking service health
- [ ] Error pages customized (500, 404, etc.)
- [ ] CORS configured for production domain only
- [ ] Static file caching enabled
- [ ] Gzip compression enabled in Nginx

#### 13. Performance Optimization

**Nginx performance tuning:**
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/javascript;

client_max_body_size 10M;  # For CSV uploads
```

**Database optimization:**
```sql
-- Add indexes for better performance
CREATE INDEX idx_course_dept ON Course(department_id);
CREATE INDEX idx_course_inst ON Course(institution_id);
CREATE INDEX idx_equiv_source ON CourseEquivalency(source_course_id);
CREATE INDEX idx_equiv_target ON CourseEquivalency(target_course_id);
```

This production deployment setup provides a robust, scalable foundation for hosting the Course Equivalency Finder with proper security, monitoring, and backup procedures.

## 📋 Future Enhancement Opportunities

### Technical Enhancements
- Database migration to PostgreSQL for production
- Redis caching for frequently accessed data
- GraphQL API for flexible data fetching
- Real-time updates with WebSocket connections

### Feature Enhancements
- User accounts and plan ownership
- Plan collaboration and sharing
- Advanced search and filtering capabilities
- Export functionality for plan data
- Integration with institutional APIs
- Dark mode toggle
- Advanced mobile optimizations

### Analytics & Monitoring
- Usage analytics for popular equivalencies
- Performance monitoring and alerting
- Audit logging for data changes
- Plan usage statistics and trends

---

## 📦 Dependencies

### Backend Dependencies
```
Flask==3.1.1
flask-cors==6.0.1
```

### Frontend Dependencies
```json
{
  "dependencies": {
    "axios": "^1.10.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.4"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

This application demonstrates modern full-stack development practices with emphasis on data integrity, user experience, maintainable architecture, and robust error handling.