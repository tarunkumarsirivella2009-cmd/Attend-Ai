import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  GraduationCap, 
  Eye, 
  X
} from 'lucide-react';
import { getStudents, getAttendance } from '../services/storage';
import { Student, AttendanceRecord } from '../types';

interface StudentManagementPageProps {
  onNavigate: (tab: string) => void;
}

export const StudentManagementPage: React.FC<StudentManagementPageProps> = () => {
  const [students] = useState<Student[]>(getStudents());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const allAttendance = getAttendance();

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 py-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Student Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse student profiles, enrollment statuses, and historical class sign-in records.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Roll No or Name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Roll Number</th>
                <th className="py-3.5 px-6">Student Name</th>
                <th className="py-3.5 px-6">Department & Section</th>
                <th className="py-3.5 px-6">Biometric Enrollment</th>
                <th className="py-3.5 px-6">Classes Logged</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const studentAttendance = allAttendance.filter(a => a.student_id === student.id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">
                        {student.roll_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{student.full_name}</div>
                        <div className="text-[11px] text-slate-400">{student.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-800 font-medium">{student.department}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{student.academic_year} • Sec {student.section}</div>
                      </td>
                      <td className="py-4 px-6">
                        {student.is_enrolled ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            <span>Enrolled</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="h-3 w-3 text-amber-600" />
                            <span>Opted Out</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-700">
                        {studentAttendance.length} records
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition inline-flex items-center space-x-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View History</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student History Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-base">{selectedStudent.full_name}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-xs font-bold">
                    {selectedStudent.roll_number}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedStudent.department} • Section {selectedStudent.section}
                </p>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attendance Log for this Student
              </h4>
              {allAttendance.filter(a => a.student_id === selectedStudent.id).length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No attendance records recorded for this student yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {allAttendance
                    .filter(a => a.student_id === selectedStudent.id)
                    .map(rec => (
                      <div key={rec.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{rec.subject_name} ({rec.subject_code})</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {new Date(rec.timestamp).toLocaleString()} • {rec.verification_method}
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {rec.status}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
