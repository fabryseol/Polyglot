import React, { useState } from 'react';
import { Export } from './views/Export';
import { WPAdminPreview } from './views/WPAdminPreview';
import { AppConfig } from './types';
import { ShieldCheck, Code, Settings, Eye } from 'lucide-react';

const App: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false);

  // Default config placeholder
  const config: AppConfig = {
    apiKey: '',
    defaultLang: 'en',
    targetLangs: [],
    slugRules: []
  };

  if (showPreview) {
    return <WPAdminPreview onClose={() => setShowPreview(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Code className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">PolyGlot Translator Generator</h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setShowPreview(true)}
               className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
             >
               <Eye size={16} /> Live Preview
             </button>
             <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <ShieldCheck size={16} />
              Verified Secure
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Description & Instructions */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your WordPress Translation Plugin is Ready.</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                This is a fully functional, self-contained WordPress plugin. It does not require external SaaS subscriptions beyond your own API keys.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-500" />
                Plugin Features
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2"></span>
                  <span><strong>Auto Language Detection:</strong> Automatically detects your site's default language.</span>
                </li>
                <li className="flex gap-3 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2"></span>
                  <span><strong>Internal Dashboard:</strong> Select from 30+ languages directly inside WP Admin.</span>
                </li>
                <li className="flex gap-3 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2"></span>
                  <span><strong>SEO Friendly:</strong> Rewrites URLs to <code>/es/slug</code> automatically.</span>
                </li>
                <li className="flex gap-3 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2"></span>
                  <span><strong>Secure:</strong> Uses WP Nonces and Capability checks.</span>
                </li>
              </ul>
              
              <div className="pt-4 mt-4 border-t border-gray-100">
                 <button 
                   onClick={() => setShowPreview(true)}
                   className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                 >
                   <Eye size={16} /> Open Admin Dashboard Preview
                 </button>
              </div>
            </div>
          </div>

          {/* Right Column: Download & Preview */}
          <div className="lg:col-span-2">
            <Export config={config} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
