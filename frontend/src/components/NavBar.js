import { useNavigate } from 'react-router-dom';
import { useTheme } from '../utils/ThemeContext';
import toast from 'react-hot-toast';
import { FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';

export default function NavBar({ username }) {
    const navigate = useNavigate();
    const { dark, toggle } = useTheme();

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out!');
        navigate('/login');
    };

    return (
        <nav className={`flex items-center justify-between px-6 py-4 shadow-lg ${dark ? 'bg-gray-900 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
            <div className='flex items-center gap-2'>
                <MdAccountBalanceWallet className='text-purple-500 text-3xl' />
                <span className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>
                    <span className='text-purple-500'>Expense</span> Tracker
                </span>
            </div>
            <div className='flex items-center gap-4'>
                <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-600'}`}>Hi, {username} 👋</span>
                <button onClick={toggle} className={`p-2 rounded-xl transition ${dark ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
                </button>
                <button onClick={logout} className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition'>
                    <FiLogOut size={16} /> Logout
                </button>
            </div>
        </nav>
    );
}
