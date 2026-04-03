import AIVoiceAssistant from './components/AIVoiceAssistant';

export default function App() {
  return (
    <AIVoiceAssistant
      scale={1.2}
      animationSpeed={1}
      enableMouseTracking={true}
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
