import React, { useState, useRef, useEffect } from 'react';
import logoIcon from '../assects/icons/satyamatrix.svg';
import SearchResults from './SearchResults';

const MessagesArea = ({ messages, chatName, onSendMessage }) => {
    const [message, setMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message, selectedFiles);
            setMessage('');
            setSelectedFiles([]);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    const getFileNames = () => {
        if (selectedFiles.length === 0) return '';
        if (selectedFiles.length === 1) return selectedFiles[0].name;
        return `${selectedFiles.length} files selected`;
    };

    return (
        <div className="messages-area">
            <div className="chat-header">
                <h3 className="chat-name">{chatName || 'New Chat'}</h3>
            </div>

            <div className="messages-container">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}-message`}>
                        {msg.type === 'bot' && (
                            <div className="message-avatar">
                                <img src={logoIcon} alt="Bot" />
                            </div>
                        )}
                        <div className="message-content">
                            {msg.type === 'user' ? (
                                <p className="message-text">{msg.content}</p>
                            ) : msg.metadata && msg.metadata.papers ? (
                                <SearchResults
                                    claim={messages[index - 1]?.content || ''}
                                    papers={msg.metadata.papers}
                                    searchMetadata={msg.metadata.searchMetadata}
                                />
                            ) : (
                                <p className="message-text">{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-wrapper">
                <form className="chat-input-box" onSubmit={handleSubmit}>
                    <div className="chat-input-row">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            autoComplete="off"
                            className="chat-input-field"
                        />
                        <button
                            type="button"
                            className="chat-attach-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                            </svg>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx"
                            style={{ display: 'none' }}
                            multiple
                            onChange={handleFileChange}
                        />
                        <button type="submit" className="chat-send-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                            </svg>
                        </button>
                    </div>
                    {selectedFiles.length > 0 && (
                        <div className="chat-file-names">{getFileNames()}</div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default MessagesArea;
