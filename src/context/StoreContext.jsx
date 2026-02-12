
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
    // Load initial state from localStorage
    const [sales, setSales] = useState(() => {
        try {
            const saved = localStorage.getItem('apple555_sales');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load sales", e);
            return [];
        }
    });

    // Save to localStorage whenever sales change
    useEffect(() => {
        try {
            localStorage.setItem('apple555_sales', JSON.stringify(sales));
        } catch (e) {
            console.error("Failed to save sales", e);
        }
    }, [sales]);

    const [token, setToken] = useState(localStorage.getItem('apple555_token') || null);
    const [user, setUser] = useState(null);

    // Update token in localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('apple555_token', token);
        } else {
            localStorage.removeItem('apple555_token');
        }
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await fetch('https://apple555-back-iqs8.onrender.com/api/auth/sign-in', {
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

    const addSale = (saleData) => {
        const newSale = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            ...saleData, // { customerName, phoneNumber, note, totalPrice, durationMonths, startDate }
            paidAmount: 0
        };
        setSales(prev => [...prev, newSale]);
    };

    const deleteSale = (id) => {
        setSales(prev => prev.filter(s => s.id !== id));
    };

    const updatePaidAmount = (saleId, amount) => {
        setSales(prev => prev.map(sale => {
            if (sale.id !== saleId) return sale;
            return { ...sale, paidAmount: amount };
        }));
    };

    return (
        <StoreContext.Provider value={{
            sales,
            addSale,
            deleteSale,
            updatePaidAmount,
            token,
            isAuthenticated: !!token,
            user,
            login,
            logout
        }}>
            {children}
        </StoreContext.Provider>
    );
};
