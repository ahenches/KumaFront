import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/Terms/HomePage';
import ProfilePage from './components/User/ProfilePage';
import ModerationPage from './components/Terms/ModerationPage';
import DashboardPage from './components/Admin/DashboardPage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import Navbar from './components/Navbar';
import TermForm from './components/Terms/TermForm';
import { AuthProvider } from './contexts/authContext';
import UsersPage from './components/Admin/UsersPage';
import TermsPage from './components/Admin/TermsPage';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes protégées */}
          <Route
            path="/profile"
            element={<ProtectedRoute element={<ProfilePage />} />}
          />
          <Route
            path="/moderation"
            element={<ProtectedRoute element={<ModerationPage />} roles={['moderator', 'admin']} />}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<DashboardPage />} roles={['admin']} />}
          />
          <Route
            path="/users"
            element={<ProtectedRoute element={<UsersPage />} roles={['admin']} />}
          />
          <Route
            path="/terms"
            element={<ProtectedRoute element={<TermsPage />} roles={['admin']} />}
          />
          <Route
            path="/new-term"
            element={<ProtectedRoute element={<TermForm />} />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
