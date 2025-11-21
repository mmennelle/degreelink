import { Download } from 'lucide-react';

/**
 * Generate a beautiful, styled HTML document for a plan that matches the app's design
 */
export async function generatePlanHTML(plan, currentProgram, targetProgram, progress = null) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Load and convert logo image to base64 for embedding
  let logoDataUrl = '';
  try {
    const response = await fetch('/mortar-board_large-initials-grad.png');
    const blob = await response.blob();
    logoDataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Could not load logo image:', e);
    logoDataUrl = '';
  }
  
  // Group courses by requirement category
  const coursesByCategory = {};
  (plan.courses || []).forEach(pc => {
    const category = pc.requirement_category || 'Uncategorized';
    if (!coursesByCategory[category]) {
      coursesByCategory[category] = [];
    }
    coursesByCategory[category].push(pc);
  });

  // Calculate statistics
  const totalCourses = plan.courses?.length || 0;
  const completedCourses = (plan.courses || []).filter(pc => pc.status === 'completed').length;
  const inProgressCourses = (plan.courses || []).filter(pc => pc.status === 'in_progress').length;
  const plannedCourses = (plan.courses || []).filter(pc => pc.status === 'planned').length;
  const totalCredits = (plan.courses || []).reduce((sum, pc) => sum + (pc.course?.credits || 0), 0);
  const completedCredits = (plan.courses || [])
    .filter(pc => pc.status === 'completed')
    .reduce((sum, pc) => sum + (pc.course?.credits || 0), 0);
  
  // Get total credits required for program completion
  const programCreditsRequired = targetProgram?.total_credits_required || 0;
  const creditProgress = programCreditsRequired > 0 ? Math.round((completedCredits / programCreditsRequired) * 100) : 0;

  const createdDate = plan.created_at ? new Date(plan.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Unknown';

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Color scheme matching the app
  const colors = isDarkMode ? {
    background: '#111827',
    cardBg: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',
    border: '#374151',
    accent: '#3b82f6',
    accentLight: '#60a5fa',
    success: '#10b981',
    warning: '#f59e0b',
    headerBg: '#1e40af',
    categoryBg: '#1f2937',
    statsCard: '#374151'
  } : {
    background: '#ffffff',
    cardBg: '#f9fafb',
    text: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#2563eb',
    accentLight: '#3b82f6',
    success: '#059669',
    warning: '#d97706',
    headerBg: '#2563eb',
    categoryBg: '#f3f4f6',
    statsCard: '#dbeafe'
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return colors.success;
    if (status === 'in_progress') return colors.warning;
    return colors.textMuted;
  };

  const getStatusText = (status) => {
    if (status === 'completed') return 'Completed';
    if (status === 'in_progress') return 'In Progress';
    return 'Planned';
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${plan.plan_name || 'Academic Plan'} - Course Transfer Plan</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background: ${colors.background};
      color: ${colors.text};
      line-height: 1.6;
      padding: 40px 20px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: ${colors.cardBg};
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, ${colors.headerBg} 0%, ${colors.accentLight} 100%);
      color: white;
      padding: 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 15s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(180deg); }
    }

    .header-content {
      position: relative;
      z-index: 1;
    }

    .plan-title {
      font-size: 2.5em;
      font-weight: 700;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .student-name {
      font-size: 1.3em;
      font-weight: 400;
      opacity: 0.95;
      margin-bottom: 20px;
    }

    .plan-code {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 0.9em;
      letter-spacing: 2px;
      font-weight: 600;
      backdrop-filter: blur(10px);
    }

    .content {
      padding: 40px;
    }

    .section {
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 1.8em;
      font-weight: 600;
      color: ${colors.accent};
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid ${colors.accent};
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .info-card {
      background: ${colors.categoryBg};
      border: 2px solid ${colors.border};
      border-radius: 12px;
      padding: 20px;
      transition: transform 0.2s;
    }

    .info-card:hover {
      transform: translateY(-2px);
    }

    .info-label {
      font-size: 0.85em;
      color: ${colors.textMuted};
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
      font-weight: 600;
    }

    .info-value {
      font-size: 1.2em;
      font-weight: 600;
      color: ${colors.text};
    }

    .info-institution {
      font-size: 0.75em;
      color: ${colors.textMuted};
      margin-top: 4px;
      font-weight: 400;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: ${colors.statsCard};
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      border: 2px solid ${colors.accent};
    }

    .stat-number {
      font-size: 2.5em;
      font-weight: 700;
      color: ${colors.accent};
      line-height: 1;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 0.85em;
      color: ${colors.textSecondary};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .progress-bar-container {
      background: ${colors.border};
      border-radius: 20px;
      height: 30px;
      overflow: visible;
      margin: 20px 0;
      position: relative;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, ${colors.accent} 0%, ${colors.accentLight} 100%);
      border-radius: 20px;
      transition: width 0.3s ease;
      position: absolute;
      top: 0;
      left: 0;
    }

    .progress-text {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${colors.text};
      font-weight: 600;
      font-size: 0.9em;
      z-index: 1;
      text-shadow: 0 0 4px ${colors.background}, 0 0 8px ${colors.background};
    }

    .category-section {
      background: ${colors.categoryBg};
      border: 2px solid ${colors.border};
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
    }

    .category-header {
      font-size: 1.4em;
      font-weight: 600;
      color: ${colors.accent};
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .category-badge {
      background: ${colors.accent};
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.7em;
      font-weight: 600;
    }

    .course-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .course-item {
      background: ${colors.background};
      border: 1px solid ${colors.border};
      border-radius: 8px;
      padding: 15px;
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      gap: 15px;
      align-items: center;
      transition: all 0.2s;
    }

    .course-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateX(2px);
    }

    .course-code {
      font-weight: 700;
      color: ${colors.accent};
      font-size: 1.1em;
      min-width: 100px;
    }

    .course-title {
      color: ${colors.text};
      font-weight: 500;
    }

    .course-credits {
      background: ${colors.accent};
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85em;
      white-space: nowrap;
    }

    .course-status {
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .status-completed {
      background: ${colors.success};
      color: white;
    }

    .status-in-progress {
      background: ${colors.warning};
      color: white;
    }

    .status-planned {
      background: ${colors.border};
      color: ${colors.textSecondary};
    }

    .footer {
      background: ${colors.categoryBg};
      padding: 30px 40px;
      text-align: center;
      border-top: 2px solid ${colors.border};
    }

    .footer-text {
      color: ${colors.textMuted};
      font-size: 0.9em;
      line-height: 1.8;
    }

    .footer-logo {
      font-size: 1.2em;
      font-weight: 700;
      color: ${colors.accent};
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .footer-logo img {
      height: 32px;
      width: auto;
    }

    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .container {
        box-shadow: none;
      }

      .course-item:hover {
        transform: none;
        box-shadow: none;
      }

      .header::before {
        animation: none;
      }
    }

    @media (max-width: 768px) {
      .plan-title {
        font-size: 1.8em;
      }

      .content {
        padding: 20px;
      }

      .course-item {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .course-code {
        min-width: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <h1 class="plan-title">${plan.plan_name || 'Academic Plan'}</h1>
        <p class="student-name">${plan.student_name || 'Student'}</p>
        <div class="plan-code">Plan Code: ${plan.plan_code || 'N/A'}</div>
      </div>
    </div>

    <div class="content">
      <!-- Plan Information -->
      <div class="section">
        <h2 class="section-title">Plan Information</h2>
        <div class="info-grid">
          ${currentProgram ? `
          <div class="info-card">
            <div class="info-label">Current Program</div>
            <div class="info-value">${currentProgram.name || 'N/A'}</div>
            ${currentProgram.institution ? `<div class="info-institution">${currentProgram.institution}</div>` : ''}
          </div>
          ` : ''}
          ${targetProgram ? `
          <div class="info-card">
            <div class="info-label">Target Program</div>
            <div class="info-value">${targetProgram.name || 'N/A'}</div>
            ${targetProgram.institution ? `<div class="info-institution">${targetProgram.institution}</div>` : ''}
          </div>
          ` : ''}
          <div class="info-card">
            <div class="info-label">Status</div>
            <div class="info-value">${plan.status || 'Draft'}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Created</div>
            <div class="info-value">${createdDate}</div>
          </div>
          ${plan.student_email ? `
          <div class="info-card">
            <div class="info-label">Email</div>
            <div class="info-value">${plan.student_email}</div>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Statistics -->
      <div class="section">
        <h2 class="section-title">Progress Overview</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${totalCourses}</div>
            <div class="stat-label">Total Courses</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${completedCourses}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${inProgressCourses}</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${plannedCourses}</div>
            <div class="stat-label">Planned</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${totalCredits}</div>
            <div class="stat-label">Total Credits</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${completedCredits}</div>
            <div class="stat-label">Credits Earned</div>
          </div>
        </div>
        
        ${programCreditsRequired > 0 ? `
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${creditProgress}%"></div>
          <div class="progress-text">${completedCredits} / ${programCreditsRequired} Credits (${creditProgress}% Complete)</div>
        </div>
        ` : totalCourses > 0 ? `
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${Math.round((completedCourses / totalCourses) * 100)}%"></div>
          <div class="progress-text">${Math.round((completedCourses / totalCourses) * 100)}% Complete</div>
        </div>
        ` : ''}
      </div>

      <!-- Courses by Category -->
      <div class="section">
        <h2 class="section-title">Courses by Requirement</h2>
        ${Object.entries(coursesByCategory).map(([category, courses]) => `
        <div class="category-section">
          <div class="category-header">
            <span>${category}</span>
            <span class="category-badge">${courses.length} course${courses.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="course-list">
            ${courses.map(pc => {
              const course = pc.course || {};
              const status = pc.status || 'planned';
              const statusClass = status === 'completed' ? 'status-completed' : 
                                 status === 'in_progress' ? 'status-in-progress' : 
                                 'status-planned';
              return `
              <div class="course-item">
                <div class="course-code">${course.code || 'N/A'}</div>
                <div class="course-title">${course.title || 'Untitled Course'}</div>
                <div class="course-credits">${course.credits || 0} cr</div>
                <div class="course-status ${statusClass}">${getStatusText(status)}</div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <div class="footer-logo">
        ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Degree Link Logo" />` : '🎓'}
        <span>Degree Link</span>
      </div>
      <p class="footer-text">
        Generated on ${currentDate}<br>
        This document contains your personalized academic transfer plan.
      </p>
    </div>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Download a plan as an HTML file
 */
export async function downloadPlanAsHTML(plan, currentProgram, targetProgram, progress = null) {
  const html = await generatePlanHTML(plan, currentProgram, targetProgram, progress);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${plan.plan_name || 'academic-plan'}_${plan.plan_code || Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print a plan (opens print dialog with the styled HTML)
 */
export async function printPlan(plan, currentProgram, targetProgram, progress = null) {
  const html = await generatePlanHTML(plan, currentProgram, targetProgram, progress);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}
