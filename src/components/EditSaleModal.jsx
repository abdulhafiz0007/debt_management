
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, DollarSign, Save } from 'lucide-react';

const EditSaleModal = ({ sale, onClose }) => {
    const { updatePaidAmount } = useStore();
    const [amount, setAmount] = useState(sale.paidAmount || 0);

    const handleSave = () => {
        updatePaidAmount(sale.id, Number(amount));
        onClose();
    };

    const percentage = Math.min(100, Math.round(((amount || 0) / sale.totalPrice) * 100));

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="card" style={{ width: '450px', animation: 'fadeIn 0.3s' }}>
                <div className="flex-between mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>To'lovni Tahrirlash</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="var(--text-muted)" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-muted text-sm" style={{ marginBottom: '4px' }}>Mijoz</p>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{sale.customerName}</div>
                </div>

                <div className="mb-4" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                    <div className="flex-between mb-4">
                        <span className="text-muted">Umumiy Qarz:</span>
                        <span style={{ fontWeight: 'bold' }}>${sale.totalPrice}</span>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <label className="text-sm" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            To'langan Summa ($)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="number"
                                className="input"
                                style={{ paddingLeft: '32px', fontSize: '1.2rem', fontWeight: 'bold' }}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <div className="flex-between text-sm mb-4">
                            <span>Jarayon: {percentage}%</span>
                            <span style={{ color: percentage >= 100 ? 'var(--success)' : 'var(--text-primary)' }}>
                                {percentage >= 100 ? "To'liq to'landi" : `$${sale.totalPrice - amount} qoldi`}
                            </span>
                        </div>
                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${percentage}%`,
                                background: percentage >= 100 ? 'var(--success)' : 'var(--primary)',
                                transition: 'width 0.3s'
                            }} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Bekor qilish</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                        <Save size={18} /> Saqlash
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditSaleModal;
