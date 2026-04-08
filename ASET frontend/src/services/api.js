// API configuration for ASET backend
// In production: uses VITE_API_URL (App Runner)
// In local dev: uses Vite proxy (empty string = relative URL → proxied to localhost:3001)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('aset_token');

export const api = {
  // Auth endpoints
  register: async (email, password, name) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },

  // Chat history endpoints
  getChatHistory: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch chat history');
    return response.json();
  },

  saveChat: async (chatId, chatName, messages) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_BASE_URL}/api/chat/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ chatId, chatName, messages })
    });
    if (!response.ok) throw new Error('Failed to save chat');
    return response.json();
  },

  loadChat: async (chatId) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to load chat');
    return response.json();
  },

  deleteChat: async (chatId) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete chat');
    return response.json();
  },

  // Search papers with relevance scoring
  searchPapers: async (query) => {
    const response = await fetch(`${API_BASE_URL}/api/get-sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        claim: query,
        filters: {}
      })
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },

  // Verify claim
  verifyClaim: async (claim, papers) => {
    const response = await fetch(`${API_BASE_URL}/api/verify-claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim, papers })
    });
    if (!response.ok) throw new Error('Verification failed');
    return response.json();
  },

  // Health check
  health: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  },

  // Password reset
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to send code');
    }
    return response.json();
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to reset password');
    }
    return response.json();
  },

  // Mode 3: Process document (PDF/DOCX/image)
  processDocument: async (formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/process-document`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData // FormData — do NOT set Content-Type, browser sets multipart boundary
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Processing failed' }));
      throw new Error(err.error || 'Document processing failed');
    }
    return response.json();
  },

  // Mode 2: Process YouTube URL
  processYouTube: async (url) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/process-youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ url })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Processing failed' }));
      throw new Error(err.error || 'YouTube processing failed');
    }
    return response.json();
  }
};
