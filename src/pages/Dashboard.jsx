
import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { DollarSign, Users, AlertCircle, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
            <p className="text-muted text-sm">{title}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '5px' }}>{value}</h3>
            {trend && <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '5px' }}>{trend}</p>}
        </div>
        <div style={{ padding: '12px', borderRadius: '12px', background: color, color: 'white' }}>
            <Icon size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    const { sales } = useStore();

    const stats = useMemo(() => {
        let totalDebt = 0;
        let pendingSales = 0;
        let uniqueCustomers = new Set();
        let totalCollected = 0;

        sales.forEach(sale => {
            uniqueCustomers.add(sale.phoneNumber);

            // Calculate total paid: downPayment + sum of all paid installments
            const scheduleSum = (sale.monthlyPayments || []).reduce((sum, p) => sum + (p.paidAmount || 0), 0);
            const paid = (sale.downPayment || 0) + scheduleSum;

            const remaining = sale.totalPrice - paid;

            totalCollected += paid;
            if (remaining > 0) {
                totalDebt += remaining;
                pendingSales++;
            }
        });

        return {
            totalDebt,
            pendingCount: pendingSales,
            customers: uniqueCustomers.size,
            collected: totalCollected
        };
    }, [sales]);

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '24px' }}>Umumiy Holat</h1>

            <div className="grid-cols-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard
                    title="Jami Qarzlar"
                    value={`$${stats.totalDebt.toLocaleString()}`}
                    icon={DollarSign}
                    color="#ef4444" // Red for debt
                />
                <StatCard
                    title="Jami Tushum"
                    value={`$${stats.collected.toLocaleString()}`}
                    icon={TrendingUp}
                    color="#10b981" // Green for income
                />
                <StatCard
                    title="Mijozlar"
                    value={stats.customers}
                    icon={Users}
                    color="#4f46e5" // Blue
                />
                <StatCard
                    title="Qarzdorlar (Sotuvlar)"
                    value={stats.pendingCount}
                    icon={AlertCircle}
                    color="#f59e0b" // Orange
                />
            </div>

            {/* Recent Activity or Quick Actions could go here */}
            <div className="mt-4 card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px' }}>Tezkor Eslatmalar</h3>
                <p className="text-muted">Bugungi to'lovlar va kechikkan to'lovlar shu yerda ko'rinadi (Tez orada).</p>
            </div>
        </div>
    );
};

export default Dashboard;
