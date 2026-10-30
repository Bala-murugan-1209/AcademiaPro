import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  TrendingUp, 
  CalendarCheck, 
  Award,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getAdmin();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading administrative intelligence...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}>
        {error}
      </div>
    );
  }

  const { stats, departmentEnrollment = [], recentStudents = [], recentAttendance = [], recentResults = [] } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.06) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Campus Executive Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Live metrics, enrollment distribution, and academic operational health.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setActiveTab('students')} className="btn btn-primary btn-sm">
            + Enroll Student
          </button>
          <button onClick={() => setActiveTab('exams')} className="btn btn-secondary btn-sm">
            Exams & Grading
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Total Students */}
        <div className="stat-card glass-panel" style={{ background: 'var(--grad-stat-1)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              ACTIVE STUDENTS
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalStudents || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
              Enrolled across programs
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)' }}>
            <GraduationCap size={26} />
          </div>
        </div>

        {/* Total Faculty */}
        <div className="stat-card glass-panel" style={{ background: 'var(--grad-stat-2)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              FACULTY MEMBERS
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalFaculty || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
              Professors & Instructors
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
            <Users size={26} />
          </div>
        </div>

        {/* Total Courses */}
        <div className="stat-card glass-panel" style={{ background: 'var(--grad-stat-3)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              ACADEMIC COURSES
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalCourses || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '0.25rem' }}>
              Degree & diploma tracks
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)' }}>
            <BookOpen size={26} />
          </div>
        </div>

        {/* Total Departments */}
        <div className="stat-card glass-panel" style={{ background: 'var(--grad-stat-4)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              DEPARTMENTS
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalDepartments || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', marginTop: '0.25rem' }}>
              Engineering & Sciences
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.2)', color: 'var(--accent-rose)' }}>
            <Building2 size={26} />
          </div>
        </div>
      </div>

      {/* Grid: Department Distribution & Recent Students */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Department Enrollment */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Enrollment by Department</h3>
            <button onClick={() => setActiveTab('departments')} className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {departmentEnrollment.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No enrollment data found.</p>
            ) : (
              departmentEnrollment.map((dept, idx) => {
                const max = Math.max(...departmentEnrollment.map(d => d.count), 1);
                const pct = Math.round((dept.count / max) * 100);
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600 }}>{dept._id}</span>
                      <span style={{ color: 'var(--text-dim)' }}>{dept.count} Students</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'var(--grad-primary)',
                        borderRadius: 'var(--radius-full)',
                      }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Registered Students</h3>
            <button onClick={() => setActiveTab('students')} className="btn btn-secondary btn-sm">
              Directory <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentStudents.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recent registrations.</p>
            ) : (
              recentStudents.map((st) => (
                <div key={st._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(99,102,241,0.15)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}>
                      {st.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{st.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{st.email}</div>
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>ACTIVE</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
