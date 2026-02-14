import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateSaleV2 = () => {
    const { addSale } = useStore();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        buyer: '',
        buyerPassport: '',
        buyerPhoneNumber: '',
        productName: '',
        currency: 'USD',
        realPrice: '',
        percentage: '',
        finalPrice: '',
        firstPayment: '',
        months: '',
        monthlyPaymentAmount: '',
        isDone: false,
        connectedAppleId: '',
        comment: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.buyer || !formData.productName || !formData.currency || !formData.realPrice || !formData.percentage || !formData.finalPrice || !formData.firstPayment || !formData.months || !formData.monthlyPaymentAmount || formData.isDone === null) return;

        setIsSubmitting(true);
        const result = await addSale({
            buyer: formData.buyer,
            buyerPassport: formData.buyerPassport,
            buyerPhoneNumber: formData.buyerPhoneNumber,
            productName: formData.productName,
            currency: formData.currency,
            realPrice: Number(formData.realPrice),
            percentage: Number(formData.percentage),
            finalPrice: Number(formData.finalPrice),
            firstPayment: Number(formData.firstPayment),
            months: Number(formData.months),
            monthlyPaymentAmount: Number(formData.monthlyPaymentAmount),
            isDone: formData.isDone,
            connectedAppleId: formData.connectedAppleId,
            comment: formData.comment,
            soldAt: new Date().toISOString()
        });

        setIsSubmitting(false);

        if (result.success) {
            alert("Sotuv muvaffaqiyatli qo'shildi!");
            navigate('/sales');
        } else {
            alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <div className="flex-between mb-6">
                <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/sales')}
                        style={{ padding: '6px', display: 'flex', alignItems: 'center' }}
                        title="Orqaga"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    Yangi Sotuv
                </h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    {/* Buyer Section */}
                    <div className="responsive-grid mb-4">
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Xaridor F.I.O *</label>
                            <input
                                className="input"
                                name="buyer"
                                placeholder="Masalan: Eshmat Toshmatov"
                                value={formData.buyer}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Pasport Raqami</label>
                            <input
                                className="input"
                                name="buyerPassport"
                                placeholder="AA1234567"
                                value={formData.buyerPassport}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="responsive-grid mb-4">
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Telefon Raqam</label>
                            <input
                                className="input"
                                name="buyerPhoneNumber"
                                placeholder="+998 90 123 45 67"
                                value={formData.buyerPhoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <div></div>
                    </div>

                    {/* Product Section */}
                    <div className="responsive-grid mb-4">
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Mahsulot Nomi *</label>
                            <input
                                className="input"
                                name="productName"
                                placeholder="Masalan: iPhone 15 Pro Max"
                                value={formData.productName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Currency and Pricing */}
                    <div className="responsive-grid mb-4">
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Valyuta *</label>
                            <select
                                className="input"
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                style={{ width: '100%' }}
                                required
                            >
                                <option value="USD">USD ($)</option>
                                <option value="UZS">UZS (so'm)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Haqiqiy Narx *</label>
                            <input
                                className="input"
                                name="realPrice"
                                type="number"
                                placeholder="1000"
                                value={formData.realPrice}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Percentage and Prices */}
                    <div className="responsive-grid mb-4">
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Foiz (%) *</label>
                            <input
                                className="input"
                                name="percentage"
                                type="number"
                                placeholder="0"
                                value={formData.percentage}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Yakuniy Narx *</label>
                            <input
                                className="input"
                                name="finalPrice"
                                type="number"
                                placeholder="1200"
                                value={formData.finalPrice}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="responsive-grid mb-4">
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Birinchi To'lov *</label>
                            <input
                                className="input"
                                name="firstPayment"
                                type="number"
                                placeholder="0"
                                value={formData.firstPayment}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Muddat (oy) *</label>
                            <input
                                className="input"
                                name="months"
                                type="number"
                                placeholder="12"
                                value={formData.months}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Monthly Payment */}
                    <div className="responsive-grid mb-4">
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Oylik To'lov Miqdori *</label>
                            <input
                                className="input"
                                name="monthlyPaymentAmount"
                                type="number"
                                placeholder="100"
                                value={formData.monthlyPaymentAmount}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Tugallangan? *</label>
                            <select
                                className="input"
                                name="isDone"
                                value={formData.isDone}
                                onChange={(e) => setFormData({ ...formData, isDone: e.target.value === 'true' })}
                                style={{ width: '100%' }}
                                required
                            >
                                <option value="false">Yo'q</option>
                                <option value="true">Ha</option>
                            </select>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="responsive-grid mb-4">
                        <div>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Apple ID</label>
                            <input
                                className="input"
                                name="connectedAppleId"
                                placeholder="example@icloud.com"
                                value={formData.connectedAppleId}
                                onChange={handleChange}
                            />
                        </div>
                        <div></div>
                    </div>

                    {/* Comment */}
                    <div className="responsive-grid mb-4">
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Izoh</label>
                            <textarea
                                className="input"
                                name="comment"
                                placeholder="Qo'shimcha ma'lumotlar..."
                                value={formData.comment}
                                onChange={handleChange}
                                style={{ minHeight: '100px', resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/sales')}
                            disabled={isSubmitting}
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saqlanmoqda...' : 'Sotuvni Saqlash'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSaleV2;

