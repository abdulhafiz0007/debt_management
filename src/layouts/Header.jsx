
import React from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Header = ({ title }) => {
    const { logout } = useStore();

    return (
        <header className="top-header">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{title}</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button className="btn" style={{ padding: '8px', borderRadius: '50%', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                    <Bell size={20} />
                </button>

                <div style={{ height: '24px', width: '1px', background: 'var(--border)' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        A
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Admin</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manager</span>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="btn"
                    style={{
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--danger)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}
                    title="Chiqish"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
