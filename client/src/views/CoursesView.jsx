import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus, Search, ChevronRight, Layers, Award, Calendar, X } from 'lucide-react';

export const CoursesView = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSubjects, setCourseSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    department: '',
    program: 'Undergraduate',
    duration: 4,
    totalSemesters: 8,
    credits: 160,
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    semester: 1,
    credits: 4,
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, dRes] = await Promise.all([
        api.courses.getAll(),
        api.departments.getAll(),
      ]);
      if (cRes.success) {
        setCourses(cRes.data);
        if (cRes.data.length > 0) {
          handleSelectCourse(cRes.data[0]);
        }
      }
      if (dRes.success) {
        setDepartments(dRes.data);
        if (dRes.data.length > 0) {
          setCourseForm((prev) => ({ ...prev, department: dRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await api.courses.getById(course._id);
      if (res.success) {
        setCourseSubjects(res.data.subjects || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setModalError('');
      await api.courses.create(courseForm);
      setShowCourseModal(false);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setModalError('');
      await api.subjects.create({
        ...subjectForm,
        course: selectedCourse._id,
      });
      setShowSubjectModal(false);
      handleSelectCourse(selectedCourse);
    } catch (err) {
      setModalError(err.message || 'Failed to add subject');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Academic Degree Programs & Syllabus</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Structured course curricula, semester-wise subjects, and assigned professors.
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowCourseModal(true)} className="btn btn-primary btn-sm">
              <Plus size={15} /> Add Course
            </button>
            {selectedCourse && (
              <button onClick={() => setShowSubjectModal(true)} className="btn btn-secondary btn-sm">
                <Plus size={15} /> Add Subject to Course
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Split Layout: Left Course list, Right Subjects breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 340px) 1fr',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        {/* Left: Course List */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search courses..."
              className="form-input"
              style={{ paddingLeft: '2.2rem', height: '36px', fontSize: '0.8rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filteredCourses.map((c) => {
              const isSelected = selectedCourse?._id === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => handleSelectCourse(c)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{c.code}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {c.duration} Yrs • {c.totalSemesters} Sem
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? '#ffffff' : 'var(--text-main)' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                    Dept: {c.department?.name || 'General'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Course Syllabus & Subject Breakdown */}
        <div>
          {selectedCourse ? (
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-primary">{selectedCourse.code}</span>
                    <h3 style={{ fontSize: '1.4rem' }}>{selectedCourse.name}</h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {selectedCourse.description || 'Comprehensive curriculum with theory, laboratory sessions, and capstone design.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedCourse.totalSemesters}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>SEMESTERS</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedCourse.credits || 160}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>CREDITS</div>
                  </div>
                </div>
              </div>

              {/* Subject Table */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.05rem' }}>Course Modules & Syllabus</h4>
                {isAdmin && (
                  <button onClick={() => setShowSubjectModal(true)} className="btn btn-primary btn-sm">
                    <Plus size={14} /> Add Subject
                  </button>
                )}
              </div>

              {courseSubjects.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-md)' }}>
                  No subjects configured yet for this course. Click "Add Subject" to begin.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Subject Name</th>
                        <th>Semester</th>
                        <th>Credits</th>
                        <th>Faculty In-Charge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseSubjects.map((sub) => (
                        <tr key={sub._id}>
                          <td><span className="badge badge-primary">{sub.code}</span></td>
                          <td style={{ fontWeight: 600 }}>{sub.name}</td>
                          <td>Semester {sub.semester}</td>
                          <td><span className="badge badge-neutral">{sub.credits} Credits</span></td>
                          <td>
                            {sub.assignedFaculty && sub.assignedFaculty.length > 0 ? (
                              <span style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
                                {sub.assignedFaculty.map(f => f.user?.name).filter(Boolean).join(', ') || 'Assigned'}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Unassigned</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
              Select a course on the left to inspect syllabus and subjects.
            </div>
          )}
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="modal-overlay" onClick={() => setShowCourseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Add Academic Degree Course</h3>
              <button onClick={() => setShowCourseModal(false)} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '0.75rem', background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Technology in Computer Science"
                  className="form-input"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BTECH-CSE"
                  className="form-input"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={courseForm.department}
                  onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    className="form-input"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Semesters</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="form-input"
                    value={courseForm.totalSemesters}
                    onChange={(e) => setCourseForm({ ...courseForm, totalSemesters: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCourseModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="modal-overlay" onClick={() => setShowSubjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Add Subject Module to {selectedCourse?.code}</h3>
              <button onClick={() => setShowSubjectModal(false)} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '0.75rem', background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateSubject}>
              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cloud Computing"
                  className="form-input"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS301"
                  className="form-input"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedCourse?.totalSemesters || 8}
                    className="form-input"
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    className="form-input"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowSubjectModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
