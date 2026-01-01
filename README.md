# PolyGlot Translator 🌍

![License](https://img.shields.io/badge/license-GPLv2-blue.svg)
![WordPress](https://img.shields.io/badge/WordPress-6.0%2B-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.6-green.svg)

**The ultimate AI translation plugin for WordPress.**  
PolyGlot Translator allows you to translate your WordPress site securely using Google Cloud Translation or DeepL APIs with zero friction.

## ✨ Features

### 🚀 Core Features
- **Dual Translation Engines**: Supports both **Google Cloud Translation API** and **DeepL API**
- **27+ Languages**: Support for English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Russian, and more
- **SEO-Friendly URLs**: Automatic URL rewriting (e.g., `/about` → `/es/acerca-de`)
- **Smart Caching**: Built-in WordPress transient caching to minimize API costs and improve performance
- **Beautiful UI**: Modern, intuitive admin interface with tab-based navigation
- **Language Switcher**: Floating button and inline list options for easy language switching

### 🔒 Security Features
- **API Key Encryption**: All API keys are encrypted before storage using WordPress salts
- **Nonce Verification**: CSRF protection on all form submissions
- **XSS Protection**: All output is properly escaped using WordPress functions
- **SQL Injection Prevention**: Uses WordPress prepared statements and sanitization
- **Input Validation**: Comprehensive sanitization of all user inputs
- **Permission Checks**: Capability checks on all admin actions
- **Secure Redirects**: Uses `wp_safe_redirect()` to prevent open redirect vulnerabilities
- **SSL Verification**: Enabled by default for all API requests

### ⚡ Performance Features
- **Intelligent Caching**: 30-day cache for all translations
- **Lazy Translation**: Content is only translated when needed
- **Optimized Queries**: Minimal database overhead
- **Cache Management**: Automatic cache clearing when settings change

## 📦 Installation

### Method 1: WordPress Admin (Recommended)
1. Download the latest release (ZIP file)
2. Go to your WordPress Admin > **Plugins** > **Add New** > **Upload Plugin**
3. Upload the `polyglot-translator.zip` file
4. Click **Install Now** and then **Activate**

### Method 2: Manual Installation
1. Download the plugin files
2. Upload the `polyglot-translator` folder to `/wp-content/plugins/`
3. Activate the plugin through the 'Plugins' menu in WordPress

### Method 3: Git Clone (For Developers)
```bash
cd wp-content/plugins/
git clone https://github.com/fabryseol/Polyglot.git polyglot-translator
```

## ⚙️ Configuration

### Step 1: Access Plugin Settings
Navigate to **PolyGlot** in your WordPress admin sidebar.

### Step 2: Choose Translation Engine
1. Go to the **Translation Engine** tab
2. Select either **Google Translate** or **DeepL**
3. Enter your API key:
   - **Google Cloud Translation API**: Get your key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - **DeepL API**: Get your key from [DeepL Pro API](https://www.deepl.com/pro-api)

### Step 3: Configure Languages
1. Go to the **Languages** tab
2. Select your **Original Site Language** (auto-detected from WordPress settings)
3. Toggle ON the destination languages you want to support
4. Click **Save Changes**

### Step 4: SEO Settings (Optional)
1. Go to the **SEO & URL** tab
2. Enable **Translate URL Slugs** if you want URLs like `/es/acerca-de` instead of `/es/about`
3. Click **Save Changes**

### Step 5: Add Language Switcher
1. Go to **General Settings** tab
2. Copy one of the shortcodes:
   - **Floating Button**: `[polyglot_switcher]` (Recommended)
   - **Inline List**: `[polyglot_switcher style="inline"]`
3. Add the shortcode to:
   - A widget (Appearance > Widgets)
   - Your footer or header
   - Any page or post

## 🔑 Getting API Keys

### Google Cloud Translation API (v2)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Cloud Translation API**
4. Go to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **API Key**
6. Copy your API key (starts with `AIza...`)
7. (Optional but recommended) Restrict the key to only Translation API

**Pricing**: Google offers $10 free per month (~500,000 characters). After that, $20 per million characters.

### DeepL API

1. Go to [DeepL Pro API](https://www.deepl.com/pro-api)
2. Sign up for a DeepL API account
3. Choose between:
   - **Free Plan**: 500,000 characters/month (API key ends with `:fx`)
   - **Pro Plan**: Pay-as-you-go pricing
4. Copy your API key
5. Paste it in PolyGlot settings

**Pricing**: DeepL Free offers 500,000 characters/month. Pro pricing starts at $5.49/month + usage.

## 🎨 Usage Examples

### Floating Language Switcher (Recommended)
Add this to your footer or as a widget:
```
[polyglot_switcher]
```

This creates a beautiful floating button in the bottom-right corner with a dropdown of languages.

### Inline Language Switcher
Add this to your header menu or navigation:
```
[polyglot_switcher style="inline"]
```

This creates an inline list of language options with flags.

### In Theme Files (PHP)
```php
<?php echo do_shortcode('[polyglot_switcher]'); ?>
```

Or for inline:
```php
<?php echo do_shortcode('[polyglot_switcher style="inline"]'); ?>
```

## 🐛 Troubleshooting

### Translation Not Working

**Problem**: Content is not being translated  
**Solutions**:
1. Check that you have entered a valid API key
2. Verify that you have selected at least one destination language
3. Check that you're viewing a language page (e.g., `/es/` for Spanish)
4. Look for error messages in the HTML comments (visible to admins only)
5. Check WordPress debug log for API errors

### API Key Errors

**Google API Errors**:
- `API key not valid`: Your key may be restricted or invalid
- `Billing not enabled`: Enable billing in Google Cloud Console
- `Daily quota exceeded`: Upgrade your Google Cloud plan

**DeepL API Errors**:
- `Authentication failed`: Check that your API key is correct
- `Quota exceeded`: You've reached your monthly character limit

### URL Rewriting Issues

**Problem**: Language URLs (like `/es/`) return 404 errors  
**Solution**:
1. Go to **Settings** > **Permalinks**
2. Click **Save Changes** (this flushes rewrite rules)
3. Test the language URLs again

### Cache Issues

**Problem**: Old translations are showing after updating content  
**Solution**:
1. Go to PolyGlot settings
2. Click **Save Changes** (this clears the translation cache)
3. Alternatively, use a cache clearing plugin

## 🔧 Advanced Configuration

### Custom CSS Styling

You can customize the language switcher appearance by adding CSS to your theme:

```css
/* Customize floating button */
.pg-switcher-btn {
    background: #your-color !important;
}

/* Customize inline switcher */
.pg-inline-item a {
    background: #your-color !important;
}
```

### Hook Integration

Developers can use WordPress filters to customize translation behavior:

```php
// Skip translation for specific content
add_filter('the_content', function($content) {
    if (has_shortcode($content, 'no-translate')) {
        remove_filter('the_content', [PolyGlotTranslator::get_instance(), 'translate_content_hook'], 999);
    }
    return $content;
}, 1);
```

### Performance Optimization

For high-traffic sites:
1. Use object caching (Redis/Memcached)
2. Enable WordPress page caching
3. Consider using DeepL (generally faster than Google)
4. Pre-translate important pages manually

## 🌍 Supported Languages

| Code | Language | Code | Language | Code | Language |
|------|----------|------|----------|------|----------|
| `en` | English 🇺🇸 | `es` | Spanish 🇪🇸 | `fr` | French 🇫🇷 |
| `de` | German 🇩🇪 | `it` | Italian 🇮🇹 | `pt` | Portuguese 🇵🇹 |
| `zh` | Chinese 🇨🇳 | `ja` | Japanese 🇯🇵 | `ru` | Russian 🇷🇺 |
| `nl` | Dutch 🇳🇱 | `tr` | Turkish 🇹🇷 | `pl` | Polish 🇵🇱 |
| `ko` | Korean 🇰🇷 | `ar` | Arabic 🇸🇦 | `hi` | Hindi 🇮🇳 |
| `sv` | Swedish 🇸🇪 | `no` | Norwegian 🇳🇴 | `da` | Danish 🇩🇰 |
| `fi` | Finnish 🇫🇮 | `el` | Greek 🇬🇷 | `he` | Hebrew 🇮🇱 |
| `th` | Thai 🇹🇭 | `vi` | Vietnamese 🇻🇳 | `id` | Indonesian 🇮🇩 |
| `ms` | Malay 🇲🇾 | `uk` | Ukrainian 🇺🇦 | `cs` | Czech 🇨🇿 |
| `ro` | Romanian 🇷🇴 | `hu` | Hungarian 🇭🇺 |

## 📊 Version History

### Version 1.0.6 (Latest) - 2026-01-01
**Major Bug Fixes & Security Enhancements**

**Fixed**:
- 🔴 **Critical**: Fixed language detection timing issue causing translations to fail
- 🔴 **Critical**: Fixed translation hook priority - now runs after language detection
- 🔴 **Critical**: Fixed DeepL language code mapping (PT, EN, ZH variants)
- 🔴 **Critical**: Fixed cache key collisions using full MD5 hash
- 🟡 Fixed URL rewriting conflicts on plugin activation
- 🟡 Fixed admin notices not showing API configuration errors

**Security Enhancements**:
- ✅ Added API key encryption using WordPress salts
- ✅ Added nonce verification for all form submissions
- ✅ Added XSS protection with proper output escaping
- ✅ Enabled SSL verification for all API requests
- ✅ Added permission checks on all admin actions
- ✅ Added secure redirect protection
- ✅ Added input validation and sanitization

**Improvements**:
- ⚡ Better error handling with admin-only error messages
- ⚡ Improved caching mechanism with automatic cleanup
- ⚡ Added admin notices for missing API keys
- ⚡ Enhanced API response validation
- 📝 Improved code documentation

### Version 1.0.5
- Initial release with Google and DeepL support
- Basic translation functionality
- URL rewriting and SEO features

## 💻 Development & Contribution

We believe in open source! This plugin is designed to be "one version for everyone"—no Pro tiers, no hidden features. We welcome community contributions.

### Setting up for Development

1. Clone this repository into your `wp-content/plugins/` directory:
   ```bash
   git clone https://github.com/fabryseol/Polyglot.git polyglot-translator
   ```

2. Activate the plugin in WordPress

3. Make your changes

4. Test thoroughly

5. Submit a pull request

### Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Reporting Issues

Found a bug? Please open an issue on [GitHub Issues](https://github.com/fabryseol/Polyglot/issues) with:
- WordPress version
- Plugin version
- Translation provider (Google/DeepL)
- Description of the issue
- Steps to reproduce

## 📞 Support

- **Documentation**: This README
- **Issues**: [GitHub Issues](https://github.com/fabryseol/Polyglot/issues)
- **Email**: support@polyglot-translator.com (if available)

## 📄 License

PolyGlot Translator is open-source software licensed under the **GPLv2**.

```
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
```

## 🙏 Credits

- **Author**: PolyGlot Solutions
- **Contributors**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Translation APIs**: Google Cloud Translation, DeepL

## 🔮 Roadmap

Future features we're considering:
- [ ] Automatic language detection based on browser
- [ ] Manual translation override interface
- [ ] Translation memory/glossary support
- [ ] Multi-site network support
- [ ] WooCommerce integration
- [ ] Elementor/page builder compatibility
- [ ] REST API endpoints
- [ ] Translation statistics dashboard

---

**Made with ❤️ for the WordPress community**

If you find this plugin helpful, please consider:
- ⭐ Starring this repository
- 📝 Writing a review
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code

Thank you for using PolyGlot Translator! 🌍
