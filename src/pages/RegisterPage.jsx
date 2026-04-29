import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { BookOpen, Upload, AlertCircle, CheckCircle, ChevronRight, ChevronLeft, User, Building, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 1, label: 'Account', icon: User },
  { id: 2, label: 'Institution', icon: Building },
  { id: 3, label: 'Verification', icon: FileCheck },
];

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Step 1: Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  // Step 2: Institution
  const [institutionName, setInstitutionName] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [institutionEmail, setInstitutionEmail] = useState('');
  // Student extras
  const [year, setYear] = useState('1st');
  const [section, setSection] = useState('');
  // Faculty extras
  const [designation, setDesignation] = useState('');

  // Step 3: File
  const [idProofFile, setIdProofFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, or PDF files are accepted');
      return;
    }
    setError('');
    setIdProofFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview('pdf');
    }
  };

  const validateStep = (s) => {
    setError('');
    if (s === 1) {
      if (!name.trim()) { setError('Full name is required'); return false; }
      if (!email.trim()) { setError('Email is required'); return false; }
      if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    }
    if (s === 2) {
      if (!institutionName.trim()) { setError('Institution name is required'); return false; }
      if (!institutionId.trim()) { setError(`${role === 'student' ? 'Student' : 'Faculty'} ID is required`); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('institutionName', institutionName);
      formData.append('institutionId', institutionId);
      formData.append('department', department);
      formData.append('institutionEmail', institutionEmail);

      if (role === 'student') {
        formData.append('studentId', institutionId);
        formData.append('year', year);
        formData.append('section', section);
        formData.append('college', institutionName);
      } else if (role === 'faculty') {
        formData.append('facultyId', institutionId);
        formData.append('designation', designation);
        formData.append('organization', institutionName);
      }

      if (idProofFile) {
        formData.append('idProof', idProofFile);
      }

      await register(formData);
      // Navigation is handled reactively by AuthContext + App router
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full py-2.5 px-4 border border-theme-border/70 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all text-theme-text bg-theme-bg/50";
  const labelClass = "block text-sm font-bold text-theme-text mb-1.5";

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-lg"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-theme-accent text-white rounded-2xl flex items-center justify-center shadow-lg shadow-theme-accent/30">
            <BookOpen className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-extrabold text-theme-text tracking-tight">Create an Account</h2>
        <p className="mt-2 text-center text-sm text-theme-text-muted">
          Join with your institutional identity
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mt-8 gap-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                step === s.id ? 'bg-theme-accent text-white shadow-sm' :
                step > s.id ? 'bg-emerald-100 text-emerald-700' : 'bg-theme-border/30 text-theme-text-muted'
              }`}>
                {step > s.id ? <CheckCircle className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 rounded ${step > s.id ? 'bg-emerald-300' : 'bg-theme-border/40'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg"
      >
        <div className="bg-white py-10 px-4 shadow-hover rounded-3xl sm:px-10 border border-theme-border/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-theme-accent to-transparent opacity-50"></div>
          
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">

              {/* ═══════ STEP 1: Account ═══════ */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input type="text" required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Rahul Sharma" />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input type="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <input type="password" required className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
                  </div>
                  <div>
                    <label className={labelClass}>Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['student', 'faculty'].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                            role === r 
                              ? 'border-theme-accent bg-theme-accent/5 text-theme-accent shadow-sm' 
                              : 'border-theme-border/50 text-theme-text-muted hover:border-theme-accent/30'
                          }`}
                        >
                          {r === 'student' ? '🎓 Student' : '👨‍🏫 Faculty'}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══════ STEP 2: Institution ═══════ */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <div>
                    <label className={labelClass}>Institution / College Name</label>
                    <input type="text" required className={inputClass} value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder="e.g., IIT Delhi" />
                  </div>
                  <div>
                    <label className={labelClass}>{role === 'student' ? 'Student ID' : 'Faculty ID'}</label>
                    <input type="text" required className={inputClass} value={institutionId} onChange={(e) => setInstitutionId(e.target.value)} placeholder={role === 'student' ? 'e.g., 21BCS001' : 'e.g., FAC-CSE-042'} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Department</label>
                      <select className={inputClass + ' bg-white'} value={department} onChange={(e) => setDepartment(e.target.value)}>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="IT">IT</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {role === 'student' ? (
                      <div>
                        <label className={labelClass}>Year</label>
                        <select className={inputClass + ' bg-white'} value={year} onChange={(e) => setYear(e.target.value)}>
                          <option value="1st">1st Year</option>
                          <option value="2nd">2nd Year</option>
                          <option value="3rd">3rd Year</option>
                          <option value="4th">4th Year</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className={labelClass}>Designation</label>
                        <select className={inputClass + ' bg-white'} value={designation} onChange={(e) => setDesignation(e.target.value)}>
                          <option value="">Select...</option>
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Professor">Professor</option>
                          <option value="HOD">HOD</option>
                          <option value="Lecturer">Lecturer</option>
                        </select>
                      </div>
                    )}
                  </div>
                  {role === 'student' && (
                    <div>
                      <label className={labelClass}>Section (optional)</label>
                      <input type="text" className={inputClass} value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g., A" />
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>Institutional Email (optional)</label>
                    <input type="email" className={inputClass} value={institutionEmail} onChange={(e) => setInstitutionEmail(e.target.value)} placeholder="rahul@college.edu.in" />
                  </div>
                </motion.div>
              )}

              {/* ═══════ STEP 3: Verification ═══════ */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <p className="font-bold mb-1">📋 Identity Verification</p>
                    <p className="text-xs leading-relaxed">Upload your institution ID card or any official document with your name and {role === 'student' ? 'Student' : 'Faculty'} ID. This helps us maintain a secure platform. Your document will be reviewed by an admin.</p>
                  </div>

                  <div>
                    <label className={labelClass}>Upload ID Proof</label>
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                        idProofFile ? 'border-emerald-300 bg-emerald-50/50' : 'border-theme-border/60 hover:border-theme-accent/50 bg-theme-bg/30'
                      }`}
                      onClick={() => document.getElementById('idProofInput').click()}
                    >
                      <input 
                        id="idProofInput"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      
                      {idProofFile ? (
                        <div className="space-y-3">
                          {filePreview === 'pdf' ? (
                            <div className="w-16 h-16 mx-auto bg-red-100 rounded-xl flex items-center justify-center">
                              <FileCheck className="w-8 h-8 text-red-500" />
                            </div>
                          ) : (
                            <img src={filePreview} alt="ID Preview" className="w-24 h-24 mx-auto object-cover rounded-xl border border-theme-border shadow-sm" />
                          )}
                          <p className="text-sm font-bold text-emerald-700">{idProofFile.name}</p>
                          <p className="text-xs text-emerald-600">{(idProofFile.size / 1024).toFixed(1)} KB • Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-14 h-14 mx-auto bg-theme-bg rounded-xl flex items-center justify-center border border-theme-border">
                            <Upload className="w-7 h-7 text-theme-text-muted" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-theme-text">Click to upload</p>
                            <p className="text-xs text-theme-text-muted mt-1">JPG, PNG, or PDF — Max 5MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary card */}
                  <div className="bg-theme-bg/50 rounded-xl border border-theme-border/50 p-4 space-y-2">
                    <h4 className="text-xs font-bold text-theme-text-muted uppercase tracking-wider">Registration Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-theme-text-muted">Name:</span>
                      <span className="font-semibold text-theme-text">{name}</span>
                      <span className="text-theme-text-muted">Role:</span>
                      <span className="font-semibold text-theme-text capitalize">{role}</span>
                      <span className="text-theme-text-muted">Institution:</span>
                      <span className="font-semibold text-theme-text">{institutionName}</span>
                      <span className="text-theme-text-muted">{role === 'student' ? 'Student ID' : 'Faculty ID'}:</span>
                      <span className="font-semibold text-theme-text">{institutionId}</span>
                      <span className="text-theme-text-muted">Department:</span>
                      <span className="font-semibold text-theme-text">{department}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="pt-4 flex justify-between items-center">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="inline-flex items-center px-5 py-2.5 text-sm font-bold text-theme-text border border-theme-border rounded-xl hover:bg-theme-bg transition-colors">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button type="button" onClick={nextStep} className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-theme-accent hover:bg-theme-accent-hover rounded-xl shadow-sm transition-colors">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-8 py-2.5 text-sm font-bold text-white bg-theme-accent hover:bg-theme-accent-hover rounded-xl shadow-md transition-colors disabled:opacity-60"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </motion.button>
              )}
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-theme-text-muted">
              Already a user?{' '}
              <Link to="/login" className="font-bold text-theme-accent hover:text-theme-accent-hover transition-colors">
                Sign in to your portal
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
