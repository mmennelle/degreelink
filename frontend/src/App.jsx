import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from './components/Navigation';
import BrowseView from './components/BrowseView';
import CreatePlanView from './components/CreatePlanView';
import EditPlanView from './components/EditPlanView';
import ViewPlanView from './components/ViewPlanView';
import ImportSection from './components/ImportSection';
import unoLogo from './assets/uno-logo.avif';
import delgadoLogo from './assets/delgado-logo.jpg';

//a
function App() {
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [equivalents, setEquivalents] = useState([]);
  
  const [expandedInstitution, setExpandedInstitution] = useState(null);
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [planName, setPlanName] = useState('');
  const [sourceInstitution, setSourceInstitution] = useState('');
  const [targetInstitution, setTargetInstitution] = useState('');
  const [planCode, setPlanCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [loadedPlan, setLoadedPlan] = useState(null);
  const [currentView, setCurrentView] = useState('browse');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    axios.get('/api/institutions').then(res => setInstitutions(res.data));
  }, []);

  useEffect(() => {
    if (expandedInstitution) {
      axios.get(`/api/departments?institution_id=${expandedInstitution}`)
        .then(res => setDepartments(res.data));
    } else {
      setDepartments([]);
      setCourses([]);
      setEquivalents([]);
    }
  }, [expandedInstitution]);

  useEffect(() => {
    if (expandedDepartment) {
      axios.get(`/api/courses?department_id=${expandedDepartment}`)
        .then(res => setCourses(res.data));
    } else {
      setCourses([]);
      setEquivalents([]);
    }
  }, [expandedDepartment]);

  useEffect(() => {
    if (selectedCourse) {
      axios.get(`/api/equivalents?course_id=${selectedCourse}`)
        .then(res => setEquivalents(res.data));
    } else {
      setEquivalents([]);
    }
  }, [selectedCourse]);

  const toggleCourseSelection = (course) => {
    const isSelected = selectedCourses.some(c => c.id === course.id);
    if (isSelected) {
      setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const createPlan = async () => {
    if (!planName.trim()) {
      alert('Please enter a plan name');
      return;
    }
    if (selectedCourses.length === 0) {
      alert('Please select at least one course');
      return;
    }
    if (!sourceInstitution || !targetInstitution) {
      alert('Please select source and target institutions');
      return;
    }

    try {
      const response = await axios.post('/api/create-plan', {
        plan_name: planName,
        source_institution_id: sourceInstitution,
        target_institution_id: targetInstitution,
        selected_courses: selectedCourses.map(c => c.id),
        additional_data: {
          total_courses: selectedCourses.length,
          created_by_user: true
        }
      });

      setPlanCode(response.data.plan_code);
      alert(`Plan created successfully! Your plan code is: ${response.data.plan_code}`);
      
    } catch (error) {
      alert('Failed to create plan: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const updatePlan = async () => {
    if (!loadedPlan) {
      alert('Error: No plan loaded for editing');
      return;
    }
    
    if (!planName.trim()) {
      alert('Please enter a plan name');
      return;
    }
    if (selectedCourses.length === 0) {
      alert('Please select at least one course');
      return;
    }
    if (!sourceInstitution || !targetInstitution) {
      alert('Please select source and target institutions');
      return;
    }

    try {
      const response = await axios.put(`/api/update-plan/${loadedPlan.code}`, {
        plan_name: planName,
        source_institution_id: sourceInstitution,
        target_institution_id: targetInstitution,
        selected_courses: selectedCourses.map(c => c.id),
        additional_data: {
          total_courses: selectedCourses.length,
          updated_by_user: true,
          last_updated: new Date().toISOString()
        }
      });

      alert(`Plan updated successfully! Your plan code remains: ${loadedPlan.code}`);
      
      const updatedPlan = await axios.get(`/api/get-plan/${loadedPlan.code}`);
      setLoadedPlan(updatedPlan.data.plan);
      setIsEditMode(false);
      setCurrentView('view-plan');
      
    } catch (error) {
      alert('Failed to update plan: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const deletePlan = async () => {
    if (!loadedPlan) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete the plan "${loadedPlan.plan_name}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/delete-plan/${loadedPlan.code}`);
      alert('Plan deleted successfully!');
      
      setLoadedPlan(null);
      setSearchCode('');
      setSelectedCourses([]);
      setPlanName('');
      setSourceInstitution('');
      setTargetInstitution('');
      setIsEditMode(false);
      setCurrentView('browse');
      
    } catch (error) {
      alert('Failed to delete plan: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const startEditMode = () => {
    if (loadedPlan) {
      setPlanName(loadedPlan.plan_name);
      setSourceInstitution(loadedPlan.plan_data.source_institution_id);
      setTargetInstitution(loadedPlan.plan_data.target_institution_id);
      setSelectedCourses(loadedPlan.selected_courses);
      setIsEditMode(true);
      setCurrentView('edit-plan');
    }
  };

  const cancelEdit = () => {
    const hasChanges = 
      planName !== loadedPlan?.plan_name ||
      sourceInstitution !== loadedPlan?.plan_data?.source_institution_id ||
      targetInstitution !== loadedPlan?.plan_data?.target_institution_id ||
      selectedCourses.length !== loadedPlan?.selected_courses?.length;
    
    if (hasChanges) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel editing?');
      if (!confirmCancel) return;
    }
    
    setIsEditMode(false);
    setCurrentView('view-plan');
    setPlanName('');
    setSourceInstitution('');
    setTargetInstitution('');
    setSelectedCourses([]);
  };

  const loadPlan = async () => {
    if (!searchCode.trim()) {
      alert('Please enter a plan code');
      return;
    }

    try {
      const response = await axios.get(`/api/get-plan/${searchCode.trim()}`);
      setLoadedPlan(response.data.plan);
      setCurrentView('view-plan');
    } catch (error) {
      if (error.response?.status === 404) {
        alert('Plan not found. Please check your code and try again.');
      } else {
        alert('Failed to load plan: ' + (error.response?.data?.error || 'Unknown error'));
      }
    }
  };

  const resetPlanCreation = () => {
    setSelectedCourses([]);
    setPlanName('');
    setSourceInstitution('');
    setTargetInstitution('');
    setPlanCode('');
    setIsEditMode(false);
    setCurrentView('browse');
  };

  const navigationProps = {
    currentView,
    setCurrentView,
    isEditMode,
    loadedPlan,
    selectedCourses,
    searchCode,
    setSearchCode,
    loadPlan,
    cancelEdit
  };

  const browseProps = {
    institutions,
    departments,
    courses,
    equivalents,
    expandedInstitution,
    setExpandedInstitution,
    expandedDepartment,
    setExpandedDepartment,
    selectedCourse,
    setSelectedCourse,
    selectedCourses,
    toggleCourseSelection,
    isEditMode,
    loadedPlan
  };

  const createPlanProps = {
    planName,
    setPlanName,
    sourceInstitution,
    setSourceInstitution,
    targetInstitution,
    setTargetInstitution,
    institutions,
    selectedCourses,
    toggleCourseSelection,
    createPlan,
    resetPlanCreation,
    planCode
  };

  const editPlanProps = {
    planName,
    setPlanName,
    sourceInstitution,
    setSourceInstitution,
    targetInstitution,
    setTargetInstitution,
    institutions,
    selectedCourses,
    toggleCourseSelection,
    updatePlan,
    cancelEdit,
    deletePlan,
    loadedPlan
  };

  const viewPlanProps = {
    loadedPlan,
    setLoadedPlan,
    setSearchCode,
    setCurrentView,
    startEditMode,
    deletePlan
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '1200px', 
      margin: '0 auto' 
    }}>
      {/* Header with Logos */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px 0'
      }}>
        {/* Left Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={unoLogo} 
            alt="University of New Orleans" 
            style={{ 
              height: '60px', 
              maxWidth: '200px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <div 
            style={{ 
              display: 'none',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Delgado CC
          </div>
        </div>

        {/* Center Title */}
        <h1 style={{ 
          color: '#333', 
          margin: '0',
          textAlign: 'center',
          flex: 1,
          fontSize: '24px'
        }}>
          Course Equivalency Finder
        </h1>

        {/* Right Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={delgadoLogo} 
            alt="Delgado Community College" 
            style={{ 
              height: '60px', 
              maxWidth: '200px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <div 
            style={{ 
              display: 'none',
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            UNO
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div style={{ 
        borderBottom: '10px solid #00402a', 
        marginBottom: '20px' 
      }}></div>

      <ImportSection />
      <Navigation {...navigationProps} />

      {currentView === 'browse' && <BrowseView {...browseProps} />}
      {currentView === 'create-plan' && <CreatePlanView {...createPlanProps} />}
      {currentView === 'view-plan' && <ViewPlanView {...viewPlanProps} />}
      {currentView === 'edit-plan' && <EditPlanView {...editPlanProps} />}
    </div>
  );
}

export default App;