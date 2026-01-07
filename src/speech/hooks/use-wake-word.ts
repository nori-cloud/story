import { usePorcupine } from '@picovoice/porcupine-react';
import { useEffect, useState } from 'react';

// Hardcoded AccessKey (visible in browser anyway)
const PORCUPINE_ACCESS_KEY = 'WDhVc7owKcp7I4WWWUmsVg+vKLSvbKouctR5cvN0h+l94Rqjz/82wg==';

export function useWakeWord() {
  const {
    keywordDetection,
    isLoaded,
    isListening,
    error,
    init,
    start,
    stop,
    release,
  } = usePorcupine();

  const [isRecording, setIsRecording] = useState(false);

  // Initialize Porcupine
  useEffect(() => {
    const initPorcupine = async () => {
      console.log('[Porcupine] Starting initialization...');
      try {
        await init(
          PORCUPINE_ACCESS_KEY,
          [{
            publicPath: '/porcupine/hey-story.ppn',
            label: 'hey-story',
            sensitivity: 0.5,
          }],
          { publicPath: '/porcupine/porcupine_params.pv' }
        );
        console.log('[Porcupine] ✅ Initialized successfully');
      } catch (err) {
        console.error('[Porcupine] ❌ Initialization error:', err);
        console.error('[Porcupine] Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          name: err instanceof Error ? err.name : 'Unknown',
          stack: err instanceof Error ? err.stack : undefined,
        });
      }
    };
    initPorcupine();
  }, [init]);

  // Handle wake word detection
  useEffect(() => {
    if (keywordDetection !== null) {
      console.log('🎤 Wake word detected!', keywordDetection.label);
      setIsRecording(true);
      // TODO: Start recording here
    }
  }, [keywordDetection]);

  return {
    isLoaded,
    isListening,
    isRecording,
    error,
    startListening: start,
    stopListening: stop,
    cleanup: release,
  };
}
