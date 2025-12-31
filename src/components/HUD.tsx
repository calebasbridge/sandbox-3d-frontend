import React from 'react';
import { useNeuralBrain } from '../hooks/useNeuralBrain';

// Configuration: Replace this with your actual Worker URL
// If running locally, it's usually http://localhost:8787
const WORKER_URL = "https://sandbox-3d-brain.caleb-a71.workers.dev"; 

export function HUD() {
  const { status, errorMessage, startRecording, stopRecording } = useNeuralBrain({ 
    workerUrl: WORKER_URL 
  });

  // Dynamic Styles based on Status
  const getStatusColor = () => {
    switch (status) {
      case 'recording': return '#ff4444'; // Red
      case 'thinking': return '#ffbb33';  // Orange
      case 'speaking': return '#00C851';  // Green
      case 'error': return '#cc0000';     // Dark Red
      default: return 'rgba(255, 255, 255, 0.2)'; // Transparent White (Idle)
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'recording': return 'LISTENING...';
      case 'thinking': return 'PROCESSING...';
      case 'speaking': return 'MARCUS SPEAKING';
      case 'error': return 'ERROR';
      default: return 'HOLD TO SPEAK'; // Idle
    }
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '50px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10, // Ensures it sits ON TOP of the 3D Canvas
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      fontFamily: 'monospace',
      pointerEvents: 'auto' // Ensures clicks register
    }}>
      
      {/* ERROR MESSAGE (Only visible if there is an error) */}
      {errorMessage && (
        <div style={{ color: 'red', background: 'black', padding: '5px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* THE INTERACTION BUTTON */}
      <button
        onMouseDown={startRecording} // Mouse Down -> Start
        onMouseUp={stopRecording}    // Mouse Up -> Stop (Send)
        onMouseLeave={stopRecording} // Mouse leaves button -> Stop
        onTouchStart={startRecording} // Mobile support
        onTouchEnd={stopRecording}    // Mobile support
        style={{
          width: '200px',
          height: '60px',
          borderRadius: '30px',
          border: '2px solid white',
          background: getStatusColor(),
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: status === 'recording' ? '0 0 20px red' : '0 0 10px rgba(0,0,0,0.5)',
          transition: 'all 0.2s ease'
        }}
      >
        {getStatusText()}
      </button>

      {/* INSTRUCTIONS */}
      <div style={{ color: 'white', textShadow: '1px 1px 2px black' }}>
        Status: {status.toUpperCase()}
      </div>
    </div>
  );
}