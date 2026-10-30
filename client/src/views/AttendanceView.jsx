import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarCheck, 
  Check, 
  X, 
  Clock, 
  Save, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  Layers,
  Plus,
  Users
} from 'lucide-react';

export const AttendanceView = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';

  // State for Faculty/Admin
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentRecords, setStudentRecords] = useState([]);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // State for Student
  const [studentStats, setStudentStats] = useState(null);
  const [studentLogs, setStudentLogs] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(false);

  useEffect(() => {
    if (isStudent) {
      loadStudentAttendance();
    } else {
      loadFacultyCourses();
    }
  }, [isStudent]);

  // Student data loader
  const loadStudentAttendance = async () => {
    try {
      setLoadingStudent(true);
      const studentId = user?.studentProfile?._id || user?.studentProfile || 'me';
      const res = await api.attendance.getStudentHistory(studentId);
      if (res.success) {
        setStudentStats(res.data.summary);
        setStudentLogs(res.data.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudent(false);
    }
  };

  // Faculty/Admin data loader
  const loadFacultyCourses = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.courses.getAll(),
        api.subjects.getAll(),
      ]);

      if (cRes.success && cRes.data.length > 0) {
        setCourses(cRes.data);
        setSelectedCourse((prev) => {
          if (prev && cRes.data.some((c) => c._id === prev)) return prev;
          return cRes.data[0]._id;
        });
      }
      if (sRes.success && Array.isArray(sRes.data)) {
        setSubjects(sRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Synchronize selectedSubject whenever selectedCourse changes
  useEffect(() => {
    if (!selectedCourse || subjects.length === 0) return;
    const available = subjects.filter((s) => {
      const sCourseId = s.course?._id || s.course;
      return sCourseId === selectedCourse || s.course?.code === selectedCourse;
    });

    if (available.length > 0) {
      const isCurrentValid = available.some((s) => s._id === selectedSubject);
      if (!isCurrentValid) {
        setSelectedSubject(available[0]._id);
      }
    } else {
      setSelectedSubject('');
    }
  }, [selectedCourse, subjects]);

  // Load students when course, subject, or date change
  useEffect(() => {
    if (!isStudent && selectedCourse) {
      loadClassRegister();
    }
  }, [selectedCourse, selectedSubject, date, isStudent]);

  const loadClassRegister = async () => {
    try {
      setLoadingRegister(true);
      setSaveSuccess(false);

      // Fetch enrolled students for this course
      const sRes = await api.students.getAll(`course=${selectedCourse}`);
      const enrolled = sRes.data || [];

      // Determine active subject to query existing register
      const activeSubjectId = selectedSubject || (subjects.find(
        (s) => s.course?._id === selectedCourse || s.course === selectedCourse
      )?._id);

      let existingMap = {};
      if (activeSubjectId) {
        const sheetRes = await api.attendance.getClassSheet(activeSubjectId, date).catch(() => ({ data: [] }));
        const existing = sheetRes.data || [];
        existing.forEach((rec) => {
          const sId = rec.student?._id || rec.student;
          existingMap[sId] = rec;
        });
      }

      // Prepare records
      const prepared = enrolled.map((st) => ({
        student: st._id,
        name: st.user?.name || 'Student',
        rollNumber: st.rollNumber,
        status: existingMap[st._id]?.status || 'PRESENT',
        remarks: existingMap[st._id]?.remarks || '',
      }));

      setStudentRecords(prepared);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegister(false);
    }
  };

  // Allow faculty to populate a sample cohort if the course has 0 students
  const handleQuickEnrollCohort = async () => {
    try {
      setLoadingRegister(true);
      const courseObj = courses.find((c) => c._id === selectedCourse);
      const prefix = courseObj?.code?.replace('BTECH-', '') || 'ENG';
      const sampleNames = ['Neil Armstrong', 'Sally Ride', 'Kalpana Chawla', 'Buzz Aldrin'];

      for (let i = 0; i < sampleNames.length; i++) {
        const rNum = `${prefix}20240${i + 1}`;
        await api.students.create({
          name: sampleNames[i],
          email: `${sampleNames[i].toLowerCase().replace(' ', '.')}${Date.now().toString().slice(-4)}@college.edu`,
          password: 'Student@123',
          rollNumber: rNum,
          registrationNumber: `REG-2024-${rNum}`,
          department: courseObj?.department?._id || courseObj?.department,
          course: selectedCourse,
          currentSemester: 2,
        }).catch(() => null);
      }
      await loadClassRegister();
    } catch (err) {
      console.error('Quick enroll error:', err);
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStudentRecords((prev) =>
      prev.map((rec) => (rec.student === studentId ? { ...rec, status } : rec))
    );
  };

  const markAll = (status) => {
    setStudentRecords((prev) => prev.map((rec) => ({ ...rec, status })));
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      const payload = {
        subject: selectedSubject,
        course: selectedCourse,
        date,
        records: studentRecords.map((r) => ({
          student: r.student,
          status: r.status,
          remarks: r.remarks,
        })),
      };

      const res = await api.attendance.markBatch(payload);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // If Student View
  if (isStudent) {
    const pct = studentStats?.percentage || 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>My Attendance Performance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Live attendance tracking against mandatory university eligibility requirements.
          </p>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--grad-stat-2)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>CUMULATIVE ATTENDANCE</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: pct >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {pct}%
            </div>
            <div style={{ fontSize: '0.75rem', color: pct >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {pct >= 75 ? 'Meets 75% exam criteria' : 'Requires academic intervention'}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--grad-stat-1)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>ATTENDED LECTURES</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{studentStats?.present || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+ {studentStats?.late || 0} late arrivals</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--grad-stat-4)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>ABSENT SESSIONS</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
              {studentStats?.absent || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Out of {studentStats?.total || 0} conducted</div>
          </div>
        </div>

        {/* Attendance Log Table */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Attendance Journal</h3>

          {loadingStudent ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading logs...</div>
          ) : studentLogs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No attendance logs found.</div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {studentLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontWeight: 600 }}>
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td>{log.subject?.name}</td>
                      <td><span className="badge badge-primary">{log.subject?.code}</span></td>
                      <td>
                        <span className={`badge ${
                          log.status === 'PRESENT' ? 'badge-success' : log.status === 'LATE' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {log.remarks || 'Standard lecture'}
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
  }

  // Faculty / Admin Attendance Register
  const presentCount = studentRecords.filter((r) => r.status === 'PRESENT').length;
  const lateCount = studentRecords.filter((r) => r.status === 'LATE').length;
  const absentCount = studentRecords.filter((r) => r.status === 'ABSENT').length;
  const total = studentRecords.length;
  const rate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Class Attendance Register</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Record, verify, and synchronize daily class roll attendance.
          </p>
        </div>

        {/* Quick Batch Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {saveSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} /> Saved Successfully!
            </div>
          )}
          <button
            onClick={handleSaveAttendance}
            disabled={saving || studentRecords.length === 0}
            className="btn btn-primary"
            style={{ height: '40px' }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Selector Controls */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        alignItems: 'end',
      }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Degree Course</label>
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Subject Module</label>
          <select
            className="form-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.filter((s) => {
              if (!selectedCourse) return true;
              const sCourseId = s.course?._id || s.course;
              return sCourseId === selectedCourse || s.course?.code === selectedCourse;
            }).length === 0 ? (
              <option value="" disabled>No subject modules found for this course</option>
            ) : (
              subjects
                .filter((s) => {
                  if (!selectedCourse) return true;
                  const sCourseId = s.course?._id || s.course;
                  return sCourseId === selectedCourse || s.course?.code === selectedCourse;
                })
                .map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))
            )}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Session Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Live Attendance Summary Banner */}
      <div className="glass-panel" style={{
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>TOTAL ROSTER:</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{total}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>PRESENT:</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{presentCount}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 600 }}>LATE:</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{lateCount}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', fontWeight: 600 }}>ABSENT:</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{absentCount}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>RATE:</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{rate}%</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => markAll('PRESENT')} className="btn btn-secondary btn-sm">
            Mark All Present
          </button>
          <button onClick={() => markAll('ABSENT')} className="btn btn-secondary btn-sm">
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Student Attendance Grid */}
      <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
        {loadingRegister ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading student roster...</div>
        ) : studentRecords.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ marginBottom: '0.5rem', fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 600 }}>
              No enrolled students found in this course yet.
            </div>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
              Populate an initial class roster for this course to begin recording and tracking daily roll attendance.
            </p>
            <button
              type="button"
              onClick={handleQuickEnrollCohort}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
            >
              <Plus size={15} /> Populate Class Cohort
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th style={{ textAlign: 'center' }}>Attendance Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {studentRecords.map((rec) => (
                  <tr key={rec.student}>
                    <td style={{ fontWeight: 600 }}>
                      <span className="badge badge-primary">{rec.rollNumber}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{rec.name}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(rec.student, 'PRESENT')}
                          className={`btn btn-sm ${rec.status === 'PRESENT' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            background: rec.status === 'PRESENT' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.04)',
                            color: rec.status === 'PRESENT' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                            border: rec.status === 'PRESENT' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-subtle)',
                            fontWeight: 700,
                          }}
                        >
                          <Check size={14} /> Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(rec.student, 'LATE')}
                          className={`btn btn-sm ${rec.status === 'LATE' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            background: rec.status === 'LATE' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.04)',
                            color: rec.status === 'LATE' ? 'var(--accent-amber)' : 'var(--text-muted)',
                            border: rec.status === 'LATE' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-subtle)',
                            fontWeight: 700,
                          }}
                        >
                          <Clock size={14} /> Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(rec.student, 'ABSENT')}
                          className={`btn btn-sm ${rec.status === 'ABSENT' ? 'btn-danger' : 'btn-secondary'}`}
                          style={{
                            background: rec.status === 'ABSENT' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255,255,255,0.04)',
                            color: rec.status === 'ABSENT' ? 'var(--accent-rose)' : 'var(--text-muted)',
                            border: rec.status === 'ABSENT' ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-subtle)',
                            fontWeight: 700,
                          }}
                        >
                          <X size={14} /> Absent
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        className="form-input"
                        style={{ height: '32px', fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}
                        value={rec.remarks}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStudentRecords((prev) =>
                            prev.map((r) => (r.student === rec.student ? { ...r, remarks: val } : r))
                          );
                        }}
                      />
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
