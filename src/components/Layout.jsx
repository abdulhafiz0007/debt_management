
import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <header className="header">
                <h1>apple555</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Qarz Daftar & Muddatli To'lov</p>
            </header>
            <main>
                {children}
            </main>
            <footer style={{ marginTop: '50px', textAlign: 'center', color: '#555', fontSize: '0.8rem' }}>
                &copy; {new Date().getFullYear()} apple555. Barcha huquqlar himoyalangan.
            </footer>
        </div>
    );
};

export default Layout;
