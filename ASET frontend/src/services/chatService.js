// Chat service for ASET - integrates with backend API
import { api } from './api';

const STORAGE_KEY = 'aset_chat_history';

// LocalStorage helper functions
const storage = {
    getChats: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    },
    
    saveChats: (chats) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },
    
    getChat: (chatId) => {
        const chats = storage.getChats();
        return chats.find(chat => chat.id === chatId);
    },
    
    updateChat: (chatId, updates) => {
        const chats = storage.getChats();
        const index = chats.findIndex(chat => chat.id === chatId);
        if (index !== -1) {
            chats[index] = { ...chats[index], ...updates, lastUpdated: new Date().toISOString() };
            storage.saveChats(chats);
            return chats[index];
        }
        return null;
    },
    
    deleteChat: (chatId) => {
        const chats = storage.getChats();
        const filtered = chats.filter(chat => chat.id !== chatId);
        storage.saveChats(filtered);
        return filtered.length < chats.length;
    }
};

export const chatService = {
    // Send a message and get AI response with paper search (verification on demand)
    sendMessage: async (message, files = []) => {
        try {
            // Search for papers using /api/get-sources
            const result = await api.searchPapers(message);

            if (!result || !result.sources) {
                return {
                    success: false,
                    response: result?.error || 'Failed to search papers',
                    timestamp: new Date().toISOString()
                };
            }

            const { sources, domain, topic, subtopic, totalSources, queryTime, externallyFetched } = result;

            if (sources.length === 0) {
                return {
                    success: true,
                    response: 'No papers found for this query. Try rephrasing your question.',
                    timestamp: new Date().toISOString()
                };
            }

            // Return papers with metadata (verification happens when user clicks button)
            return {
                success: true,
                response: `Found ${totalSources} relevant papers`,
                timestamp: new Date().toISOString(),
                metadata: {
                    papers: sources,
                    searchMetadata: {
                        domain,
                        topic,
                        subtopic,
                        totalSources,
                        queryTime,
                        externallyFetched: externallyFetched || false
                    }
                }
            };
        } catch (error) {
            console.error('Send message error:', error);
            return {
                success: false,
                response: 'Sorry, I encountered an error processing your request. Please try again.',
                timestamp: new Date().toISOString()
            };
        }
    },

    // Fetch chat history from localStorage or backend
    getChatHistory: async () => {
        const token = localStorage.getItem('aset_token');
        
        if (token) {
            // Fetch from backend if authenticated
            try {
                const result = await api.getChatHistory();
                return {
                    success: true,
                    chats: result.chats.map(chat => ({
                        id: chat.chat_id,
                        name: chat.chat_name,
                        mode: chat.chat_name?.startsWith('📄') ? 'document' : chat.chat_name?.startsWith('▶️') ? 'youtube' : 'claim',
                        lastUpdated: chat.updated_at,
                        createdAt: chat.created_at
                    }))
                };
            } catch (error) {
                console.error('Failed to fetch chat history from backend:', error);
                // Fallback to localStorage
            }
        }
        
        // Use localStorage for non-authenticated users
        const chats = storage.getChats();
        chats.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        
        return {
            success: true,
            chats: chats
        };
    },

    // Create a new chat
    createChat: async (initialMessage, messages = []) => {
        const chatId = Date.now().toString();
        const now = new Date().toISOString();
        const token = localStorage.getItem('aset_token');
        
        const newChat = {
            id: chatId,
            name: initialMessage.slice(0, 50) + (initialMessage.length > 50 ? '...' : ''),
            messageCount: messages.length,
            messages: messages,
            lastUpdated: now,
            createdAt: now
        };
        
        if (token) {
            // Save to backend if authenticated
            try {
                await api.saveChat(chatId, newChat.name, messages);
                return {
                    success: true,
                    chatId: chatId,
                    message: 'Chat created successfully'
                };
            } catch (error) {
                console.error('Failed to save chat to backend:', error);
                // Fallback to localStorage
            }
        }
        
        // Save to localStorage
        const chats = storage.getChats();
        chats.push(newChat);
        storage.saveChats(chats);
        
        return {
            success: true,
            chatId: chatId,
            message: 'Chat created successfully'
        };
    },

    // Update chat (messages or name)
    updateChat: async (chatId, updates) => {
        const token = localStorage.getItem('aset_token');
        
        if (token && updates.messages) {
            // Update backend if authenticated
            try {
                await api.saveChat(chatId, updates.name, updates.messages?.map(m => ({
              ...m,
              metadata: m.metadata ? {
                ...m.metadata,
                papers: m.metadata.papers?.map(p => ({ ...p, abstract: undefined }))
              } : undefined
            })));
                return {
                    success: true,
                    message: 'Chat updated successfully'
                };
            } catch (error) {
                console.error('Failed to update chat on backend:', error);
                // Fallback to localStorage
            }
        }
        
        // Update localStorage
        const chat = storage.updateChat(chatId, updates);
        
        if (chat) {
            return {
                success: true,
                message: 'Chat updated successfully',
                chat: chat
            };
        }
        
        return {
            success: false,
            message: 'Chat not found'
        };
    },

    // Update chat name
    updateChatName: async (chatId, newName) => {
        return chatService.updateChat(chatId, { name: newName });
    },

    // Delete a chat
    deleteChat: async (chatId) => {
        const deleted = storage.deleteChat(chatId);
        
        return {
            success: deleted,
            message: deleted ? 'Chat deleted successfully' : 'Chat not found'
        };
    },

    // Load chat messages
    loadChatMessages: async (chatId) => {
        const token = localStorage.getItem('aset_token');
        
        if (token) {
            // Load from backend if authenticated
            try {
                const result = await api.loadChat(chatId);
                return {
                    success: true,
                    messages: result.messages || [],
                    chatName: result.chatName
                };
            } catch (error) {
                console.error('Failed to load chat from backend:', error);
                // Fallback to localStorage
            }
        }
        
        // Load from localStorage
        const chat = storage.getChat(chatId);
        
        if (chat) {
            return {
                success: true,
                messages: chat.messages || [],
                chatName: chat.name
            };
        }
        
        return {
            success: false,
            message: 'Chat not found',
            messages: []
        };
    },
    
    // Save current chat to history
    saveCurrentChat: async (chatName, messages) => {
        if (messages.length === 0) return { success: false };
        
        const firstUserMessage = messages.find(m => m.type === 'user')?.content || 'New Chat';
        
        return chatService.createChat(firstUserMessage, messages);
    },

    // Save Mode 2/3 verification result to history
    saveVerificationResult: async (mode, name, result) => {
        const chatId = Date.now().toString();
        const now = new Date().toISOString();
        const token = localStorage.getItem('aset_token');

        const chatName = name.slice(0, 50) + (name.length > 50 ? '...' : '');
        const messages = [{ type: 'verification', mode, result, timestamp: now }];

        if (token) {
            try {
                await api.saveChat(chatId, chatName, messages);
                return { success: true, chatId };
            } catch (error) {
                console.error('Failed to save verification to backend:', error);
            }
        }

        const chats = storage.getChats();
        chats.push({ id: chatId, name: chatName, mode, messages, lastUpdated: now, createdAt: now });
        storage.saveChats(chats);
        return { success: true, chatId };
    }
};
