
import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Header = ({ title }) => {
    return (
        <header className="top-header">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{title}</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Qidirish..."
                        className="input"
                        style={{ paddingLeft: '36px', width: '250px' }}
                    />
                </div> */}

                <button className="btn" style={{ padding: '8px', borderRadius: '50%', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                    <Bell size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        A
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Admin</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manager</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
