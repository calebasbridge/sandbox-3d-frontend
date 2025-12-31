import { useState, useRef, useCallback } from 'react';

interface BrainConfig {
  workerUrl: string;
}

export type BrainState = 'idle' | 'recording' | 'thinking' | 'speaking' | 'error';

// Interface for memory items
interface HistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function useNeuralBrain({ workerUrl }: BrainConfig) {
  const [status, setStatus] = useState<BrainState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Memory State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // NEW: Gamification State
  const [complianceScore, setComplianceScore] = useState<number>(50); // Default 50 (Neutral)

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);

  // Helper to play audio from a URL
  const playResponse = (url: string) => {
    setStatus('speaking');
    if (audioPlayer.current) {
      audioPlayer.current.pause();
    }
    const audio = new Audio(url);
    audioPlayer.current = audio;
    
    // Reset to idle when audio finishes
    audio.onended = () => setStatus('idle');
    
    audio.play().catch(e => console.error("Playback error:", e));
  };

  const startRecording = useCallback(async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = "audio/webm"; // Standard web audio

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setStatus('thinking');
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        
        // Prepare Payload
        const formData = new FormData();
        formData.append('audio', audioBlob, 'input.webm');
        
        // Inject History (The Amnesia Cure)
        // We transform the history format to match what Gemini expects if needed, 
        // or just send the raw array if the backend parses it.
        // Based on your backend code, sending the raw JSON string is correct.
        formData.append('history', JSON.stringify(history)); 

        try {
          const response = await fetch(workerUrl, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errData = await response.json() as any;
            throw new Error(errData.error || `Server Error: ${response.status}`);
          }

          // 1. Get Audio
          const responseBlob = await response.blob();
          const audioUrl = URL.createObjectURL(responseBlob);

          // 2. Read Headers (The Intelligence)
          const aiText = response.headers.get("X-Ai-Text") || "";
          const userText = response.headers.get("X-User-Text") || "";
          
          // NEW: Read Compliance Score
          const scoreHeader = response.headers.get("X-Compliance-Score");
          if (scoreHeader) {
            const score = parseInt(scoreHeader, 10);
            if (!isNaN(score)) {
              console.log("📈 Compliance Score Updated:", score);
              setComplianceScore(score);
            }
          }
          
          console.log("🗣️ User Said:", userText);
          console.log("🤖 AI Replied:", aiText);

          // 3. Update History (Sliding Window)
          if (userText && aiText) {
            setHistory(prev => {
              const newTurn: HistoryItem[] = [
                { role: 'user', parts: [{ text: userText }] },
                { role: 'model', parts: [{ text: aiText }] }
              ];
              // Keep only last 6 items (3 turns)
              return [...prev, ...newTurn].slice(-6);
            });
          }

          playResponse(audioUrl);

        } catch (err: any) {
          console.error("Brain Error:", err);
          setErrorMessage(err.message || "Connection failed");
          setStatus('error');
        }

        // Clean up tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setStatus('recording');

    } catch (err: any) {
      console.error("Mic Error:", err);
      setErrorMessage("Microphone access denied or not available.");
      setStatus('error');
    }
  }, [workerUrl, history]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
  }, []);

  return {
    status,
    startRecording,
    stopRecording,
    errorMessage,
    complianceScore // Exported for the HUD
  };
}