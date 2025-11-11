import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download, Settings } from 'lucide-react';
import api from '../services/api';

const CSVUpload = () => {
  const [uploadType, setUploadType] = useState('courses');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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
      let result;
      switch (uploadType) {
        case 'courses':
          result = await api.uploadCourses(file);
          break;
        case 'equivalencies':
          result = await api.uploadEquivalencies(file);
          break;
        case 'requirements':
          result = await api.uploadRequirements(file);
          break;
        case 'constraints':
          result = await api.uploadConstraints(file);
          break;
        default:
          throw new Error('Invalid upload type');
      }
      
      setUploadResult(result);

      // After uploading requirements, refresh versions listing
      if (uploadType === 'requirements') {
        await loadProgramVersions();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({ error: error.message });
    } finally {
      setUploading(false);
    }
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
      // Updated sample to include versioning fields: semester, year, is_current
      csvContent = `program_name,category,credits_required,requirement_type,semester,year,is_current,group_name,courses_required,credits_required_group,course_option,institution,is_preferred,description,group_description,option_notes
"Biology Major","Humanities",9,"grouped","Fall",2025,true,"Literature & Writing",2,6,"ENG 201","State University",true,"Liberal arts breadth requirement","Choose 2 literature/writing courses","Advanced composition"
"Biology Major","Humanities",9,"grouped","Fall",2025,true,"Literature & Writing",2,6,"ENG 205","State University",false,"Liberal arts breadth requirement","Choose 2 literature/writing courses","Creative writing"
"Biology Major","Humanities",9,"grouped","Fall",2025,true,"Literature & Writing",2,6,"LIT 101","Community College",false,"Liberal arts breadth requirement","Choose 2 literature/writing courses","Introduction to literature"
"Biology Major","Humanities",9,"grouped","Fall",2025,true,"Philosophy & Ethics",1,3,"PHIL 101","State University",true,"Liberal arts breadth requirement","Choose 1 philosophy course","Introduction to philosophy"
"Biology Major","Humanities",9,"grouped","Fall",2025,true,"Philosophy & Ethics",1,3,"PHIL 201","State University",false,"Liberal arts breadth requirement","Choose 1 philosophy course","Ethics and moral philosophy"
"Biology Major","Science Electives",12,"grouped","Fall",2025,true,"Upper Biology",2,8,"BIO 301","State University",true,"Advanced biology courses","Choose 2 upper-division biology","Cell biology"
"Biology Major","Science Electives",12,"grouped","Fall",2025,true,"Upper Biology",2,8,"BIO 305","State University",true,"Advanced biology courses","Choose 2 upper-division biology","Genetics"
"Biology Major","Science Electives",12,"grouped","Fall",2025,true,"Upper Biology",2,8,"BIO 401","State University",false,"Advanced biology courses","Choose 2 upper-division biology","Molecular biology"
"Biology Major","Science Electives",12,"grouped","Fall",2025,true,"Chemistry Option",1,4,"CHEM 301","State University",true,"Advanced chemistry requirement","Choose 1 advanced chemistry","Organic chemistry"
"Biology Major","Science Electives",12,"grouped","Fall",2025,true,"Chemistry Option",1,4,"CHEM 310","State University",false,"Advanced chemistry requirement","Choose 1 advanced chemistry","Biochemistry"
"Biology Major","Core Biology",32,"simple","Fall",2025,true,"","","","","","Required biology courses for the major","",""
"Biology Major","Mathematics",12,"simple","Fall",2025,true,"","","","","","Calculus and statistics requirements","",""`;
      filename = 'sample_program_requirements.csv';
    } else if (type === 'constraints') {
      csvContent = `program_name,requirement_category,constraint_type,description,min_credits,max_credits,min_level,min_courses,max_courses,tag,tag_value,scope_subject_codes
"Biology Major","BIOS Electives","min_level_credits","At least 10 credits at 3000+ level",10,"",3000,"","","","","BIOS"
"Biology Major","BIOS Electives","min_tag_courses","At least 2 courses with lab components","","","",2,"","has_lab",true,"BIOS"
"Biology Major","BIOS Electives","max_tag_credits","Maximum 7 research credits","",7,"","","","course_type","research","BIOS"
"Biology Major","Science Electives","min_courses_at_level","Minimum 3 courses at 4000+ level","","",4000,3,"","","",""`;
      filename = 'sample_requirement_constraints.csv';
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
        title: 'Program Requirements Upload Instructions',
        description: 'Upload a CSV file containing program requirements and grouping rules. For grouped or conditional requirements, group-related columns (group_name, courses_required, credits_required_group, etc.) are required.',
        columns: [
          { name: 'program_name', description: 'Name of the program (e.g., "Biology Major")', required: true },
          { name: 'category', description: 'Requirement category (e.g., "Humanities")', required: true },
          { name: 'credits_required', description: 'Total credits for this category', required: true },
          { name: 'requirement_type', description: 'Type: simple, grouped, conditional', required: true },
          { name: 'semester', description: 'Notes about course option', required: true },
          { name: 'year', description: 'Notes about course option', required: true },
          { name: 'is_current', description: 'Is this the current version? (true/false)', required: true },
          { name: 'group_name', description: 'Sub-group name (required for grouped/conditional types)', required: row => ["grouped","conditional"].includes(row.requirement_type) },
          { name: 'courses_required', description: 'Number of courses needed from group (required for grouped/conditional types)', required: row => ["grouped","conditional"].includes(row.requirement_type) },
          { name: 'credits_required_group', description: 'Credits needed from group (required for grouped/conditional types)', required: row => ["grouped","conditional"].includes(row.requirement_type) },
          { name: 'course_option', description: 'Specific course code option (required for grouped/conditional types)', required: row => ["grouped","conditional"].includes(row.requirement_type) },
          { name: 'institution', description: 'Institution for course option (required for grouped/conditional types)', required: row => ["grouped","conditional"].includes(row.requirement_type) },
          { name: 'is_preferred', description: 'Mark as preferred option (true/false)', required: false },
          { name: 'description', description: 'Category description', required: false },
          { name: 'group_description', description: 'Group description', required: false },
          { name: 'option_notes', description: 'Notes about course option', required: false }
          
        ]
      };
    } else if (uploadType === 'constraints') {
      return {
        title: 'Requirement Constraints Upload Instructions',
        description: 'Upload a CSV file containing UNO-level constraints that apply to grouped requirements (e.g., minimum credits at certain level, lab requirements, research limits)',
        columns: [
          { name: 'program_name', description: 'Name of the program (must match existing program)', required: true },
          { name: 'requirement_category', description: 'Category name (must match existing requirement)', required: true },
          { name: 'constraint_type', description: 'Type: min_level_credits, min_tag_courses, max_tag_credits, min_courses_at_level', required: true },
          { name: 'description', description: 'Human-readable description of the constraint', required: true },
          { name: 'min_credits', description: 'Minimum credits (for min_level_credits)', required: false },
          { name: 'max_credits', description: 'Maximum credits (for max_tag_credits)', required: false },
          { name: 'min_level', description: 'Minimum course level (e.g., 3000 for 3000+)', required: false },
          { name: 'min_courses', description: 'Minimum number of courses (for min_tag_courses, min_courses_at_level)', required: false },
          { name: 'max_courses', description: 'Maximum number of courses', required: false },
          { name: 'tag', description: 'Tag name (has_lab, course_type) for tag-based constraints', required: false },
          { name: 'tag_value', description: 'Required tag value (true, research, lab_only, etc.)', required: false },
          { name: 'scope_subject_codes', description: 'Limit constraint to specific subjects (comma-separated, e.g., "BIOS,BIO")', required: false }
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
            <p>• <strong>{uploadResult.groups_created || 0}</strong> requirement groups created</p>
            <p>• <strong>{uploadResult.options_created || 0}</strong> course options created</p>
          </>
        );
      case 'constraints':
        return (
          <>
            <p>• <strong>{uploadResult.constraints_created || 0}</strong> constraints created</p>
            <p>• <strong>{uploadResult.constraints_updated || 0}</strong> constraints updated</p>
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
            <option value="requirements">Program Requirements & Grouping</option>
            <option value="constraints">Requirement Constraints</option>
          </select>
          
          {/* Type Description */}
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {uploadType === 'courses' && '📚 Upload course catalog data with codes, titles, credits, and descriptions.'}
              {uploadType === 'equivalencies' && '🔗 Upload course transfer mappings between institutions.'}
              {uploadType === 'requirements' && '⚙️ Upload complex program requirements with grouping rules (e.g., "Choose 2 from Group A").'}
              {uploadType === 'constraints' && '🔒 Upload UNO-level constraints for grouped requirements (e.g., "Min 10cr at 3000+ level").'}
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
              uploadType === 'constraints' ? 'Constraints' :
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
                <li>• Programs must exist before uploading requirements</li>
                <li>• For grouped requirements, include multiple rows for each course option</li>
                <li>• Use "simple" type for basic credit requirements</li>
                <li>• Use "grouped" type for "choose X from Y" scenarios</li>
                <li>• Course options should reference existing courses</li>
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
            <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">📝 Requirements CSV Examples:</h5>
            
            <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
              <div>
                <strong>Simple Requirement:</strong>
                <code className="block mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                  "Biology Major","Core Biology",32,"simple","","","","","","","Required biology courses"
                </code>
              </div>
              
              <div>
                <strong>Grouped Requirement (Choose 2 from Literature):</strong>
                <code className="block mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                  "Biology Major","Humanities",9,"grouped","Literature & Writing",2,6,"ENG 201","State University","true","Liberal arts requirement"
                  <br />
                  "Biology Major","Humanities",9,"grouped","Literature & Writing",2,6,"ENG 205","State University","false","Liberal arts requirement"
                </code>
              </div>
              
              <div>
                <strong>Multiple Groups in One Category:</strong>
                <p className="text-xs">Use the same category but different group_name values for complex requirements like "Choose 2 from Group A AND 1 from Group B"</p>
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
                          <td className="px-3 py-2 font-medium" rowSpan={versions.length}>{program.name}</td>
                        ) : null}
                        <td className="px-3 py-2">{v.semester || 'N/A'}</td>
                        <td className="px-3 py-2">{v.year || 'N/A'}</td>
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
    </div>
  );
};

export default CSVUpload;