
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import AddSaleForm from '../components/AddSaleForm';
import EditSaleModal from '../components/EditSaleModal';

const Sales = () => {
    const { sales, deleteSale, loading } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSale, setEditingSale] = useState(null);

    const sortedSales = [...sales].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    const filteredSales = sortedSales.filter(sale =>
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.phoneNumber.includes(searchTerm)
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatPrice = (amount, currency) => {
        if (currency === 'UZS') {
            return `${amount.toLocaleString()} so'm`;
        }
        return `$${amount.toLocaleString()}`;
    };

    const calculatePaidAmount = (sale) => {
        return sale.paidAmount || 0;
    };

    const getStatus = (sale) => {
        const paid = calculatePaidAmount(sale);
        const total = sale.totalPrice;
        if (total > 0 && paid >= total) return <span className="badge badge-success">Yopilgan</span>;
        if (paid > 0) return <span className="badge badge-pending">Jarayonda</span>;
        return <span className="badge badge-danger">Boshlanmagan</span>;
    };

    return (
        <div>
            <div className="flex-between mb-4">
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input"
                        placeholder="Mijoz qidirish..."
                        style={{ paddingLeft: '36px', width: '80%' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(!showAddModal)}>
                    <Plus size={18} /> Yangi Sotuv
                </button>
            </div>

            {showAddModal && (
                <div className="card mb-4" style={{ border: '2px solid var(--primary)', animation: 'fadeIn 0.3s' }}>
                    <div className="flex-between mb-4">
                        <h3>Sotuv kiritish</h3>
                        <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Yopish</button>
                    </div>
                    <AddSaleForm onSuccess={() => setShowAddModal(false)} />
                </div>
            )}

            {editingSale && (
                <EditSaleModal sale={editingSale} onClose={() => setEditingSale(null)} />
            )}

            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Sana</th>
                                <th>Mijoz</th>
                                <th>Telefon</th>
                                <th>Mahsulot</th>
                                <th>Narx</th>
                                <th>To'langan</th>
                                <th>Holat</th>
                                <th>Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && sales.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                                        <div className="text-muted">Yuklanmoqda...</div>
                                    </td>
                                </tr>
                            ) : filteredSales.map(sale => (
                                <tr key={sale.id}>
                                    <td className="text-muted">{formatDate(sale.startDate)}</td>
                                    <td style={{ fontWeight: 500 }}>{sale.customerName}</td>
                                    <td className="text-muted">{sale.phoneNumber}</td>
                                    <td>{sale.note || '-'}</td>
                                    <td>{formatPrice(sale.totalPrice, sale.currency)}</td>
                                    <td>{formatPrice(calculatePaidAmount(sale), sale.currency)}</td>
                                    <td>{getStatus(sale)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '6px', color: 'var(--primary)', }}
                                                onClick={() => setEditingSale(sale)}
                                                title="To'lovlarni boshqarish"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ color: '#ef4444', padding: '6px', }}
                                                onClick={() => {
                                                    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) deleteSale(sale.id);
                                                }}
                                                title="O'chirish"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSales.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        Ma'lumot topilmadi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Sales;
