import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'courses', label: 'Courses & Subjects', icon: BookOpen },
          { id: 'faculty', label: 'Faculty Directory', icon: Users },
          { id: 'students', label: 'Student Directory', icon: GraduationCap },
          { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
          { id: 'exams', label: 'Exams & Results', icon: Award },
        ];
      case 'FACULTY':
        return [
          { id: 'overview', label: 'Faculty Dashboard', icon: LayoutDashboard },
          { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
          { id: 'exams', label: 'Exam Grading', icon: Award },
          { id: 'courses', label: 'Subjects & Syllabus', icon: BookOpen },
          { id: 'students', label: 'Class Students', icon: GraduationCap },
        ];
      case 'STUDENT':
        return [
          { id: 'overview', label: 'My Academic Portal', icon: LayoutDashboard },
          { id: 'attendance', label: 'Attendance Tracker', icon: CalendarCheck },
          { id: 'exams', label: 'Grades & Report Card', icon: Award },
          { id: 'courses', label: 'My Course & Subjects', icon: BookOpen },
        ];
      default:
        return [{ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems();

  return (
    <aside style={{
      width: '260px',
      flexShrink: 0,
      marginLeft: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      <div className="glass-panel" style={{ padding: '1rem', height: 'fit-content' }}>
        <div style={{
          padding: '0.4rem 0.75rem 0.85rem',
          fontSize: '0.725rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-dim)',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '0.65rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>Navigation Menu</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--primary)' }}>{role}</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent',
                  background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition)',
                  fontFamily: 'var(--font-main)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Tip Card */}
      <div className="glass-panel" style={{
        padding: '1.25rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.04) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
            AcademiaPro Active
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {role === 'ADMIN' && 'Full administrative authority. Manage courses, faculty, student registrations and academic departments.'}
          {role === 'FACULTY' && 'Instructor portal. Take class attendance in 1-click, record exam marks, and monitor performance.'}
          {role === 'STUDENT' && 'Student academic hub. Monitor real-time attendance compliance and inspect official grade transcripts.'}
        </p>
      </div>
    </aside>
  );
};
