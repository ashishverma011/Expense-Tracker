import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiDownload, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { axiosClient } from '../utils/axiosClient';
import { useTheme } from '../utils/ThemeContext';
import NavBar from '../components/NavBar';
import SummaryCards from '../components/SummaryCards';
import Charts from '../components/Charts';
import TransactionItem from '../components/TransactionItem';

const EXPENSE_CATEGORIES = ['Grocery', 'Food', 'Travel', 'Shopping', 'Vehicle', 'Fun', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other'];

const emptyForm = { type: 'expense', amount: '', category: '', description: '', date: '' };

export default function Home() {
    const navigate = useNavigate();
    const { dark } = useTheme();
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    });
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, categoryBreakdown: {}, budget: 0, budgetAlert: false });
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [budget, setBudget] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showBudget, setShowBudget] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const bg = dark ? 'bg-gray-900' : 'bg-gray-100';
    const cardBg = dark ? 'bg-gray-800' : 'bg-white';
    const textPrimary = dark ? 'text-white' : 'text-gray-800';
    const textSecondary = dark ? 'text-gray-400' : 'text-gray-500';
    const inputCls = `w-full px-3 py-2 rounded-xl text-sm outline-none border transition ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-purple-400'}`;

    const fetchTransactions = useCallback(async () => {
        try {
            const params = {};
            if (filterType) params.type = filterType;
            if (filterCategory) params.category = filterCategory;
            if (search) params.search = search;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const res = await axiosClient.get('/transactions', { params });
            const data = res.data.message;
            if (Array.isArray(data)) {
                setTransactions(data);
            } else {
                console.error('Unexpected transactions response:', res.data);
                setTransactions([]);
                toast.error('Failed to load transactions');
            }
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || error.message || 'Failed to load transactions';
            toast.error(message);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        }
    }, [filterType, filterCategory, search, startDate, endDate, navigate]);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await axiosClient.get('/transactions/summary');
            setSummary(res.data.message);
            setBudget(res.data.message.budget || '');
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
            if (storedUser && res.data.message.budget !== storedUser.budget) {
                const updatedUser = { ...storedUser, budget: res.data.message.budget };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch { }
    }, []);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await axiosClient.get('/auth/profile');
            setUser(res.data.message);
            localStorage.setItem('user', JSON.stringify(res.data.message));
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        fetchProfile();
        fetchTransactions();
        fetchSummary();
    }, [fetchTransactions, fetchSummary, fetchProfile, navigate]);

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!form.amount || !form.category || !form.date) { toast.error('Fill all required fields'); return; }
        setLoading(true);
        try {
            if (editingId) {
                await axiosClient.put(`/transactions/${editingId}`, form);
                toast.success('Transaction updated!');
            } else {
                await axiosClient.post('/transactions', form);
                toast.success('Transaction added!');
            }
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(false);
            fetchTransactions();
            fetchSummary();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save transaction');
        } finally { setLoading(false); }
    };

    const handleEdit = (transaction) => {
        setForm({
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description || '',
            date: transaction.date.slice(0, 10)
        });
        setEditingId(transaction._id);
        setShowForm(true);
    };

    const handleCancelEdit = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/transactions/${id}`);
            setTransactions(prev => prev.filter(t => t._id !== id));
            toast.success('Deleted!');
            await Promise.all([fetchTransactions(), fetchSummary()]);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to delete transaction');
        }
    };

    const handleBudgetSave = async () => {
        try {
            await axiosClient.put('/auth/budget', { budget: Number(budget) });
            toast.success('Budget updated!');
            setShowBudget(false);
            fetchSummary();
            const updatedUser = { ...user, budget: Number(budget) };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch { toast.error('Failed to update budget'); }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Expense Report', 14, 20);
        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
        doc.text(`Total Income: Rs.${summary.totalIncome}  |  Total Expense: Rs.${summary.totalExpense}  |  Balance: Rs.${summary.balance}`, 14, 36);
        autoTable(doc, {
            startY: 44,
            head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
            body: transactions.map(t => [
                new Date(t.date).toLocaleDateString(),
                t.type,
                t.category,
                t.description || '-',
                `${t.type === 'expense' ? '-' : '+'}Rs.${t.amount}`
            ]),
            styles: { fontSize: 10 },
            headStyles: { fillColor: [139, 92, 246] }
        });
        doc.save('expense-report.pdf');
        toast.success('PDF downloaded!');
    };

    const clearFilters = () => {
        setFilterType('');
        setFilterCategory('');
        setSearch('');
        setStartDate('');
        setEndDate('');
        fetchTransactions();
    };
    const categories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    return (
        <div className={`min-h-screen ${bg} transition-colors duration-300`}>
            <NavBar username={user?.username} />

            {/* Budget Alert Banner */}
            {summary.budgetAlert && (
                <div className='bg-yellow-500 text-white text-center py-2 text-sm font-medium animate-pulse'>
                    ⚠️ Warning: You have used 80% or more of your monthly budget!
                </div>
            )}

            <div className='max-w-7xl mx-auto px-4 py-6'>
                {/* Top Actions */}
                <div className='flex flex-wrap items-center justify-between gap-3 mb-6'>
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Dashboard</h1>
                    <div className='flex gap-2 flex-wrap'>
                        <button onClick={() => setShowBudget(!showBudget)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                            💰 Set Budget
                        </button>
                        <button onClick={exportPDF} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                            <FiDownload size={15} /> Export PDF
                        </button>
                        <button onClick={() => setShowForm(!showForm)} className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition'>
                            <FiPlus size={15} /> Add Transaction
                        </button>
                    </div>
                </div>

                {/* Budget Input */}
                {showBudget && (
                    <div className={`${cardBg} rounded-2xl p-4 mb-4 flex gap-3 items-center shadow`}>
                        <input type='number' value={budget} onChange={e => setBudget(e.target.value)} placeholder='Set monthly budget (₹)' className={inputCls} />
                        <button onClick={handleBudgetSave} className='bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap'>Save</button>
                    </div>
                )}

                {/* Add Transaction Form */}
                {showForm && (
                    <div className={`${cardBg} rounded-2xl p-5 mb-6 shadow-md`}>
                        <h2 className={`font-semibold mb-4 ${textPrimary}`}>{editingId ? 'Edit Transaction' : 'New Transaction'}</h2>
                        <form onSubmit={handleAddTransaction} className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, category: '' })} className={inputCls}>
                                <option value='expense'>Expense</option>
                                <option value='income'>Income</option>
                            </select>
                            <input type='number' placeholder='Amount ₹' value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className={inputCls} required />
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls} required>
                                <option value=''>Category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input type='text' placeholder='Description (optional)' value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} />
                            <input type='date' value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls} required />
                            <button type='submit' disabled={loading} className='bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50'>
                                {loading ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update' : 'Add')}
                            </button>
                            {editingId && (
                                <button type='button' onClick={handleCancelEdit} className='ml-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-sm font-medium px-4 py-2 transition'>
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {/* Summary Cards */}
                <SummaryCards summary={summary} />

                {/* Charts */}
                <Charts transactions={transactions} categoryBreakdown={summary.categoryBreakdown} />

                {/* Filters + Transaction List */}
                <div className={`${cardBg} rounded-2xl p-5 shadow-md`}>
                    <div className='flex flex-wrap gap-3 mb-4'>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[160px] ${dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <FiSearch className={textSecondary} size={15} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search description or category...' className={`bg-transparent outline-none text-sm w-full ${textPrimary} placeholder-gray-400`} />
                        </div>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={`${inputCls} w-auto`}>
                            <option value=''>All Types</option>
                            <option value='income'>Income</option>
                            <option value='expense'>Expense</option>
                        </select>
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={`${inputCls} w-auto`}>
                            <option value=''>All Categories</option>
                            {[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].filter((v, i, a) => a.indexOf(v) === i).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input type='date' value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputCls} w-auto`} />
                        <input type='date' value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputCls} w-auto`} />
                        {(filterType || filterCategory || search || startDate || endDate) && (
                            <button onClick={clearFilters} className='flex items-center gap-1 text-sm text-red-500 hover:text-red-600 px-2'>
                                <FiX size={15} /> Clear
                            </button>
                        )}
                    </div>

                    <div className='flex items-center justify-between mb-3'>
                        <h2 className={`font-semibold ${textPrimary}`}>Transactions ({transactions.length})</h2>
                    </div>

                    <div className='flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1'>
                        {transactions.length === 0
                            ? <p className={`text-center py-12 ${textSecondary}`}>No transactions found</p>
                            : transactions.map(t => <TransactionItem key={t._id} transaction={t} onDelete={handleDelete} onEdit={handleEdit} />)
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
