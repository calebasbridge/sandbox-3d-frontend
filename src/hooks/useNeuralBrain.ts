import { useState, useRef, useCallback } from 'react';

// Configuration types
interface BrainConfig {
  workerUrl: string; // The URL of your Cloudflare Worker
}

// The states of our neural link
export type BrainState = 'idle' | 'recording' | 'thinking' | 'speaking' | 'error';

export function useNeuralBrain({ workerUrl }: BrainConfig) {
  const [status, setStatus] = useState<BrainState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Refs to hold mutable objects without triggering re-renders
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);

  /**
   * 1. START RECORDING
   * Captures the microphone stream.
   */
  const startRecording = useCallback(async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine supported mime type (browser compatibility)
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

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
      console.error("Microphone access denied:", err);
      setErrorMessage("Microphone access denied.");
      setStatus('error');
    }
  }, []);

  /**
   * 2. STOP RECORDING & SEND TO BRAIN
   * Stops capture, creates a blob, and POSTs to the worker.
   */
  const stopRecording = useCallback(() => {
    if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') return;

    setStatus('thinking');

    mediaRecorder.current.onstop = async () => {
      // 1. Create the Audio Blob
      const audioBlob = new Blob(audioChunks.current, { type: mediaRecorder.current?.mimeType });
      
      // 2. Prepare the payload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_input.webm');
      // We can add specific speaker routing here later if needed
      // formData.append('speaker', 'Narrator'); 

      try {
        // 3. Send to Cloudflare Worker (The Brain)
        const response = await fetch(`${workerUrl}/v1/turn`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error(`Brain Freeze: ${response.statusText}`);

        // 4. Handle the Response (Audio Stream)
        const responseBlob = await response.blob();
        const audioUrl = URL.createObjectURL(responseBlob);
        
        playResponse(audioUrl);

      } catch (err) {
        console.error("Brain Connection Failed:", err);
        setErrorMessage("Connection to Brain lost.");
        setStatus('error');
      }

      // Cleanup tracks
      mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.current.stop();
  }, [workerUrl]);

  /**
   * 3. PLAY RESPONSE
   * Plays the audio returned by the Brain.
   */
  const playResponse = (url: string) => {
    setStatus('speaking');
    
    if (audioPlayer.current) {
      audioPlayer.current.pause();
      audioPlayer.current = null;
    }

    const audio = new Audio(url);
    audioPlayer.current = audio;

    audio.onended = () => {
      setStatus('idle');
      URL.revokeObjectURL(url); // Memory cleanup
    };

    audio.play().catch(e => {
        console.error("Autoplay blocked:", e);
        setErrorMessage("Audio playback blocked.");
        setStatus('error');
    });
  };

  return {
    status,
    errorMessage,
    startRecording,
    stopRecording
  };
}