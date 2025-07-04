import React, { useState } from 'react';
import './App.css';

function App() {
  // Sample student data - you can modify these names and groups
  const [students, setStudents] = useState([
    // Reading Group
    { id: 1, name: 'SARAH', group: 'reading', skillsCompleted: 8, totalSkills: 10, present: false, tokens: 25, todayTokens: 0, todaySubjects: [], purchases: [] },
    { id: 2, name: 'MIGUEL', group: 'reading', skillsCompleted: 6, totalSkills: 10, present: false, tokens: 18, todayTokens: 0, todaySubjects: [], purchases: [] },
    { id: 3, name: 'AIDEN', group: 'reading', skillsCompleted: 3, totalSkills: 10, present: false, tokens: 12, todayTokens: 0, todaySubjects: [], purchases: [] },
    { id: 4, name: 'JASMINE', group: 'reading', skillsCompleted: 9, totalSkills: 10, present: false, tokens: 31, todayTokens: 0, todaySubjects: [], purchases: [] },
    
    // Math Group  
    { id: 5, name: 'EMMA', group: 'math', skillsCompleted: 10, totalSkills: 10, present: false, tokens: 45, todayTokens: 0, todaySubjects: [], purchases: [] },
    { id: 6, name: 'JASON', group: 'math', skillsCompleted: 7, totalSkills: 10, present: false, tokens: 22, todayTokens: 0, todaySubjects: [], purchases: [] },
    { id: 7, name: 'NOAH', group: 'math', skillsCompleted: 4, totalSkills: 10, present: false, tokens: 15, todayTokens: 0, todaySubjects: [], purchases: [] },
    
    // Writing Group
    { id: 8, name: 'LILY', group: 'writing', skillsCompleted: 7, totalSkills: 10, present: false, tokens: 28, todayTokens: 0, todaySubjects: [], purchases: [] },
    { id: 9, name: 'CARTER', group: 'writing', skillsCompleted: 5, totalSkills: 10, present: false, tokens: 19, todayTokens: 0, todaySubjects: [], purchases: [] },
    
    // Behavior Group
    { id: 10, name: 'CARLOS', group: 'behavior', skillsCompleted: 4, totalSkills: 5, present: false, tokens: 33, todayTokens: 0, todaySubjects: [], purchases: [] },
    { id: 11, name: 'ZOE', group: 'behavior', skillsCompleted: 3, totalSkills: 5, present: false, tokens: 16, todayTokens: 0, todaySubjects: [], purchases: [] },
  ]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentGroup, setCurrentGroup] = useState('reading');
  const [showTokenStore, setShowTokenStore] = useState(false);
  const [showTeacherPanel, setShowTeacherPanel] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGroup, setNewStudentGroup] = useState('reading');
  const [showEditGoals, setShowEditGoals] = useState(false);

  // Editable goals for each group
  const [groupGoals, setGroupGoals] = useState({
    reading: {
      topic: "2-syllable words",
      goal: "Read 8 words correctly",
      icon: "📖"
    },
    math: {
      topic: "Addition with regrouping",
      goal: "Solve 10 problems correctly",
      icon: "🔢"
    },
    writing: {
      topic: "Complete sentences",
      goal: "Write 5 complete sentences",
      icon: "✏️"
    },
    behavior: {
      topic: "Asking for help politely",
      goal: 'Remember: "Excuse me, can you help me please?"',
      icon: "🤝"
    }
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

  // Filter students by current group
  const currentStudents = students.filter(student => student.group === currentGroup);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const handleReadyClick = (studentId) => {
    const student = students.find(s => s.id === studentId);
    
    // Check if student already earned token for this subject today
    if (student.todaySubjects.includes(currentGroup)) {
      alert(`${student.name} already earned a token for ${currentGroup} today! But great to see you again! 😊`);
      setSelectedStudent(null);
      return;
    }

    setStudents(students.map(student => 
      student.id === studentId 
        ? { 
            ...student, 
            present: true, 
            tokens: student.tokens + 1, 
            todayTokens: student.todayTokens + 1,
            todaySubjects: [...student.todaySubjects, currentGroup]
          }
        : student
    ));
    setSelectedStudent(null); // Go back to main screen
  };

  const handleBackClick = () => {
    setSelectedStudent(null);
  };

  const handlePurchase = (studentId, itemCost, itemName) => {
    const currentDate = new Date().toLocaleDateString();
    
    setStudents(prevStudents => prevStudents.map(student => 
      student.id === studentId 
        ? { 
            ...student, 
            tokens: student.tokens - itemCost,
            purchases: [...student.purchases, {
              item: itemName,
              cost: itemCost,
              date: currentDate,
              id: Date.now()
            }]
          }
        : student
    ));
    
    // Update selectedStudent to reflect new token count
    setSelectedStudent(prev => ({
      ...prev,
      tokens: prev.tokens - itemCost,
      purchases: [...prev.purchases, {
        item: itemName,
        cost: itemCost,
        date: currentDate,
        id: Date.now()
      }]
    }));
    
    alert(`🎉 Purchase successful! Enjoy your ${itemName}!`);
  };

  const awardBonusTokens = (studentId, amount) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, tokens: student.tokens + amount, todayTokens: student.todayTokens + amount }
        : student
    ));
  };

  const exportData = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    // Create comprehensive data export
    let csvContent = "Student Name,Group,Present Today,Total Tokens,Tokens Earned Today,Subjects Attended Today,Skills Completed,Total Skills,Completion Rate,Total Purchases,Total Spent,Last Purchase\n";
    
    students.forEach(student => {
      const completionRate = ((student.skillsCompleted / student.totalSkills) * 100).toFixed(1);
      const totalSpent = student.purchases.reduce((total, p) => total + p.cost, 0);
      const lastPurchase = student.purchases.length > 0 
        ? `${student.purchases[student.purchases.length - 1].item} (${student.purchases[student.purchases.length - 1].date})`
        : 'None';
      
      csvContent += `${student.name},${student.group},${student.present ? 'Yes' : 'No'},${student.tokens},${student.todayTokens},"${student.todaySubjects.join(', ')}",${student.skillsCompleted},${student.totalSkills},${completionRate}%,${student.purchases.length},${totalSpent},"${lastPurchase}"\n`;
    });
    
    // Add summary statistics
    csvContent += "\n\nSUMMARY STATISTICS\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Students,${students.length}\n`;
    csvContent += `Students Present Today,${students.filter(s => s.present).length}\n`;
    csvContent += `Attendance Rate,${((students.filter(s => s.present).length / students.length) * 100).toFixed(1)}%\n`;
    csvContent += `Total Tokens in System,${students.reduce((sum, s) => sum + s.tokens, 0)}\n`;
    csvContent += `Tokens Earned Today,${students.reduce((sum, s) => sum + s.todayTokens, 0)}\n`;
    csvContent += `Total Purchases Made,${students.reduce((sum, s) => sum + s.purchases.length, 0)}\n`;
    
    // Add individual purchase details
    csvContent += "\n\nPURCHASE DETAILS\n";
    csvContent += "Student,Item,Cost,Date\n";
    students.forEach(student => {
      student.purchases.forEach(purchase => {
        csvContent += `${student.name},${purchase.item},${purchase.cost},${purchase.date}\n`;
      });
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

  const addStudent = () => {
    if (newStudentName.trim() === '') {
      alert('Please enter a student name');
      return;
    }

    // Check if student name already exists
    if (students.some(student => student.name.toLowerCase() === newStudentName.trim().toLowerCase())) {
      alert('A student with this name already exists');
      return;
    }

    const newStudent = {
      id: Date.now(), // Simple ID generation
      name: newStudentName.trim().toUpperCase(),
      group: newStudentGroup,
      skillsCompleted: 0,
      totalSkills: 10,
      present: false,
      tokens: 0,
      todayTokens: 0,
      todaySubjects: [],
      purchases: []
    };

    setStudents([...students, newStudent]);
    setNewStudentName('');
    setShowAddStudent(false);
    alert(`${newStudent.name} has been added to the ${newStudentGroup} group!`);
  };

  const deleteStudent = (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      setStudents(students.filter(student => student.id !== studentId));
      alert(`${studentName} has been removed from the system.`);
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

  // If token store is open
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
                  onClick={() => selectedStudent.tokens >= item.cost && handlePurchase(selectedStudent.id, item.cost, item.name)}
                  disabled={selectedStudent.tokens < item.cost}
                >
                  {selectedStudent.tokens >= item.cost ? 'BUY' : 'Need More'}
                </button>
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
                <span className="stat-value">{students.reduce((sum, s) => sum + s.todayTokens, 0)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Reading Group:</span>
                <span className="stat-value">{students.filter(s => s.todaySubjects.includes('reading')).length} attended</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Math Group:</span>
                <span className="stat-value">{students.filter(s => s.todaySubjects.includes('math')).length} attended</span>
              </div>
            </div>
          </div>
          </div>

          {selectedStudent.purchases && selectedStudent.purchases.length > 0 && (
            <div className="purchase-history">
              <h3>📊 Your Spending History</h3>
              <div className="purchase-list">
                {selectedStudent.purchases.slice(-5).reverse().map(purchase => (
                  <div key={purchase.id} className="purchase-item">
                    <span className="purchase-name">{purchase.item}</span>
                    <span className="purchase-cost">-🪙 {purchase.cost}</span>
                    <span className="purchase-date">{purchase.date}</span>
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
    );
  }

  // If a student is selected, show their individual screen
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
              {groupGoals[selectedStudent.group].icon} {selectedStudent.group.charAt(0).toUpperCase() + selectedStudent.group.slice(1)} Group: {groupGoals[selectedStudent.group].topic}
            </p>
            <p className="mission-goal">
              🎯 YOUR GOAL: {groupGoals[selectedStudent.group].goal}
            </p>
          </div>

          <div className="action-buttons">
            <button 
              className="ready-button"
              onClick={() => handleReadyClick(selectedStudent.id)}
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

  // Main group screen with name buttons
  return (
    <div className="App">
      <header className="app-header">
        <h1>Welcome to Mr. Teacher's Resource Room</h1>
        <p>Ready to level up your skills?</p>
        <button 
          className="teacher-panel-btn"
          onClick={() => setShowTeacherPanel(!showTeacherPanel)}
        >
          👨‍🏫 Teacher Panel
        </button>
      </header>

      {showTeacherPanel && (
        <div className="teacher-panel">
          <div className="panel-header">
            <h3>🎯 Teacher Controls</h3>
            <div className="panel-buttons">
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
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="student-name-input"
                />
                <select 
                  value={newStudentGroup} 
                  onChange={(e) => setNewStudentGroup(e.target.value)}
                  className="group-select"
                >
                  <option value="reading">📖 Reading</option>
                  <option value="math">🔢 Math</option>
                  <option value="writing">✏️ Writing</option>
                  <option value="behavior">🤝 Behavior</option>
                </select>
                <button onClick={addStudent} className="confirm-add-btn">
                  Add Student
                </button>
                <button onClick={() => setShowAddStudent(false)} className="cancel-btn">
                  Cancel
                </button>
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
                <button onClick={() => setShowEditGoals(false)} className="close-goals-btn">
                  ✅ Save Goals
                </button>
              </div>
            </div>
          )}

          <h4>🎯 Award Bonus Tokens</h4>
          <div className="bonus-controls">
            {students.map(student => (
              <div key={student.id} className="bonus-row">
                <span className="bonus-name">{student.name}</span>
                <div className="button-group">
                  <button onClick={() => awardBonusTokens(student.id, 1)} className="bonus-btn">
                    +1 Task Complete
                  </button>
                  <button onClick={() => awardBonusTokens(student.id, 1)} className="bonus-btn">
                    +1 Independent Work
                  </button>
                  <button 
                    onClick={() => deleteStudent(student.id, student.name)} 
                    className="delete-btn"
                    title="Delete Student"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
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
            key={student.id}
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
          <div key={student.id} className="progress-row">
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
              <div key={student.id} className="leaderboard-item">
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

export default App;