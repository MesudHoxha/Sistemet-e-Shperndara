import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components
import LoginForm from './components/LoginForm';
import StudentDashboard from './components/StudentDashboard';
import ProfessorDashboard from './components/ProfessorDashboard';
import AdminDashboard from './components/AdminDashboard';
import StudentManagement from './components/AdminSrc/StudentManagement';
import ProfessorManagement from './components/AdminSrc/ProfessorManagement';
import SecretaryManagement from './components/AdminSrc/SecretaryManagement';
import FinanceManagement from './components/AdminSrc/FinanceManagement';
import LibrarianManagement from './components/AdminSrc/LibrarianManagement';
import ExamOfficerManagement from './components/AdminSrc/ExamOfficerManagement';
import SecretaryDashboard from './components/SecretaryDashboard';
import DepartmentManagementForSecretary from './components/SecretarySrc/DepartmentManagementForSecretary';
import SubjectManagementForSecretary from './components/SecretarySrc/SubjectManagementForSecretary';
import StudentListForSecretary from './components/SecretarySrc/StudentListForSecretary';
import AddStudentBySecretary from './components/SecretarySrc/AddStudentBySecretary';
import ProfessorListForSecretary from './components/SecretarySrc/ProfessorListForSecretary';
import ManageBuildings from './components/SecretarySrc/ManageBuildings';
import FinanceDashboard from './components/FinanceDashboard';
import ScholarshipApproval from './components/FinanceSrc/ScholarshipApproval';
import ScholarshipOpeningManager from './components/FinanceSrc/ScholarshipOpeningManager';
import StaffPayment from './components/FinanceSrc/StaffPayment';
import StaffPaymentHistory from './components/FinanceSrc/StaffPaymentHistory';
import ScholarshipWinners from './components/FinanceSrc/ScholarshipWinners';
import ExamOfficerDashboard from './components/ExamOfficerDashboard';
import ExamManagement from './components/ExamSrc/ExamManagement';
import ProtectedRoute from './components/ProtectedRoute';
import SubmissionsSection from './components/ProfessorSrc/SubmissionsSection';
import GradeSection from './components/ProfessorSrc/GradeSection';
import AttendanceSection from './components/ProfessorSrc/AttendanceSection';
import ScheduleSection from './components/ProfessorSrc/ScheduleSection';
import ScholarshipApplicationForm from './components/StudentSrc/ScholarshipApplicationForm';
import EnrollSubjectSection from './components/StudentSrc/EnrollSubjectSection';  
import ExamSubmissionSection from './components/StudentSrc/ExamSubmissionSection';
import StudentAttendanceSection from './components/StudentSrc/StudentAttendanceSection';
import StudentGradesSection from './components/StudentSrc/StudentGradesSection';
import StudentScheduleSection from './components/StudentSrc/StudentScheduleSection';
import LibraryCreateSection from './components/SecretarySrc/LibraryCreateSection';
import LibrarianDashboard from './components/LibrarianDashboard';
import AddBook from './components/LibrarianSrc/AddBook';
import AvailableBooks from './components/LibrarianSrc/AvailableBooks';
import BorrowedBooks from './components/LibrarianSrc/BorrowedBooks';
import LoanBook from './components/LibrarianSrc/LoanBook';

import { AuthProvider } from './context/AuthContext';



function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/scholarship"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ScholarshipApplicationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/enroll"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <EnrollSubjectSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam-submissions"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ExamSubmissionSection />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/student/grades"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentGradesSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/schedule"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentScheduleSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAttendanceSection />
              </ProtectedRoute>
            }
          />

          {/* Professor Routes */}
          <Route
            path="/professor"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/submissions"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <SubmissionsSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/grades"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <GradeSection />   
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/attendance"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <AttendanceSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/schedule"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <ScheduleSection />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/professors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProfessorManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/secretaries"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SecretaryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FinanceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/librarians"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LibrarianManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exam-officers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamOfficerManagement />
              </ProtectedRoute>
            }
          />

          {/* Secretary Routes */}
          <Route
            path="/secretary"
            element={
              <ProtectedRoute allowedRoles={['secretary']}>
                <SecretaryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/departments"
            element={
              <ProtectedRoute allowedRoles={['secretary']}>
                <DepartmentManagementForSecretary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/subjects"
            element={
              <ProtectedRoute allowedRoles={['secretary']}>
                <SubjectManagementForSecretary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/students"
            element={
              <ProtectedRoute allowedRoles={['secretary']}>
                <StudentListForSecretary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/add-student"
            element={
              <ProtectedRoute allowedRoles={['secretary']}>
                <AddStudentBySecretary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/professors"
            element={
              <ProtectedRoute allowedRoles={['secretary']}>
                <ProfessorListForSecretary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/buildings"
            element={
              <ProtectedRoute allowedRoles={['secretary']}>
                <ManageBuildings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/add-library"
            element={
              <ProtectedRoute allowedRoles={['secretary']}>
                <LibraryCreateSection />
              </ProtectedRoute>
            }
          />
          {/* Finance Routes */}
          <Route
            path="/finance"
            element={
              <ProtectedRoute allowedRoles={['finance']}>
                <FinanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/scholarships"
            element={
              <ProtectedRoute allowedRoles={['finance']}>
                <ScholarshipApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/scholarship-winners"
            element={
              <ProtectedRoute allowedRoles={['finance']}>
                <ScholarshipWinners />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/scholarship-openings"
            element={
              <ProtectedRoute allowedRoles={['finance']}>
                <ScholarshipOpeningManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/payments"
            element={
              <ProtectedRoute allowedRoles={['finance']}>
                <StaffPayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/payment-history"
            element={
              <ProtectedRoute allowedRoles={['finance']}>
                <StaffPaymentHistory />
              </ProtectedRoute>
            }
          />

          {/* Exam Officer Routes */}
          <Route
  path="/exam"
  element={
    <ProtectedRoute allowedRoles={['exam']}>
      <ExamOfficerDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/exam/manage"
  element={
    <ProtectedRoute allowedRoles={['exam']}>
      <ExamManagement />
    </ProtectedRoute>
  }
/>


          {/* Librarian Routes */}
          <Route
            path="/librarian"
            element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <LibrarianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/librarian/add-book"
            element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <AddBook />
              </ProtectedRoute>
            }
          /> 
          <Route
            path="/librarian/available-books"
            element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <AvailableBooks />
              </ProtectedRoute>
            }
          /> 
          <Route
            path="/librarian/loan-book"
            element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <LoanBook />
              </ProtectedRoute>
            }
          /> 
          <Route
            path="/librarian/borrowed-books"
            element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <BorrowedBooks />
              </ProtectedRoute>
            }
          /> 
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
