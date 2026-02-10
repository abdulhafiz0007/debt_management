
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

            // We are now just tracking total paid amount, but preserving the structure 
            // incase we want to go back to schedule. 
            // For now, let's just update the first payment entry to hold the entire paid amount mockingly 
            // OR better: add a 'paidAmount' field to the SALE object itself.

            // Let's go with adding 'paidAmount' to the sale object for simplicity and robustness 
            // given the user's request to "manually enter how much paid".

            return { ...sale, paidAmount: amount };
        }));
    };

    return (
        <StoreContext.Provider value={{ sales, addSale, deleteSale, updatePaidAmount }}>
            {children}
        </StoreContext.Provider>
    );
};
