import React, { useState, useEffect } from 'react';
import { Search, Filter, User, Calendar, BookOpen, Mail, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdvisorCenter = ({ onOpenPlan }) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalCount, setTotalCount] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 20;

  // Fetch advisor plans
  const fetchAdvisorPlans = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        search: searchTerm,
        status: statusFilter,
        sort: sortBy,
        order: sortOrder,
        limit: plansPerPage,
        offset: (currentPage - 1) * plansPerPage
      };
      
      const response = await api.getAdvisorPlans(params);
      setPlans(response.plans || []);
      setTotalCount(response.total_count || 0);
    } catch (err) {
      console.error('Error fetching advisor plans:', err);
      setError(err.response?.data?.error || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  // Fetch advisor statistics
  const fetchAdvisorStats = async () => {
    try {
      const response = await api.getAdvisorStats();
      setStats(response);
    } catch (err) {
      console.error('Error fetching advisor stats:', err);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchAdvisorPlans();
  }, [searchTerm, statusFilter, sortBy, sortOrder, currentPage]);

  // Load stats on component mount
  useEffect(() => {
    fetchAdvisorStats();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle filter change
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / plansPerPage);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Open plan in current tab by loading it with the plan code
  const openPlan = async (planCode) => {
    try {
      // Use the API to access the plan by code
      const planData = await api.getPlanByCode(planCode);
      
      if (planData) {
        // Plan is now loaded and accessible in the session
        // Navigate to the plans page and trigger reload
        navigate('/plans');
        if (onOpenPlan) {
          onOpenPlan();
        }
      }
    } catch (err) {
      console.error('Error loading plan:', err);
      alert('Failed to load plan. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Advisor Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all student plans linked to your account
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Plans</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total_plans}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recent Plans (30 days)</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.recent_plans_30_days}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status Breakdown</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {Object.entries(stats.status_breakdown || {}).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="capitalize">{status}:</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by student name, email, or plan name..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => handleSortChange('updated_at')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'updated_at'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Recently Updated {sortBy === 'updated_at' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('created_at')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'created_at'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Recently Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('student_name')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'student_name'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Student Name {sortBy === 'student_name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={fetchAdvisorPlans}
            className="ml-auto px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Plans Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter
              ? 'No plans match your search criteria.'
              : 'No student plans are currently linked to your account.'}
          </p>
        </div>
      ) : (
        <>
          {/* Plans List */}
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openPlan(plan.plan_code)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">
                      {plan.plan_name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{plan.student_name}</span>
                      </div>
                      {plan.student_email && (
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          <span>{plan.student_email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      plan.status === 'draft'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : plan.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : plan.status === 'completed'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {plan.status}
                    </span>
                    <button
                      onClick={() => openPlan(plan.plan_code)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Open plan"
                    >
                      <ExternalLink size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-4">
                    {plan.target_program && (
                      <span>Program: {plan.target_program.name}</span>
                    )}
                    <span>Courses: {plan.courses?.length || 0}</span>
                  </div>
                  <div className="flex gap-4">
                    <span>Created: {formatDate(plan.created_at)}</span>
                    <span>Updated: {formatDate(plan.updated_at)}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Plan Code: {plan.plan_code}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages} ({totalCount} total plans)
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdvisorCenter;
