import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { translateText } from '../services/gemini';
import { ArrowRight, Sparkles } from 'lucide-react';

interface TranslatorProps {
  config: AppConfig;
}

export const Translator: React.FC<TranslatorProps> = ({ config }) => {
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState(config.targetLangs[0]?.code || '');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!config.apiKey) {
      setError("Please configure your Gemini API Key in Settings first.");
      return;
    }
    if (!targetLang) {
      setError("Please add at least one target language in Settings.");
      return;
    }
    if (!sourceText.trim()) {
      setError("Please enter some text to translate.");
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await translateText(sourceText, targetLang, config.apiKey);
      setTranslatedText(result);
    } catch (err: any) {
      setError(err.message || "Translation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Live AI Preview</h2>
        <p className="text-gray-500">Test the Gemini integration before exporting your plugin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Original Content (Spanish)">
          <textarea
            className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Escribe algo aquí para probar la traducción..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />
        </Card>

        <Card 
          title="Translated Output" 
          description={
            <div className="flex items-center gap-2 mt-2">
              <span>To:</span>
              <select 
                className="px-2 py-1 border rounded text-sm"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                {config.targetLangs.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
          }
        >
          <div className="w-full h-48 p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-auto">
             {isLoading ? (
               <div className="flex items-center justify-center h-full text-indigo-500">
                 <Sparkles className="animate-spin mr-2" /> Translating...
               </div>
             ) : translatedText ? (
               <p className="text-gray-800">{translatedText}</p>
             ) : (
               <p className="text-gray-400 italic">Translation will appear here...</p>
             )}
          </div>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <Button size="lg" onClick={handleTranslate} isLoading={isLoading} className="w-full md:w-auto min-w-[200px]">
          Translate Content <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};