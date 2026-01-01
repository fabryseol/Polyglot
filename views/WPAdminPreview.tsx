import React, { useState } from 'react';
import { Settings, Globe, Home, FileText, Zap, Search, Save, X, ChevronDown, Check, Plus, Trash2, Languages, Code, Link as LinkIcon, Layout } from 'lucide-react';

interface WPAdminPreviewProps {
  onClose: () => void;
}

const ALL_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
];

export const WPAdminPreview: React.FC<WPAdminPreviewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [googleKey, setGoogleKey] = useState('');
  const [deeplKey, setDeeplKey] = useState('');
  const [provider, setProvider] = useState('google');
  // Default to Spanish so English shows up in the list, per user request
  const [defaultLang, setDefaultLang] = useState('es');
  const [activeLangs, setActiveLangs] = useState<string[]>(['en', 'fr']);
  const [showFrontend, setShowFrontend] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  // Mock state for SEO Tab
  const [slugRules, setSlugRules] = useState([
    { id: 1, original: 'sobre-nosotros', translated: 'about-us', lang: 'en' },
    { id: 2, original: 'contacto', translated: 'contact', lang: 'en' },
  ]);

  const toggleLang = (code: string) => {
    if (code === defaultLang) return; // Cannot toggle default lang
    if (activeLangs.includes(code)) {
      setActiveLangs(activeLangs.filter(c => c !== code));
    } else {
      setActiveLangs([...activeLangs, code]);
    }
  };

  const filteredLanguages = ALL_LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(langSearch.toLowerCase()) || 
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  // Frontend Preview Mode
  if (showFrontend) {
    const allActiveLangs = Array.from(new Set([defaultLang, ...activeLangs]));
    const currentFlag = ALL_LANGUAGES.find(l => l.code === defaultLang)?.flag || '🌐';

    return (
      <div className="flex flex-col h-screen bg-white relative">
        <div className="bg-black text-white px-4 py-2 flex justify-between items-center text-sm z-50">
          <div className="flex items-center gap-4">
             <span className="font-bold flex items-center gap-2"><Home size={14}/> My WordPress Site</span>
             <button onClick={() => setShowFrontend(false)} className="hover:text-gray-300 flex items-center gap-1">
               <Layout size={14}/> Dashboard
             </button>
          </div>
          <button onClick={onClose} className="hover:text-red-300">Exit Preview</button>
        </div>
        
        <div className="flex-1 overflow-auto relative">
           <header className="border-b px-8 py-6 flex justify-between items-center bg-white">
             <h1 className="text-2xl font-serif font-bold tracking-tight">Mi Blog</h1>
             <nav className="flex gap-6 text-sm font-medium">
                <a href="#" className="text-gray-900 hover:text-blue-600">Inicio</a>
                <a href="#" className="text-gray-500 hover:text-blue-600">Sobre Nosotros</a>
                <a href="#" className="text-gray-500 hover:text-blue-600">Contacto</a>
             </nav>
           </header>
           
           <div className="bg-gray-50 py-16 px-6 text-center">
             <h2 className="text-4xl font-bold text-gray-900 mb-4">Bienvenido al futuro de la traducción</h2>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Esta página demuestra el <strong>PolyGlot Translator</strong> flotante. ¡Mira la esquina inferior derecha!
             </p>
           </div>

           <div className="fixed bottom-6 right-6 z-40 font-sans text-sm">
              {switcherOpen && (
                <div className="bg-white rounded-lg shadow-xl mb-2 overflow-hidden border border-gray-100 flex flex-col min-w-[160px] animate-in slide-in-from-bottom-2 fade-in">
                  {allActiveLangs.map(code => {
                    const l = ALL_LANGUAGES.find(lang => lang.code === code);
                    return (
                      <button 
                         key={code}
                         className="px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                         onClick={() => setSwitcherOpen(false)}
                      >
                         <span className="text-lg">{l?.flag}</span>
                         <span className="text-gray-700 font-medium">{l?.name}</span>
                         {code === defaultLang && <Check size={14} className="ml-auto text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
              <button 
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="bg-white text-gray-800 px-4 py-3 rounded-lg shadow-xl border border-gray-100 flex items-center gap-3 font-semibold hover:-translate-y-1 transition-transform"
              >
                <span className="text-lg">{currentFlag}</span> 
                {ALL_LANGUAGES.find(l => l.code === defaultLang)?.name} 
                <ChevronDown size={14} className="text-gray-400 ml-2" />
              </button>
           </div>
        </div>
      </div>
    );
  }

  // Dashboard Preview Mode
  return (
    <div className="flex h-screen bg-[#f0f0f1] font-sans text-[13px] text-[#3c434a]">
      {/* WordPress Sidebar */}
      <aside className="w-[160px] bg-[#1d2327] text-white flex-shrink-0 flex flex-col pt-8 pb-4 relative z-20">
        <div className="px-3 mb-4 text-gray-400 text-xs uppercase font-semibold">Dashboard</div>
        <nav className="space-y-1">
          <NavItem icon={<Home size={16} />} label="Home" />
          <NavItem icon={<FileText size={16} />} label="Posts" />
          <NavItem icon={<Settings size={16} />} label="Settings" />
          <div className="mt-4 pt-2 border-t border-[#3c434a]">
             <div className="bg-[#2271b1] text-white px-3 py-2 flex items-center gap-2 font-medium relative cursor-default border-l-4 border-white">
               <Globe size={16} />
               PolyGlot
             </div>
          </div>
        </nav>
        <button onClick={onClose} className="mt-auto mx-3 flex items-center gap-2 text-[#a7aaad] hover:text-[#72aee6] py-2">
          <X size={16} /> Exit Preview
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* WP Top Bar */}
        <div className="h-[32px] bg-[#1d2327] text-[#c3c4c7] flex justify-between items-center px-4 text-sm flex-shrink-0 z-20">
          <div className="flex items-center gap-4">
             <span className="hover:text-[#72aee6] cursor-pointer flex items-center gap-1"><Home size={12} /> My Site</span>
             <span className="flex items-center gap-1 cursor-pointer hover:text-[#72aee6]" onClick={() => setShowFrontend(true)}><Globe size={12} /> Visit Site</span>
          </div>
          <div className="flex items-center gap-2"><span>Howdy, Admin</span><div className="w-5 h-5 bg-gray-500 rounded"></div></div>
        </div>

        {/* Plugin Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm z-10 sticky top-0">
           <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-2 rounded-lg text-white"><Globe size={20} /></div>
             <div>
               <h1 className="text-xl font-bold text-gray-900 leading-none">PolyGlot Translator</h1>
               <p className="text-xs text-gray-500 mt-1">One Version for Everyone</p>
             </div>
           </div>
           <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2">
             <Save size={16} /> Save Changes
           </button>
        </div>

        <div className="flex-1 overflow-auto bg-[#f6f7f7] p-8">
           <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
              
              {/* Navigation Sidebar (Inner) */}
              <div className="col-span-12 md:col-span-3">
                 <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General Settings', icon: Settings },
                      { id: 'languages', label: 'Languages', icon: Globe },
                      { id: 'integrations', label: 'Translation Engine', icon: Zap },
                      { id: 'seo', label: 'SEO & URL', icon: Search },
                    ].map((item) => (
                       <button
                         key={item.id}
                         onClick={() => setActiveTab(item.id)}
                         className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                           activeTab === item.id 
                             ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                             : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                         }`}
                       >
                         <item.icon size={18} />
                         {item.label}
                       </button>
                    ))}
                 </nav>
              </div>

              {/* Content Area */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                
                {activeTab === 'general' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                       <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                         <h3 className="text-lg font-semibold text-gray-900">Implementation</h3>
                       </div>
                       <div className="p-6 grid gap-6">
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Floating Switcher</span>
                                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Recommended</span>
                             </div>
                             <code className="block bg-white p-3 rounded border border-gray-200 text-sm font-mono text-gray-800 select-all">
                                [polyglot_switcher]
                             </code>
                             <p className="text-xs text-gray-500 mt-2">
                               Add this shortcode to a widget or footer to display the floating button.
                             </p>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inline List</span>
                             </div>
                             <code className="block bg-white p-3 rounded border border-gray-200 text-sm font-mono text-gray-800 select-all">
                                [polyglot_switcher style="inline"]
                             </code>
                             <p className="text-xs text-gray-500 mt-2">
                               Use this for menus or headers.
                             </p>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'integrations' && (
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Translation Engine</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Production Ready</span>
                      </div>
                      <div className="p-6 space-y-6">
                         <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-900 mb-2">Active Provider</label>
                            <div className="grid grid-cols-2 gap-4">
                               <button 
                                 onClick={() => setProvider('google')}
                                 className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${provider === 'google' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-gray-300'}`}
                               >
                                  <Zap size={24} className={provider === 'google' ? 'text-indigo-600' : 'text-gray-400'} />
                                  <span className="font-semibold text-sm">Google Translate</span>
                               </button>
                               <button 
                                 onClick={() => setProvider('deepl')}
                                 className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${provider === 'deepl' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-gray-300'}`}
                               >
                                  <Languages size={24} className={provider === 'deepl' ? 'text-indigo-600' : 'text-gray-400'} />
                                  <span className="font-semibold text-sm">DeepL Translate</span>
                               </button>
                            </div>
                         </div>

                         {provider === 'google' && (
                           <div className="animate-in fade-in slide-in-from-top-1">
                              <label className="block text-sm font-bold text-gray-900 mb-1">Google Cloud API Key</label>
                              <input 
                                type="password" 
                                value={googleKey}
                                onChange={(e) => setGoogleKey(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="AIza..."
                              />
                           </div>
                         )}

                         {provider === 'deepl' && (
                           <div className="animate-in fade-in slide-in-from-top-1">
                              <label className="block text-sm font-bold text-gray-900 mb-1">DeepL API Key</label>
                              <input 
                                type="password" 
                                value={deeplKey}
                                onChange={(e) => setDeeplKey(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="...:fx"
                              />
                           </div>
                         )}
                      </div>
                   </div>
                )}

                {activeTab === 'languages' && (
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Language Manager</h3>
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Search..." 
                            value={langSearch}
                            onChange={(e) => setLangSearch(e.target.value)}
                            className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none w-48"
                          />
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {/* Default Language Selector */}
                        <div className="mb-6 pb-6 border-b border-gray-100">
                           <label className="block text-sm font-bold text-gray-700 mb-2">Original Site Language</label>
                           <div className="relative inline-block w-full sm:w-80">
                              <select 
                                value={defaultLang}
                                onChange={(e) => {
                                  setDefaultLang(e.target.value);
                                  // Reset active langs if default overlaps
                                  setActiveLangs(activeLangs.filter(l => l !== e.target.value));
                                }}
                                className="w-full appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                {ALL_LANGUAGES.map(l => (
                                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                                ))}
                              </select>
                              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                           </div>
                           <p className="text-xs text-gray-500 mt-2">Detected: <strong>{ALL_LANGUAGES.find(l => l.code === defaultLang)?.name}</strong>. Changed in plugin for demonstration.</p>
                        </div>

                        {/* Language Grid with Toggles */}
                        <label className="block text-sm font-bold text-gray-700 mb-3">Destination Languages</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                           {filteredLanguages.map(lang => {
                             const isActive = activeLangs.includes(lang.code);
                             const isDefault = defaultLang === lang.code;
                             
                             if (isDefault) return null;

                             return (
                               <div 
                                 key={lang.code}
                                 className={`
                                   flex items-center justify-between p-4 rounded-lg border transition-all
                                   ${isActive 
                                      ? 'bg-indigo-50 border-indigo-200' 
                                      : 'bg-white border-gray-200 hover:bg-gray-50'}
                                 `}
                               >
                                  <div className="flex items-center gap-3">
                                     <span className="text-xl">{lang.flag}</span>
                                     <div>
                                       <p className="text-sm font-semibold text-gray-900">{lang.name}</p>
                                       <p className="text-xs text-gray-400 uppercase">{lang.code}</p>
                                     </div>
                                  </div>
                                  <div 
                                    onClick={() => toggleLang(lang.code)}
                                    className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                  >
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                  </div>
                               </div>
                             );
                           })}
                        </div>
                      </div>
                   </div>
                )}

                {activeTab === 'seo' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                       <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <LinkIcon size={18} className="text-gray-500"/>
                            <h3 className="text-lg font-semibold text-gray-900">URL Rewrites & SEO</h3>
                         </div>
                       </div>
                       
                       <div className="p-6 space-y-8">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                             <div>
                               <p className="font-bold text-gray-900">Translate URL Slugs</p>
                               <p className="text-sm text-gray-500 mt-1">
                                 Automatically translate post/page slugs. <br/>
                                 <span className="text-xs text-gray-400">Example: <code>/about-us</code> becomes <code>/es/sobre-nosotros</code></span>
                               </p>
                             </div>
                             <ToggleSwitch checked={true} />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-4">
                               <h4 className="font-bold text-gray-900">Custom Rewrite Rules</h4>
                               <button className="text-xs flex items-center gap-1 bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-600">
                                 <Plus size={12}/> Add New Rule
                               </button>
                            </div>
                            
                            <div className="overflow-hidden border border-gray-200 rounded-lg">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Original Slug</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Language</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Translated Slug</th>
                                    <th className="px-4 py-3 text-right"></th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {slugRules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{rule.original}</td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                                          {rule.lang}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-indigo-600 font-medium">{rule.translated}</td>
                                      <td className="px-4 py-3 text-right">
                                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                                          <Trash2 size={16} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label }: { icon: any, label: string }) => (
  <div className="px-3 py-2 flex items-center gap-2 text-[#c3c4c7] hover:bg-[#191e23] hover:text-[#72aee6] cursor-pointer transition-colors rounded mx-2">
    {icon}
    <span>{label}</span>
  </div>
);

const ToggleSwitch = ({ checked }: { checked: boolean }) => (
  <div className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </div>
);
