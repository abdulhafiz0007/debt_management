
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // need to install uuid? or just use crypto.randomUUID

// Simple UUID generator if uuid package not installed, but ideally use crypto.randomUUID
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
};

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
    const [sales, setSales] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('apple555_token') || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = 'https://apple555-back-iqs8.onrender.com/api';

    // Update token in localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('apple555_token', token);
            fetchSales();
        } else {
            localStorage.removeItem('apple555_token');
            setSales([]);
        }
    }, [token]);

    const fetchSales = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/sales`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Map backend data to frontend structure
                const mappedSales = (data.content || []).map(item => ({
                    id: item.id,
                    customerName: item.buyer,
                    phoneNumber: item.buyerPhoneNumber,
                    note: item.productName,
                    totalPrice: item.fullPrice,
                    downPayment: item.firstPayment,
                    paidAmount: item.firstPayment, // Initial paidAmount is firstPayment
                    currency: item.currency || 'USD',
                    durationMonths: item.months,
                    startDate: item.soldAt,
                    isDone: item.isDone,
                    comment: item.comment,
                    appleId: item.connectedAppleId
                }));
                setSales(mappedSales);
            }
        } catch (error) {
            console.error('Failed to fetch sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/sign-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login muvaffaqiyatsiz bo\'ldi');
            }

            const data = await response.json();
            if (data.accessToken) {
                setToken(data.accessToken);
                setUser({ username });
                return { success: true };
            }
            return { success: false, message: 'Token topilmadi' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const addSale = async (saleData) => {
        try {
            // Convert "2026-02-12" to ISO Instant format "2026-02-12T00:00:00Z"
            const isoDate = saleData.startDate ? new Date(saleData.startDate).toISOString() : new Date().toISOString();

            const body = {
                buyer: saleData.customerName,
                buyerPhoneNumber: saleData.phoneNumber,
                productName: saleData.note || 'Telefon',
                fullPrice: Number(saleData.totalPrice),
                firstPayment: Number(saleData.downPayment),
                currency: saleData.currency,
                months: Number(saleData.durationMonths),
                isDone: false,
                connectedAppleId: saleData.appleId || '',
                soldAt: isoDate,
                comment: saleData.comment || ''
            };

            const response = await fetch(`${API_URL}/sales`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                fetchSales(); // Refresh list
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            console.error('Add sale error:', error);
            return { success: false };
        }
    };

    const deleteSale = async (id) => {
        try {
            const response = await fetch(`${API_URL}/sales/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setSales(prev => prev.filter(s => s.id !== id));
                return true;
            }
        } catch (error) {
            console.error('Delete sale error:', error);
        }
        return false;
    };

    const updateSale = async (id, updatedData) => {
        try {
            // Fetch the full original data or construct it
            const original = sales.find(s => s.id === id);
            if (!original) return false;

            // Ensure date is in ISO Instant format if provided
            const soldAt = updatedData.startDate ? new Date(updatedData.startDate).toISOString() : original.startDate;

            const body = {
                id: id,
                buyer: updatedData.customerName || original.customerName,
                buyerPhoneNumber: updatedData.phoneNumber || original.phoneNumber,
                productName: updatedData.note || original.note,
                fullPrice: Number(updatedData.totalPrice || original.totalPrice),
                firstPayment: Number(updatedData.paidAmount || original.paidAmount), // Assuming firstPayment is used for total paid for now
                currency: updatedData.currency || original.currency,
                months: Number(updatedData.durationMonths || original.durationMonths),
                isDone: updatedData.isDone !== undefined ? updatedData.isDone : original.isDone,
                connectedAppleId: updatedData.appleId || original.appleId || '',
                soldAt: soldAt,
                comment: updatedData.comment || original.comment || ''
            };

            const response = await fetch(`${API_URL}/sales`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                fetchSales();
                return true;
            }
        } catch (error) {
            console.error('Update sale error:', error);
        }
        return false;
    };

    return (
        <StoreContext.Provider value={{
            sales,
            addSale,
            deleteSale,
            updateSale,
            token,
            isAuthenticated: !!token,
            user,
            login,
            logout,
            loading
        }}>
            {children}
        </StoreContext.Provider>
    );
};
