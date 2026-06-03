export const getSpeechRecognitionConstructor = (runtime = globalThis) => (
  runtime.SpeechRecognition ?? runtime.webkitSpeechRecognition ?? null
);

export const isSpeechRecognitionSupported = (runtime = globalThis) => Boolean(getSpeechRecognitionConstructor(runtime));

export const isSpeechSynthesisSupported = (runtime = globalThis) => Boolean(runtime.speechSynthesis && runtime.SpeechSynthesisUtterance);

export const createVoiceSessionStatus = (runtime = globalThis) => ({
  speechRecognition: isSpeechRecognitionSupported(runtime),
  speechSynthesis: isSpeechSynthesisSupported(runtime),
  recommendedFallback: isSpeechRecognitionSupported(runtime) ? 'browser-voice' : 'typed-practice',
});

export const createBrowserSpeechRecognizer = ({
  language = 'en-IN',
  interimResults = true,
  onPartial = () => {},
  onFinal = () => {},
  onStatus = () => {},
  runtime = globalThis,
} = {}) => {
  const Recognition = getSpeechRecognitionConstructor(runtime);

  if (!Recognition) {
    return null;
  }

  const recognition = new Recognition();
  recognition.lang = language;
  recognition.interimResults = interimResults;
  recognition.continuous = false;

  recognition.onstart = () => onStatus('listening');
  recognition.onend = () => onStatus('idle');
  recognition.onerror = (event) => onStatus(`error:${event.error ?? 'unknown'}`);
  recognition.onresult = (event) => {
    let partial = '';
    let finalText = '';

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0]?.transcript ?? '';
      if (event.results[index].isFinal) {
        finalText += transcript;
      } else {
        partial += transcript;
      }
    }

    if (partial.trim()) onPartial(partial.trim());
    if (finalText.trim()) onFinal(finalText.trim());
  };

  return recognition;
};

export const speakText = (text, runtime = globalThis) => {
  if (!isSpeechSynthesisSupported(runtime)) return false;

  const utterance = new runtime.SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = 0.92;
  runtime.speechSynthesis.cancel();
  runtime.speechSynthesis.speak(utterance);
  return true;
};
