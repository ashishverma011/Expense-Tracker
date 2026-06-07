import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import { useTheme } from '../utils/ThemeContext';

export default function SummaryCards({ summary }) {
    const { dark } = useTheme();
    const card = `rounded-2xl p-5 flex flex-col gap-2 shadow-md ${dark ? 'bg-gray-800' : 'bg-white'}`;
    const label = `text-sm font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`;
    const value = `text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`;
    const budgetUsed = summary.budget > 0 ? Math.min((summary.totalExpense / summary.budget) * 100, 100) : 0;

    return (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <div className={card}>
                <div className='flex items-center justify-between'>
                    <span className={label}>Total Income</span>
                    <FiTrendingUp className='text-green-500 text-xl' />
                </div>
                <span className={`${value} text-green-500`}>₹{summary.totalIncome?.toLocaleString()}</span>
            </div>
            <div className={card}>
                <div className='flex items-center justify-between'>
                    <span className={label}>Total Expense</span>
                    <FiTrendingDown className='text-red-500 text-xl' />
                </div>
                <span className={`${value} text-red-500`}>₹{summary.totalExpense?.toLocaleString()}</span>
            </div>
            <div className={card}>
                <div className='flex items-center justify-between'>
                    <span className={label}>Balance</span>
                    <FiDollarSign className='text-purple-500 text-xl' />
                </div>
                <span className={`${value} ${summary.balance >= 0 ? 'text-purple-500' : 'text-red-500'}`}>₹{summary.balance?.toLocaleString()}</span>
            </div>
            <div className={card}>
                <div className='flex items-center justify-between'>
                    <span className={label}>Budget</span>
                    {summary.budgetAlert && <FiAlertTriangle className='text-yellow-500 text-xl animate-pulse' />}
                </div>
                <span className={value}>₹{summary.budget?.toLocaleString() || 0}</span>
                {summary.budget > 0 && (
                    <div className='mt-1'>
                        <div className={`w-full h-2 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div className={`h-2 rounded-full transition-all ${budgetUsed >= 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${budgetUsed}%` }} />
                        </div>
                        <span className={`text-xs mt-1 ${budgetUsed >= 80 ? 'text-red-500' : dark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {budgetUsed >= 80 ? '⚠️ Budget Alert! ' : ''}{budgetUsed.toFixed(0)}% used
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
