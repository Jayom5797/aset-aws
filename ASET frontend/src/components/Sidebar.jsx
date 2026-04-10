import React from 'react';

const Sidebar = ({ isExpanded, onToggle, activeItem, onItemClick, onNewChat }) => {
    return (
        <aside className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
            <div className="sidebar-header">
                <button className="menu-btn" onClick={onToggle}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <span className="sidebar-title">Menu</span>
            </div>

            <div className="sidebar-top">
                <button
                    className="sidebar-item"
                    onClick={onNewChat}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"></path>
                    </svg>
                    <span className="sidebar-text">New Chat</span>
                </button>

                <button
                    className="sidebar-item"
                    onClick={() => onItemClick('home')}
                    title="Go to Home"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span className="sidebar-text">Go to Home</span>
                </button>

                <button
                    className={`sidebar-item ${activeItem === 'current-chat' ? 'active' : ''}`}
                    onClick={() => onItemClick('current-chat')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="sidebar-text">Current Chat</span>
                </button>

                <button
                    className={`sidebar-item ${activeItem === 'history' ? 'active' : ''}`}
                    onClick={() => onItemClick('history')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="sidebar-text">History</span>
                </button>

                <button
                    className={`sidebar-item ${activeItem === 'trending' ? 'active' : ''}`}
                    onClick={() => onItemClick('trending')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                    </svg>
                    <span className="sidebar-text">Trending</span>
                </button>
            </div>

            <div className="sidebar-bottom">
                <button className="sidebar-item" onClick={() => onItemClick('settings')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                    </svg>
                    <span className="sidebar-text">Settings</span>
                </button>

                <button className="sidebar-item" onClick={() => onItemClick('profile')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className="sidebar-text">Profile</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
