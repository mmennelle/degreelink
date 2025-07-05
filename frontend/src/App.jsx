// App.jsx - Refactored with MVC pattern
import React, { useState } from 'react';
import { useInstitutions } from './hooks/useInstitutions.js';
import { useTransferPlan } from './hooks/useTransferPlan.js';
import { MainLayout } from './views/layouts/MainLayout.jsx';
import { Navigation } from './views/components/Navigation/Navigation.jsx';
import { BrowsePage } from './views/pages/BrowsePage.jsx';
import { CreatePlanPage } from './views/pages/CreatePlanPage.jsx';
import { EditPlanPage } from './views/pages/EditPlanPage.jsx';
import { ViewPlanPage } from './views/pages/ViewPlanPage.jsx';
import { ImportSection } from './views/components/Import/ImportSection.jsx';

function App() {
  // UI State Management
  const [currentView, setCurrentView] = useState('browse');
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  // Data Management through Custom Hooks
  const { institutions } = useInstitutions();
  const {
    selectedCourses,
    planName,
    setPlanName,
    sourceInstitution,
    setSourceInstitution,
    targetInstitution,
    setTargetInstitution,
    loadedPlan,
    loading,
    error,
    toggleCourseSelection,
    createPlan,
    loadPlan,
    updatePlan,
    deletePlan,
    resetPlan
  } = useTransferPlan();

  // Navigation Controller Logic
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleLoadPlan = async () => {
    if (!searchCode.trim()) {
      alert('Please enter a plan code');
      return;
    }

    const result = await loadPlan(searchCode.trim());
    if (result.success) {
      setCurrentView('view-plan');
    } else {
      if (result.error.includes('not found')) {
        alert('Plan not found. Please check your code and try again.');
      } else {
        alert(`Failed to load plan: ${result.error}`);
      }
    }
  };

  const handleStartEdit = () => {
    setIsEditMode(true);
    setCurrentView('edit-plan');
  };

  const handleCancelEdit = () => {
    // Check for unsaved changes
    if (loadedPlan) {
      const hasChanges = 
        planName !== loadedPlan.plan_name ||
        sourceInstitution !== loadedPlan.source_institution_id ||
        targetInstitution !== loadedPlan.target_institution_id ||
        selectedCourses.length !== loadedPlan.selected_courses.length;
      
      if (hasChanges) {
        const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel editing?');
        if (!confirmCancel) return;
      }
    }
    
    setIsEditMode(false);
    setCurrentView('view-plan');
  };

  const handleCreatePlan = async () => {
    const result = await createPlan();
    
    if (result.success) {
      alert(`Plan created successfully! Your plan code is: ${result.data.plan_code}`);
    } else {
      if (result.errors) {
        alert(`Validation errors: ${result.errors.join(', ')}`);
      } else {
        alert(`Failed to create plan: ${result.error}`);
      }
    }
  };

  const handleUpdatePlan = async () => {
    if (!loadedPlan) {
      alert('Error: No plan loaded for editing');
      return;
    }

    const result = await updatePlan(loadedPlan.code);
    
    if (result.success) {
      alert(`Plan updated successfully! Your plan code remains: ${loadedPlan.code}`);
      setIsEditMode(false);
      setCurrentView('view-plan');
    } else {
      if (result.errors) {
        alert(`Validation errors: ${result.errors.join(', ')}`);
      } else {
        alert(`Failed to update plan: ${result.error}`);
      }
    }
  };

  const handleDeletePlan = async () => {
    if (!loadedPlan) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the plan "${loadedPlan.plan_name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    const result = await deletePlan(loadedPlan.code);
    
    if (result.success) {
      alert('Plan deleted successfully!');
      setSearchCode('');
      setIsEditMode(false);
      setCurrentView('browse');
    } else {
      alert(`Failed to delete plan: ${result.error}`);
    }
  };

  const handleResetPlan = () => {
    resetPlan();
    setIsEditMode(false);
    setCurrentView('browse');
  };

  // Navigation Props
  const navigationProps = {
    currentView,
    setCurrentView: handleViewChange,
    isEditMode,
    loadedPlan,
    selectedCourses,
    searchCode,
    setSearchCode,
    onLoadPlan: handleLoadPlan,
    onCancelEdit: handleCancelEdit
  };

  // Page Props
  const browseProps = {
    selectedCourses,
    onCourseToggle: toggleCourseSelection,
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
    onCourseToggle: toggleCourseSelection,
    onCreatePlan: handleCreatePlan,
    onResetPlan: handleResetPlan,
    loading
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
    onCourseToggle: toggleCourseSelection,
    onUpdatePlan: handleUpdatePlan,
    onCancelEdit: handleCancelEdit,
    onDeletePlan: handleDeletePlan,
    loadedPlan,
    loading
  };

  const viewPlanProps = {
    loadedPlan,
    onBackToBrowse: () => {
      setSearchCode('');
      setCurrentView('browse');
    },
    onStartEdit: handleStartEdit,
    onDeletePlan: handleDeletePlan
  };

  return (
    <MainLayout>
      <ImportSection />
      <Navigation {...navigationProps} />

      {currentView === 'browse' && <BrowsePage {...browseProps} />}
      {currentView === 'create-plan' && <CreatePlanPage {...createPlanProps} />}
      {currentView === 'view-plan' && <ViewPlanPage {...viewPlanProps} />}
      {currentView === 'edit-plan' && <EditPlanPage {...editPlanProps} />}
    </MainLayout>
  );
}

export default App;