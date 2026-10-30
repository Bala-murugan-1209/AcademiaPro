import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Edit3, 
  FileText, 
  Printer, 
  X,
  Sparkles
} from 'lucide-react';

export const ExaminationsView = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const isAdminOrFaculty = user?.role === 'ADMIN' || user?.role === 'FACULTY';

  // State for Admin/Faculty
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [gradingRecords, setGradingRecords] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Student State
  const [studentReport, setStudentReport] = useState(null);

  const [examForm, setExamForm] = useState({
    name: '',
    course: '',
    subject: '',
    semester: 1,
    examDate: new Date().toISOString().split('T')[0],
    maxMarks: 100,
    examType: 'MID_TERM',
  });

  useEffect(() => {
    if (isStudent) {
      loadStudentResults();
    } else {
      loadExamsData();
    }
  }, [isStudent]);

  const loadStudentResults = async () => {
    try {
      setLoading(true);
      const studentId = user?.studentProfile?._id || user?.studentProfile || 'me';
      const res = await api.exams.getStudentResults(studentId);
      if (res.success) {
        setStudentReport(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadExamsData = async () => {
    try {
      setLoading(true);
      const [eRes, cRes, sRes] = await Promise.all([
        api.exams.getAll(),
        api.courses.getAll(),
        api.subjects.getAll(),
      ]);

      if (eRes.success) setExams(eRes.data);
      if (cRes.success) {
        setCourses(cRes.data);
        if (cRes.data.length > 0 && !examForm.course) {
          setExamForm((prev) => ({ ...prev, course: cRes.data[0]._id }));
        }
      }
      if (sRes.success) {
        setSubjects(sRes.data);
        if (sRes.data.length > 0 && !examForm.subject) {
          setExamForm((prev) => ({ ...prev, subject: sRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setModalError('');
      await api.exams.create(examForm);
      setShowCreateModal(false);
      loadExamsData();
    } catch (err) {
      setModalError(err.message || 'Failed to create examination');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenGrading = async (exam) => {
    setSelectedExam(exam);
    setModalError('');
    try {
      // Fetch enrolled students for this course
      const courseId = exam.course?._id || exam.course;
      const sRes = await api.students.getAll(`course=${courseId}`);
      const students = sRes.data || [];

      // Fetch existing exam results
      const examDetailRes = await api.exams.getById(exam._id);
      const existingResults = examDetailRes.data?.results || [];
      const resultMap = {};
      existingResults.forEach((r) => {
        const sId = r.student?._id || r.student;
        resultMap[sId] = r;
      });

      const records = students.map((st) => ({
        student: st._id,
        name: st.user?.name || 'Student',
        rollNumber: st.rollNumber,
        obtainedMarks: resultMap[st._id]?.obtainedMarks ?? '',
        remarks: resultMap[st._id]?.remarks || '',
      }));

      setGradingRecords(records);
      setShowGradingModal(true);
    } catch (err) {
      alert(err.message || 'Failed to load class roster');
    }
  };

  const handleSaveGrading = async () => {
    try {
      setSubmitting(true);
      setModalError('');

      const validResults = gradingRecords
        .filter((r) => r.obtainedMarks !== '' && !isNaN(parseFloat(r.obtainedMarks)))
        .map((r) => ({
          student: r.student,
          obtainedMarks: parseFloat(r.obtainedMarks),
          remarks: r.remarks,
        }));

      if (validResults.length === 0) {
        setModalError('Please enter marks for at least one student.');
        setSubmitting(false);
        return;
      }

      await api.exams.submitResults({
        examinationId: selectedExam._id,
        results: validResults,
      });

      setShowGradingModal(false);
      loadExamsData();
    } catch (err) {
      setModalError(err.message || 'Failed to submit grades');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (exam) => {
    try {
      await api.exams.publish(exam._id, !exam.isPublished);
      loadExamsData();
    } catch (err) {
      alert(err.message || 'Failed to toggle publication');
    }
  };

  // Student Transcript View
  if (isStudent) {
    const results = studentReport?.results || [];
    const pct = studentReport?.overallPercentage || 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Official Academic Transcript & Grade Sheet</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Certified semester examination evaluation and performance grades.
            </p>
          </div>

          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={16} /> Print Grade Report
          </button>
        </div>

        {/* Performance KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--grad-stat-1)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>CUMULATIVE PERCENTAGE</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              {pct}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>First Class with Distinction</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--grad-stat-2)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>TOTAL MARKS EARNED</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              {studentReport?.totalMarksObtained || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Out of {studentReport?.totalMaxMarks || 0} aggregate max
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--grad-stat-3)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>EXAMS EVALUATED</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              {results.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>Published official scores</div>
          </div>
        </div>

        {/* Grade Sheet Table */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Semester Grade Breakdown</h3>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading report card...</div>
          ) : results.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
              No examination results have been published for your profile yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Code</th>
                    <th>Exam Title</th>
                    <th>Exam Date</th>
                    <th>Max Marks</th>
                    <th>Obtained Marks</th>
                    <th>Letter Grade</th>
                    <th>Faculty Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((res) => (
                    <tr key={res._id}>
                      <td style={{ fontWeight: 600 }}>{res.subject?.name}</td>
                      <td><span className="badge badge-primary">{res.subject?.code}</span></td>
                      <td>{res.examination?.name}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {res.examination?.examDate ? new Date(res.examination.examDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>{res.maxMarks}</td>
                      <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                        {res.obtainedMarks}
                      </td>
                      <td>
                        <span className={`badge ${
                          res.grade === 'A+' || res.grade === 'A' ? 'badge-success' : res.grade === 'B+' || res.grade === 'B' ? 'badge-primary' : 'badge-warning'
                        }`} style={{ fontWeight: 700, fontSize: '0.8rem' }}>
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
  }

  // Admin / Faculty Examination Management
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Examinations & Grading Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Schedule midterm/final tests, record student marks, calculate letter grades, and publish transcripts.
          </p>
        </div>

        {isAdminOrFaculty && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} /> Schedule Examination
          </button>
        )}
      </div>

      {/* Exams Table */}
      <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading examinations...</div>
        ) : exams.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            No examinations scheduled yet. Click "Schedule Examination" to create one.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Examination Name</th>
                  <th>Course & Semester</th>
                  <th>Subject</th>
                  <th>Exam Date</th>
                  <th>Max Marks</th>
                  <th>Grades Entered</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{exam.name}</div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{exam.examType}</span>
                    </td>
                    <td>
                      <div>{exam.course?.code}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Semester {exam.semester}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{exam.subject?.name}</div>
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{exam.subject?.code}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(exam.examDate).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{exam.maxMarks} pts</td>
                    <td>
                      <span className="badge badge-neutral">
                        {exam.resultCount || 0} Graded
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${exam.isPublished ? 'badge-success' : 'badge-warning'}`}>
                        {exam.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenGrading(exam)}
                          className="btn btn-primary btn-sm"
                          title="Grade Students"
                        >
                          <Edit3 size={13} /> Enter Marks
                        </button>
                        <button
                          onClick={() => handleTogglePublish(exam)}
                          className={`btn btn-sm ${exam.isPublished ? 'btn-secondary' : 'btn-primary'}`}
                          style={{
                            background: exam.isPublished ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.2)',
                            color: exam.isPublished ? 'var(--text-dim)' : 'var(--accent-emerald)',
                            border: exam.isPublished ? '1px solid var(--border-subtle)' : '1px solid rgba(16, 185, 129, 0.4)',
                          }}
                          title={exam.isPublished ? 'Unpublish from Students' : 'Publish to Students'}
                        >
                          {exam.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                          {exam.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Exam Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Schedule Examination</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '0.75rem', background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateExam}>
              <div className="form-group">
                <label className="form-label">Examination Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Exam: Computer Architecture"
                  className="form-input"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select
                    className="form-select"
                    value={examForm.course}
                    onChange={(e) => setExamForm({ ...examForm, course: e.target.value })}
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    value={examForm.subject}
                    onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                  >
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="form-input"
                    value={examForm.semester}
                    onChange={(e) => setExamForm({ ...examForm, semester: parseInt(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    className="form-input"
                    value={examForm.maxMarks}
                    onChange={(e) => setExamForm({ ...examForm, maxMarks: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Exam Type</label>
                  <select
                    className="form-select"
                    value={examForm.examType}
                    onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
                  >
                    <option value="MID_TERM">Mid Term</option>
                    <option value="END_TERM">End Term</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="PRACTICAL">Practical Lab</option>
                    <option value="QUIZ">Quiz</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Examination Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={examForm.examDate}
                  onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Scheduling...' : 'Schedule Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Students Modal */}
      {showGradingModal && (
        <div className="modal-overlay" onClick={() => setShowGradingModal(false)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Enter Student Marks & Evaluation</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedExam?.name} • Max Marks: {selectedExam?.maxMarks} pts
                </p>
              </div>
              <button onClick={() => setShowGradingModal(false)} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '0.75rem', background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <div style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '1.25rem' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th style={{ width: '130px' }}>Marks (/{selectedExam?.maxMarks})</th>
                    <th>Auto Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {gradingRecords.map((r, idx) => {
                    const marks = parseFloat(r.obtainedMarks);
                    const pct = !isNaN(marks) && selectedExam?.maxMarks ? (marks / selectedExam.maxMarks) * 100 : 0;
                    let calculatedGrade = '-';
                    if (!isNaN(marks) && r.obtainedMarks !== '') {
                      if (pct >= 90) calculatedGrade = 'A+';
                      else if (pct >= 80) calculatedGrade = 'A';
                      else if (pct >= 70) calculatedGrade = 'B+';
                      else if (pct >= 60) calculatedGrade = 'B';
                      else if (pct >= 50) calculatedGrade = 'C';
                      else if (pct >= 40) calculatedGrade = 'D';
                      else calculatedGrade = 'F';
                    }

                    return (
                      <tr key={r.student}>
                        <td><span className="badge badge-primary">{r.rollNumber}</span></td>
                        <td style={{ fontWeight: 600 }}>{r.name}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={selectedExam?.maxMarks}
                            placeholder="Score"
                            className="form-input"
                            style={{ height: '34px', fontSize: '0.85rem', padding: '0.2rem 0.5rem' }}
                            value={r.obtainedMarks}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGradingRecords((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, obtainedMarks: val } : item))
                              );
                            }}
                          />
                        </td>
                        <td>
                          <span className={`badge ${
                            calculatedGrade === 'A+' || calculatedGrade === 'A' ? 'badge-success' : calculatedGrade === 'B+' || calculatedGrade === 'B' ? 'badge-primary' : 'badge-neutral'
                          }`}>
                            {calculatedGrade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setShowGradingModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleSaveGrading} disabled={submitting} className="btn btn-primary">
                {submitting ? 'Saving Marks...' : 'Save & Calculate Grades'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
