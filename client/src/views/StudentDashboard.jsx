import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  CalendarCheck, 
  Award, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle,
  FileText
} from 'lucide-react';

export const StudentDashboard = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getStudent();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading student academic profile...</div>
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

  const { student, stats, recentResults = [] } = data || {};
  const attendancePct = stats?.attendancePercentage || 0;
  const isAttendanceShort = attendancePct < 75;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Student Profile Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.08) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <h2 style={{ fontSize: '1.75rem' }}>Welcome, {user?.name}</h2>
            <span className="badge badge-success">{student?.rollNumber}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {student?.course?.name} • Semester {student?.currentSemester} • {student?.department?.name}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setActiveTab('attendance')} className="btn btn-primary">
            <CalendarCheck size={16} /> Attendance Breakdown
          </button>
          <button onClick={() => setActiveTab('exams')} className="btn btn-secondary">
            <Award size={16} /> View All Grades
          </button>
        </div>
      </div>

      {/* Attendance & Performance Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Attendance Card with Visual Gauge */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Attendance Standing</h3>
            <span className={`badge ${attendancePct >= 75 ? 'badge-success' : 'badge-danger'}`}>
              {attendancePct >= 75 ? 'ELIGIBLE' : 'SHORTAGE ALERT'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1rem 0' }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: attendancePct >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            }}>
              {attendancePct}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div>Attended: <strong style={{ color: 'var(--text-main)' }}>{stats?.attendedClasses || 0}</strong> classes</div>
              <div>Conducted: <strong style={{ color: 'var(--text-main)' }}>{stats?.totalClasses || 0}</strong> classes</div>
            </div>
          </div>

          <div style={{
            width: '100%',
            height: '10px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: '0.85rem',
          }}>
            <div style={{
              width: `${Math.min(100, attendancePct)}%`,
              height: '100%',
              background: attendancePct >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.5s ease-out',
            }} />
          </div>

          {isAttendanceShort ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.775rem',
              color: 'var(--accent-rose)',
            }}>
              <AlertTriangle size={15} />
              Attendance is below mandatory 75% examination threshold.
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.775rem',
              color: 'var(--accent-emerald)',
            }}>
              <CheckCircle size={15} />
              Good standing. Eligible for semester end examinations.
            </div>
          )}
        </div>

        {/* Academic Program Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Academic Registration</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-dim)' }}>Enrollment ID</span>
              <span style={{ fontWeight: 600 }}>{student?.registrationNumber || 'REG-2024-CSE-001'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-dim)' }}>Degree Track</span>
              <span style={{ fontWeight: 600 }}>{student?.course?.code || 'BTECH-CSE'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-dim)' }}>Current Semester</span>
              <span style={{ fontWeight: 600 }}>Semester {student?.currentSemester}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Admission Date</span>
              <span style={{ fontWeight: 600 }}>
                {student?.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'Aug 2024'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Published Examination Results */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Recent Examination Results</h3>
          <button onClick={() => setActiveTab('exams')} className="btn btn-secondary btn-sm">
            <FileText size={14} /> Full Grade Sheet
          </button>
        </div>

        {recentResults.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No published results yet for this semester.</p>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Examination</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {recentResults.map((res) => (
                  <tr key={res._id}>
                    <td style={{ fontWeight: 600 }}>
                      {res.subject?.name}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{res.subject?.code}</div>
                    </td>
                    <td>{res.examination?.name}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{res.obtainedMarks}</span> / {res.maxMarks}
                    </td>
                    <td>
                      <span className={`badge ${res.grade === 'A+' || res.grade === 'A' ? 'badge-success' : 'badge-primary'}`}>
                        {res.grade}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {res.remarks || 'Satisfactory academic evaluation'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
