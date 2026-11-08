import React, { useState } from 'react';
import { User, Mail, Hash, BookOpen, Calendar, Layers, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { registerStudent, setCurrentUser } from '../services/storage';

interface StudentRegisterPageProps {
  onNavigate: (tab: string) => void;
  onRegistered?: () => void;
}

export const StudentRegisterPage: React.FC<StudentRegisterPageProps> = ({ onNavigate, onRegistered }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    roll_number: '',
    email: '',
    department: 'Computer Science & Engineering',
    academic_year: '1st Year',
    section: 'A',
    password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Information Technology',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence & Data Science'
  ];

  const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const sections = ['A', 'B', 'C', 'D'];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required.';
    }

    if (!formData.roll_number.trim()) {
      newErrors.roll_number = 'College roll number is required (e.g. 24B91A0501).';
    } else if (formData.roll_number.length < 6) {
      newErrors.roll_number = 'Roll number must be at least 6 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'College email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    const res = registerStudent({
      full_name: formData.full_name.trim(),
      roll_number: formData.roll_number.trim().toUpperCase(),
      email: formData.email.trim().toLowerCase(),
      department: formData.department,
      academic_year: formData.academic_year,
      section: formData.section
    });

    if (!res.success) {
      setServerError(res.message);
    } else {
      setSuccessMessage(res.message);
      if (res.student) {
        // Auto sign-in new student
        setCurrentUser({ role: 'student', data: res.student });
        if (onRegistered) onRegistered();
        setTimeout(() => {
          onNavigate('student-enroll');
        }, 1200);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-1">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Student Identity Registration</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create your authenticated student profile for AttendAI. You can voluntarily enroll for facial verification after registration.
          </p>
        </div>

        {/* Feedback Alerts */}
        {serverError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{serverError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{successMessage} Redirecting to Facial Enrollment...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Tarun Varma"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.full_name ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                }`}
              />
              {errors.full_name && <p className="text-[11px] text-red-600 font-medium">{errors.full_name}</p>}
            </div>

            {/* Roll Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Hash className="h-3.5 w-3.5 text-slate-400" />
                <span>College Roll Number</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 24B91A0501"
                value={formData.roll_number}
                onChange={e => setFormData({ ...formData, roll_number: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs uppercase font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.roll_number ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                }`}
              />
              {errors.roll_number && <p className="text-[11px] text-red-600 font-medium">{errors.roll_number}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>College Email</span>
            </label>
            <input
              type="email"
              placeholder="e.g. tarun.24b91a0501@gvpce.ac.in"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.email ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
              }`}
            />
            {errors.email && <p className="text-[11px] text-red-600 font-medium">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Department */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                <span>Department</span>
              </label>
              <select
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Academic Year</span>
              </label>
              <select
                value={formData.academic_year}
                onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {academicYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>Section</span>
              </label>
              <select
                value={formData.section}
                onChange={e => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {sections.map(s => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.password ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                }`}
              />
              {errors.password && <p className="text-[11px] text-red-600 font-medium">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirm_password}
                onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.confirm_password ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                }`}
              />
              {errors.confirm_password && (
                <p className="text-[11px] text-red-600 font-medium">{errors.confirm_password}</p>
              )}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center space-x-2"
            >
              <span>Register Student Profile</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Existing account link */}
        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('student-login')}
            className="text-blue-600 hover:text-blue-500 font-bold underline"
          >
            Sign In to Student Portal
          </button>
        </div>

      </div>
    </div>
  );
};
