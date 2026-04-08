import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import MessagesArea from './MessagesArea';
import HistoryView from './HistoryView';
import UserDropdown from './UserDropdown';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import { chatService } from '../services/chatService';
import auroraVideo from '../assects/videos/Aurora.mp4';

const ChatArea = ({ userName = 'User', currentView, setCurrentView, messages, setMessages, chatName, setChatName, onLoadChat }) => {
    const handleSendMessage = async (messageText, files = []) => {
        // Add user message
        const userMessage = {
            type: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        // Switch to messages view if on welcome screen
        if (currentView === 'welcome') {
            setCurrentView('messages');
            // Set chat name based on first message
            setChatName(messageText.slice(0, 50) + (messageText.length > 50 ? '...' : ''));
        }

        // Get AI response
        try {
            const response = await chatService.sendMessage(messageText, files);
            if (response.success) {
                const botMessage = {
                    type: 'bot',
                    content: response.response,
                    timestamp: response.timestamp,
                    metadata: response.metadata // Include papers and searchMetadata
                };
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage = {
                type: 'bot',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const handleCloseHistory = () => {
        setCurrentView(messages.length > 0 ? 'messages' : 'welcome');
    };

    return (
        <main className={`main-content ${currentView === 'messages' ? 'chat-active' : ''}`}>
            {/* Background Video */}
            <div className="video-background">
                <video autoPlay muted loop playsInline>
                    <source src={auroraVideo} type="video/mp4" />
                </video>
            </div>

            {/* User Dropdown */}
            <UserDropdown userName={userName} onNavigate={setCurrentView} />

            {/* Chat Area */}
            <div className="chat-area">
                {currentView === 'welcome' && (
                    <WelcomeScreen userName={userName} onSendMessage={handleSendMessage} />
                )}

                {currentView === 'messages' && (
                    <MessagesArea
                        messages={messages}
                        chatName={chatName}
                        onSendMessage={handleSendMessage}
                    />
                )}

                {currentView === 'history' && (
                    <HistoryView
                        onLoadChat={onLoadChat}
                        onClose={handleCloseHistory}
                    />
                )}

                {currentView === 'profile' && (
                    <ProfilePage onClose={() => setCurrentView('welcome')} />
                )}

                {currentView === 'settings' && (
                    <SettingsPage onClose={() => setCurrentView('welcome')} />
                )}
            </div>
        </main>
    );
};

export default ChatArea;
