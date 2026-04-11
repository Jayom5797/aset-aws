import React, { useState, useRef, useEffect } from 'react';
import logoIcon from '../assects/icons/satyamatrix.svg';
import SearchResults from './SearchResults';

const AssistantLoader = () => (
    <div className="message bot-message loading-message" aria-live="polite">
        <div className="message-avatar">
            <img src={logoIcon} alt="ASET" />
        </div>
        <div className="message-content">
            <div className="assistant-loading-card">
                <div className="assistant-loader-orb">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div>
                    <div className="assistant-loading-title">ASET is researching your claim</div>
                    <div className="assistant-loading-subtitle">Searching papers, ranking sources, and preparing evidence...</div>
                </div>
            </div>
        </div>
    </div>
);

const MessagesArea = ({ messages, chatName, onSendMessage, isSending = false }) => {
    const [message, setMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const latestUserMessageRef = useRef(null);

    // Keep the conversation anchored on the latest user claim instead of jumping
    // to the bottom when a long API response renders.
    useEffect(() => {
        const latestMessage = messages[messages.length - 1];
        const shouldAnchorToUserClaim = isSending || latestMessage?.type === 'user';

        if (shouldAnchorToUserClaim) {
            latestUserMessageRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [messages, isSending]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !isSending) {
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
                {messages.map((msg, index) => {
                    const isLatestUserMessage = msg.type === 'user' && !messages.slice(index + 1).some(nextMsg => nextMsg.type === 'user');

                    return (
                    <div
                        key={index}
                        className={`message ${msg.type}-message`}
                        ref={isLatestUserMessage ? latestUserMessageRef : null}
                    >
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
                    );
                })}
                {isSending && <AssistantLoader />}
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
                            disabled={isSending}
                        />
                        <button
                            type="button"
                            className="chat-attach-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSending}
                            aria-label="Attach files"
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
                        <button type="submit" className="chat-send-btn" disabled={isSending || !message.trim()} aria-label="Send message">
                            {isSending ? (
                                <span className="send-spinner" aria-hidden="true"></span>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                                </svg>
                            )}
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
