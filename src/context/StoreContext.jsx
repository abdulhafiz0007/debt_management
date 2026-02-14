
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

    const API_URL = 'https://back.apple555.uz/api';

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
            // Use the full-info endpoint as it returns the nested hierarchy (sales with payments)
            // This is the most reliable way to get linked data from this backend
            const url = `${API_URL}/sales/full-info?page=0&size=1000&sort=soldAt,desc`;
            console.log(`FETCHING SALES FROM: ${url}`);
            console.log(`TOKEN: ${token ? 'Present' : 'Missing'}`);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('FETCH FULL-INFO SUCCESS:', data);

                // Map backend data to frontend structure
                const mappedSales = (data.content || []).map(mapBackendSaleToFrontend);

                setSales(mappedSales);

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
                firstPayment: Number(original.downPayment), // Keep original down payment
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
                // OPTIMISTIC/LOCAL UPDATE
                // We update the local state directly instead of calling fetchSales()
                // This prevents the backend's latency from overwriting our recent payment updates with stale data
                setSales(prevSales => prevSales.map(s => {
                    if (s.id === id) {
                        return {
                            ...s,
                            customerName: updatedData.customerName || s.customerName,
                            phoneNumber: updatedData.phoneNumber || s.phoneNumber,
                            note: updatedData.note || s.note,
                            totalPrice: Number(updatedData.totalPrice || s.totalPrice),
                            currency: updatedData.currency || s.currency,
                            durationMonths: Number(updatedData.durationMonths || s.durationMonths),
                            isDone: updatedData.isDone !== undefined ? updatedData.isDone : s.isDone,
                            connectedAppleId: updatedData.appleId || s.appleId,
                            soldAt: soldAt,
                            comment: updatedData.comment || s.comment
                        };
                    }
                    return s;
                }));
                return true;
            }
        } catch (error) {
            console.error('Update sale error:', error);
        }
        return false;
    };

    const updateMonthlyPayment = async (payment, explicitSaleId = null) => {
        try {
            // Standard update schema: /api/monthly-payments (PUT)
            // CRITICAL FIX: Use explicitSaleId if provided, otherwise fallback to payment's own reference
            // 'full-info' payments often lack the parent 'sale' reference to avoid recursion
            const saleId = explicitSaleId || payment.sale?.id || payment.saleId;

            if (!saleId) {
                console.error('Update Payment Error: Missing saleId!');
                return false;
            }

            // Construct the clean body
            // FIX: Backend likely requires 'sale' object with ID to bind relationship, 
            // even if flat 'saleId' is accepted by DTO but ignored by Hibernate save.
            const body = {
                id: payment.id,
                expectedAmount: payment.expectedAmount,
                expectedDate: payment.expectedDate,
                paidAmount: payment.paidAmount || 0,
                paidAt: payment.paidAt,
                comment: payment.comment || '',
                isPaid: payment.isPaid,
                saleId: parseInt(saleId), // Send both flat ID (for DTO)
                sale: { id: parseInt(saleId) } // AND nested object (for Hibernate)
            };

            console.log('PUT PAYMENT REQUEST (Flat saleId):', JSON.stringify(body, null, 2));

            const response = await fetch(`${API_URL}/monthly-payments`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const resData = await response.json();
            console.log('PUT PAYMENT RESPONSE:', response.status, JSON.stringify(resData, null, 2));

            if (response.ok) {
                // OPTIMISTIC/CONFIRMED LOCAL UPDATE
                // The backend might return stale data on immediate fetch, so we update local state immediately
                setSales(prevSales => {
                    return prevSales.map(s => {
                        // Try to match by explicit saleId or find the sale containing this payment
                        const isTargetSale = explicitSaleId ? (s.id === parseInt(explicitSaleId)) : s.monthlyPayments.some(p => p.id === payment.id);

                        if (isTargetSale) {
                            // Calculate new "Paid Amount" for the sale
                            const updatedPayments = s.monthlyPayments.map(p =>
                                p.id === payment.id ? { ...p, ...resData } : p
                            );

                            // Re-calculate derived paidAmount directly
                            const totalInstallmentsPaid = updatedPayments.reduce((sum, p) =>
                                sum + (p.isPaid ? (p.paidAmount || 0) : 0), 0
                            );
                            const finalPaidAmount = (s.downPayment || 0) + totalInstallmentsPaid;

                            return {
                                ...s,
                                monthlyPayments: updatedPayments,
                                paidAmount: finalPaidAmount
                            };
                        }
                        return s;
                    });
                });

                return true;
            } else {
                console.error('PUT PAYMENT ERROR:', resData);
            }
        } catch (error) {
            console.error('Update monthly payment error:', error);
        }
        return false;
    };

    // Fetch single sale detailed info (New Endpoint)
    const fetchSaleById = async (id) => {
        if (!token) return null;
        try {
            const response = await fetch(`${API_URL}/sales/full-info/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const saleData = await response.json();
                console.log(`FETCH SALE ${id} SUCCESS:`, saleData);

                // Update this sale in the global list to keep UI in sync
                // FIX: Use the robust mapper to ensure field names match frontend expectations
                setSales(prev => prev.map(s => s.id === id ? mapBackendSaleToFrontend(saleData) : s));

                return saleData;
            }
        } catch (error) {
            console.error(`Fetch sale ${id} error:`, error);
        }
        return null;
    };

    // Helper to map single backend sale if needed (reusing logic from fetchSales if complex)
    // For now, simple mapping or direct usage. 
    // We already do mapping in fetchSales, let's replicate or extract it.
    // Helper to map single backend sale if needed (reusing logic from fetchSales if complex)
    const mapBackendSaleToFrontend = (item) => {
        const payments = item.monthlyPayments || [];

        // STRICT CALCULATION: Total Paid = Down Payment + Sum(Paid Monthly Installments)
        const totalInstallmentsPaid = payments.reduce((sum, p) => {
            return sum + (p.isPaid ? (p.paidAmount || 0) : 0);
        }, 0);

        const finalPaidAmount = (item.firstPayment || 0) + totalInstallmentsPaid;

        return {
            id: item.id,
            // Check if backend sent 'buyer' (new schema) or if it's already mapped (frontend state)
            customerName: item.buyer !== undefined ? item.buyer : item.customerName,
            phoneNumber: item.buyerPhoneNumber !== undefined ? item.buyerPhoneNumber : item.phoneNumber,
            note: item.productName !== undefined ? item.productName : item.note,
            totalPrice: item.fullPrice !== undefined ? item.fullPrice : item.totalPrice,
            downPayment: item.firstPayment !== undefined ? item.firstPayment : item.downPayment,

            paidAmount: finalPaidAmount,
            currency: item.currency || 'USD',
            durationMonths: item.months !== undefined ? item.months : item.durationMonths,
            startDate: item.soldAt || item.startDate,
            isDone: item.isDone,
            comment: item.comment,
            appleId: item.connectedAppleId || item.appleId,
            monthlyPayments: payments
        };
    };

    // Generate monthly payments for a sale
    const generateMonthlyPayments = async (saleId) => {
        try {
            console.log(`Generating monthly payments for sale ${saleId}`);

            // Find the sale
            const sale = sales.find(s => s.id === saleId);
            if (!sale) {
                console.error('Sale not found');
                return { success: false };
            }

            // Calculate monthly payment amount with precision handling
            const remainingAmount = sale.totalPrice - sale.downPayment;

            // Base monthly amount (floor to avoid overshooting, last month picks up remainder)
            // OR Ceil and adjust last? Let's use standard logic:
            // If we have 100 remaining and 3 months. 33, 33, 34.
            const baseMonthlyAmount = Math.floor(remainingAmount / sale.durationMonths);
            const remainder = remainingAmount % sale.durationMonths;

            const startDate = new Date(sale.startDate);

            // Create payment schedule
            const createdPayments = [];
            for (let i = 0; i < sale.durationMonths; i++) {
                const expectedDate = new Date(startDate);
                expectedDate.setMonth(expectedDate.getMonth() + i + 1);

                // Distribute remainder across the first 'remainder' months, or add to last?
                // Usually adding 1 to the first 'remainder' months is fairest and keeps payments similar.
                // Example: 100/3 -> 34, 33, 33.
                let amount = baseMonthlyAmount;
                if (i < remainder) {
                    amount += 1;
                }

                // If currency is UZS, maybe we want to round to nearest 100 or 1000?
                // For now, let's keep it exact integer as per request.

                const paymentBody = {
                    expectedAmount: amount,
                    expectedDate: expectedDate.toISOString().split('T')[0],
                    paidAmount: 0,
                    paidAt: null,
                    comment: '',
                    isPaid: false,
                    sale: { id: saleId } // Link to sale
                };

                // Create payment on backend using standard POST endpoint
                const response = await fetch(`${API_URL}/monthly-payments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(paymentBody)
                });

                if (response.ok) {
                    const created = await response.json();
                    createdPayments.push(created);
                }
            }

            console.log(`Created ${createdPayments.length} payments for sale ${saleId}`);

            // Refresh list to get linked data
            await fetchSales();

            return { success: true, payments: createdPayments };
        } catch (error) {
            console.error('Generate monthly payments error:', error);
            return { success: false, error };
        }
    };

    return (
        <StoreContext.Provider value={{
            sales,
            addSale,
            deleteSale,
            updateSale,
            updateMonthlyPayment,
            generateMonthlyPayments,
            updateMonthlyPayment,
            generateMonthlyPayments,
            fetchSales,
            fetchSaleById,
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
