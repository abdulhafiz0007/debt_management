
import React from 'react';
import PaymentList from '../components/PaymentList'; // Reuse the logic but might need styling tweaks

const Payments = () => {
    return (
        <div>
            {/* Reuse existing PaymentList but wrap it or eventually refactor it to match the new table style */}
            <PaymentList />
        </div>
    );
};

export default Payments;
