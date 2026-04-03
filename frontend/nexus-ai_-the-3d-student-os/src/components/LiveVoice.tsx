import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2, Terminal } from 'lucide-react';
import { cn } from '../lib/utils';

interface LiveVoiceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoice: React.FC<LiveVoiceProps> = ({ isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [transcript, setTranscript] = useState<string>('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  const apiKey = process.env.GEMINI_API_KEY;

  const startSession = async () => {
    if (!apiKey) {
      setStatus('error');
      return;
    }

    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey });

    try {
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are Senior Top, a high-efficiency AI assistant for AIDS students. You are in a real-time voice conversation. Be concise, proactive, and encouraging. Focus on academic success and consistency.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus('active');
            setIsActive(true);
            startAudioStreaming();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const audioData = base64ToUint8Array(part.inlineData.data);
                  const pcmData = new Int16Array(audioData.buffer);
                  audioQueue.current.push(pcmData);
                  if (!isPlaying.current) {
                    playNextInQueue();
                  }
                }
                if (part.text) {
                  // Handle transcription if needed
                }
              }
            }
            
            if (message.serverContent?.interrupted) {
              audioQueue.current = [];
              isPlaying.current = false;
            }

            if (message.serverContent?.turnComplete) {
              // Turn finished
            }
          },
          onclose: () => {
            stopSession();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setStatus('error');
          }
        }
      });

      sessionRef.current = session;
    } catch (err) {
      console.error("Failed to start voice session:", err);
      setStatus('error');
    }
  };

  const startAudioStreaming = () => {
    if (!audioContextRef.current || !streamRef.current || !sessionRef.current) return;

    const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

    processorRef.current.onaudioprocess = (e) => {
      if (isMuted) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      
      const base64Data = uint8ArrayToBase64(new Uint8Array(pcmData.buffer));
      sessionRef.current.sendRealtimeInput({
        audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    source.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
  };

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) {
      isPlaying.current = false;
      return;
    }

    isPlaying.current = true;
    const pcmData = audioQueue.current.shift()!;
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
    buffer.getChannelData(0).set(floatData);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('idle');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    
    audioQueue.current = [];
    isPlaying.current = false;
  };

  const base64ToUint8Array = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const uint8ArrayToBase64 = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  useEffect(() => {
    if (!isOpen && isActive) {
      stopSession();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <div className="w-full max-w-lg bg-[#020617] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-cyan-500/10">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                  status === 'active' ? "bg-cyan-500/20 text-cyan-400 glow-cyan" : "bg-slate-800 text-slate-500"
                )}>
                  <Terminal size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100 tracking-tight">Senior Top Live</h2>
                  <p className="text-xs uppercase tracking-widest font-bold text-cyan-500/60">Neural Voice Link</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-12 flex flex-col items-center justify-center min-h-[300px] space-y-12">
              {/* Visualizer Placeholder */}
              <div className="relative flex items-center justify-center">
                <AnimatePresence>
                  {status === 'active' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.1, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                          }}
                          className="absolute w-48 h-48 rounded-full border border-cyan-500/30"
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={isActive ? stopSession : startSession}
                  disabled={status === 'connecting'}
                  className={cn(
                    "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 z-10",
                    isActive 
                      ? "bg-cyan-500 text-white shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)]" 
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  )}
                >
                  {status === 'connecting' ? (
                    <Loader2 size={48} className="animate-spin" />
                  ) : isActive ? (
                    <Volume2 size={48} />
                  ) : (
                    <Mic size={48} />
                  )}
                </button>
              </div>

              <div className="text-center space-y-2">
                <p className={cn(
                  "text-lg font-medium transition-colors",
                  status === 'active' ? "text-cyan-400" : "text-slate-400"
                )}>
                  {status === 'idle' && "Ready for mission briefing"}
                  {status === 'connecting' && "Establishing neural link..."}
                  {status === 'active' && "Neural link active"}
                  {status === 'error' && "Neural link failed"}
                </p>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  {isActive 
                    ? "Speak naturally. Senior Top is listening." 
                    : "Tap the mic to start a real-time voice conversation."}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  disabled={!isActive}
                  className={cn(
                    "p-4 rounded-2xl transition-all",
                    isMuted ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                    !isActive && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-4 rounded-2xl bg-slate-800 text-slate-400 hover:bg-slate-700"
                >
                  <Volume2 size={24} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-900/30 border-t border-white/5 flex items-center justify-center">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-slate-600">
                <div className={cn("w-1.5 h-1.5 rounded-full", status === 'active' ? "bg-cyan-500 animate-pulse" : "bg-slate-700")} />
                System Status: {status.toUpperCase()}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
