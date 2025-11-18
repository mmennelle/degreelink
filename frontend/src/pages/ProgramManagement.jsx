import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  BookOpen, 
  Link2, 
  FileText, 
  GitBranch,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Download,
  Upload,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import ProgramRequirementsEditModal from '../components/ProgramRequirementsEditModal';

// Pagination Controls Component
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      
      {getPageNumbers().map((page, idx) => (
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              currentPage === page
                ? 'bg-blue-500 border-blue-500 text-white font-semibold'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

const ProgramManagement = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('all');
  const [showOnlyWithPrerequisites, setShowOnlyWithPrerequisites] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 50;
  
  // Data states
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]); // For search across all pages
  const [equivalencies, setEquivalencies] = useState([]);
  const [allEquivalencies, setAllEquivalencies] = useState([]); // For search
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when changing tabs
    loadData();
  }, [activeTab]);

  useEffect(() => {
    // Reload data when page changes (only if not searching)
    if (!searchTerm) {
      loadData();
    }
  }, [currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'courses':
          await loadCourses();
          break;
        case 'equivalencies':
          await loadEquivalencies();
          break;
        case 'programs':
          await loadPrograms();
          break;
        case 'prerequisites':
          await loadCourses(); // Prerequisites are part of courses
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await api.searchCourses({ per_page: 10000 });
      setAllCourses(response.courses || []);
      
      // Extract unique institutions
      const uniqueInsts = [...new Set((response.courses || []).map(c => c.institution))];
      setInstitutions(uniqueInsts.sort());
      
      // Apply filters (both institution and search)
      const filtered = filterCourses(response.courses || []);
      setTotalItems(filtered.length);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      const startIdx = (currentPage - 1) * itemsPerPage;
      setCourses(filtered.slice(startIdx, startIdx + itemsPerPage));
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadEquivalencies = async () => {
    try {
      const response = await api.getEquivalencies({ per_page: 10000 });
      setAllEquivalencies(response.equivalencies || []);
      
      // Apply search filter
      const filtered = filterEquivalencies(response.equivalencies || []);
      setTotalItems(filtered.length);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      const startIdx = (currentPage - 1) * itemsPerPage;
      setEquivalencies(filtered.slice(startIdx, startIdx + itemsPerPage));
    } catch (error) {
      console.error('Error loading equivalencies:', error);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await api.getPrograms({ include_all: true });
      setPrograms(response.programs || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      switch (activeTab) {
        case 'courses':
          await api.deleteCourse(deletingItem.id);
          break;
        case 'equivalencies':
          await api.deleteEquivalency(deletingItem.id);
          break;
        case 'programs':
          await api.deleteProgram(deletingItem.id);
          break;
        default:
          break;
      }
      setShowDeleteModal(false);
      setDeletingItem(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Error: ${error.message || 'Failed to delete item'}`);
    }
  };

  const filterCourses = (coursesData) => {
    let filtered = coursesData;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.code?.toLowerCase().includes(term) ||
        item.title?.toLowerCase().includes(term) ||
        item.subject_code?.toLowerCase().includes(term) ||
        item.course_number?.toLowerCase().includes(term)
      );
    }
    
    // Apply institution filter
    if (filterInstitution !== 'all') {
      filtered = filtered.filter(item => item.institution === filterInstitution);
    }
    
    // Apply prerequisites filter (only when on prerequisites tab or when toggle is on)
    if (activeTab === 'prerequisites' || showOnlyWithPrerequisites) {
      filtered = filtered.filter(item => item.prerequisites && item.prerequisites.trim() !== '');
    }
    
    return filtered;
  };

  const filterEquivalencies = (equivData) => {
    let filtered = equivData;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.from_course?.code?.toLowerCase().includes(term) ||
        item.to_course?.code?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  // Handle search - trigger reload when search term or filter changes
  useEffect(() => {
    if (activeTab === 'courses' || activeTab === 'prerequisites') {
      setCurrentPage(1);
      loadCourses();
    } else if (activeTab === 'equivalencies') {
      setCurrentPage(1);
      loadEquivalencies();
    }
  }, [searchTerm, filterInstitution, showOnlyWithPrerequisites]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const filteredData = () => {
    let data = [];
    
    switch (activeTab) {
      case 'courses':
        data = courses;
        break;
      case 'prerequisites':
        // Prerequisites already filtered by filterCourses
        data = courses;
        break;
      case 'equivalencies':
        data = equivalencies;
        break;
      case 'programs':
        data = programs;
        break;
      default:
        data = [];
    }

    return data;
  };

  const tabs = [
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'equivalencies', label: 'Equivalencies', icon: Link2 },
    { id: 'prerequisites', label: 'Prerequisites', icon: GitBranch },
    { id: 'programs', label: 'Programs', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Settings className="mr-3" size={32} />
                Program Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage courses, equivalencies, prerequisites, and program requirements
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchTerm('');
                      setFilterInstitution('all');
                      setShowOnlyWithPrerequisites(false);
                    }}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search and Filter Bar */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {(activeTab === 'courses' || activeTab === 'prerequisites') && institutions.length > 0 && (
                <div className="sm:w-64">
                  <select
                    value={filterInstitution}
                    onChange={(e) => setFilterInstitution(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Institutions</option>
                    {institutions.map(inst => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {activeTab === 'courses' && (
                <div>
                  <button
                    onClick={() => setShowOnlyWithPrerequisites(!showOnlyWithPrerequisites)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      showOnlyWithPrerequisites
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Filter size={18} />
                    {showOnlyWithPrerequisites ? 'With Prerequisites' : 'All Courses'}
                  </button>
                </div>
              )}
              
              {activeTab === 'equivalencies' && (
                <div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={18} />
                    Create Equivalency
                  </button>
                </div>
              )}
            </div>
            
            {/* Pagination Info */}
            {activeTab !== 'programs' && totalItems > 0 && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
              </div>
            )}
          </div>

          {/* Top Pagination */}
          {activeTab !== 'programs' && totalPages > 1 && (
            <div className="px-6 pt-4">
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Content Area */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading {activeTab}...</p>
              </div>
            ) : (
              <>
                {activeTab === 'courses' && <CoursesTable courses={filteredData()} onEdit={handleEdit} onDelete={handleDelete} />}
                {activeTab === 'equivalencies' && <EquivalenciesTable equivalencies={filteredData()} onEdit={handleEdit} onDelete={handleDelete} />}
                {activeTab === 'prerequisites' && <PrerequisitesTable courses={filteredData()} onEdit={handleEdit} />}
                {activeTab === 'programs' && <ProgramsTable programs={filteredData()} onEdit={handleEdit} />}
              </>
            )}
          </div>

          {/* Bottom Pagination */}
          {activeTab !== 'programs' && totalPages > 1 && (
            <div className="px-6 pb-4">
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditModal
          item={editingItem}
          type={activeTab}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
          onSave={async () => {
            setShowEditModal(false);
            setEditingItem(null);
            await loadData();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          item={deletingItem}
          type={activeTab}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

      {/* Create Equivalency Modal */}
      {showCreateModal && (
        <CreateEquivalencyModal
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            setShowCreateModal(false);
            await loadData();
          }}
        />
      )}
    </div>
  );
};

// Courses Table Component
const CoursesTable = ({ courses, onEdit, onDelete }) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <BookOpen className="mx-auto mb-4" size={48} />
        <p>No courses found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Institution
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Credits
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Prerequisites
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <td onClick={() => onEdit(course)} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {course.code}
              </td>
              <td onClick={() => onEdit(course)} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {course.title}
              </td>
              <td onClick={() => onEdit(course)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {course.institution}
              </td>
              <td onClick={() => onEdit(course)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {course.credits}
              </td>
              <td onClick={() => onEdit(course)} className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {course.prerequisites || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(course);
                  }}
                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Equivalencies Table Component
const EquivalenciesTable = ({ equivalencies, onEdit, onDelete }) => {
  if (equivalencies.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Link2 className="mx-auto mb-4" size={48} />
        <p>No equivalencies found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              From Course
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              To Course
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {equivalencies.map((equiv) => (
            <tr key={equiv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <td onClick={() => onEdit(equiv)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                <div className="font-medium">{equiv.from_course?.code}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{equiv.from_course?.institution}</div>
              </td>
              <td onClick={() => onEdit(equiv)} className="px-6 py-4 text-center">
                <ChevronRight className="text-gray-400" size={20} />
              </td>
              <td onClick={() => onEdit(equiv)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                <div className="font-medium">{equiv.to_course?.code}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{equiv.to_course?.institution}</div>
              </td>
              <td onClick={() => onEdit(equiv)} className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  equiv.equivalency_type === 'direct' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                }`}>
                  {equiv.equivalency_type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(equiv);
                  }}
                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Prerequisites Table Component
const PrerequisitesTable = ({ courses, onEdit }) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <GitBranch className="mx-auto mb-4" size={48} />
        <p>No courses with prerequisites found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Course
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Institution
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Prerequisites
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {courses.map((course) => (
            <tr key={course.id} onClick={() => onEdit(course)} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                <div>{course.code}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">{course.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {course.institution}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {course.prerequisites}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="inline-flex text-gray-400 dark:text-gray-500 pointer-events-none">
                  <Edit size={18} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Programs Table Component
const ProgramsTable = ({ programs, onEdit }) => {
  if (programs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Settings className="mx-auto mb-4" size={48} />
        <p>No programs found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {programs.map((program) => (
        <div
          key={program.id}
          onClick={() => onEdit(program)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {program.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {program.institution}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <FileText size={16} className="mr-2" />
                  <span>{program.degree_type}</span>
                </div>
                {program.total_credits_required && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{program.total_credits_required} credits required</span>
                  </div>
                )}
                {program.requirements && program.requirements.length > 0 && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <span>{program.requirements.length} requirement(s)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="ml-4 text-gray-400 dark:text-gray-500 pointer-events-none">
              <Edit size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Edit Modal Component
const EditModal = ({ item, type, onClose, onSave }) => {
  const [formData, setFormData] = useState(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      switch (type) {
        case 'courses':
        case 'prerequisites':
          await api.updateCourse(formData.id, formData);
          break;
        case 'equivalencies':
          await api.updateEquivalency(formData.id, formData);
          break;
        case 'programs':
          await api.updateProgram(formData.id, formData);
          break;
        default:
          break;
      }
      onSave();
    } catch (err) {
      setError(err.message || 'Failed to save changes');
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit {type === 'prerequisites' ? 'Course Prerequisites' : type.slice(0, -1)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {(type === 'courses' || type === 'prerequisites') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Code
                </label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => handleChange('code', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  value={formData.institution || ''}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Credits
                </label>
                <input
                  type="number"
                  value={formData.credits || 0}
                  onChange={(e) => handleChange('credits', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prerequisites
                </label>
                <textarea
                  value={formData.prerequisites || ''}
                  onChange={(e) => handleChange('prerequisites', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="e.g., MATH 101 or MATH 102"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter prerequisites as course codes separated by 'or' or 'and'
                </p>
              </div>
            </>
          )}

          {type === 'equivalencies' && (
            <>
              <EquivalencyCourseSelector
                label="From Course"
                selectedCourse={formData.from_course}
                onSelectCourse={(course) => handleChange('from_course_id', course.id)}
                onChange={(course) => setFormData(prev => ({ ...prev, from_course: course }))}
              />
              <EquivalencyCourseSelector
                label="To Course"
                selectedCourse={formData.to_course}
                onSelectCourse={(course) => handleChange('to_course_id', course.id)}
                onChange={(course) => setFormData(prev => ({ ...prev, to_course: course }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Equivalency Type
                </label>
                <select
                  value={formData.equivalency_type || 'direct'}
                  onChange={(e) => handleChange('equivalency_type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="direct">Direct</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
            </>
          )}

          {type === 'programs' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Program Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  value={formData.institution || ''}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Degree Type
                </label>
                <input
                  type="text"
                  value={formData.degree_type || ''}
                  onChange={(e) => handleChange('degree_type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="e.g., Bachelor of Science, Associate of Arts"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Credits Required
                </label>
                <input
                  type="number"
                  value={formData.total_credits_required || 0}
                  onChange={(e) => handleChange('total_credits_required', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Program description"
                />
              </div>
              
              {/* Display requirements count (read-only) */}
              {formData.requirements && formData.requirements.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Program Requirements
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowRequirementsModal(true)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Settings size={14} />
                      Manage Current Requirements
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    This program has {formData.requirements.length} requirement(s) with associated groups and constraints.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Button opens the current semester/year requirements. To manage other versions, use the CSV upload interface.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Program Requirements Modal */}
      {showRequirementsModal && type === 'programs' && (
        <ProgramRequirementsEditModal
          program={formData}
          semester={(() => {
            // Find current requirement to get semester/year
            const currentReq = formData.requirements?.find(r => r.is_current);
            return currentReq?.semester || null;
          })()}
          year={(() => {
            // Find current requirement to get semester/year
            const currentReq = formData.requirements?.find(r => r.is_current);
            return currentReq?.year || null;
          })()}
          onClose={() => {
            setShowRequirementsModal(false);
            // Reload program data to get updated requirements
            onSave();
          }}
        />
      )}
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ item, type, onClose, onConfirm }) => {
  const getItemDisplay = () => {
    switch (type) {
      case 'courses':
      case 'prerequisites':
        return `${item.code} - ${item.title}`;
      case 'equivalencies':
        return `${item.from_course?.code} → ${item.to_course?.code}`;
      case 'programs':
        return item.name;
      default:
        return 'this item';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Confirm Deletion
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete <strong>{getItemDisplay()}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Course Selector Component for Equivalencies
const EquivalencyCourseSelector = ({ label, selectedCourse, onSelectCourse, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await api.searchCourses({ search: term, per_page: 20 });
      setSearchResults(response.courses || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching courses:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCourse = (course) => {
    onChange(course);
    onSelectCourse(course);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      {selectedCourse ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="font-medium text-gray-900 dark:text-white">{selectedCourse.code}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{selectedCourse.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">{selectedCourse.institution}</div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Search for a course..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleSelectCourse(course)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{course.code}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{course.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">{course.institution}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Create Equivalency Modal
const CreateEquivalencyModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    from_course: null,
    from_course_id: null,
    to_course: null,
    to_course_id: null,
    equivalency_type: 'direct'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.from_course_id || !formData.to_course_id) {
      setError('Please select both from and to courses');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.createEquivalency({
        from_course_id: formData.from_course_id,
        to_course_id: formData.to_course_id,
        equivalency_type: formData.equivalency_type
      });
      onSave();
    } catch (err) {
      setError(err.message || 'Failed to create equivalency');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Equivalency
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <EquivalencyCourseSelector
            label="From Course"
            selectedCourse={formData.from_course}
            onSelectCourse={(course) => setFormData(prev => ({ ...prev, from_course_id: course.id }))}
            onChange={(course) => setFormData(prev => ({ ...prev, from_course: course }))}
          />

          <EquivalencyCourseSelector
            label="To Course"
            selectedCourse={formData.to_course}
            onSelectCourse={(course) => setFormData(prev => ({ ...prev, to_course_id: course.id }))}
            onChange={(course) => setFormData(prev => ({ ...prev, to_course: course }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Equivalency Type
            </label>
            <select
              value={formData.equivalency_type}
              onChange={(e) => setFormData(prev => ({ ...prev, equivalency_type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="direct">Direct</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Equivalency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramManagement;
