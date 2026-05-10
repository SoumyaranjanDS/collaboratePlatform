import React, { useState, useEffect, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import './Whiteboard.css';

const Whiteboard = ({ socket, selectedChat, initialData, onSave }) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const isRemoteUpdate = useRef(false);
  const lastEmitTime = useRef(0);

  const initialElements = Array.isArray(initialData) ? initialData : [];

  useEffect(() => {
    if (!excalidrawAPI) return;

    const handleRemoteUpdate = (data) => {
      if (data.elements) {
        isRemoteUpdate.current = true;
        excalidrawAPI.updateScene({ elements: data.elements });
        setTimeout(() => { isRemoteUpdate.current = false; }, 100);
      }
    };

    socket.on('draw-line', handleRemoteUpdate);
    return () => socket.off('draw-line', handleRemoteUpdate);
  }, [excalidrawAPI, socket]);

  const handleChange = (elements) => {
    if (isRemoteUpdate.current) return;
    const now = Date.now();
    if (now - lastEmitTime.current > 100) {
      const cleanElements = elements.map(el => ({ ...el }));
      socket.emit('draw-line', { recipientName: selectedChat, elements: cleanElements });
      lastEmitTime.current = now;
      if (onSave) onSave(cleanElements);
    }
  };

  return (
    <div className="chatify-canvas">
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{
          elements: initialElements,
          appState: {
            viewBackgroundColor: 'transparent',
            currentItemStrokeColor: '#e2e8f0',
            currentItemBackgroundColor: 'transparent',
            gridSize: null,
          },
        }}
        onChange={handleChange}
        theme="dark"
      />
    </div>
  );
};

export default Whiteboard;
