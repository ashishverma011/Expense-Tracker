import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { axiosClient } from '../utils/axiosClient';
import toast from 'react-hot-toast';

export default function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosClient.post('/auth/signup', form);
            if (res.data.status === 'error') { toast.error(res.data.message); return; }
            localStorage.setItem('token', res.data.message.token);
            localStorage.setItem('user', JSON.stringify(res.data.message.user));
            toast.success('Account created!');
            navigate('/');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4'>
            <div className='bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white/20'>
                <h1 className='text-3xl font-bold text-white mb-2'>Create Account</h1>
                <p className='text-gray-400 mb-8'>Start tracking your finances today</p>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <input className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400 transition'
                        placeholder='Username' value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                    <input className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400 transition'
                        placeholder='Email' type='email' value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <input className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400 transition'
                        placeholder='Password' type='password' value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <button type='submit' disabled={loading}
                        className='w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50'>
                        {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                </form>
                <p className='text-gray-400 text-center mt-6'>Already have an account? <Link to='/login' className='text-purple-400 hover:underline'>Login</Link></p>
            </div>
        </div>
    );
}
