import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import { useTheme } from '../utils/ThemeContext';

const categoryIcons = {
    Grocery: '🛒', Food: '🍔', Travel: '✈️', Shopping: '🛍️',
    Vehicle: '🚗', Fun: '🎮', Salary: '💼', Freelance: '💻',
    Investment: '📈', Other: '💰'
};

export default function TransactionItem({ transaction, onDelete, onEdit }) {
    const { dark } = useTheme();
    const isExpense = transaction.type === 'expense';

    return (
        <div className={`flex items-center justify-between p-4 rounded-xl transition hover:scale-[1.01] ${dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
            <div className='flex items-center gap-3'>
                <span className='text-2xl'>{categoryIcons[transaction.category] || '💰'}</span>
                <div>
                    <p className={`font-medium text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>{transaction.category}</p>
                    <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {transaction.description || '—'} · {new Date(transaction.date).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className='flex items-center gap-3'>
                <button onClick={() => onEdit(transaction)} className='text-gray-400 hover:text-indigo-500 transition p-1'>
                    <FiEdit2 size={15} />
                </button>
                <span className={`font-bold text-sm ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
                    {isExpense ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                </span>
                <button onClick={() => onDelete(transaction._id)} className='text-gray-400 hover:text-red-500 transition p-1'>
                    <FiTrash2 size={15} />
                </button>
            </div>
        </div>
    );
}
