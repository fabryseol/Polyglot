import React, { useState } from 'react';
import { AppConfig, SUPPORTED_LANGUAGES, Language } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';

interface SettingsProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, onUpdateConfig }) => {
  const [apiKeyInput, setApiKeyInput] = useState(config.apiKey);
  const [selectedLangCode, setSelectedLangCode] = useState<string>(SUPPORTED_LANGUAGES[0].code);

  const handleSaveApiKey = () => {
    onUpdateConfig({ ...config, apiKey: apiKeyInput });
  };

  const handleAddLanguage = () => {
    const langToAdd = SUPPORTED_LANGUAGES.find(l => l.code === selectedLangCode);
    if (langToAdd && !config.targetLangs.find(l => l.code === langToAdd.code)) {
      onUpdateConfig({
        ...config,
        targetLangs: [...config.targetLangs, langToAdd]
      });
    }
  };

  const handleRemoveLanguage = (code: string) => {
    onUpdateConfig({
      ...config,
      targetLangs: config.targetLangs.filter(l => l.code !== code)
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Plugin Configuration</h2>
        <p className="text-gray-500">Configure your WordPress plugin settings and API keys.</p>
      </div>

      <Card title="API Configuration" description="Set up your AI provider for translations.">
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <Input 
              label="Google Gemini API Key" 
              type="password"
              placeholder="Enter your Gemini API Key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
            <Button onClick={handleSaveApiKey}>Save Key</Button>
          </div>
          <p className="text-xs text-gray-500">
            This key will be used to generate the plugin code and test translations in the preview.
          </p>
        </div>
      </Card>

      <Card title="Language Management" description="Select the languages you want to support on your site.">
        <div className="space-y-6">
          <div className="flex gap-4 items-end">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Target Language</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedLangCode}
                onChange={(e) => setSelectedLangCode(e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleAddLanguage} className="whitespace-nowrap">
              <Plus size={18} className="mr-2" /> Add Language
            </Button>
          </div>

          <div className="border rounded-lg divide-y">
            {config.targetLangs.length === 0 && (
              <div className="p-4 text-center text-gray-500">No languages added yet.</div>
            )}
            {config.targetLangs.map((lang) => (
              <div key={lang.code} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <p className="font-medium text-gray-900">{lang.name}</p>
                    <p className="text-xs text-gray-500">Code: {lang.code}</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => handleRemoveLanguage(lang.code)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Default Language" description="The primary language of your WordPress site.">
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">Spanish (Español)</span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">DEFAULT</span>
        </div>
      </Card>
    </div>
  );
};