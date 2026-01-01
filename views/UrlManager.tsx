import React, { useState } from 'react';
import { AppConfig, SlugRule } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';

interface UrlManagerProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
}

export const UrlManager: React.FC<UrlManagerProps> = ({ config, onUpdateConfig }) => {
  const [newOriginal, setNewOriginal] = useState('');
  const [newTranslated, setNewTranslated] = useState('');
  const [selectedLang, setSelectedLang] = useState(config.targetLangs[0]?.code || '');

  const handleAddRule = () => {
    if (!newOriginal || !newTranslated || !selectedLang) return;

    const newRule: SlugRule = {
      id: Math.random().toString(36).substr(2, 9),
      original: newOriginal,
      translated: newTranslated,
      lang: selectedLang
    };

    onUpdateConfig({
      ...config,
      slugRules: [...config.slugRules, newRule]
    });

    setNewOriginal('');
    setNewTranslated('');
  };

  const handleRemoveRule = (id: string) => {
    onUpdateConfig({
      ...config,
      slugRules: config.slugRules.filter(r => r.id !== id)
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">SEO Slug Manager</h2>
        <p className="text-gray-500">Map your original URL slugs to translated versions for better international SEO.</p>
      </div>

      <Card title="Add New Rewrite Rule">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input 
            label="Original Slug (Spanish)"
            placeholder="e.g., sobre-nosotros"
            value={newOriginal}
            onChange={(e) => setNewOriginal(e.target.value)}
          />
          <Input 
            label="Translated Slug"
            placeholder="e.g., about-us"
            value={newTranslated}
            onChange={(e) => setNewTranslated(e.target.value)}
          />
          <div className="space-y-1">
             <label className="block text-sm font-medium text-gray-700">Target Language</label>
             <div className="flex gap-2">
                <select 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                >
                  {config.targetLangs.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
                <Button onClick={handleAddRule}>
                  <Plus size={18} />
                </Button>
             </div>
          </div>
        </div>
      </Card>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Translated Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {config.slugRules.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No slug rules defined. Add one above.
                </td>
              </tr>
            ) : (
              config.slugRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">/{rule.original}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/{rule.translated}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {rule.lang.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleRemoveRule(rule.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};