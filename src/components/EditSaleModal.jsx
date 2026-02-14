import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, DollarSign, Save } from 'lucide-react';

const EditSaleModal = ({ sale: propSale, onClose }) => {
    // CRITICAL FIX: Use live data from store, not the stale prop
    // This ensures that when fetchSales() runs, this component re-renders with new data
    const { sales, updateSale, updateMonthlyPayment, generateMonthlyPayments, fetchSales, fetchSaleById } = useStore();

    // Find live sale from store first (optimistic), but we will also fetch fresh data
    const sale = sales.find(s => s.id === propSale.id) || propSale;

    const [amount, setAmount] = useState(0);
    const [localPayments, setLocalPayments] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [isFetching, setIsFetching] = useState(true);

    // Fetch fresh data for this specific sale when modal opens
    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            if (propSale.id) {
                setIsFetching(true);
                await fetchSaleById(propSale.id);
                if (mounted) setIsFetching(false);
            }
        };
        loadData();
        return () => { mounted = false; };
    }, [propSale.id]);

    // Initialize and Auto-Generate Schedule
    // Initialize local state from sale data
    useEffect(() => {
        // Wait for fetch to complete before making decisions about empty arrays
        if (isFetching) return;

        // Use live sale object for initialization
        console.log('EditSaleModal - LIVE sale data:', sale);

        const payments = sale.monthlyPayments || [];

        if (payments.length > 0) {
            // Deduplicate payments just in case backend sends duplicates
            const uniquePayments = Array.from(new Map(payments.map(item => [item.id, item])).values());

            const sorted = uniquePayments.sort((a, b) => new Date(a.expectedDate) - new Date(b.expectedDate));
            setLocalPayments(sorted);

            // Calculate Total Paid based on user request: Down Payment + Sum(Installments Paid)
            const schedulePaid = sorted.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
            setAmount((sale.downPayment || 0) + schedulePaid);
        } else {
            // If genuinely empty, we might want to generate, BUT be careful of race conditions.
            // Only generate if we are sure it's not just loading.
            // For now, let's NOT auto-generate here to prevent the "2x" issue if latency causes empty array temporarily.
            // setLocalPayments([]);
            if (sale.totalPrice > 0 && sale.durationMonths > 0) {
                handleGenerateSchedule();
            }
        }
    }, [sale, isFetching]); // Re-run when LIVE sale updates OR fetching finishes

    const handleAmountChange = (paymentId, newAmount) => {
        setLocalPayments(prev => {
            const updated = prev.map(p => {
                if (p.id === paymentId) {
                    const numAmount = newAmount === '' ? '' : Number(newAmount);
                    return {
                        ...p,
                        customAmount: numAmount,
                        // If already paid, sync the paidAmount to reflect current input
                        paidAmount: p.isPaid ? (numAmount || 0) : 0
                    };
                }
                return p;
            });
            return updated;
        });
    };

    const handleTogglePayment = (paymentId) => {
        setLocalPayments(prev => {
            const updated = prev.map(p => {
                if (p.id === paymentId) {
                    const newStatus = !p.isPaid;
                    return {
                        ...p,
                        isPaid: newStatus,
                        paidAmount: newStatus ? (p.customAmount || p.expectedAmount) : 0,
                        paidAt: newStatus ? new Date().toISOString() : null
                    };
                }
                return p;
            });

            // Recalculate total amount correctly from the UPDATED list
            // Logic: Down Payment + Sum(Paid Installments)
            const schedulePaid = updated.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
            setAmount((sale.downPayment || 0) + schedulePaid);
            return updated;
        });
    };

    const handleGenerateSchedule = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const result = await generateMonthlyPayments(sale.id);
            if (result.success) {
                // Success - fetchSales will trigger a re-render of the modal with new data via useEffect
                // but we also update local state just in case
                // FIX: Ensure we don't append, but replace
                setLocalPayments(result.payments || []);
                // Also update the global store for this sale so next render is correct
                // This prevents the "2x" issue by ensuring the store knows about the new payments
                if (fetchSaleById) fetchSaleById(sale.id);
            } else {
                alert("Jadval yaratishda xatolik yuz berdi");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            // 1. Identify changed payments
            const changedPayments = localPayments.filter(lp => {
                const original = (sale.monthlyPayments || []).find(op => op.id === lp.id);
                return !original || original.isPaid !== lp.isPaid || original.paidAmount !== lp.paidAmount;
            });

            // 2. Batch update changed payments
            await Promise.all(changedPayments.map(p =>
                updateMonthlyPayment({
                    ...p,
                    paidAmount: p.paidAmount || 0 // Ensuring it's a number
                }, sale.id) // CRITICAL: Pass sale.id explicitly
            ));

            // 3. DO NOT call updateSale() here!
            // ROOT CAUSE FIX: updateSale sends PUT /api/sales WITHOUT monthlyPayments.
            // If backend has @OneToMany(cascade=ALL), Hibernate resets all payments to defaults,
            // undoing the payment updates from step 2 above.
            // This modal only edits payments, not sale metadata, so updateSale is unnecessary.

            // 4. Force refresh of this specific sale to confirm persistence
            // CRITICAL FIX: DO NOT fetch immediately after save.
            // Backend latency causes this fetch to return STALE data, overwriting our correct optimistic update.
            // We trust the local state update from updateMonthlyPayment.
            // await fetchSaleById(sale.id);

            onClose();
        } catch (error) {
            console.error("Save error:", error);
            alert("Saqlashda xatolik yuz berdi");
        } finally {
            setIsUpdating(false);
        }
    };

    const percentage = Math.min(100, Math.round(((amount || 0) / (sale.totalPrice || 1)) * 100));

    const formatPrice = (val) => {
        if (sale.currency === 'UZS') return `${(val || 0).toLocaleString()} so'm`;
        return `$${(val || 0).toLocaleString()}`;
    };

    const formatDateShort = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('uz-UZ', { month: 'short', year: 'numeric' });
    };

    return (
        <div
            style={{
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
                backdropFilter: 'blur(5px)',
                padding: '20px'
            }}
            onClick={(e) => {
                // Close if clicking the overlay itself, not the modal content
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="card" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '24px',
                animation: 'fadeIn 0.3s',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                {(isUpdating || isGenerating || isFetching) && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255,255,255,0.7)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '12px'
                    }}>
                        <div className="text-primary mb-2" style={{ fontWeight: 'bold' }}>
                            {isFetching ? "Ma'lumotlar yuklanmoqda..." : (isGenerating ? "Jadval yaratilmoqda..." : "Saqlanmoqda...")}
                        </div>
                        <div className="text-muted text-sm">Iltimos kuting</div>
                    </div>
                )}

                <div className="flex-between mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>To'lovlar va Grafik</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} disabled={isUpdating || isGenerating}>
                        <X size={24} color="var(--text-muted)" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-muted text-sm" style={{ marginBottom: '4px' }}>Mijoz</p>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{sale.customerName}</div>
                </div>

                <div className="mb-6" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div className="flex-between mb-4">
                        <span className="text-muted">Umumiy Qarz:</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatPrice(sale.totalPrice)}</span>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="text-sm" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                            Jami To'langan ({sale.currency})
                        </label>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'var(--primary)',
                            padding: '8px 0'
                        }}>
                            {formatPrice(amount)}
                        </div>
                    </div>

                    <div>
                        <div className="flex-between text-sm mb-2">
                            <span>To'lov Jarayoni: {percentage}%</span>
                            <span style={{ fontWeight: '600', color: percentage >= 100 ? 'var(--success)' : 'var(--primary)' }}>
                                {percentage >= 100 ? "To'liq to'landi" : `${formatPrice(sale.totalPrice - amount)} qoldi`}
                            </span>
                        </div>
                        <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${percentage}%`,
                                background: percentage >= 100 ? 'var(--success)' : 'var(--primary)',
                                transition: 'width 0.4s ease'
                            }} />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-primary)' }}>To'lovlar Jadvali</h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {localPayments.map((payment, index) => (
                            <div
                                key={payment.id}
                                style={{
                                    padding: '12px',
                                    background: payment.isPaid ? 'rgba(34, 197, 94, 0.05)' : '#fff',
                                    border: `1px solid ${payment.isPaid ? 'var(--success)' : 'var(--border)'}`,
                                    borderRadius: '8px',
                                    transition: 'all 0.2s',
                                    opacity: isUpdating ? 0.6 : 1
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{index + 1}-oy to'lovi</div>
                                        <div className="text-muted text-xs">{formatDateShort(payment.expectedDate)}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="text-muted text-xs">Kutilgan:</div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            {formatPrice(payment.expectedAmount)}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <label className="text-sm" style={{ minWidth: '80px' }}>To'langan:</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={payment.customAmount !== undefined ? payment.customAmount : (payment.isPaid ? payment.paidAmount || '' : '')}
                                        onChange={(e) => handleAmountChange(payment.id, e.target.value)}
                                        disabled={isUpdating}
                                        style={{
                                            flex: 1,
                                            padding: '6px 10px',
                                            fontSize: '0.9rem',
                                            border: (payment.customAmount || payment.paidAmount) !== payment.expectedAmount ? '2px solid #4f46e5' : '1px solid var(--border)'
                                        }}
                                    />
                                    <span className="text-sm" style={{ minWidth: '60px' }}>
                                        {sale.currency === 'UZS' ? "so'm" : '$'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={payment.isPaid}
                                        onChange={() => handleTogglePayment(payment.id)}
                                        disabled={isUpdating}
                                        title="To'langanini tasdiqlash"
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                        ))}
                        {localPayments.length === 0 && (
                            <div className="text-muted text-sm" style={{ textAlign: 'center', padding: '16px' }}>
                                {isGenerating ? "Jadval shakllantirilmoqda..." : "Jadval yuklanmoqda..."}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={isUpdating || isGenerating}>Bekor qilish</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={isUpdating || isGenerating || localPayments.length === 0}>
                        <Save size={18} /> Saqlash
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditSaleModal;
