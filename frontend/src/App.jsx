import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AccessibilityPanel from './components/AccessibilityPanel'
import ProtectedRoute from './components/ProtectedRoute'
import SideMenu from './components/SideMenu'
import BackgroundOrbs from './components/BackgroundOrbs'
import Landing from './pages/Landing'
import LiveDetection from './pages/LiveDetection'
import DataCollection from './pages/DataCollection'
import LearnISL from './pages/LearnISL'
import Tutorials from './pages/Tutorials'
import Practice from './pages/Practice'
import MyProgress from './pages/MyProgress'
import TextToSign from './pages/TextToSign'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import NotFound from './pages/NotFound'
export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundOrbs />
      <SideMenu />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/live-detection" element={<ProtectedRoute><LiveDetection /></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
          <Route path="/my-progress" element={<ProtectedRoute><MyProgress /></ProtectedRoute>} />
          <Route path="/text-to-sign" element={<TextToSign />} />
          <Route path="/collect-data" element={<ProtectedRoute><DataCollection /></ProtectedRoute>} />
          <Route path="/learn" element={<LearnISL />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <AccessibilityPanel />
    </div>
  )
}
