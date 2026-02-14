import React, {createContext, useContext, useEffect, useState} from 'react';
// need to install uuid? or just use crypto.randomUUID

const StoreContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({children}) => {
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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login muvaffaqiyatsiz bo\'ldi');
            }

            const data = await response.json();
            if (data.accessToken) {
                setToken(data.accessToken);
                setUser({username});
                return {success: true};
            }
            return {success: false, message: 'Token topilmadi'};
        } catch (error) {
            console.error('Login error:', error);
            return {success: false, message: error.message};
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const addSale = async (saleData) => {
        try {
            const body = {
                buyer: saleData.buyer,
                buyerPassport: saleData.buyerPassport || '',
                buyerPhoneNumber: saleData.buyerPhoneNumber || '',
                productName: saleData.productName,
                currency: saleData.currency,
                realPrice: Number(saleData.realPrice) || 0,
                percentage: Number(saleData.percentage) || 0,
                finalPrice: Number(saleData.finalPrice),
                firstPayment: Number(saleData.firstPayment) || 0,
                months: Number(saleData.months) || 0,
                monthlyPaymentAmount: Number(saleData.monthlyPaymentAmount) || 0,
                isDone: saleData.isDone || false,
                connectedAppleId: saleData.connectedAppleId || '',
                soldAt: saleData.soldAt,
                comment: saleData.comment || ''
            };

            console.log('Adding sale with data:', body);

            const response = await fetch(`${API_URL}/sales`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Sale added successfully:', result);
                fetchSales(); // Refresh list
                return {success: true};
            } else {
                const errorData = await response.json();
                console.error('Add sale error response:', errorData);
                return {success: false, message: errorData.message || 'Failed to add sale'};
            }
        } catch (error) {
            console.error('Add sale error:', error);
            return {success: false, message: error.message};
        }
    };

    const deleteSale = async (id) => {
        try {
            const response = await fetch(`${API_URL}/sales/${id}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${token}`}
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

    // Fetch single sale detailed info (New Endpoint)
    const fetchSaleById = async (id) => {
        if (!token) return null;
        try {
            const response = await fetch(`${API_URL}/sales/full-info/${id}`, {
                headers: {'Authorization': `Bearer ${token}`}
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

    return (
        <StoreContext.Provider value={{
            sales,
            addSale,
            deleteSale,
            updateSale,
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
