import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { studentsAPI, goalsAPI } from '../services/api';
import '../App.css';

function Dashboard() {
  // Auth context
  const { teacher, logout } = useAuth();

  // State management
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentGroup, setCurrentGroup] = useState('reading');
  const [showTokenStore, setShowTokenStore] = useState(false);
  const [showTeacherPanel, setShowTeacherPanel] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGroups, setNewStudentGroups] = useState(['reading']);
  const [newStudentPrimaryGroup, setNewStudentPrimaryGroup] = useState('reading');
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentMode, setStudentMode] = useState(false);
  const [teacherCode, setTeacherCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  // Set your teacher code here - change this to whatever you want
  const TEACHER_ACCESS_CODE = '123456';

  // Goals state
  const [groupGoals, setGroupGoals] = useState({
    reading: { topic: "2-syllable words", goal: "Read 8 words correctly", icon: "📖" },
    math: { topic: "Addition with regrouping", goal: "Solve 10 problems correctly", icon: "🔢" },
    writing: { topic: "Complete sentences", goal: "Write 5 complete sentences", icon: "✏️" },
    behavior: { topic: "Asking for help politely", goal: 'Remember: "Excuse me, can you help me please?"', icon: "🤝" }
  });

  // Token store items
  const storeItems = [
    { id: 1, name: 'Takis', cost: 8, emoji: '🌶️' },
    { id: 2, name: 'Fruit Snacks', cost: 5, emoji: '🍇' },
    { id: 3, name: 'Gatorade', cost: 10, emoji: '🥤' },
    { id: 4, name: 'Pretzels', cost: 6, emoji: '🥨' },
    { id: 5, name: 'Extra Computer Time', cost: 15, emoji: '💻' },
    { id: 6, name: 'Teacher Helper Badge', cost: 12, emoji: '⭐' },
  ];

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load students and goals in parallel
      const [studentsResponse, goalsResponse] = await Promise.all([
        studentsAPI.getAll(),
        goalsAPI.getCurrent()
      ]);

      console.log('Students from API:', studentsResponse.data); // Debug log
      setStudents(studentsResponse.data || []);
      
      // Update goals if available from backend
      if (goalsResponse.data && Object.keys(goalsResponse.data).length > 0) {
        setGroupGoals(goalsResponse.data);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Filter students by current group - now checks if student is in the group
  const currentStudents = students.filter(student => {
    // Ensure we have valid data
    const studentGroups = student.groups || [];
    const primaryGroup = student.primaryGroup;
    const legacyGroup = student.group;
    
    // Check multiple ways for backward compatibility
    const isInGroup = studentGroups.includes(currentGroup) || 
                     primaryGroup === currentGroup ||
                     legacyGroup === currentGroup;
    
    console.log(`Student ${student.name} - Groups: [${studentGroups.join(',')}], Primary: ${primaryGroup}, Legacy: ${legacyGroup}, Current: ${currentGroup}, In Group: ${isInGroup}`);
    
    return isInGroup;
  });

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const handleReadyClick = async (studentId) => {
    try {
      const response = await studentsAPI.checkin(studentId, currentGroup);
      
      if (response.data) {
        // Reload students to get updated data
        await loadData();
        setSelectedStudent(null);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to check in student');
      }
      setSelectedStudent(null);
    }
  };

  const handleBackClick = () => {
    setSelectedStudent(null);
  };

  const handlePurchase = async (studentId, itemCost, itemName) => {
    try {
      const response = await studentsAPI.purchase(studentId, itemName, itemCost);
      
      if (response.data) {
        // Update the selected student and students list
        await loadData();
        
        // Update selected student with new token count
        const updatedStudent = students.find(s => s._id === studentId);
        if (updatedStudent) {
          setSelectedStudent({
            ...updatedStudent,
            tokens: updatedStudent.tokens - itemCost
          });
        }
        
        alert(`🎉 Purchase successful! Enjoy your ${itemName}!`);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Purchase failed');
    }
  };

  const awardBonusTokens = async (studentId, amount) => {
    try {
      console.log('Awarding bonus tokens:', { studentId, amount }); // Debug log
      await studentsAPI.awardBonus(studentId, amount, 'Teacher awarded bonus');
      await loadData(); // Reload to get updated data
    } catch (error) {
      console.error('Bonus tokens error:', error); // Debug log
      alert('Failed to award bonus tokens: ' + (error.response?.data?.message || error.message));
    }
  };

  // Helper functions for group management
  const handleGroupToggle = (group) => {
    if (newStudentGroups.includes(group)) {
      // Remove group if already selected
      const updatedGroups = newStudentGroups.filter(g => g !== group);
      setNewStudentGroups(updatedGroups);
      
      // If removing primary group, set new primary
      if (newStudentPrimaryGroup === group && updatedGroups.length > 0) {
        setNewStudentPrimaryGroup(updatedGroups[0]);
      }
    } else {
      // Add group
      setNewStudentGroups([...newStudentGroups, group]);
    }
  };

  const updateStudentGroups = async (studentId, groups, primaryGroup) => {
    try {
      console.log('Updating student groups:', { studentId, groups, primaryGroup });
      await studentsAPI.updateGroups(studentId, groups, primaryGroup);
      await loadData(); // Reload to get updated data
      alert('Student groups updated successfully!');
    } catch (error) {
      console.error('Update groups error:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to update student groups: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTeacherCodeSubmit = () => {
    if (teacherCode === TEACHER_ACCESS_CODE) {
      setStudentMode(false);
      setTeacherCode('');
      setShowCodeInput(false);
      alert('Welcome back, Teacher! 👨‍🏫');
    } else {
      alert('Incorrect code. Access denied.');
      setTeacherCode('');
    }
  };

  const handleCodeInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTeacherCodeSubmit();
    }
  };

  const activateStudentMode = () => {
    setStudentMode(true);
    setShowTeacherPanel(false); // Close teacher panel when entering student mode
  };

  const addStudent = async () => {
    if (newStudentName.trim() === '') {
      alert('Please enter a student name');
      return;
    }

    if (newStudentGroups.length === 0) {
      alert('Please select at least one group');
      return;
    }

    try {
      console.log('Adding student with data:', {
        name: newStudentName.trim(),
        groups: newStudentGroups,
        primaryGroup: newStudentPrimaryGroup
      });

      await studentsAPI.add({
        name: newStudentName.trim(),
        groups: newStudentGroups,
        primaryGroup: newStudentPrimaryGroup,
        skillsCompleted: 0,
        totalSkills: 10
      });

      await loadData(); // Reload students
      setNewStudentName('');
      setNewStudentGroups(['reading']);
      setNewStudentPrimaryGroup('reading');
      setShowAddStudent(false);
      alert(`${newStudentName.trim().toUpperCase()} has been added to the ${newStudentGroups.join(', ')} group(s)!`);
    } catch (error) {
      console.error('Add student error:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to add student: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      try {
        console.log('Deleting student:', { studentId, studentName }); // Debug log
        await studentsAPI.delete(studentId);
        await loadData(); // Reload students
        alert(`${studentName} has been removed from the system.`);
      } catch (error) {
        console.error('Delete student error:', error); // Debug log
        alert('Failed to delete student: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const updateGroupGoal = (group, field, value) => {
    setGroupGoals(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: value
      }
    }));
  };

  const saveGoals = async () => {
    try {
      await goalsAPI.updateCurrent(groupGoals);
      setShowEditGoals(false);
      alert('Goals updated successfully!');
    } catch (error) {
      alert('Failed to update goals');
    }
  };

  const exportData = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    // Create comprehensive data export
    let csvContent = "Student Name,Group,Present Today,Total Tokens,Tokens Earned Today,Subjects Attended Today,Skills Completed,Total Skills,Completion Rate,Total Purchases,Total Spent,Last Purchase\n";
    
    students.forEach(student => {
      const completionRate = ((student.skillsCompleted / student.totalSkills) * 100).toFixed(1);
      const totalSpent = (student.purchases || []).reduce((total, p) => total + p.cost, 0);
      const lastPurchase = (student.purchases || []).length > 0 
        ? `${student.purchases[student.purchases.length - 1].item} (${new Date(student.purchases[student.purchases.length - 1].date).toLocaleDateString()})`
        : 'None';
      
      csvContent += `${student.name},${student.group || student.primaryGroup},${student.present ? 'Yes' : 'No'},${student.tokens},${student.todayTokens || 0},"${(student.todaySubjects || []).join(', ')}",${student.skillsCompleted},${student.totalSkills},${completionRate}%,${(student.purchases || []).length},${totalSpent},"${lastPurchase}"\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Resource_Room_Data_${currentDate.replace(/\//g, '-')}_${currentTime.replace(/:/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🏫</div>
          <div>Loading your classroom...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
          <div>{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Token store view
  if (showTokenStore && selectedStudent) {
    return (
      <div className="App">
        <div className="token-store">
          <button className="back-button" onClick={() => setShowTokenStore(false)}>
            ← Back
          </button>
          
          <h1>🏪 TOKEN STORE</h1>
          <div className="student-tokens">
            <h2>{selectedStudent.name}'s Tokens: 🪙 {selectedStudent.tokens}</h2>
          </div>

          <div className="store-grid">
            {storeItems.map(item => (
              <div key={item.id} className="store-item">
                <div className="item-emoji">{item.emoji}</div>
                <div className="item-name">{item.name}</div>
                <div className="item-cost">🪙 {item.cost}</div>
                <button 
                  className={`buy-button ${selectedStudent.tokens >= item.cost ? '' : 'disabled'}`}
                  onClick={() => selectedStudent.tokens >= item.cost && handlePurchase(selectedStudent._id, item.cost, item.name)}
                  disabled={selectedStudent.tokens < item.cost}
                >
                  {selectedStudent.tokens >= item.cost ? 'BUY' : 'Need More'}
                </button>
              </div>
            ))}
          </div>

          {selectedStudent.purchases && selectedStudent.purchases.length > 0 && (
            <div className="purchase-history">
              <h3>📊 Your Spending History</h3>
              <div className="purchase-list">
                {selectedStudent.purchases.slice(-5).reverse().map((purchase, index) => (
                  <div key={index} className="purchase-item">
                    <span className="purchase-name">{purchase.item}</span>
                    <span className="purchase-cost">-🪙 {purchase.cost}</span>
                    <span className="purchase-date">{new Date(purchase.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
              <div className="spending-lesson">
                <p>💡 <strong>Money Lesson:</strong> You've spent {selectedStudent.purchases.reduce((total, p) => total + p.cost, 0)} tokens total! 
                Think about saving vs. spending. What's your next savings goal?</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Individual student screen
  if (selectedStudent) {
    return (
      <div className="App">
        <div className="individual-screen">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Group
          </button>
          
          <div className="welcome-message">
            <h1>Hi {selectedStudent.name}! 👋</h1>
            <div className="token-display">
              <span className="token-count">🪙 {selectedStudent.tokens} Total Tokens</span>
              {selectedStudent.todayTokens > 0 && (
                <span className="today-tokens">+{selectedStudent.todayTokens} Today!</span>
              )}
            </div>
          </div>

          <div className="mission-card">
            <h2>TODAY'S MISSION:</h2>
            <p className="mission-icon">
              {groupGoals[currentGroup].icon} {currentGroup.charAt(0).toUpperCase() + currentGroup.slice(1)} Group: {groupGoals[currentGroup].topic}
            </p>
            <p className="mission-goal">
              🎯 YOUR GOAL: {groupGoals[currentGroup].goal}
            </p>
          </div>

          <div className="action-buttons">
            <button 
              className="ready-button"
              onClick={() => handleReadyClick(selectedStudent._id)}
            >
              I'M READY TO START!
            </button>
            
            <button 
              className="shop-button"
              onClick={() => setShowTokenStore(true)}
            >
              🏪 SPEND TOKENS
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="App">
      <header className="app-header">
        <h1>Welcome to {teacher?.firstName}'s Resource Room</h1>
        <p>Ready to level up your skills?</p>
        {!studentMode && (
          <div className="teacher-controls">
            <button 
              className="teacher-panel-btn"
              onClick={() => setShowTeacherPanel(!showTeacherPanel)}
            >
              👨‍🏫 Teacher Panel
            </button>
            <button 
              className="logout-btn"
              onClick={logout}
            >
              🚪 Logout
            </button>
          </div>
        )}
        {studentMode && (
          <div className="student-mode-header">
            <p style={{fontSize: '1.2rem', color: '#FFD700'}}>🎓 Student Mode Active</p>
            <button 
              className="teacher-access-btn"
              onClick={() => setShowCodeInput(true)}
            >
              Teacher Access
            </button>
          </div>
        )}
      </header>

      {/* Teacher Code Input Modal */}
      {showCodeInput && (
        <div className="code-modal">
          <div className="code-modal-content">
            <h3>👨‍🏫 Teacher Access</h3>
            <p>Enter 6-digit teacher code:</p>
            <input
              type="password"
              value={teacherCode}
              onChange={(e) => setTeacherCode(e.target.value)}
              onKeyPress={handleCodeInputKeyPress}
              maxLength="6"
              className="code-input"
              placeholder="••••••"
              autoFocus
            />
            <div className="code-modal-buttons">
              <button onClick={handleTeacherCodeSubmit} className="submit-code-btn">
                Submit
              </button>
              <button onClick={() => {setShowCodeInput(false); setTeacherCode('');}} className="cancel-code-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!studentMode && showTeacherPanel && (
        <div className="teacher-panel">
          <div className="panel-header">
            <h3>🎯 Teacher Controls</h3>
            <div className="panel-buttons">
              <button 
                onClick={activateStudentMode} 
                className="student-mode-btn"
              >
                🎓 Activate Student Mode
              </button>
              <button onClick={() => setShowAddStudent(!showAddStudent)} className="add-student-btn">
                👥 Add Student
              </button>
              <button onClick={() => setShowEditGoals(!showEditGoals)} className="edit-goals-btn">
                🎯 Edit Goals
              </button>
              <button onClick={exportData} className="export-btn">
                📊 Export Data
              </button>
            </div>
          </div>

          {showAddStudent && (
            <div className="add-student-form">
              <h4>➕ Add New Student</h4>
              <div className="form-column">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="student-name-input"
                  />
                </div>
                
                <div className="groups-selection">
                  <label><strong>Select Groups (check all that apply):</strong></label>
                  <div className="checkbox-grid">
                    {['reading', 'math', 'writing', 'behavior'].map(group => (
                      <label key={group} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={newStudentGroups.includes(group)}
                          onChange={() => handleGroupToggle(group)}
                        />
                        <span className="checkbox-label">
                          {group === 'reading' && '📖'} 
                          {group === 'math' && '🔢'} 
                          {group === 'writing' && '✏️'} 
                          {group === 'behavior' && '🤝'} 
                          {group.charAt(0).toUpperCase() + group.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {newStudentGroups.length > 1 && (
                  <div className="primary-group-selection">
                    <label><strong>Primary Group:</strong></label>
                    <select 
                      value={newStudentPrimaryGroup} 
                      onChange={(e) => setNewStudentPrimaryGroup(e.target.value)}
                      className="group-select"
                    >
                      {newStudentGroups.map(group => (
                        <option key={group} value={group}>
                          {group === 'reading' && '📖'} 
                          {group === 'math' && '🔢'} 
                          {group === 'writing' && '✏️'} 
                          {group === 'behavior' && '🤝'} 
                          {group.charAt(0).toUpperCase() + group.slice(1)}
                        </option>
                      ))}
                    </select>
                    <small className="form-hint">Primary group determines where they appear by default</small>
                  </div>
                )}

                <div className="form-actions">
                  <button onClick={addStudent} className="confirm-add-btn">
                    Add Student
                  </button>
                  <button onClick={() => setShowAddStudent(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditGoals && (
            <div className="edit-goals-form">
              <h4>🎯 Edit Weekly Goals</h4>
              <div className="goals-grid">
                {Object.entries(groupGoals).map(([group, goalData]) => (
                  <div key={group} className="goal-editor">
                    <h5>{goalData.icon} {group.charAt(0).toUpperCase() + group.slice(1)} Group</h5>
                    <div className="goal-inputs">
                      <label>Topic/Skill:</label>
                      <input
                        type="text"
                        value={goalData.topic}
                        onChange={(e) => updateGroupGoal(group, 'topic', e.target.value)}
                        className="goal-input"
                        placeholder="What skill are they learning?"
                      />
                      <label>Student Goal:</label>
                      <input
                        type="text"
                        value={goalData.goal}
                        onChange={(e) => updateGroupGoal(group, 'goal', e.target.value)}
                        className="goal-input"
                        placeholder="What should students accomplish?"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="goals-actions">
                <button onClick={saveGoals} className="close-goals-btn">
                  ✅ Save Goals
                </button>
                <button onClick={() => setShowEditGoals(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <h4>🎯 Award Bonus Tokens</h4>
          <div className="bonus-controls">
            {students.map(student => (
              <div key={student._id} className="bonus-row">
                <span className="bonus-name">
                  {student.name}
                  <br />
                  <small style={{opacity: 0.8}}>
                    Groups: {(student.groups || []).join(', ') || 'None'}
                  </small>
                </span>
                <div className="button-group">
                  <button onClick={() => awardBonusTokens(student._id, 1)} className="bonus-btn">
                    +1 Task Complete
                  </button>
                  <button onClick={() => awardBonusTokens(student._id, 1)} className="bonus-btn">
                    +1 Independent Work
                  </button>
                  <button 
                    onClick={() => updateStudentGroups(student._id, ['reading', 'math', 'writing', 'behavior'], 'reading')} 
                    className="groups-btn"
                    title="Add to All Groups"
                  >
                    📚 All Groups
                  </button>
                  <button 
                    onClick={() => deleteStudent(student._id, student.name)} 
                    className="delete-btn"
                    title="Delete Student"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="quick-stats">
            <h4>📈 Today's Quick Stats</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Present Today:</span>
                <span className="stat-value">{students.filter(s => s.present).length}/{students.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tokens Earned:</span>
                <span className="stat-value">{students.reduce((sum, s) => sum + (s.todayTokens || 0), 0)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Reading Group:</span>
                <span className="stat-value">{students.filter(s => (s.todaySubjects || []).includes('reading')).length} attended</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Math Group:</span>
                <span className="stat-value">{students.filter(s => (s.todaySubjects || []).includes('math')).length} attended</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="group-selector">
        <button 
          className={`group-btn ${currentGroup === 'reading' ? 'active' : ''}`}
          onClick={() => setCurrentGroup('reading')}
        >
          📖 Reading
        </button>
        <button 
          className={`group-btn ${currentGroup === 'math' ? 'active' : ''}`}
          onClick={() => setCurrentGroup('math')}
        >
          🔢 Math
        </button>
        <button 
          className={`group-btn ${currentGroup === 'writing' ? 'active' : ''}`}
          onClick={() => setCurrentGroup('writing')}
        >
          ✏️ Writing
        </button>
        <button 
          className={`group-btn ${currentGroup === 'behavior' ? 'active' : ''}`}
          onClick={() => setCurrentGroup('behavior')}
        >
          🤝 Behavior
        </button>
      </div>

      <div className="group-info">
        <h2>Today's Focus: {currentGroup.toUpperCase()} Group • 20 minutes</h2>
        <p className="current-goal">
          📚 Current Topic: <strong>{groupGoals[currentGroup].topic}</strong> • 
          🎯 Goal: <strong>{groupGoals[currentGroup].goal}</strong>
        </p>
      </div>

      <div className="name-grid">
        {currentStudents.map(student => (
          <button
            key={student._id}
            className="name-button"
            onClick={() => handleStudentClick(student)}
          >
            {student.name}
          </button>
        ))}
      </div>

      <div className="group-summary">
        <h3>GROUP PROGRESS 🏆</h3>
        {currentStudents.map(student => (
          <div key={student._id} className="progress-row">
            <span className={`student-name ${student.present ? 'present' : ''}`}>
              {student.present ? '✅' : '○'} {student.name}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${(student.skillsCompleted / student.totalSkills) * 100}%`}}
              ></div>
            </div>
            <span className="progress-text">
              {student.skillsCompleted}/{student.totalSkills} skills
            </span>
            <span className="token-info">
              🪙 {student.tokens}
            </span>
          </div>
        ))}
      </div>

      <div className="token-leaderboard">
        <h3>🏅 TOKEN CHAMPIONS</h3>
        <div className="leaderboard-list">
          {[...students]
            .sort((a, b) => b.tokens - a.tokens)
            .slice(0, 5)
            .map((student, index) => (
              <div key={student._id} className="leaderboard-item">
                <span className="rank">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <span className="leader-name">{student.name}</span>
                <span className="leader-tokens">🪙 {student.tokens}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;