import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download, Settings } from 'lucide-react';
import api from '../services/api';
import UploadConfirmationModal from './UploadConfirmationModal';
import ProgramRequirementsEditModal from './ProgramRequirementsEditModal';

const CSVUpload = () => {
  const [uploadType, setUploadType] = useState('courses');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Preview and confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [editingSemester, setEditingSemester] = useState(null);
  const [editingYear, setEditingYear] = useState(null);

  // Program versions state for requirements management
  const [programVersions, setProgramVersions] = useState([]);

  const loadProgramVersions = async () => {
    try {
      // Fetch all programs with all versions
      const progData = await api.getPrograms({ include_all: true });
      const programs = progData.programs || [];
      // For each program, fetch its version summaries
      const versionsList = await Promise.all(programs.map(async (p) => {
        try {
          const res = await api.getProgramVersions(p.id);
          return { program: p, versions: res.versions || [] };
        } catch {
          return { program: p, versions: [] };
        }
      }));
      setProgramVersions(versionsList);
    } catch (e) {
      console.error('Failed to load program versions', e);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadResult({ 
        error: 'Please upload a CSV file (.csv extension required)' 
      });
      return;
    }

    
    if (file.size > 10 * 1024 * 1024) {
      setUploadResult({ 
        error: 'File size too large. Please upload files smaller than 10MB.' 
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      // Show preview modal for all upload types
      let preview;
      switch (uploadType) {
        case 'requirements':
          preview = await api.previewRequirements(file);
          break;
        case 'courses':
          preview = await api.previewCourses(file);
          break;
        case 'equivalencies':
          preview = await api.previewEquivalencies(file);
          break;
        default:
          throw new Error('Invalid upload type');
      }
      
      setPreviewData(preview);
      setPendingFile(file);
      setShowConfirmModal(true);
      setUploading(false);
    } catch (error) {
      console.error('Preview failed:', error);
      setUploadResult({ error: error.message });
      setUploading(false);
    }
  };

  const handleConfirmUpload = async (editedData) => {
    if (!pendingFile) return;

    setShowConfirmModal(false);
    setUploading(true);
    setUploadResult(null);

    try {
      // Upload based on type
      // Note: editedData parameter available for future enhancement
      let result;
      switch (uploadType) {
        case 'requirements':
          result = await api.uploadRequirements(pendingFile);
          // Refresh program versions after requirements upload
          await loadProgramVersions();
          break;
        case 'courses':
          result = await api.uploadCourses(pendingFile);
          break;
        case 'equivalencies':
          result = await api.uploadEquivalencies(pendingFile);
          break;
        default:
          throw new Error('Invalid upload type');
      }
      
      setUploadResult(result);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({ error: error.message });
    } finally {
      setUploading(false);
      setPendingFile(null);
      setPreviewData(null);
    }
  };

  const handleCancelUpload = () => {
    setShowConfirmModal(false);
    setPendingFile(null);
    setPreviewData(null);
    setUploading(false);
  };

  const handleEditRequirements = (program, semester, year) => {
    setEditingProgram(program);
    setEditingSemester(semester);
    setEditingYear(year);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProgram(null);
    setEditingSemester(null);
    setEditingYear(null);
  };

  const handleSaveEditModal = async () => {
    // Reload program versions after save
    await loadProgramVersions();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
    
    event.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const downloadSampleCSV = (type) => {
    let csvContent, filename;
    
    if (type === 'courses') {
      csvContent = `code,title,description,credits,institution,department,prerequisites,has_lab,course_type
"BIOL 101","Introduction to Biology","Fundamental principles of biology including cell structure, genetics, and evolution.",4,"Community College","Biology","",false,lecture
"BIOL 102L","Biology Lab","Laboratory component for BIOL 101.",1,"Community College","Biology","BIOL 101",true,lab_only
"MATH 151","Calculus I","Limits, derivatives, and applications of differential calculus.",4,"Community College","Mathematics","MATH 141",false,lecture
"CHEM 111","General Chemistry I","Introduction to chemical principles and laboratory techniques.",4,"Community College","Chemistry","MATH 120",true,lecture_lab
"ENG 101","English Composition I","Introduction to academic writing and critical thinking.",3,"Community College","English","",false,lecture
"HIST 101","World History I","Survey of world civilizations from ancient times to 1500.",3,"Community College","History","",false,lecture`;
      filename = 'sample_courses.csv';
    } else if (type === 'equivalencies') {
      csvContent = `from_course_code,from_institution,to_course_code,to_institution,equivalency_type,notes,approved_by
"BIOL 101","Community College","BIO 1010","State University","direct","Direct transfer equivalency","Dr. Smith"
"MATH 151","Community College","MATH 1210","State University","direct","Same content and credit hours","Dr. Johnson"
"ENG 101","Community College","ENGL 1010","State University","direct","Meets composition requirement","Dr. Williams"
"HIST 101","Community College","HIST 1700","State University","partial","Covers similar content but different time periods","Dr. Brown"
"CHEM 111","Community College","CHEM 1210","State University","direct","Laboratory component included","Dr. Davis"`;
      filename = 'sample_equivalencies.csv';
    } else if (type === 'requirements') {
      // Updated unified format with new requirement type semantics
      csvContent = `program_name,category,requirement_type,semester,year,is_current,group_name,course_code,institution,is_preferred,constraint_type,description,min_credits,max_credits,min_level,min_courses,max_courses,tag,tag_value,scope_subject_codes
"Biology B.S.","Biology Electives",simple,Fall,2025,true,"Elective Options",BIOS 301,"State University",false,credits,"Simple: Choose any 15 credits from this pool",15,,,,,,,
"Biology B.S.","Biology Electives",simple,Fall,2025,true,"Elective Options",BIOS 302,"State University",false,,,,,,,,,,
"Biology B.S.","Biology Electives",simple,Fall,2025,true,"Elective Options",BIOS 303,"State University",true,,,,,,,,,,
"Biology B.S.","Biology Electives",simple,Fall,2025,true,"Elective Options",BIOS 401,"State University",false,,,,,,,,,,
"Biology B.S.","Biology Electives",simple,Fall,2025,true,"Elective Options",BIOS 402,"State University",false,,,,,,,,,,
"Biology B.S.","Core Major Requirements",grouped,Fall,2025,true,"Required Theory",BIOS 101,"State University",false,courses,"Grouped: Must complete ALL groups - 2 courses from Theory",,,,,2,,,,
"Biology B.S.","Core Major Requirements",grouped,Fall,2025,true,"Required Theory",BIOS 201,"State University",true,,,,,,,,,,
"Biology B.S.","Core Major Requirements",grouped,Fall,2025,true,"Required Theory",BIOS 301,"State University",false,,,,,,,,,,
"Biology B.S.","Core Major Requirements",grouped,Fall,2025,true,"Required Labs",BIOS 102L,"State University",false,courses,"Grouped: AND 2 lab courses from Labs",,,,,2,,,,
"Biology B.S.","Core Major Requirements",grouped,Fall,2025,true,"Required Labs",BIOS 202L,"State University",false,,,,,,,,,,
"Biology B.S.","Core Major Requirements",grouped,Fall,2025,true,"Required Labs",BIOS 302L,"State University",true,,,,,,,,,,
"Biology B.S.","Core Major Requirements",grouped,Fall,2025,true,"Advanced Courses",BIOS 401,"State University",false,min_courses_at_level,"Grouped: AND 3 courses at 4000 level",,,4000,3,,,,"BIOS"
"Biology B.S.","Core Major Requirements",grouped,Fall,2025,true,"Advanced Courses",BIOS 402,"State University",true,,,,,,,,,,
"Biology B.S.","Core Major Requirements",grouped,Fall,2025,true,"Advanced Courses",BIOS 405,"State University",false,,,,,,,,,,
"Biology B.S.","Core Major Requirements",grouped,Fall,2025,true,"Advanced Courses",BIOS 410,"State University",false,,,,,,,,,,`;
      filename = 'sample_program_requirements.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getUploadInstructions = () => {
    if (uploadType === 'courses') {
      return {
        title: 'Course Upload Instructions',
        description: 'Upload a CSV file containing course information',
        columns: [
          { name: 'code', description: 'Course code (e.g., "BIOL 101")', required: true },
          { name: 'title', description: 'Course title', required: true },
          { name: 'credits', description: 'Number of credits (integer)', required: true },
          { name: 'institution', description: 'Institution name', required: true },
          { name: 'description', description: 'Course description', required: false },
          { name: 'department', description: 'Department name', required: false },
          { name: 'prerequisites', description: 'Prerequisites (if any)', required: false },
          { name: 'has_lab', description: 'Has lab component? (true/false)', required: false },
          { name: 'course_type', description: 'Type: lecture, lecture_lab, lab_only, research, seminar, independent_study', required: false }
        ]
      };
    } else if (uploadType === 'equivalencies') {
      return {
        title: 'Equivalency Upload Instructions',
        description: 'Upload a CSV file containing course equivalency mappings',
        columns: [
          { name: 'from_course_code', description: 'Source course code', required: true },
          { name: 'from_institution', description: 'Source institution', required: true },
          { name: 'to_course_code', description: 'Target course code', required: true },
          { name: 'to_institution', description: 'Target institution', required: true },
          { name: 'equivalency_type', description: 'Type: direct, partial, conditional', required: false },
          { name: 'notes', description: 'Additional notes', required: false },
          { name: 'approved_by', description: 'Approving authority', required: false }
        ]
      };
    } else if (uploadType === 'requirements') {
      return {
        title: 'Program Requirements Upload Instructions (Unified Format)',
        description: 'Upload CSV with requirements and optional constraints. SIMPLE = pool of courses (choose any to meet credits). GROUPED = subdivided pools (must satisfy ALL groups). Prerequisites are handled at the course level.',
        columns: [
          { name: 'program_name', description: 'Name of the program (e.g., "Biology B.S.")', required: true },
          { name: 'category', description: 'Requirement category (e.g., "Biology Electives")', required: true },
          { name: 'requirement_type', description: 'Type: simple (pool) or grouped (all groups required)', required: true },
          { name: 'semester', description: 'Academic semester (Fall, Spring, Summer)', required: true },
          { name: 'year', description: 'Academic year (e.g., 2025)', required: true },
          { name: 'is_current', description: 'Is this the current version? (true/false)', required: true },
          { name: 'group_name', description: 'Group name for organizing course options', required: false },
          { name: 'course_code', description: 'Course code (e.g., "BIOS 301")', required: false },
          { name: 'institution', description: 'Institution offering the course', required: false },
          { name: 'is_preferred', description: 'Mark as preferred option (true/false)', required: false },
          { name: 'constraint_type', description: 'Optional constraint: credits, courses, min_courses_at_level, min_tag_courses, max_tag_credits', required: false },
          { name: 'description', description: 'Human-readable constraint description', required: false },
          { name: 'min_credits', description: 'Minimum credits required', required: false },
          { name: 'max_credits', description: 'Maximum credits allowed', required: false },
          { name: 'min_level', description: 'Minimum course level (e.g., 3000)', required: false },
          { name: 'min_courses', description: 'Minimum number of courses', required: false },
          { name: 'max_courses', description: 'Maximum number of courses', required: false },
          { name: 'tag', description: 'Tag field name (has_lab, course_type)', required: false },
          { name: 'tag_value', description: 'Required tag value (true, lab, research)', required: false },
          { name: 'scope_subject_codes', description: 'Limit to subjects (comma-separated: "BIOS,CHEM")', required: false }
        ]
      };
    }
  };

  const instructions = getUploadInstructions();

  const getUploadTypeIcon = () => {
    switch (uploadType) {
      case 'courses': return <FileText className="mr-2" size={20} />;
      case 'equivalencies': return <Upload className="mr-2" size={20} />;
      case 'requirements': return <Settings className="mr-2" size={20} />;
      default: return <Upload className="mr-2" size={20} />;
    }
  };

  const getSuccessMessage = () => {
    if (!uploadResult || uploadResult.error) return null;

    switch (uploadType) {
      case 'courses':
        return (
          <>
            <p>• <strong>{uploadResult.courses_created || 0}</strong> courses created</p>
            <p>• <strong>{uploadResult.courses_updated || 0}</strong> courses updated</p>
          </>
        );
      case 'equivalencies':
        return (
          <>
            <p>• <strong>{uploadResult.equivalencies_created || 0}</strong> equivalencies created</p>
            <p>• <strong>{uploadResult.equivalencies_updated || 0}</strong> equivalencies updated</p>
          </>
        );
      case 'requirements':
        return (
          <>
            <p>• <strong>{uploadResult.requirements_created || 0}</strong> requirements created</p>
            <p>• <strong>{uploadResult.requirements_updated || 0}</strong> requirements updated</p>
            <p>• <strong>{uploadResult.groups_created || 0}</strong> requirement groups created</p>
            <p>• <strong>{uploadResult.options_created || 0}</strong> course options created</p>
            {uploadResult.constraints_created > 0 && (
              <p>• <strong>{uploadResult.constraints_created}</strong> constraints created</p>
            )}
          </>
        );
      default:
        return null;
    }
  };

  // Load program versions when component mounts or when uploadType switches to requirements
  useEffect(() => {
    if (uploadType === 'requirements') {
      loadProgramVersions();
    }
  }, [uploadType]);

  return (
    <div className="space-y-6">
      {/* Upload Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Upload className="mr-2" size={20} />
          CSV Upload
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Upload Type
          </label>
          <select
            value={uploadType}
            onChange={(e) => {
              setUploadType(e.target.value);
              setUploadResult(null); 
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="courses">Course Information</option>
            <option value="equivalencies">Course Equivalencies</option>
            <option value="requirements">Program Requirements & Constraints</option>
          </select>
          
          {/* Type Description */}
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {uploadType === 'courses' && '📚 Upload course catalog data with codes, titles, credits, and descriptions.'}
              {uploadType === 'equivalencies' && '🔗 Upload course transfer mappings between institutions.'}
              {uploadType === 'requirements' && '⚙️ Upload program requirements with two types: SIMPLE (pool of courses, choose any), GROUPED (multiple mandatory groups). Prerequisites are now handled at the course level.'}
            </p>
          </div>
        </div>

        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30' 
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 dark:bg-gray-700'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="space-y-4">
            <div className="mx-auto flex justify-center">
              {dragActive ? (
                <div className="h-12 w-12 text-blue-500">📁</div>
              ) : (
                <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            
            {uploading ? (
              <div className="space-y-2">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploading and processing...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Maximum file size: 10MB • Only .csv files accepted
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sample CSV Download */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => downloadSampleCSV(uploadType)}
            className="flex items-center px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="mr-2" size={16} />
            Download Sample {
              uploadType === 'courses' ? 'Courses' : 
              uploadType === 'equivalencies' ? 'Equivalencies' :
              'Requirements'
            } CSV
          </button>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className="mt-6">
            {uploadResult.error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="text-red-600 dark:text-red-400 mr-3 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">Upload Failed</h4>
                    <p className="text-sm text-red-700 dark:text-red-400">{uploadResult.error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-600 rounded-md">
                <div className="flex items-start">
                  <CheckCircle className="text-green-600 dark:text-green-400 mr-3 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Upload Successful!</h4>
                    <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
                      {getSuccessMessage()}
                      
                      {uploadResult.errors && uploadResult.errors.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-600 rounded">
                          <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                            ⚠️ {uploadResult.errors.length} errors encountered:
                          </p>
                          <div className="max-h-32 overflow-y-auto">
                            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                              {uploadResult.errors.slice(0, 10).map((error, index) => (
                                <li key={index} className="list-disc list-inside">{error}</li>
                              ))}
                              {uploadResult.errors.length > 10 && (
                                <li className="font-medium">
                                  ... and {uploadResult.errors.length - 10} more errors
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="mr-2" size={18} />
          {instructions.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">{instructions.description}</p>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200">Required CSV Columns:</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-600 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-600">
                    Column Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-600">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-600">
                    Required
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {instructions.columns.map((column, index) => {
                  let requiredLabel = 'Optional';
                  let requiredClass = 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
                  if (typeof column.required === 'function') {
                    requiredLabel = 'Required for grouped/conditional';
                    requiredClass = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
                  } else if (column.required === true) {
                    requiredLabel = 'Required';
                    requiredClass = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
                  }
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-200 border-r dark:border-gray-600">
                        {column.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-r dark:border-gray-600">
                        {column.description}
                      </td>
                      <td className="px-4 py-3 text-sm border-r dark:border-gray-600">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${requiredClass}`}>
                          {requiredLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Type Specific Tips */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600 rounded-md">
          <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">💡 Upload Tips:</h5>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Download the sample csv and input your course data into it ensuring that column requirements listed above are met.</li>
            <li>• Use double quotes around text values that contain commas. ""this is a "quote" line""</li>
            <li>• Keep one header row at the top of your file</li>
            
            
            {uploadType === 'courses' && (
              <>
                <li>• Credits must be zero or greater</li>
                <li>• Course codes should be unique within each institution</li>
              </>
            )}
            
            {uploadType === 'equivalencies' && (
              <>
                <li>• Upload courses first if they don't exist yet</li>
                <li>• Both source and target courses must exist in the database</li>
                <li>• Use exact course codes and institution names</li>
                <li>• Equivalency types: "direct", "partial", or "conditional"</li>
              </>
            )}
            
            {uploadType === 'requirements' && (
              <>
                <li>• <strong>SIMPLE</strong>: Pool of courses where students choose any to meet credit goal (e.g., "15 credits from biology electives")</li>
                <li>• <strong>GROUPED</strong>: Multiple mandatory groups - students must satisfy ALL groups (e.g., "2 from Theory AND 2 from Lab")</li>
                <li>• Prerequisites are now handled at the course level via the 'prerequisites' field in courses CSV</li>
                <li>• Programs must exist before uploading requirements</li>
                <li>• Include multiple rows for each course option in a group</li>
                <li>• Constraints are optional - specify on first row to apply rules</li>
                <li>• Constraint types: credits, courses, min_courses_at_level, min_tag_courses, max_tag_credits</li>
              </>
            )}
            
            {uploadType === 'constraints' && (
              <>
                <li>• Upload requirements first - constraints link to existing requirements</li>
                <li>• Program name and requirement category must match exactly</li>
                <li>• Only use constraints on "grouped" requirement types</li>
                <li>• Leave unused parameter columns empty (but include the comma)</li>
                <li>• Valid constraint types: min_level_credits, min_tag_courses, max_tag_credits, min_courses_at_level</li>
                <li>• Valid course_type values: lecture, lecture_lab, lab_only, research, seminar, independent_study</li>
              </>
            )}
          </ul>
        </div>

        {/* Requirements-Specific Examples */}
        {uploadType === 'requirements' && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-600 rounded-md">
            <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">📝 Requirement Type Examples:</h5>
            
            <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
              <div>
                <strong>SIMPLE Type (Pool - Choose Any):</strong>
                <code className="block mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs overflow-x-auto">
                  "Biology B.S.","Electives",simple,Fall,2025,true,"Elective Options",BIOS 301,"State U",false,credits,"Choose 15cr",15,,,,,,,
                  <br />
                  "Biology B.S.","Electives",simple,Fall,2025,true,"Elective Options",BIOS 302,"State U",false,,,,,,,,,,
                  <br />
                  "Biology B.S.","Electives",simple,Fall,2025,true,"Elective Options",BIOS 401,"State U",false,,,,,,,,,,
                </code>
                <p className="text-xs mt-1">Students can pick ANY courses from pool to reach 15 credits</p>
              </div>
              
              <div>
                <strong>GROUPED Type (Multiple Mandatory Groups):</strong>
                <code className="block mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs overflow-x-auto">
                  "Biology B.S.","Core",grouped,Fall,2025,true,"Theory",BIOS 101,"State U",false,courses,"2 from Theory",,,,,2,,,,
                  <br />
                  "Biology B.S.","Core",grouped,Fall,2025,true,"Theory",BIOS 201,"State U",false,,,,,,,,,,
                  <br />
                  "Biology B.S.","Core",grouped,Fall,2025,true,"Lab",BIOS 102L,"State U",false,courses,"AND 2 from Lab",,,,,2,,,,
                  <br />
                  "Biology B.S.","Core",grouped,Fall,2025,true,"Lab",BIOS 202L,"State U",false,,,,,,,,,,
                </code>
                <p className="text-xs mt-1">Students must complete 2 from Theory AND 2 from Lab (all groups required)</p>
              </div>
              
              <div>
                <strong>Prerequisites (Course-Level):</strong>
                <code className="block mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs overflow-x-auto">
                  Prerequisites are now specified in the courses CSV using the 'prerequisites' field.
                  <br />
                  Example: MATH 152 has "MATH 151" in prerequisites column
                  <br />
                  MATH 251 has "MATH 152" in prerequisites column
                </code>
                <p className="text-xs mt-1">Prerequisites are validated per-course, considering equivalencies across institutions</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Constraints-Specific Examples */}
        {uploadType === 'constraints' && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-600 rounded-md">
            <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">📝 Constraint CSV Examples:</h5>
            
            <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
              <div>
                <strong>Minimum Level Credits:</strong>
                <code className="block mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                  "Biology Major","BIOS Electives","min_level_credits","At least 10cr at 3000+",10,"",3000,"","","","","BIOS"
                </code>
                <p className="text-xs mt-1">Requires min_credits=10, min_level=3000, scope_subject_codes="BIOS"</p>
              </div>
              
              <div>
                <strong>Minimum Courses with Labs:</strong>
                <code className="block mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                  "Biology Major","BIOS Electives","min_tag_courses","At least 2 courses with labs","","","",2,"","has_lab",true,"BIOS"
                </code>
                <p className="text-xs mt-1">Requires min_courses=2, tag="has_lab", tag_value=true</p>
              </div>
              
              <div>
                <strong>Maximum Research Credits:</strong>
                <code className="block mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                  "Biology Major","BIOS Electives","max_tag_credits","Max 7cr research","",7,"","","","course_type","research",""
                </code>
                <p className="text-xs mt-1">Requires max_credits=7, tag="course_type", tag_value="research"</p>
              </div>
              
              <div>
                <strong>Minimum Courses at Level:</strong>
                <code className="block mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                  "Biology Major","Science Electives","min_courses_at_level","Min 3 courses at 4000+","","",4000,3,"","","",""
                </code>
                <p className="text-xs mt-1">Requires min_level=4000, min_courses=3</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Program Versions Management for Requirements */}
        {uploadType === 'requirements' && programVersions.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="mr-2" size={18} /> Manage Program Requirement Versions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              View and select which version of requirements should be active for each program.  Only the current version will be used in student plans and course search.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Program</th>
                    <th className="px-3 py-2 text-left font-medium">Semester</th>
                    <th className="px-3 py-2 text-left font-medium">Year</th>
                    <th className="px-3 py-2 text-left font-medium">Requirements</th>
                    <th className="px-3 py-2 text-left font-medium">Current?</th>
                    <th className="px-3 py-2 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {programVersions.map(({ program, versions }) => (
                    versions.map((v, idx) => (
                      <tr key={`${program.id}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {idx === 0 ? (
                          <td className="px-3 py-2 font-medium" rowSpan={versions.length}>
                            <button
                              onClick={() => handleEditRequirements(program, v.semester, v.year)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-left"
                              title="Click to edit requirements"
                            >
                              {program.name}
                            </button>
                          </td>
                        ) : null}
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleEditRequirements(program, v.semester, v.year)}
                            className="text-gray-900 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                            title="Click to edit this version"
                          >
                            {v.semester || 'N/A'}
                          </button>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleEditRequirements(program, v.semester, v.year)}
                            className="text-gray-900 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                            title="Click to edit this version"
                          >
                            {v.year || 'N/A'}
                          </button>
                        </td>
                        <td className="px-3 py-2">{v.requirement_count}</td>
                        <td className="px-3 py-2">
                          {v.is_current ? (
                            <span className="text-green-600 dark:text-green-400">Yes</span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">No</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {!v.is_current && (
                            <button
                              className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                              onClick={async () => {
                                try {
                                  await api.setCurrentVersion(program.id, v.semester, v.year);
                                  await loadProgramVersions();
                                } catch (e) {
                                  alert('Failed to set current version: ' + e.message);
                                }
                              }}
                            >
                              Set Current
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Upload History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Upload Activity</h3>
        <div className="text-center py-8 text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>Upload history will appear here after successful uploads</p>
          <p className="text-sm mt-1">Track your bulk import operations and results</p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <UploadConfirmationModal
          previewData={previewData}
          onConfirm={handleConfirmUpload}
          onCancel={handleCancelUpload}
          uploadType={uploadType}
        />
      )}

      {/* Edit Requirements Modal */}
      {showEditModal && editingProgram && (
        <ProgramRequirementsEditModal
          program={editingProgram}
          semester={editingSemester}
          year={editingYear}
          onClose={handleCloseEditModal}
          onSave={handleSaveEditModal}
        />
      )}
    </div>
  );
};

export default CSVUpload;