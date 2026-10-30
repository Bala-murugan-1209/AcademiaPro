import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  BookOpen, 
  Building2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  Phone,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

// Comprehensive Engineering Departments Catalog
export const DEFAULT_ENGINEERING_DEPARTMENTS = [
  { _id: 'CSE', code: 'CSE', name: 'Computer Science & Engineering' },
  { _id: 'AIDS', code: 'AIDS', name: 'Artificial Intelligence & Data Science' },
  { _id: 'IT', code: 'IT', name: 'Information Technology' },
  { _id: 'ECE', code: 'ECE', name: 'Electronics & Communication Engineering' },
  { _id: 'EEE', code: 'EEE', name: 'Electrical & Electronics Engineering' },
  { _id: 'ME', code: 'ME', name: 'Mechanical Engineering' },
  { _id: 'CE', code: 'CE', name: 'Civil Engineering' },
  { _id: 'AE', code: 'AE', name: 'Aerospace Engineering' },
  { _id: 'BME', code: 'BME', name: 'Biomedical Engineering' },
  { _id: 'CHE', code: 'CHE', name: 'Chemical Engineering' },
  { _id: 'SMS', code: 'SMS', name: 'School of Management Studies' },
];

export const DEFAULT_ENGINEERING_COURSES = [
  { _id: 'BTECH-CSE', code: 'BTECH-CSE', name: 'B.Tech in Computer Science & Engineering', deptCode: 'CSE' },
  { _id: 'BTECH-AIDS', code: 'BTECH-AIDS', name: 'B.Tech in Artificial Intelligence & Data Science', deptCode: 'AIDS' },
  { _id: 'BTECH-IT', code: 'BTECH-IT', name: 'B.Tech in Information Technology', deptCode: 'IT' },
  { _id: 'BTECH-ECE', code: 'BTECH-ECE', name: 'B.Tech in Electronics & Communication', deptCode: 'ECE' },
  { _id: 'BTECH-EEE', code: 'BTECH-EEE', name: 'B.Tech in Electrical & Electronics Engineering', deptCode: 'EEE' },
  { _id: 'BTECH-ME', code: 'BTECH-ME', name: 'B.Tech in Mechanical Engineering', deptCode: 'ME' },
  { _id: 'BTECH-CE', code: 'BTECH-CE', name: 'B.Tech in Civil Engineering', deptCode: 'CE' },
  { _id: 'BTECH-AE', code: 'BTECH-AE', name: 'B.Tech in Aerospace Engineering', deptCode: 'AE' },
  { _id: 'BTECH-BME', code: 'BTECH-BME', name: 'B.Tech in Biomedical Engineering', deptCode: 'BME' },
  { _id: 'BTECH-CHE', code: 'BTECH-CHE', name: 'B.Tech in Chemical Engineering', deptCode: 'CHE' },
  { _id: 'MBA', code: 'MBA', name: 'Master of Business Administration (MBA)', deptCode: 'SMS' },
];

