import { useState } from "react";
import { MessageInput } from '../MessageInput';

export default function MessageInputExample() {
  const [message, setMessage] = useState("Please take your medication with food after meals.");
  const [targetLanguage, setTargetLanguage] = useState("mandarin");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = () => {
    setIsTranslating(true);
    console.log('Translating message:', message, 'to', targetLanguage);
    
    // Simulate translation delay
    setTimeout(() => {
      setIsTranslating(false);
      console.log('Translation completed');
    }, 2000);
  };

  return (
    <div className="p-8 max-w-lg">
      <h2 className="text-2xl font-semibold mb-4">Message Input</h2>
      <MessageInput
        message={message}
        onMessageChange={setMessage}
        targetLanguage={targetLanguage}
        onLanguageChange={setTargetLanguage}
        onTranslate={handleTranslate}
        isTranslating={isTranslating}
      />
    </div>
  );
}