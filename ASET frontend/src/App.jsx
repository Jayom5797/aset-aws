import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LandingPage from './components/LandingPage';
import TrendingPage from './components/TrendingPage';
import Login from './components/Login';
import Register from './components/Register';
import { useSidebar } from './hooks/useSidebar';
import { chatService } from './services/chatService';
import './styles/chat.css';
import './styles/searchResults.css';
import './styles/auth.css';
import './styles/landing.css';
import './styles/trending.css';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const [showAuth, setShowAuth] = React.useState(false);
  const [showRegister, setShowRegister] = React.useState(false);
  const [showLanding, setShowLanding] = React.useState(false); // logged-in user viewing landing
  const { isExpanded, activeItem, toggleSidebar, setActive } = useSidebar();
  const [currentView, setCurrentView] = React.useState('welcome');
  const [messages, setMessages] = React.useState([]);
  const [chatName, setChatName] = React.useState('New Chat');
  const [currentChatId, setCurrentChatId] = React.useState(null);

  // Add/remove chat-mode class based on authentication
  React.useEffect(() => {
    if (isAuthenticated) {
      document.body.classList.add('chat-mode');
    } else {
      document.body.classList.remove('chat-mode');
    }
    return () => {
      document.body.classList.remove('chat-mode');
    };
  }, [isAuthenticated]);

  // Auto-save chat when messages change (only if authenticated)
  React.useEffect(() => {
    if (messages.length > 0 && isAuthenticated) {
      const saveChat = async () => {
        try {
          if (currentChatId) {
            // Update existing chat
            await chatService.updateChat(currentChatId, {
              messages: messages,
              messageCount: messages.length,
              name: chatName
            });
          } else {
            // Create new chat
            const firstUserMessage = messages.find(m => m.type === 'user')?.content || 'New Chat';
            const result = await chatService.createChat(firstUserMessage, messages);
            if (result.success) {
              setCurrentChatId(result.chatId);
            }
          }
        } catch (error) {
          console.error('Failed to save chat:', error);
        }
      };
      saveChat();
    }
  }, [messages, chatName, currentChatId, isAuthenticated]);

  const handleItemClick = (item) => {
    setActive(item);

    if (item === 'history') {
      setCurrentView('history');
    } else if (item === 'current-chat') {
      if (messages.length > 0) {
        setCurrentView('messages');
      } else {
        setCurrentView('welcome');
      }
    } else if (item === 'trending') {
      setCurrentView('trending');
    } else if (item === 'profile') {
      setCurrentView('profile');
    } else if (item === 'settings') {
      setCurrentView('settings');
    } else if (item === 'home') {
      setShowLanding(true);
      document.body.classList.remove('chat-mode');
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatName('New Chat');
    setCurrentChatId(null);
    setCurrentView('welcome');
    setActive('current-chat');
  };

  const handleLoadChat = async (chatId) => {
    const result = await chatService.loadChatMessages(chatId);
    if (result.success) {
      setMessages(result.messages);
      setChatName(result.chatName || 'Chat');
      setCurrentChatId(chatId);
      setCurrentView('messages');
      setActive('current-chat');
    }
  };

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Authenticated user viewing landing page
  if (isAuthenticated && showLanding) {
    // Remove chat-mode so landing page can scroll
    document.body.classList.remove('chat-mode');
    return <LandingPage onGetStarted={() => setShowLanding(false)} isLoggedIn={true} onGoToApp={() => setShowLanding(false)} />;
  }

  if (!isAuthenticated) {
    if (!showAuth) {
      return <LandingPage onGetStarted={handleGetStarted} />;
    }
    
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  if (currentView === 'trending') {
    return (
      <div className="app-container">
        <Sidebar isExpanded={isExpanded} onToggle={toggleSidebar} activeItem={activeItem} onItemClick={handleItemClick} onNewChat={handleNewChat} />
        <TrendingPage />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        isExpanded={isExpanded}
        onToggle={toggleSidebar}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        onNewChat={handleNewChat}
      />
      <ChatArea 
        userName={user?.name || user?.email || 'User'}
        currentView={currentView}
        setCurrentView={setCurrentView}
        messages={messages}
        setMessages={setMessages}
        chatName={chatName}
        setChatName={setChatName}
        onLoadChat={handleLoadChat}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
