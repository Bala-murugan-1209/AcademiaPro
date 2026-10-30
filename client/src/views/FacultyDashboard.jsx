import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, CalendarCheck, Award, CheckCircle, Clock } from 'lucide-react';

export const FacultyDashboard = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getFaculty();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load faculty information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading academic schedule...</div>
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

  const { faculty, stats, recentAttendance = [] } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.75rem' }}>Welcome, {user?.name}</h2>
            <span className="badge badge-primary">{faculty?.employeeId}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Department of {faculty?.department?.name || 'Academic Studies'} • {faculty?.qualification}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setActiveTab('attendance')} className="btn btn-primary">
            <CalendarCheck size={16} /> Mark Today's Attendance
          </button>
          <button onClick={() => setActiveTab('exams')} className="btn btn-secondary">
            <Award size={16} /> Record Exam Marks
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
      }}>
        <div className="stat-card glass-panel" style={{ background: 'var(--grad-stat-1)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>ASSIGNED SUBJECTS</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.assignedSubjects || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Active course modules</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)' }}>
            <BookOpen size={26} />
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ background: 'var(--grad-stat-2)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>ENROLLED STUDENTS</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.assignedStudentsCount || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>In your classes</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
            <Users size={26} />
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ background: 'var(--grad-stat-3)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>TODAY'S ATTENDANCE</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.todayAttendanceCount || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>Students marked today</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)' }}>
            <CheckCircle size={26} />
          </div>
        </div>
      </div>

      {/* Assigned Subjects Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem' }}>My Teaching Subjects</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Semester Modules</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}>
          {faculty?.assignedSubjects?.length === 0 ? (
            <div className="glass-card" style={{ color: 'var(--text-muted)' }}>
              No subjects currently assigned to your profile.
            </div>
          ) : (
            faculty?.assignedSubjects?.map((sub) => (
              <div key={sub._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-primary">{sub.code}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Semester {sub.semester} • {sub.credits} Credits
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>{sub.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {sub.course?.name || 'Engineering Curriculum'}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.65rem',
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Attendance
                  </button>
                  <button
                    onClick={() => setActiveTab('exams')}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Examinations
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
