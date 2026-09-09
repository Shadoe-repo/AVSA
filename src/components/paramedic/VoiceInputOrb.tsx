import React, { useState, useEffect, useRef } from 'react';
import { Mic, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { parseClinicalSpeech, CLINICAL_VOICE_PRESETS } from '../../services/voiceExtractor';
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
      // If browser doesn't allow speech, use a default realistic phrase for quick demo
      handleSimulateVoice(CLINICAL_VOICE_PRESETS[0].phrase);
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

  const handleSimulateVoice = (phrase: string) => {
    setIsListening(true);
    setTranscript(phrase);
    setTimeout(() => {
      setIsListening(false);
      processText(phrase);
    }, 1200);
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
            Tap the orb to speak vitals (or select a quick clinical preset below)
          </span>
        )}
      </div>

      {/* Quick Clinical Simulation Presets for Instant 1-Tap Testing */}
      <div className="w-full">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          1-Tap Clinical Voice Scenarios
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {CLINICAL_VOICE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSimulateVoice(preset.phrase)}
              disabled={isListening || isProcessing}
              className="px-3 py-2 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/20 hover:border-purple-500/40 text-left transition-all duration-150 active:scale-95 group"
            >
              <div className="text-xs font-semibold text-purple-300 group-hover:text-purple-200">
                {preset.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                "{preset.phrase.slice(0, 38)}..."
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
