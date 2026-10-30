import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/LoginView';

// Views
import { AdminDashboard } from './views/AdminDashboard';
import { FacultyDashboard } from './views/FacultyDashboard';
import { StudentDashboard } from './views/StudentDashboard';
import { DepartmentsView } from './views/DepartmentsView';
import { CoursesView } from './views/CoursesView';
import { FacultyView } from './views/FacultyView';
import { StudentsView } from './views/StudentsView';
import { AttendanceView } from './views/AttendanceView';
import { ExaminationsView } from './views/ExaminationsView';
import { GraduationCap } from 'lucide-react';

export function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--grad-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: 'var(--shadow-glow)',
          animation: 'pulse 1.5s infinite',
        }}>
          <GraduationCap size={30} />
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Loading AcademiaPro...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        if (user.role === 'ADMIN') return <AdminDashboard setActiveTab={setActiveTab} />;
        if (user.role === 'FACULTY') return <FacultyDashboard setActiveTab={setActiveTab} />;
        return <StudentDashboard setActiveTab={setActiveTab} />;
      case 'departments':
        return <DepartmentsView />;
      case 'courses':
        return <CoursesView />;
      case 'faculty':
        return <FacultyView />;
      case 'students':
        return <StudentsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'exams':
        return <ExaminationsView />;
      default:
        return <AdminDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{
        display: 'flex',
        flex: 1,
        gap: '1.25rem',
        paddingRight: '1.25rem',
        paddingBottom: '2rem',
      }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main style={{ flex: 1, minWidth: 0 }}>
          {renderActiveView()}
        </main>
      </div>

      <footer style={{
        padding: '1.25rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        AcademiaPro Unified College Management System • Operating with zero-friction role transitions
      </footer>
    </div>
  );
}

export default App;
