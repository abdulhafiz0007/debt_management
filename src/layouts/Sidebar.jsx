
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, CreditCard, Users, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { icon: <ShoppingCart size={20} />, label: 'Sotuvlar', path: '/sales' },
    ];

    return (
        <aside className="sidebar">
            <div style={{ padding: '24px', borderBottom: '1px solid #334155' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#4f46e5' }}>apple</span>555
                </h1>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>Store Management v2.0</p>
            </div>

            <nav style={{ padding: '20px 10px', flex: 1 }}>
                <ul style={{ listStyle: 'none' }}>
                    {navItems.map((item) => (
                        <li key={item.path} style={{ marginBottom: '5px' }}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `btn ${isActive ? 'btn-primary' : ''}`
                                }
                                style={({ isActive }) => ({
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                                    color: isActive ? 'white' : '#cbd5e1',
                                    border: 'none',
                                    padding: '12px 16px'
                                })}
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div style={{ padding: '20px', borderTop: '1px solid #334155' }}>
                <button className="btn" style={{ width: '100%', color: '#94a3b8', justifyContent: 'flex-start', background: 'transparent', border: 'none' }}>
                    <Settings size={20} /> Sozlamalar
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
