import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Simulado from './components/Simulado'
import Resultado from './components/Resultado'
import Historico from './components/Historico'
import DicasEstudo from './components/DicasEstudo'
import Navbar from './components/Navbar'
import AdminLogin from './components/admin/AdminLogin'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminQuestoes from './components/admin/AdminQuestoes'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/simulado/:simuladoId" 
          element={user ? <Simulado /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/resultado/:simuladoId" 
          element={user ? <Resultado /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/historico" 
          element={user ? <Historico /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/dicas-estudo" 
          element={user ? <DicasEstudo /> : <Navigate to="/login" />} 
        />
        
        {/* Rotas do admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/questoes" element={<AdminQuestoes />} />
        
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App

