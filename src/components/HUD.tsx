import React from 'react';
import { useNeuralBrain } from '../hooks/useNeuralBrain';

// ✅ YOUR CORRECT WORKER URL
const WORKER_URL = "https://sandbox-3d-brain.caleb-a71.workers.dev";

export function HUD() {
  const { 
    status, 
    startRecording, 
    stopRecording, 
    errorMessage, 
    complianceScore 
  } = useNeuralBrain({ workerUrl: WORKER_URL });

  // Visual Logic: Color bar based on Score (0-100)
  const getBarColor = (score: number) => {
    if (score < 30) return '#ef4444'; // Red (Danger)
    if (score < 70) return '#eab308'; // Yellow (Caution)
    return '#22c55e'; // Green (Success)
  };

  return (
    <div style={{
      position: 'fixed', // changed from absolute to fixed to ensure it stays on screen
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none', // Click-through to 3D scene
      zIndex: 100, // Ensure it sits on top of the 3D Canvas
      fontFamily: 'monospace',
      color: 'white',
      textShadow: '1px 1px 2px black',
      userSelect: 'none'
    }}>
      
      {/* --- TOP ANCHOR: COMPLIANCE METER --- */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <div style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.8 }}>COMPLIANCE LEVEL</div>
        
        {/* The Bar Container */}
        <div style={{ 
          width: '300px', 
          height: '20px', 
          background: 'rgba(0,0,0,0.6)', 
          border: '2px solid white',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* The Fill */}
          <div style={{
            width: `${complianceScore}%`,
            height: '100%',
            backgroundColor: getBarColor(complianceScore),
            transition: 'width 0.5s ease-out, background-color 0.5s ease'
          }} />
        </div>
        
        <div style={{ marginTop: '5px', fontWeight: 'bold' }}>{complianceScore}/100</div>
      </div>

      {/* --- CENTER ANCHOR: RETICLE --- */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '10px',
        height: '10px',
        border: '2px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '50%'
      }} />

      {/* --- BOTTOM ANCHOR: CONTROLS --- */}
      <div style={{ 
        position: 'absolute',
        bottom: '40px', // Forces it to stay 40px from bottom
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '15px',
        pointerEvents: 'auto' // CRITICAL: Re-enables clicking on the button
      }}>
        
        {/* Error Message Display */}
        {errorMessage && (
          <div style={{ color: '#ff4444', background: 'rgba(0,0,0,0.8)', padding: '8px', borderRadius: '4px' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Status Text */}
        {status === 'thinking' && (
          <div style={{ color: '#fbbf24', fontWeight: 'bold', animation: 'pulse 1s infinite' }}>
            ● ANALYZING...
          </div>
        )}
        {status === 'speaking' && (
          <div style={{ color: '#22c55e', fontWeight: 'bold' }}>
            🔊 MARCUS SPEAKING...
          </div>
        )}

        {/* PTT Button */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={status === 'thinking'} 
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            borderRadius: '30px',
            border: '2px solid white',
            background: status === 'recording' ? '#ef4444' : '#3b82f6',
            color: 'white',
            cursor: status === 'thinking' ? 'wait' : 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            transition: 'all 0.2s',
            opacity: status === 'thinking' ? 0.6 : 1,
            outline: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {status === 'recording' ? 'LISTENING...' : 'HOLD TO SPEAK'}
        </button>
      </div>
    </div>
  );
}