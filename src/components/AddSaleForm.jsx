
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

const AddSaleForm = ({ onSuccess }) => {
    const { addSale } = useStore();
    const [formData, setFormData] = useState({
        customerName: '',
        phoneNumber: '',
        note: '',
        totalPrice: '',
        downPayment: '0',
        currency: 'USD',
        durationMonths: '12',
        startDate: new Date().toISOString().split('T')[0],
        appleId: '',
        comment: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customerName || !formData.totalPrice) return;

        const result = await addSale({
            ...formData,
            totalPrice: Number(formData.totalPrice),
            downPayment: Number(formData.downPayment),
            durationMonths: Number(formData.durationMonths)
        });

        if (result.success) {
            alert("Sotuv muvaffaqiyatli qo'shildi!");
            // Reset form
            setFormData({
                customerName: '',
                phoneNumber: '',
                note: '',
                totalPrice: '',
                downPayment: '0',
                currency: 'USD',
                durationMonths: '12',
                startDate: new Date().toISOString().split('T')[0],
                appleId: '',
                comment: ''
            });
            if (onSuccess) onSuccess();
        } else {
            alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="responsive-grid mb-4">
                <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Mijoz F.I.O</label>
                    <input
                        className="input"
                        name="customerName"
                        placeholder="Masalan: Eshmat Toshmatov"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Telefon Raqam</label>
                    <input
                        className="input"
                        name="phoneNumber"
                        placeholder="+998 90 123 45 67"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="responsive-grid mb-4">
                <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Valyuta</label>
                    <select
                        className="input"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                    >
                        <option value="USD">USD ($)</option>
                        <option value="UZS">UZS (so'm)</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Umumiy Narx</label>
                    <input
                        className="input"
                        name="totalPrice"
                        type="number"
                        placeholder="1200"
                        value={formData.totalPrice}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="responsive-grid mb-4">
                <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Birinchi To'lov (Down Payment)</label>
                    <input
                        className="input"
                        name="downPayment"
                        type="number"
                        placeholder="0"
                        value={formData.downPayment}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Muddat (oy)</label>
                    <input
                        className="input"
                        name="durationMonths"
                        type="number"
                        placeholder="12"
                        value={formData.durationMonths}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="responsive-grid mb-4">
                <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Boshlanish Sanasi</label>
                    <input
                        className="input"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Mahsulot (Note)</label>
                    <input
                        className="input"
                        name="note"
                        placeholder="Model, xotira, rang..."
                        value={formData.note}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="responsive-grid mb-4">
                <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Apple ID</label>
                    <input
                        className="input"
                        name="appleId"
                        placeholder="example@icloud.com"
                        value={formData.appleId}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '4px' }}>Izoh (Comment)</label>
                    <input
                        className="input"
                        name="comment"
                        placeholder="Qo'shimcha ma'lumotlar..."
                        value={formData.comment}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                    Sotuvni Saqlash
                </button>
            </div>
        </form>
    );
};

export default AddSaleForm;