export const LoginView = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [registerRole, setRegisterRole] = useState('STUDENT'); // 'STUDENT' | 'FACULTY'
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [course, setCourse] = useState('BTECH-CSE');
  const [currentSemester, setCurrentSemester] = useState(1);
  const [rollNumber, setRollNumber] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');

  // Pre-populated data lists so dropdowns NEVER display "Loading..." or empty states
  const [departments, setDepartments] = useState(DEFAULT_ENGINEERING_DEPARTMENTS);
  const [courses, setCourses] = useState(DEFAULT_ENGINEERING_COURSES);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch live departments & courses from API to merge with database Mongo IDs
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const [dRes, cRes] = await Promise.all([
          api.departments.getAll().catch(() => ({ success: false, data: [] })),
          api.courses.getAll().catch(() => ({ success: false, data: [] })),
        ]);

        if (!isMounted) return;

        if (dRes?.success && Array.isArray(dRes.data) && dRes.data.length > 0) {
          const mergedDepts = DEFAULT_ENGINEERING_DEPARTMENTS.map((def) => {
            const found = dRes.data.find(
              (d) => d.code === def.code || d.name?.toLowerCase() === def.name.toLowerCase()
            );
            return found ? { ...def, ...found } : def;
          });
          // Append any custom depts from backend
          dRes.data.forEach((d) => {
            if (!mergedDepts.some((m) => m.code === d.code || m._id === d._id)) {
              mergedDepts.push(d);
            }
          });
          setDepartments(mergedDepts);
          const currentSelected = mergedDepts.find((d) => d.code === department || d._id === department);
          if (currentSelected) setDepartment(currentSelected._id);
        }

        if (cRes?.success && Array.isArray(cRes.data) && cRes.data.length > 0) {
          const mergedCourses = DEFAULT_ENGINEERING_COURSES.map((def) => {
            const found = cRes.data.find(
              (c) => c.code === def.code || c.name?.toLowerCase() === def.name.toLowerCase()
            );
            return found ? { ...def, ...found } : def;
          });
          cRes.data.forEach((c) => {
            if (!mergedCourses.some((m) => m.code === c.code || m._id === c._id)) {
              mergedCourses.push(c);
            }
          });
          setCourses(mergedCourses);
          const currentCourse = mergedCourses.find((c) => c.code === course || c._id === course);
          if (currentCourse) setCourse(currentCourse._id);
        }
      } catch (err) {
        console.warn('Metadata fetch warning:', err);
      }
    };
    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name || !regEmail || !regPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name,
        email: regEmail,
        password: regPassword,
        role: registerRole,
        department: department || undefined,
        phone,
      };

      if (registerRole === 'STUDENT') {
        payload.course = course || undefined;
        payload.currentSemester = parseInt(currentSemester) || 1;
        if (rollNumber) payload.rollNumber = rollNumber;
      } else if (registerRole === 'FACULTY') {
        if (employeeId) payload.employeeId = employeeId;
      }

      await register(payload);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      position: 'relative',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '3rem',
        alignItems: 'center',
      }}>
        {/* Left: Academic Enterprise Identity */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: '1.5rem',
          }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
              AcademiaPro Institutional Portal
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
          }}>
            Unified Campus <br />
            <span style={{
              background: 'var(--grad-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Management Platform
            </span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '500px',
          }}>
            A centralized system for academic scheduling, student attendance monitoring, faculty syllabus allocation, and certified examination grade transcripts.
          </p>

          {/* Academic Pillars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--primary)',
              }}>
                <GraduationCap size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>Student Portal</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Real-time attendance gauge, examination grade transcripts, and course syllabus tracks.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--accent-emerald)',
              }}>
                <BookOpen size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>Faculty & Teaching</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  One-touch class roll attendance registers, mark submissions, and automated grade calculations.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--accent-amber)',
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>Institutional Administration</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Department capacity planning, degree curricula, student admissions, and security audits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Authentication Card (Sign In / Register) */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.3rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.75rem',
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'login' ? 'var(--grad-primary)' : 'transparent',
                color: mode === 'login' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontFamily: 'var(--font-main)',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'register' ? 'var(--grad-primary)' : 'transparent',
                color: mode === 'register' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontFamily: 'var(--font-main)',
              }}
            >
              Register Account
            </button>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>
              {mode === 'login' ? 'Institutional Sign In' : 'Create Academic Account'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {mode === 'login'
                ? 'Sign in with your registered college credentials to access your portal.'
                : 'Register as a student or faculty member to access the campus management system.'}
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-emerald)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Institutional Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="name@college.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.9rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-dim)',
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.9rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-dim)',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.85rem', padding: '0.85rem' }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>

              <div style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-dim)',
              }}>
                Don't have an institutional account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '0.85rem',
                  }}
                >
                  Register here →
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit}>
              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label">Select Account Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setRegisterRole('STUDENT')}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: registerRole === 'STUDENT' ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                      background: registerRole === 'STUDENT' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: registerRole === 'STUDENT' ? '#ffffff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                  >
                    <GraduationCap size={16} color={registerRole === 'STUDENT' ? 'var(--primary)' : 'currentColor'} />
                    Student
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('FACULTY')}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: registerRole === 'FACULTY' ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                      background: registerRole === 'FACULTY' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: registerRole === 'FACULTY' ? '#ffffff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                  >
                    <BookOpen size={16} color={registerRole === 'FACULTY' ? 'var(--primary)' : 'currentColor'} />
                    Faculty
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder={registerRole === 'STUDENT' ? 'e.g. Alex Mercer' : 'e.g. Dr. Alan Turing'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.9rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-dim)',
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Institutional Email</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="username@college.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.9rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-dim)',
                    }}
                  />
                </div>
              </div>

              {/* Role-specific Fields */}
              {registerRole === 'STUDENT' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Engineering Department</label>
                    <select
                      className="form-select"
                      value={department}
                      onChange={(e) => {
                        const newDept = e.target.value;
                        setDepartment(newDept);
                        const matchedCourse = courses.find((c) => 
                          c.deptCode === newDept || 
                          c.code?.includes(newDept) ||
                          (c.department && (c.department === newDept || c.department?._id === newDept))
                        );
                        if (matchedCourse) setCourse(matchedCourse._id || matchedCourse.code);
                      }}
                    >
                      {departments.map((d) => (
                        <option key={d._id || d.code} value={d._id || d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Degree Course</label>
                      <select
                        className="form-select"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                      >
                        {courses.map((c) => (
                          <option key={c._id || c.code} value={c._id || c.code}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Semester</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        className="form-input"
                        value={currentSemester}
                        onChange={(e) => setCurrentSemester(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Roll Number <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. CSE2024099 (Auto-generated if empty)"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Engineering Department</label>
                    <select
                      className="form-select"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      {departments.map((d) => (
                        <option key={d._id || d.code} value={d._id || d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Employee ID <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. FAC1005 (Auto-generated if empty)"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-pwd">Password</label>
                  <input
                    id="reg-pwd"
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    className="form-input"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-confirm">Confirm</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    required
                    placeholder="Repeat password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.85rem', padding: '0.85rem' }}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>

              <div style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-dim)',
              }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '0.85rem',
                  }}
                >
                  Sign in here →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
