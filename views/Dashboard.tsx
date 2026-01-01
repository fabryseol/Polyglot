import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Globe, Shield, Zap, Layout, Settings, Github } from 'lucide-react';

interface DashboardProps {
  onStart: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStart }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          Create Your <span className="text-indigo-600">PolyGlot Translator</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Generate a production-ready, open-source WordPress plugin.
          Uses Google Gemini or DeepL to translate your site instantly. 
          No tiers, just code.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={onStart} size="lg" className="h-12 px-8 text-lg">
            Create Plugin Now
          </Button>
          <a href="#features" className="px-8 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Learn More
          </a>
        </div>
      </div>

      <div id="features" className="grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Layout className="w-6 h-6 text-blue-600" />}
          title="WP Admin Dashboard"
          description="The generated plugin installs a native settings page in your WordPress admin. Manage languages and API keys directly."
        />
        <FeatureCard 
          icon={<Zap className="w-6 h-6 text-amber-500" />}
          title="Gemini & DeepL"
          description="Choose your engine. Uses state-of-the-art AI for natural, context-aware translations of your content."
        />
        <FeatureCard 
          icon={<Github className="w-6 h-6 text-slate-800" />}
          title="Open Source Ready"
          description="Exports with README.md and CONTRIBUTING.md. Ready to be pushed to GitHub immediately."
        />
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white overflow-hidden relative">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">How it works</h2>
            <ul className="space-y-4">
              <Step number="1" text="Click 'Create Plugin' to generate the ZIP file." />
              <Step number="2" text="Unzip and upload to your WordPress site." />
              <Step number="3" text="Optionally run 'git init' to push to GitHub." />
              <Step number="4" text="Your site is now multilingual and open source!" />
            </ul>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-mono text-slate-300">WP Admin > PolyGlot Translator</span>
            </div>
            <div className="space-y-4 opacity-75">
              <div className="h-4 bg-slate-600 rounded w-1/3"></div>
              <div className="h-10 bg-slate-700 rounded w-full border border-slate-600"></div>
              <div className="h-4 bg-slate-600 rounded w-1/4"></div>
              <div className="flex gap-2">
                <div className="h-6 w-6 bg-blue-500 rounded"></div>
                <div className="h-6 w-6 bg-slate-600 rounded"></div>
                <div className="h-6 w-6 bg-slate-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: any) => (
  <Card className="hover:shadow-lg transition-shadow">
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </Card>
);

const Step = ({ number, text }: any) => (
  <li className="flex items-center gap-4">
    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white flex-shrink-0">
      {number}
    </div>
    <span className="text-lg text-slate-300">{text}</span>
  </li>
);
