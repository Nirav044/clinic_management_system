import React from 'react';
import { 
    Search, 
    Bell, 
    Sun, 
    Moon, 
    User,
    ChevronDown,
    Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import '../styles/topbar.css';

const Topbar = () => {
    const { user } = useAuth();
    const { toggleSidebar } = useUI();

    return (
        <header className="topbar">
            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <div className="search-container">
                <Search className="search-icon" size={18} />
                <input 
                    type="text" 
                    placeholder="Search patients, doctors, records..." 
                    className="search-input"
                />
            </div>

            {/* Right Side Actions */}
            <div className="topbar-actions">
                <button className="icon-btn relative" title="Notifications">
                    <Bell size={20} />
                    <span className="dot"></span>
                </button>

                <div className="divider"></div>

                {/* User Profile */}
                <div className="user-profile">
                    <div className="user-info text-right mr-3 hidden-sm">
                        <span className="user-name">{user?.name || 'Guest User'}</span>
                        <span className="user-role uppercase">{user?.role || 'User'}</span>
                    </div>
                    <div className="avatar">
                        {user?.name?.charAt(0) || <User size={18} />}
                    </div>
                    <ChevronDown size={14} className="ml-1 text-faint" />
                </div>
            </div>
        </header>
    );
};

export default Topbar;
