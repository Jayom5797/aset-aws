import React, { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import EditChatModal from './EditChatModal';

const MODE_LABELS = {
    claim:    { icon: '💬', label: 'Single Claim', color: 'rgba(255,255,255,0.6)' },
    youtube:  { icon: '▶️', label: 'YouTube',      color: '#ef4444' },
    document: { icon: '📄', label: 'Document',     color: '#00ffaa' },
};

const getModeFromChat = (chat) => {
    if (chat.mode) return chat.mode;
    // Infer from name prefix
    if (chat.name?.startsWith('📄')) return 'document';
    if (chat.name?.startsWith('▶️')) return 'youtube';
    return 'claim';
};

const HistoryView = ({ onLoadChat, onClose }) => {
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState({ isOpen: false, chatId: null, currentName: '' });

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredChats(chats);
        } else {
            const filtered = chats.filter(chat =>
                chat.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredChats(filtered);
        }
    }, [searchQuery, chats]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const response = await chatService.getChatHistory();
            if (response.success) {
                setChats(response.chats);
                setFilteredChats(response.chats);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (chat) => {
        setEditModal({
            isOpen: true,
            chatId: chat.id,
            currentName: chat.name
        });
    };

    const handleSaveEdit = async (chatId, newName) => {
        try {
            const response = await chatService.updateChatName(chatId, newName);
            if (response.success) {
                setChats(prevChats =>
                    prevChats.map(chat =>
                        chat.id === chatId ? { ...chat, name: newName } : chat
                    )
                );
            }
        } catch (error) {
            console.error('Failed to update chat name:', error);
        }
    };

    const handleDeleteClick = async (chatId) => {
        if (window.confirm('Are you sure you want to delete this conversation?')) {
            try {
                const response = await chatService.deleteChat(chatId);
                if (response.success) {
                    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
                }
            } catch (error) {
                console.error('Failed to delete chat:', error);
            }
        }
    };

    const handleLoadClick = (chatId) => {
        onLoadChat(chatId);
        onClose();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <div className="history-view">
            <div className="history-view-header">
                <h2>Chat History</h2>
            </div>

            <div className="history-search-bar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                />
            </div>

            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Sr No.</th>
                            <th>Chat Name</th>
                            <th>Mode</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="loading-row">Loading conversations...</td>
                            </tr>
                        ) : filteredChats.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="loading-row">
                                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredChats.map((chat, index) => (
                                <tr key={chat.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="chat-name-cell">
                                            <span className="chat-name-text">{chat.name}</span>
                                            <button
                                                className="edit-name-btn"
                                                onClick={() => handleEditClick(chat)}
                                                title="Edit chat name"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        {(() => {
                                            const m = getModeFromChat(chat);
                                            const cfg = MODE_LABELS[m] || MODE_LABELS.claim;
                                            return (
                                                <span style={{ color: cfg.color, fontSize: 12, fontWeight: 600, background: `${cfg.color}18`, border: `1px solid ${cfg.color}44`, borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                                                    {cfg.icon} {cfg.label}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td>{formatDate(chat.lastUpdated)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn"
                                                onClick={() => handleLoadClick(chat.id)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                                Load
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteClick(chat.id)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <EditChatModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, chatId: null, currentName: '' })}
                chatId={editModal.chatId}
                currentName={editModal.currentName}
                onSave={handleSaveEdit}
            />
        </div>
    );
};

export default HistoryView;
