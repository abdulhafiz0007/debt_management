
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet, useLocation } from 'react-router-dom';

const MainLayout = () => {
    const location = useLocation();

    // Determine page title based on path
    const getTitle = () => {
        switch (location.pathname) {
            case '/': return 'Boshqaruv Paneli';
            case '/sales': return 'Sotuvlar';
            case '/payments': return "To'lovlar";
            case '/customers': return 'Mijozlar';
            default: return 'Boshqaruv';
        }
    };

    return (
        <div style={{ display: 'flex', width: '100%' }}>
            <Sidebar />
            <div className="main-content">
                <Header title={getTitle()} />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
