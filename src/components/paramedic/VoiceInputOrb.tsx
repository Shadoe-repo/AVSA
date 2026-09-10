import React, { useState, useEffect, useRef } from 'react';
import { Mic, Sparkles, RefreshCw } from 'lucide-react';
import { parseClinicalSpeech } from '../../services/voiceExtractor';
import { VoiceExtractionResult } from '../../types';

interface VoiceInputOrbProps {
  onExtractionComplete: (result: VoiceExtractionResult) => void;
}

export const VoiceInputOrb: React.FC<VoiceInputOrbProps> = ({ onExtractionComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const transcriptRef = useRef('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    }
  }, []);

  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        transcriptRef.current = '';
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const speechText = event.results[current][0].transcript;
        transcriptRef.current = speechText;
        setTranscript(speechText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        const finalRecorded = transcriptRef.current;
        if (finalRecorded) {
          processText(finalRecorded);
        }
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition failed to start:', e);
      setIsListening(false);
    }
  };

  const processText = (text: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = parseClinicalSpeech(text);
      setIsProcessing(false);
      onExtractionComplete(result);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      {/* Central Pulsing Voice Orb */}
      <div className="relative mb-6">
        <button
          onClick={handleStartListening}
          disabled={isProcessing}
          className={`voice-orb ${isListening ? 'listening' : ''} w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95`}
          title="Click to speak clinical vitals"
        >
          {isProcessing ? (
            <RefreshCw className="w-9 h-9 text-white animate-spin" />
          ) : isListening ? (
            <div className="relative flex items-center justify-center">
              <span className="w-8 h-8 rounded-full bg-white animate-ping absolute opacity-60" />
              <Mic className="w-9 h-9 text-white relative z-10" />
            </div>
          ) : (
            <Mic className="w-9 h-9 text-white" />
          )}
        </button>
      </div>

      {/* Spoken transcript or active state indicator */}
      <div className="min-h-[44px] max-w-md w-full px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-4 flex items-center justify-center text-sm">
        {isProcessing ? (
          <span className="text-purple-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            Extracting medical entities & confidence scores...
          </span>
        ) : isListening ? (
          <span className="text-purple-400 font-medium animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            Listening... "{transcript || 'Speak patient condition, vitals, or BP...'}"
          </span>
        ) : transcript ? (
          <span className="text-slate-300 italic text-xs truncate">"{transcript}"</span>
        ) : (
          <span className="text-slate-400 text-xs">
            Tap the orb to speak vitals, or type a manual value
          </span>
        )}
      </div>

    </div>
  );
};
