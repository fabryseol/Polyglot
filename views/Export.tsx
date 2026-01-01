import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Button } from '../components/ui/Button';
import { Download, FileCode, CheckCircle, Copy, Github, BookOpen, Users } from 'lucide-react';
import { getPluginFileContent } from '../utils/phpGenerator';
import JSZip from 'jszip';

interface ExportProps {
  config: AppConfig;
  onBack?: () => void;
}

export const Export: React.FC<ExportProps> = ({ config }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'download'>('download');
  const [copied, setCopied] = useState(false);

  const pluginCode = getPluginFileContent(config);

  const handleDownloadZip = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      
      // Define folder structure for a GitHub Repo / WP Plugin
      const folder = zip.folder("polyglot-translator");
      if (!folder) return;

      // 1. Main Plugin File
      folder.file("polyglot-translator.php", pluginCode);

      // 2. WordPress Readme (Standard for WP Repo)
      folder.file("readme.txt", `=== PolyGlot Translator ===
Contributors: polyglot-solutions
Tags: translation, ai, gemini, deepl, seo
Requires at least: 6.0
Tested up to: 6.4
Stable tag: 1.0.1
License: GPLv2

The ultimate AI translation plugin for WordPress. Secure, fast, and SEO-ready.

== Installation ==
1. Upload this folder to /wp-content/plugins/
2. Activate via WordPress Plugins menu
3. Go to Settings > PolyGlot Translator
4. Enter API Key and Select Languages
`);

      // 3. GitHub Documentation (README.md)
      folder.file("README.md", `# PolyGlot Translator 🌍

![License](https://img.shields.io/badge/license-GPLv2-blue.svg)
![WordPress](https://img.shields.io/badge/WordPress-6.0%2B-blue.svg)

**The ultimate AI translation plugin for WordPress.**  
PolyGlot Translator allows you to translate your WordPress site securely using Google Gemini or DeepL APIs with zero friction.

## 📖 Documentation

### Features
- **AI Powered**: Supports **Google Gemini 2.5** and **DeepL** for high-quality translations.
- **SEO Ready**: Automatically rewrites URL slugs (e.g., \`/about\` → \`/es/sobre-nosotros\`).
- **Performance**: Built-in object caching (Transients) to minimize API costs and latency.
- **Secure**: Implements WordPress nonces, capability checks, and secure API handling.

### Installation

1. Download the latest release (ZIP).
2. Go to your WordPress Admin > **Plugins** > **Add New** > **Upload Plugin**.
3. Activate **PolyGlot Translator**.

### Configuration

1. Navigate to **Settings > PolyGlot Translator**.
2. **Translation Engine**: Choose between Gemini (Fast/Contextual) or DeepL (Precise).
3. **API Keys**:
   - [Get Gemini Key](https://aistudio.google.com/)
   - [Get DeepL Key](https://www.deepl.com/pro-api)
4. **Languages**: Select your site's original language and target languages.

---

## 💻 Development & Contribution

We believe in open source! This plugin is designed to be "one version for everyone"—no Pro tiers, no hidden features. We welcome community contributions.

### Setting up for Development
1. Clone this repository into your \`wp-content/plugins/\` directory:
   \`\`\`bash
   git clone https://github.com/your-username/polyglot-translator.git
   \`\`\`
2. Activate the plugin in WordPress.

### Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## 📄 License
PolyGlot Translator is open-source software licensed under the GPLv2.
`);

      // 4. Contribution Guidelines
      folder.file("CONTRIBUTING.md", `# Contributing to PolyGlot Translator

Thank you for your interest in contributing! We want to make this the best free translation plugin for WordPress.

## How to Contribute

### Reporting Bugs
- Open an issue on GitHub.
- Provide clear reproduction steps and your environment details (PHP version, WP version).

### Submitting Changes
1. **Fork** the repository on GitHub.
2. **Clone** your fork locally.
3. Create a new **branch** for your feature or fix:
   \`git checkout -b feature/my-awesome-feature\`
4. **Commit** your changes with meaningful messages.
5. **Push** to your fork and submit a **Pull Request**.

## Coding Standards
- We follow [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/).
- Ensure all inputs are sanitized (\`sanitize_text_field\`, etc.) and outputs are escaped (\`esc_html\`, etc.).
- Prefix all functions and classes with \`PolyGlot\` or \`pg_\` to avoid collisions.

## Security
If you discover a security vulnerability, please do **not** open a public issue. Email us directly or use the GitHub Security Advisory feature.
`);

      // 5. Git Ignore
      folder.file(".gitignore", `# WordPress defaults
/node_modules/
/vendor/
*.log
.DS_Store
.vscode/
.idea/
polyglot-translator.zip
`);

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "polyglot-translator-github-ready.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert("Error generating ZIP");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pluginCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('download')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'download' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Export Package
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'preview' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Inspect Source Code
        </button>
      </div>

      {activeTab === 'download' && (
        <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto relative">
             <Github className="w-10 h-10 text-indigo-600 absolute" />
             <Download className="w-6 h-6 text-indigo-400 absolute bottom-3 right-3 bg-white rounded-full p-1" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Ready for GitHub & WordPress</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Generates a production-ready plugin ZIP that includes <strong>README.md</strong>, <strong>CONTRIBUTING.md</strong>, and <strong>.gitignore</strong>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-lg mx-auto bg-gray-50 p-4 rounded-lg border border-gray-100">
             <div className="flex items-center gap-2 text-sm text-gray-700">
               <BookOpen size={16} className="text-blue-500" />
               <span>Documentation</span>
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-700">
               <Users size={16} className="text-green-500" />
               <span>Contribution Guide</span>
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-700">
               <CheckCircle size={16} className="text-purple-500" />
               <span>Git Ready</span>
             </div>
          </div>

          <Button 
            size="lg" 
            onClick={handleDownloadZip} 
            isLoading={isGenerating}
            className="w-full h-14 text-lg shadow-xl shadow-indigo-100 flex items-center gap-3"
          >
            <Github size={20} />
            Download GitHub-Ready Zip
          </Button>
          <p className="text-xs text-gray-400">
            Unzip this file and run <code>git init</code> to start your open-source repository immediately.
          </p>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-xs font-mono"
            >
              {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy PHP'}
            </button>
          </div>
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
               <FileCode size={16} className="text-blue-400" />
               <span className="text-xs font-mono text-gray-400">polyglot-translator.php</span>
            </div>
            <pre className="p-4 overflow-x-auto h-[600px] text-xs font-mono text-blue-100 leading-relaxed">
              <code>{pluginCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
