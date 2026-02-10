
import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';

const PaymentList = () => {
    const { sales, togglePaymentStatus } = useStore();

    const allPayments = useMemo(() => {
        let payments = [];
        sales.forEach(sale => {
            sale.payments.forEach((payment, index) => {
                payments.push({
                    ...payment,
                    saleId: sale.id,
                    customerName: sale.customerName,
                    phoneNumber: sale.phoneNumber,
                    index: index,
                    totalPrice: sale.totalPrice,
                    saleNote: sale.note
                });
            });
        });
        return payments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }, [sales]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (sales.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Hozircha hech qanday sotuv yo'q.</p>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Mijoz</th>
                        <th>Telefon</th>
                        <th>Muddati</th>
                        <th>Summa</th>
                        <th>Holat</th>
                        <th>Amallar</th>
                    </tr>
                </thead>
                <tbody>
                    {allPayments.map((payment, idx) => (
                        <tr key={`${payment.saleId}-${payment.index}`}>
                            <td style={{ fontWeight: 500 }}>{payment.customerName}</td>
                            <td className="text-muted">{payment.phoneNumber}</td>
                            <td style={{
                                color: !payment.paid && new Date(payment.dueDate) < new Date() ? 'var(--danger)' : 'inherit',
                                fontWeight: !payment.paid && new Date(payment.dueDate) < new Date() ? 'bold' : 'normal'
                            }}>
                                {formatDate(payment.dueDate)}
                            </td>
                            <td style={{ fontWeight: '600' }}>${payment.amount}</td>
                            <td>
                                <span className={`badge ${payment.paid ? 'badge-success' : (new Date(payment.dueDate) < new Date() ? 'badge-danger' : 'badge-pending')}`}>
                                    {payment.paid ? "To'langan" : (new Date(payment.dueDate) < new Date() ? "Kechikkan" : "Kutilmoqda")}
                                </span>
                            </td>
                            <td>
                                <button
                                    className={`btn ${payment.paid ? 'btn-secondary' : 'btn-primary'}`}
                                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                    onClick={() => togglePaymentStatus(payment.saleId, payment.index)}
                                >
                                    {payment.paid ? "Bekor qilish" : "Qabul qilish"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentList;
