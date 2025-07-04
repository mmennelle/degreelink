// src/components/CSVUpload.jsx
import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import api from '../services/api';

const CSVUpload = () => {
  const [uploadType, setUploadType] = useState('courses');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadResult({ 
        error: 'Please upload a CSV file (.csv extension required)' 
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadResult({ 
        error: 'File size too large. Please upload files smaller than 10MB.' 
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const result = uploadType === 'courses' 
        ? await api.uploadCourses(file)
        : await api.uploadEquivalencies(file);
      
      setUploadResult(result);
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
    // Reset input to allow re-uploading same file
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
      csvContent = `code,title,description,credits,institution,department,prerequisites
"BIOL 101","Introduction to Biology","Fundamental principles of biology including cell structure, genetics, and evolution.",4,"City Community College","Biology",""
"MATH 151","Calculus I","Limits, derivatives, and applications of differential calculus.",4,"City Community College","Mathematics","MATH 141"
"ENG 101","English Composition I","Introduction to academic writing and critical thinking.",3,"City Community College","English",""
"HIST 101","World History I","Survey of world civilizations from ancient times to 1500.",3,"City Community College","History",""
"CHEM 111","General Chemistry I","Introduction to chemical principles and laboratory techniques.",4,"City Community College","Chemistry","MATH 120"`;
      filename = 'sample_courses.csv';
    } else {
      csvContent = `from_course_code,from_institution,to_course_code,to_institution,equivalency_type,notes,approved_by
"BIOL 101","City Community College","BIO 1010","State University","direct","Direct transfer equivalency","Dr. Smith"
"MATH 151","City Community College","MATH 1210","State University","direct","Same content and credit hours","Dr. Johnson"
"ENG 101","City Community College","ENGL 1010","State University","direct","Meets composition requirement","Dr. Williams"
"HIST 101","City Community College","HIST 1700","State University","partial","Covers similar content but different time periods","Dr. Brown"
"CHEM 111","City Community College","CHEM 1210","State University","direct","Laboratory component included","Dr. Davis"`;
      filename = 'sample_equivalencies.csv';
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
          { name: 'description', description: 'Course description', required: false },
          { name: 'credits', description: 'Number of credits (integer)', required: true },
          { name: 'institution', description: 'Institution name', required: true },
          { name: 'department', description: 'Department name', required: false },
          { name: 'prerequisites', description: 'Prerequisites (if any)', required: false }
        ]
      };
    } else {
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
    }
  };

  const instructions = getUploadInstructions();

  return (
    <div className="space-y-6">
      {/* Upload Type Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Upload className="mr-2" size={20} />
          CSV Upload Manager
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Upload Type
          </label>
          <select
            value={uploadType}
            onChange={(e) => {
              setUploadType(e.target.value);
              setUploadResult(null); // Clear previous results
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="courses">Course Information</option>
            <option value="equivalencies">Course Equivalencies</option>
          </select>
        </div>

        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
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
              <Upload className={`h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            </div>
            
            {uploading ? (
              <div className="space-y-2">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">Uploading and processing...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
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
            className="flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Download className="mr-2" size={16} />
            Download Sample {uploadType === 'courses' ? 'Courses' : 'Equivalencies'} CSV
          </button>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className="mt-6">
            {uploadResult.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="text-red-600 mr-3 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Upload Failed</h4>
                    <p className="text-sm text-red-700">{uploadResult.error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start">
                  <CheckCircle className="text-green-600 mr-3 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800 mb-2">Upload Successful!</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      {uploadType === 'courses' ? (
                        <>
                          <p>• <strong>{uploadResult.courses_created || 0}</strong> courses created</p>
                          <p>• <strong>{uploadResult.courses_updated || 0}</strong> courses updated</p>
                        </>
                      ) : (
                        <>
                          <p>• <strong>{uploadResult.equivalencies_created || 0}</strong> equivalencies created</p>
                          <p>• <strong>{uploadResult.equivalencies_updated || 0}</strong> equivalencies updated</p>
                        </>
                      )}
                      
                      {uploadResult.errors && uploadResult.errors.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="font-medium text-yellow-800 mb-2">
                            ⚠️ {uploadResult.errors.length} errors encountered:
                          </p>
                          <div className="max-h-32 overflow-y-auto">
                            <ul className="text-xs text-yellow-700 space-y-1">
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="mr-2" size={18} />
          {instructions.title}
        </h3>
        
        <p className="text-gray-600 mb-4">{instructions.description}</p>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Required CSV Columns:</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Column Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Required
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {instructions.columns.map((column, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 border-r">
                      {column.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 border-r">
                      {column.description}
                    </td>
                    <td className="px-4 py-3 text-sm border-r">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        column.required 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {column.required ? 'Required' : 'Optional'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h5 className="font-medium text-blue-800 mb-2">💡 Upload Tips:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure your CSV has the exact column names listed above</li>
            <li>• Use double quotes around text values that contain commas</li>
            <li>• Keep one header row at the top of your file</li>
            <li>• Remove any empty rows at the end of your file</li>
            <li>• For equivalencies, make sure both courses exist in the system first</li>
            <li>• The system will automatically skip duplicate entries</li>
          </ul>
        </div>

        {uploadType === 'equivalencies' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h5 className="font-medium text-yellow-800 mb-2">⚠️ Equivalency Requirements:</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Both source and target courses must exist in the database</li>
              <li>• Upload courses first if they don't exist yet</li>
              <li>• Use exact course codes and institution names</li>
              <li>• Equivalency types: "direct", "partial", or "conditional"</li>
            </ul>
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