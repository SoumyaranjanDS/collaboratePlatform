import { useState, useEffect } from 'react'; // Import React hooks
import io from 'socket.io-client'; // Import socket.io client
import './App.css'; // Import component-specific styles

// Initialize the socket connection to our server
const socket = io('http://localhost:3001');

function App() {
  // State to store the text in the board
  const [text, setText] = useState('');
  // State to track if we are currently connected to the server
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Listener for when the connection is established
    socket.on('connect', () => {
      setIsConnected(true);
    });

    // Listener for when we are disconnected
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listener for the initial board data from the server
    socket.on('load-board', (data) => {
      setText(data);
    });

    // Listener for updates sent by other users
    socket.on('text-received', (newText) => {
      setText(newText);
    });

    // Cleanup listeners when the component unmounts
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('load-board');
      socket.off('text-received');
    };
  }, []);

  // Handle changes in the textarea
  const handleChange = (e) => {
    const value = e.target.value;
    setText(value); // Update local state
    socket.emit('update-text', value); // Send the new text to the server
  };

  return (
    <div className="container">
      <header>
        <h1>Collaborate.io</h1>
        <p className="subtitle">Real-time collaborative writing platform</p>
        
        {/* Status Indicator */}
        <div className={`status ${isConnected ? 'online' : 'offline'}`}>
          <span className="dot"></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <main>
        {/* The Collaborative Board */}
        <div className="editor-wrapper">
          <textarea
            className="editor"
            value={text}
            onChange={handleChange}
            placeholder="Start typing something amazing..."
            spellCheck="false"
          />
        </div>
      </main>

      <footer>
        <p>Built with Socket.io & React</p>
      </footer>
    </div>
  );
}

export default App;
