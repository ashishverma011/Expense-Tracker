import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../utils/ThemeContext';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export default function Charts({ transactions, categoryBreakdown }) {
    const { dark } = useTheme();
    const bg = dark ? 'bg-gray-800' : 'bg-white';
    const text = dark ? '#e5e7eb' : '#374151';

    const pad = (n) => n.toString().padStart(2, '0');
    const toLocalYMD = (d) => {
        const dt = new Date(d);
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
    };

    const pieData = Object.entries(categoryBreakdown || {})
        .map(([name, value]) => ({ name, value: Number(value) || 0 }))
        .filter(item => item.value > 0);

    const normalizedTransactions = (transactions || []).map(t => ({
        ...t,
        localDate: toLocalYMD(t.date)
    }));

    const last7 = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const label = d.toLocaleDateString('en', { weekday: 'short' });
        const dateYMD = toLocalYMD(d);
        const income = normalizedTransactions
            .filter(t => t.type === 'income' && t.localDate === dateYMD)
            .reduce((s, t) => s + Number(t.amount || 0), 0);
        const expense = normalizedTransactions
            .filter(t => t.type === 'expense' && t.localDate === dateYMD)
            .reduce((s, t) => s + Number(t.amount || 0), 0);
        return { label, income, expense };
    });

    const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.75;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const labelName = payload?.name || '';
        return (
            <text
                x={x}
                y={y}
                fill={text}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline='central'
                fontSize={11}
                fontWeight={600}
            >
                {`${labelName} ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
            <div className={`${bg} rounded-2xl p-5 shadow-md`}>
                <h3 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Expense by Category</h3>
                {pieData.length > 0 ? (
                    <ResponsiveContainer width='100%' height={220}>
                        <PieChart>
                            <Pie data={pieData} cx='50%' cy='50%' innerRadius={60} outerRadius={90} dataKey='value' nameKey='name' label={renderPieLabel} labelLine={false}>
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v) => `₹${v}`} />
                            <Legend verticalAlign='bottom' height={36} iconType='circle' />
                        </PieChart>
                    </ResponsiveContainer>
                ) : <p className={`text-center py-16 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No expense data</p>}
            </div>
            <div className={`${bg} rounded-2xl p-5 shadow-md`}>
                <h3 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Last 7 Days</h3>
                <ResponsiveContainer width='100%' height={220}>
                    <BarChart data={last7}>
                        <XAxis dataKey='label' tick={{ fill: text, fontSize: 12 }} />
                        <YAxis tick={{ fill: text, fontSize: 12 }} />
                        <Tooltip formatter={(v) => `₹${v}`} />
                        <Legend />
                        <Bar dataKey='income' fill='#10b981' radius={[4, 4, 0, 0]} />
                        <Bar dataKey='expense' fill='#ef4444' radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
