import { useState, useRef, useCallback } from 'react';

interface BrainConfig {
  workerUrl: string;
}

export type BrainState = 'idle' | 'recording' | 'thinking' | 'speaking' | 'error';

// New: Interface for memory items
interface HistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function useNeuralBrain({ workerUrl }: BrainConfig) {
  const [status, setStatus] = useState<BrainState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // New: Memory State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.start(); 
      setStatus('recording');

    } catch (err) {
      console.error("Mic Error:", err);
      setErrorMessage("Microphone access denied.");
      setStatus('error');
    }
  }, []);

  // Updated: Now depends on 'history' to ensure we send the latest context
  const stopRecording = useCallback(() => {
    if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') return;

    setStatus('thinking');

    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      console.log("📦 Frontend Audio Size:", audioBlob.size);

      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_input.webm');
      
      // New: Inject Memory (Last 3 turns / 6 items max)
      // We JSON.stringify it so it passes as a text field in FormData
      formData.append('history', JSON.stringify(history)); 

      try {
        const response = await fetch(`${workerUrl}/v1/turn`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
           const errJson = await response.json() as any;
           throw new Error(errJson.error || response.statusText);
        }

        const responseBlob = await response.blob();
        const audioUrl = URL.createObjectURL(responseBlob);
        
        // Retrieve transcripts from headers
        const aiText = response.headers.get("X-Ai-Text") || "";
        const userText = response.headers.get("X-User-Text") || "";
        
        console.log("🗣️ User Said:", userText);
        console.log("🤖 AI Replied:", aiText);

        // New: Update History (Sliding Window)
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

      mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.current.stop();
  }, [workerUrl, history]); // Added history dependency

  const playResponse = (url: string) => {
    setStatus('speaking');
    if (audioPlayer.current) {
      audioPlayer.current.pause();
    }
    const audio = new Audio(url);
    audioPlayer.current = audio;
    audio.onended = () => {
      setStatus('idle');
      URL.revokeObjectURL(url);
    };
    audio.play().catch(e => console.error("Playback blocked:", e));
  };

  return { status, errorMessage, startRecording, stopRecording };
}