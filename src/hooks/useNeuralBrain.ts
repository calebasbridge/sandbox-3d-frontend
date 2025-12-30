import { useState, useRef, useCallback } from 'react';

interface BrainConfig {
  workerUrl: string;
}

export type BrainState = 'idle' | 'recording' | 'thinking' | 'speaking' | 'error';

export function useNeuralBrain({ workerUrl }: BrainConfig) {
  const [status, setStatus] = useState<BrainState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setErrorMessage(null);
      // Request simple audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use simple webm for maximum compatibility
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

  const stopRecording = useCallback(() => {
    if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') return;

    setStatus('thinking');

    mediaRecorder.current.onstop = async () => {
      // Create Blob
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      
      console.log("📦 Frontend Audio Size:", audioBlob.size); // Debug Log

      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_input.webm');

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
        
        // Log what the AI thought
        const aiText = response.headers.get("X-Ai-Text");
        console.log("🤖 AI Replied:", aiText);

        playResponse(audioUrl);

      } catch (err: any) {
        console.error("Brain Error:", err);
        setErrorMessage(err.message || "Connection failed");
        setStatus('error');
      }

      // Cleanup
      mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.current.stop();
  }, [workerUrl]);

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