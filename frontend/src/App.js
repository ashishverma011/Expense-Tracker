import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './utils/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

function ProtectedRoute({ children }) {
    return localStorage.getItem('token') ? children : <Navigate to='/login' />;
}

function App() {
    return (
        <ThemeProvider>
            <Toaster position='top-right' />
            <Routes>
                <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;
