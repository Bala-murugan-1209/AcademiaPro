import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Plus, Search, Filter, Phone, Mail, UserCheck, X } from 'lucide-react';

export const StudentsView = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'Student@123',
    rollNumber: '',
    registrationNumber: '',
    course: '',
    department: '',
    currentSemester: 1,
    phone: '+1-555-0299',
    guardianName: 'Parent / Guardian',
    guardianPhone: '+1-555-0298',
  });

  useEffect(() => {
    loadData();
  }, [selectedCourse, selectedSemester, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCourse) params.append('course', selectedCourse);
      if (selectedSemester) params.append('semester', selectedSemester);

      const [sRes, cRes, dRes] = await Promise.all([
        api.students.getAll(params.toString()),
        api.courses.getAll(),
        api.departments.getAll(),
      ]);

      if (sRes.success) setStudents(sRes.data);
      if (cRes.success) {
        setCourses(cRes.data);
        if (cRes.data.length > 0 && !form.course) {
          setForm((prev) => ({
            ...prev,
            course: cRes.data[0]._id,
            department: cRes.data[0].department?._id || prev.department,
          }));
        }
      }
      if (dRes.success) setDepartments(dRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (courseId) => {
    const selected = courses.find((c) => c._id === courseId);
    setForm((prev) => ({
      ...prev,
      course: courseId,
      department: selected?.department?._id || prev.department,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setModalError('');
      await api.students.create(form);
      setShowModal(false);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to enroll student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Student Admissions & Registry</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Comprehensive directory of undergraduate & postgraduate scholars.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: '160px', height: '38px', fontSize: '0.825rem' }}
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.code}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: '130px', height: '38px', fontSize: '0.825rem' }}
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name, roll no..."
              className="form-input"
              style={{ width: '220px', paddingLeft: '2.2rem', height: '38px', fontSize: '0.825rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>

          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ height: '38px' }}>
              <Plus size={16} /> Enroll Student
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading student records...</div>
        ) : students.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>No students match your query.</div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Degree Course</th>
                  <th>Semester</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st._id}>
                    <td>
                      <span className="badge badge-primary">{st.rollNumber}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{st.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{st.user?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{st.course?.code}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{st.course?.name}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">Sem {st.currentSemester}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{st.department?.name}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {st.phone || 'N/A'}
                    </td>
                    <td>
                      <span className={`badge ${st.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                        {st.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enroll Student Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Enroll New Student</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '0.75rem', background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Student Email</label>
                  <input
                    type="email"
                    required
                    placeholder="maya@college.edu"
                    className="form-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="CSE2024099"
                    className="form-input"
                    value={form.rollNumber}
                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select
                    className="form-select"
                    value={form.course}
                    onChange={(e) => handleCourseChange(e.target.value)}
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="form-input"
                    value={form.currentSemester}
                    onChange={(e) => setForm({ ...form, currentSemester: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
