import { useState } from 'react';

export const useChatState = () => {
    const [messages, setMessages] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [currentView, setCurrentView] = useState('welcome'); // 'welcome', 'messages', 'history'

    const addMessage = (message) => {
        setMessages(prev => [...prev, message]);
    };

    const clearMessages = () => {
        setMessages([]);
    };

    const startNewChat = () => {
        setMessages([]);
        setCurrentChatId(null);
        setCurrentView('welcome');
        setSelectedFiles([]);
    };

    const loadChat = (chatId) => {
        // This would normally load from API
        setCurrentChatId(chatId);
        setCurrentView('messages');
    };

    const addFiles = (files) => {
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const clearFiles = () => {
        setSelectedFiles([]);
    };

    return {
        messages,
        currentChatId,
        chatHistory,
        selectedFiles,
        currentView,
        addMessage,
        clearMessages,
        startNewChat,
        loadChat,
        setCurrentView,
        setChatHistory,
        addFiles,
        clearFiles
    };
};
