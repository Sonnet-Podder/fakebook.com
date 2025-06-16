
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Fakebook() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeChats, setActiveChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [usersOnline, setUsersOnline] = useState([]);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('users online', (users) => {
      setUsersOnline(users.filter(u => u !== username));
    });

    return () => {
      socket.off('chat message');
      socket.off('users online');
    };
  }, [username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && username) {
      socket.emit('chat message', { from: username, message, to: currentChat || 'all' });
      setMessages((prev) => [...prev, { from: username, message, to: currentChat || 'all' }]);
      setMessage('');
    }
  };

  if (!loggedIn) {
    return (
      <div style={styles.loginContainer}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim()) {
              socket.emit('new user', username);
              setLoggedIn(true);
              setCurrentChat('all');
            }
          }}
          style={styles.loginForm}
        >
          <h2 style={{ marginBottom: 20 }}>Welcome to Fakebook</h2>
          <input
            type="text"
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
          />
          <button style={styles.button}>Join Chat</button>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3>Chats</h3>
        <div
          style={currentChat === 'all' ? styles.activeChatUser : styles.chatUser}
          onClick={() => setCurrentChat('all')}
        >
          Group Chat
        </div>
        <h4>Online Users</h4>
        {usersOnline.length === 0 && <div>No users online</div>}
        {usersOnline.map((user) => (
          <div
            key={user}
            style={currentChat === user ? styles.activeChatUser : styles.chatUser}
            onClick={() => setCurrentChat(user)}
          >
            {user}
          </div>
        ))}
      </div>
      <div style={styles.chatArea}>
        <div style={styles.chatHeader}>
          Chat with {currentChat === 'all' ? 'Group' : currentChat}
        </div>
        <div style={styles.messages}>
          {messages
            .filter(
              (msg) =>
                (msg.to === 'all' && currentChat === 'all') ||
                (msg.from === username && msg.to === currentChat) ||
                (msg.from === currentChat && msg.to === username) ||
                (msg.from === username && currentChat === 'all' && msg.to === 'all')
            )
            .map((msg, i) => (
              <div
                key={i}
                style={msg.from === username ? styles.messageSent : styles.messageReceived}
              >
                <b>{msg.from}:</b> {msg.message}
              </div>
            ))}
        </div>
        <form onSubmit={sendMessage} style={styles.form}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.inputMessage}
            placeholder="Type your message..."
          />
          <button type="submit" style={styles.sendButton}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  loginContainer: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loginForm: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    width: 300,
  },
  input: {
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 5,
    border: '1px solid #ccc',
  },
  button: {
    padding: 10,
    fontSize: 16,
    backgroundColor: '#1877f2',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
  },
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  sidebar: {
    width: 250,
    backgroundColor: 'white',
    borderRight: '1px solid #ddd',
    padding: 20,
    boxSizing: 'border-box',
  },
  chatUser: {
    padding: 10,
    cursor: 'pointer',
    borderRadius: 5,
    marginBottom: 8,
    backgroundColor: '#e4e6eb',
  },
  activeChatUser: {
    padding: 10,
    cursor: 'pointer',
    borderRadius: 5,
    marginBottom: 8,
    backgroundColor: '#1877f2',
    color: 'white',
  },
  chatArea: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  chatHeader: {
    padding: 15,
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold',
    fontSize: 18,
  },
  messages: {
    flexGrow: 1,
    padding: 15,
    overflowY: 'auto',
    backgroundColor: '#f5f6f7',
  },
  messageSent: {
    backgroundColor: '#1877f2',
    color: 'white',
    padding: 10,
    borderRadius: 15,
    maxWidth: '60%',
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  messageReceived: {
    backgroundColor: '#e4e6eb',
    padding: 10,
    borderRadius: 15,
    maxWidth: '60%',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  form: {
    display: 'flex',
    borderTop: '1px solid #ddd',
  },
  inputMessage: {
    flexGrow: 1,
    padding: 15,
    border: 'none',
    fontSize: 16,
    outline: 'none',
  },
  sendButton: {
    padding: '0 20px',
    backgroundColor: '#1877f2',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: 16,
  },
};
