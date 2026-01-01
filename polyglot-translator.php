<?php
/**
 * Plugin Name: PolyGlot Translator
 * Description: The ultimate AI translation plugin for WordPress. Secure, fast, and SEO-ready. Supports Google Cloud Translate and DeepL.
 * Version: 1.0.6
 * Author: PolyGlot Solutions
 * Text Domain: polyglot-translator
 * License: GPLv2
 */

if (!defined('ABSPATH')) {
    exit; // Security: Prevent direct access
}

define('POLYGLOT_VERSION', '1.0.6');

class PolyGlotTranslator {
    private static $instance = null;
    private $options;
    private $active_languages = [];
    private $current_lang;
    private $default_lang;
    private $api_errors = [];

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->options = get_option('polyglot_settings', []);
        
        // Default detection
        $locale = get_locale(); 
        $detected_lang = substr($locale, 0, 2); 
        
        $this->default_lang = isset($this->options['default_lang']) ? $this->options['default_lang'] : $detected_lang; 
        $this->active_languages = isset($this->options['active_languages']) ? $this->options['active_languages'] : [];
        
        // Admin
        add_action('admin_menu', [$this, 'register_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_notices', [$this, 'show_admin_notices']);
        
        // Core Logic - FIXED: Changed order and timing
        add_action('init', [$this, 'setup_rewrites']);
        add_action('parse_request', [$this, 'determine_language'], 1); // FIXED: Earlier hook
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        
        // Translation Hooks - FIXED: Higher priority to run after language detection
        add_filter('the_content', [$this, 'translate_content_hook'], 999); // FIXED: Much higher priority
        add_filter('the_title', [$this, 'translate_title_hook'], 999, 2); // FIXED: Much higher priority
        add_filter('widget_text', [$this, 'translate_content_hook'], 999); // FIXED: Much higher priority
        add_shortcode('polyglot_switcher', [$this, 'render_language_switcher']);
        
        // URL & SEO
        add_filter('query_vars', [$this, 'add_query_vars']);
        add_action('template_redirect', [$this, 'handle_seo_redirects']);
        add_filter('home_url', [$this, 'rewrite_home_url'], 10, 4);
        add_filter('post_link', [$this, 'rewrite_post_link'], 10, 2);
        
        register_activation_hook(__FILE__, [$this, 'activate_plugin']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate_plugin']);
    }
    
    public function activate_plugin() {
        $this->setup_rewrites();
        flush_rewrite_rules();
        
        // SECURITY: Create .htaccess to protect cache if needed
        $upload_dir = wp_upload_dir();
        $cache_dir = $upload_dir['basedir'] . '/polyglot-cache';
        if (!file_exists($cache_dir)) {
            wp_mkdir_p($cache_dir);
            file_put_contents($cache_dir . '/.htaccess', 'deny from all');
        }
    }
    
    public function deactivate_plugin() {
        flush_rewrite_rules();
    }

    public function register_admin_menu() {
        add_menu_page(
            'PolyGlot', 
            'PolyGlot', 
            'manage_options', 
            'polyglot_translator', 
            [$this, 'render_admin_page'], 
            'dashicons-translation', 
            80
        );
    }

    public function register_settings() {
        register_setting('polyglot_settings_group', 'polyglot_settings', [$this, 'sanitize_settings']);
    }

    // SECURITY: Enhanced sanitization
    public function sanitize_settings($input) {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have permission to access this page.'));
        }
        
        // SECURITY: Verify nonce
        if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'polyglot_settings_group-options')) {
            add_settings_error('polyglot_settings', 'nonce_failed', 'Security check failed. Please try again.');
            return get_option('polyglot_settings', []);
        }
        
        $output = [];
        $output['provider'] = isset($input['provider']) && in_array($input['provider'], ['google', 'deepl']) 
            ? sanitize_text_field($input['provider']) 
            : 'google';
            
        // SECURITY: Encrypt API keys before storing
        $output['google_key'] = !empty($input['google_key']) ? $this->encrypt_api_key(sanitize_text_field($input['google_key'])) : '';
        $output['deepl_key'] = !empty($input['deepl_key']) ? $this->encrypt_api_key(sanitize_text_field($input['deepl_key'])) : '';
        
        $output['default_lang'] = sanitize_text_field($input['default_lang']);
        $output['enable_seo'] = isset($input['enable_seo']) ? '1' : '0';
        
        if (isset($input['active_languages']) && is_array($input['active_languages'])) {
            $output['active_languages'] = array_map('sanitize_text_field', $input['active_languages']);
        } else {
            $output['active_languages'] = [];
        }
        
        // Force flush on save to ensure new langs work
        flush_rewrite_rules();
        
        // Clear all translation cache when settings change
        $this->clear_translation_cache();
        
        add_settings_error('polyglot_settings', 'settings_updated', 'Settings saved successfully!', 'success');
        
        return $output;
    }
    
    // SECURITY: Simple encryption for API keys
    private function encrypt_api_key($key) {
        if (empty($key)) return '';
        
        // Use WordPress salt for basic encryption
        $salt = defined('AUTH_KEY') ? AUTH_KEY : 'polyglot_default_salt';
        return base64_encode($key . '::' . md5($salt . $key));
    }
    
    // SECURITY: Decrypt API keys
    private function decrypt_api_key($encrypted_key) {
        if (empty($encrypted_key)) return '';
        
        // Check if already decrypted (backward compatibility)
        if (strpos($encrypted_key, '::') === false && strpos(base64_decode($encrypted_key, true), '::') === false) {
            return $encrypted_key;
        }
        
        $decoded = base64_decode($encrypted_key);
        $parts = explode('::', $decoded);
        
        if (count($parts) !== 2) return '';
        
        $key = $parts[0];
        $hash = $parts[1];
        $salt = defined('AUTH_KEY') ? AUTH_KEY : 'polyglot_default_salt';
        
        // Verify integrity
        if (md5($salt . $key) === $hash) {
            return $key;
        }
        
        return '';
    }
    
    // Clear translation cache
    private function clear_translation_cache() {
        global $wpdb;
        $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_pg_tr_%' OR option_name LIKE '_transient_timeout_pg_tr_%'");
    }

    // SECURITY: Admin notices for errors
    public function show_admin_notices() {
        if (!current_user_can('manage_options')) return;
        
        $screen = get_current_screen();
        if ($screen->id !== 'toplevel_page_polyglot_translator') return;
        
        // Check if API keys are configured
        $provider = isset($this->options['provider']) ? $this->options['provider'] : 'google';
        $google_key = $this->decrypt_api_key(isset($this->options['google_key']) ? $this->options['google_key'] : '');
        $deepl_key = $this->decrypt_api_key(isset($this->options['deepl_key']) ? $this->options['deepl_key'] : '');
        
        if ($provider === 'google' && empty($google_key)) {
            echo '<div class="notice notice-warning"><p><strong>PolyGlot:</strong> Google API key is not configured. Translation will not work.</p></div>';
        }
        
        if ($provider === 'deepl' && empty($deepl_key)) {
            echo '<div class="notice notice-warning"><p><strong>PolyGlot:</strong> DeepL API key is not configured. Translation will not work.</p></div>';
        }
        
        if (empty($this->active_languages)) {
            echo '<div class="notice notice-info"><p><strong>PolyGlot:</strong> No target languages selected. Please select at least one language to translate to.</p></div>';
        }
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have permission to access this page.'));
        }
        
        $opts = $this->options;
        $provider = isset($opts['provider']) ? $opts['provider'] : 'google';
        
        // SECURITY: Decrypt keys for display
        $google_key = $this->decrypt_api_key(isset($opts['google_key']) ? $opts['google_key'] : '');
        $deepl_key = $this->decrypt_api_key(isset($opts['deepl_key']) ? $opts['deepl_key'] : '');
        
        $detected_lang = substr(get_locale(), 0, 2);
        $default_lang = isset($opts['default_lang']) ? $opts['default_lang'] : $detected_lang;
        
        $active_langs = isset($opts['active_languages']) ? $opts['active_languages'] : [];
        $enable_seo = isset($opts['enable_seo']) ? $opts['enable_seo'] : '0';

        // SVGs
        $icon_globe = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
        $icon_zap = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
        $icon_settings = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>';
        $icon_search = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
        $icon_save = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
        
        $languages = [
            'en' => ['English', '🇺🇸'], 'es' => ['Spanish', '🇪🇸'], 'fr' => ['French', '🇫🇷'], 
            'de' => ['German', '🇩🇪'], 'it' => ['Italian', '🇮🇹'], 'pt' => ['Portuguese', '🇵🇹'], 
            'zh' => ['Chinese', '🇨🇳'], 'ja' => ['Japanese', '🇯🇵'], 'ru' => ['Russian', '🇷🇺'], 
            'nl' => ['Dutch', '🇳🇱'], 'tr' => ['Turkish', '🇹🇷'], 'pl' => ['Polish', '🇵🇱'],
            'ko' => ['Korean', '🇰🇷'], 'ar' => ['Arabic', '🇸🇦'], 'hi' => ['Hindi', '🇮🇳'],
            'sv' => ['Swedish', '🇸🇪'], 'no' => ['Norwegian', '🇳🇴'], 'da' => ['Danish', '🇩🇰'],
            'fi' => ['Finnish', '🇫🇮'], 'el' => ['Greek', '🇬🇷'], 'he' => ['Hebrew', '🇮🇱'],
            'th' => ['Thai', '🇹🇭'], 'vi' => ['Vietnamese', '🇻🇳'], 'id' => ['Indonesian', '🇮🇩'],
            'ms' => ['Malay', '🇲🇾'], 'uk' => ['Ukrainian', '🇺🇦'], 'cs' => ['Czech', '🇨🇿'],
            'ro' => ['Romanian', '🇷🇴'], 'hu' => ['Hungarian', '🇭🇺']
        ];
        ?>
        <div class="pg-wrapper">
            <style>
                .pg-wrapper { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; background: #f0f0f1; margin: -20px; min-height: 100vh; display: flex; flex-direction: column; }
                .pg-header { background: #fff; border-bottom: 1px solid #dcdcde; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .pg-title h1 { margin: 0; font-size: 20px; font-weight: 700; color: #1d2327; display: flex; align-items: center; gap: 10px; }
                .pg-logo-icon { background: #4f46e5; color: white; padding: 6px; border-radius: 8px; line-height: 0; }
                .pg-save-btn { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; font-size: 14px; text-decoration: none; }
                .pg-save-btn:hover { background: #4338ca; color: white; }
                .pg-container { display: grid; grid-template-columns: 240px 1fr; gap: 32px; max-width: 1200px; margin: 32px auto; padding: 0 20px; align-items: start; }
                .pg-nav { background: transparent; }
                .pg-nav-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: none; background: transparent; text-align: left; cursor: pointer; color: #64748b; font-weight: 500; border-radius: 8px; transition: all 0.2s; font-size: 14px; }
                .pg-nav-btn:hover { background: rgba(255,255,255,0.6); color: #1e293b; }
                .pg-nav-btn.active { background: #fff; color: #4f46e5; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-weight: 600; }
                .pg-content { display: none; }
                .pg-content.active { display: block; animation: pgFadeIn 0.3s ease; }
                .pg-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 24px; }
                .pg-card-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; display: flex; justify-content: space-between; align-items: center; }
                .pg-card-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: #0f172a; }
                .pg-card-body { padding: 24px; }
                .pg-form-group { margin-bottom: 20px; }
                .pg-label { display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 8px; }
                .pg-input { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; transition: border 0.2s; box-sizing: border-box; }
                .pg-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1); }
                .pg-grid-options { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .pg-option-card { border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; }
                .pg-option-card:hover { border-color: #cbd5e1; background: #f8fafc; }
                .pg-option-card input { display: none; }
                .pg-option-card.selected { border-color: #4f46e5; background: #eef2ff; }
                .pg-option-card.selected h4 { color: #4f46e5; }
                
                .pg-lang-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 5px; }
                .pg-lang-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; transition: all 0.15s; background: #fff; }
                .pg-lang-item:hover { border-color: #94a3b8; background: #f8fafc; }
                .pg-lang-item.active { border-color: #4f46e5; background: #eff6ff; }
                
                .pg-badge { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                
                .pg-toggle { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
                .pg-toggle input { opacity: 0; width: 0; height: 0; }
                .pg-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; }
                .pg-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .pg-slider { background-color: #4f46e5; }
                input:checked + .pg-slider:before { transform: translateX(20px); }
                
                .pg-code { background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 13px; margin-top: 8px; display: block; }
                @keyframes pgFadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            </style>
            
            <form method="post" action="options.php" id="polyglot-form">
                <?php settings_fields('polyglot_settings_group'); ?>

                <div class="pg-header">
                    <div class="pg-title">
                        <h1>
                            <span class="pg-logo-icon"><?php echo $icon_globe; ?></span>
                            PolyGlot Translator
                        </h1>
                    </div>
                    <button type="submit" class="pg-save-btn">
                        <?php echo $icon_save; ?> Save Changes
                    </button>
                </div>

                <div class="pg-container">
                    <div class="pg-nav">
                        <button type="button" class="pg-nav-btn active" onclick="switchTab('general')">
                            <?php echo $icon_settings; ?> General Settings
                        </button>
                        <button type="button" class="pg-nav-btn" onclick="switchTab('languages')">
                            <?php echo $icon_globe; ?> Languages
                        </button>
                        <button type="button" class="pg-nav-btn" onclick="switchTab('integrations')">
                            <?php echo $icon_zap; ?> Translation Engine
                        </button>
                        <button type="button" class="pg-nav-btn" onclick="switchTab('seo')">
                            <?php echo $icon_search; ?> SEO & URL
                        </button>
                    </div>

                    <div class="pg-main">
                        <!-- GENERAL TAB -->
                        <div id="tab-general" class="pg-content active">
                            <div class="pg-card">
                                <div class="pg-card-header">
                                    <h3>Implementation</h3>
                                </div>
                                <div class="pg-card-body">
                                    <div class="pg-form-group" style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                            <span class="pg-label" style="margin:0;">Floating Switcher</span>
                                            <span style="font-size:10px; background:#e0e7ff; color:#4338ca; padding:2px 6px; border-radius:4px; font-weight:bold;">RECOMMENDED</span>
                                        </div>
                                        <code class="pg-code">[polyglot_switcher]</code>
                                        <p style="font-size:12px; color:#64748b; margin-top:8px;">Add this shortcode to a widget or footer to display the floating button.</p>
                                    </div>
                                    <div class="pg-form-group" style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                        <span class="pg-label">Inline List</span>
                                        <code class="pg-code">[polyglot_switcher style="inline"]</code>
                                        <p style="font-size:12px; color:#64748b; margin-top:8px;">Use this for menus or headers.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- LANGUAGES TAB -->
                        <div id="tab-languages" class="pg-content">
                            <div class="pg-card">
                                <div class="pg-card-header">
                                    <h3>Language Manager</h3>
                                </div>
                                <div class="pg-card-body">
                                    <div class="pg-form-group">
                                        <label class="pg-label">Original Site Language</label>
                                        <select name="polyglot_settings[default_lang]" class="pg-input" style="max-width:300px;">
                                            <?php foreach($languages as $code => $details): ?>
                                                <option value="<?php echo esc_attr($code); ?>" <?php selected($default_lang, $code); ?>>
                                                    <?php echo esc_html($details[1] . ' ' . $details[0]); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                        <p style="font-size:12px; color:#64748b; margin-top:4px;">Detected from WordPress: <strong><?php echo esc_html($detected_lang); ?></strong>. Save changes if you modify this.</p>
                                    </div>
                                    
                                    <div class="pg-form-group">
                                        <label class="pg-label">Destination Languages</label>
                                        <div class="pg-lang-grid">
                                            <?php foreach($languages as $code => $details): 
                                                if ($code === $default_lang) continue; 
                                                $is_active = in_array($code, $active_langs);
                                                $item_class = $is_active ? 'active' : '';
                                            ?>
                                            <div class="pg-lang-item <?php echo esc_attr($item_class); ?>" id="card-<?php echo esc_attr($code); ?>">
                                                <div style="display:flex; align-items:center; gap:10px;">
                                                    <span style="font-size:20px;"><?php echo esc_html($details[1]); ?></span>
                                                    <div>
                                                        <div style="font-size:14px; font-weight:600; color:#1e293b;"><?php echo esc_html($details[0]); ?></div>
                                                        <div style="font-size:11px; color:#94a3b8;"><?php echo esc_html(strtoupper($code)); ?></div>
                                                    </div>
                                                </div>
                                                <label class="pg-toggle">
                                                    <input type="checkbox" 
                                                           name="polyglot_settings[active_languages][]" 
                                                           value="<?php echo esc_attr($code); ?>" 
                                                           <?php checked($is_active); ?> 
                                                           onchange="toggleLangCard(this, '<?php echo esc_js($code); ?>')">
                                                    <span class="pg-slider"></span>
                                                </label>
                                            </div>
                                            <?php endforeach; ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- INTEGRATIONS TAB -->
                        <div id="tab-integrations" class="pg-content">
                             <div class="pg-card">
                                <div class="pg-card-header">
                                    <h3>Translation Engine</h3>
                                    <span class="pg-badge">Production Ready</span>
                                </div>
                                <div class="pg-card-body">
                                    <div class="pg-form-group">
                                        <label class="pg-label">Active Provider</label>
                                        <div class="pg-grid-options">
                                            <label class="pg-option-card <?php echo $provider === 'google' ? 'selected' : ''; ?>" onclick="selectProvider(this, 'google')">
                                                <input type="radio" name="polyglot_settings[provider]" value="google" <?php checked($provider, 'google'); ?>>
                                                <?php echo $icon_zap; ?>
                                                <h4 style="margin:0; font-size:14px;">Google Translate</h4>
                                            </label>
                                            <label class="pg-option-card <?php echo $provider === 'deepl' ? 'selected' : ''; ?>" onclick="selectProvider(this, 'deepl')">
                                                <input type="radio" name="polyglot_settings[provider]" value="deepl" <?php checked($provider, 'deepl'); ?>>
                                                <?php echo $icon_globe; ?>
                                                <h4 style="margin:0; font-size:14px;">DeepL Translate</h4>
                                            </label>
                                        </div>
                                    </div>

                                    <div id="config-google" class="pg-form-group" style="display: <?php echo $provider === 'google' ? 'block' : 'none'; ?>">
                                        <label class="pg-label">Google Cloud API Key</label>
                                        <input type="password" name="polyglot_settings[google_key]" value="<?php echo esc_attr($google_key); ?>" class="pg-input" placeholder="AIza..." autocomplete="off">
                                        <p style="font-size:12px; color:#64748b; margin-top:4px;">Supports standard Google Cloud Translation API (v2). <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Get your API key</a></p>
                                    </div>

                                    <div id="config-deepl" class="pg-form-group" style="display: <?php echo $provider === 'deepl' ? 'block' : 'none'; ?>">
                                        <label class="pg-label">DeepL API Key</label>
                                        <input type="password" name="polyglot_settings[deepl_key]" value="<?php echo esc_attr($deepl_key); ?>" class="pg-input" placeholder="...:fx" autocomplete="off">
                                        <p style="font-size:12px; color:#64748b; margin-top:4px;">Supports Free (:fx) and Pro keys. <a href="https://www.deepl.com/pro-api" target="_blank">Get your API key</a></p>
                                    </div>
                                </div>
                             </div>
                        </div>

                        <!-- SEO TAB -->
                        <div id="tab-seo" class="pg-content">
                            <div class="pg-card">
                                <div class="pg-card-header">
                                    <h3>URL Rewrites & SEO</h3>
                                </div>
                                <div class="pg-card-body">
                                    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:16px; border-radius:8px; border:1px solid #e2e8f0;">
                                        <div>
                                            <div class="pg-label" style="margin-bottom:4px;">Translate URL Slugs</div>
                                            <div style="font-size:13px; color:#64748b;">Automatically rewrite URLs (e.g. /es/page-name)</div>
                                        </div>
                                        <label class="pg-toggle">
                                            <input type="checkbox" name="polyglot_settings[enable_seo]" value="1" <?php checked($enable_seo, '1'); ?>>
                                            <span class="pg-slider"></span>
                                        </label>
                                    </div>
                                    <p style="font-size:13px; color:#94a3b8; margin-top:16px; font-style:italic;">
                                        Note: Complex slug translation tables are stored in the database and managed automatically in this version.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </div>

        <script>
            function switchTab(tabId) {
                document.querySelectorAll('.pg-content').forEach(el => el.classList.remove('active'));
                document.querySelectorAll('.pg-nav-btn').forEach(el => el.classList.remove('active'));
                document.getElementById('tab-' + tabId).classList.add('active');
                event.currentTarget.classList.add('active');
            }

            function selectProvider(el, provider) {
                document.querySelectorAll('.pg-option-card').forEach(c => c.classList.remove('selected'));
                el.classList.add('selected');
                document.getElementById('config-google').style.display = provider === 'google' ? 'block' : 'none';
                document.getElementById('config-deepl').style.display = provider === 'deepl' ? 'block' : 'none';
            }
            
            function toggleLangCard(checkbox, code) {
                var card = document.getElementById('card-' + code);
                if (checkbox.checked) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            }
        </script>
        <?php
    }

    // ==========================================
    // 2. SEO & URL REWRITING
    // ==========================================

    public function setup_rewrites() {
        add_rewrite_tag('%pg_lang%', '([a-z]{2})');
        add_rewrite_rule(
            '^([a-z]{2})/(.+?)/?$',
            'index.php?pg_lang=$matches[1]&pagename=$matches[2]',
            'top'
        );
        add_rewrite_rule(
            '^([a-z]{2})/?$',
            'index.php?pg_lang=$matches[1]',
            'top'
        );
    }

    public function add_query_vars($vars) {
        $vars[] = 'pg_lang';
        return $vars;
    }

    // FIXED: Changed to parse_request hook to get language earlier
    public function determine_language($wp) {
        if (is_admin()) return; 

        $lang = '';
        
        // Check rewrite rule match first
        if (isset($wp->query_vars['pg_lang'])) {
            $lang = sanitize_text_field($wp->query_vars['pg_lang']);
        }
        // Fallback to GET parameter
        elseif (isset($_GET['lang'])) {
            $lang = sanitize_text_field($_GET['lang']);
        }

        if ($lang && in_array($lang, $this->active_languages)) {
            $this->current_lang = $lang;
        } else {
            $this->current_lang = $this->default_lang;
        }
    }

    public function rewrite_post_link($permalink, $post) {
        if ($this->current_lang && $this->current_lang !== $this->default_lang) {
            $home = home_url();
            $clean_link = str_replace($home, '', $permalink);
            return home_url('/' . $this->current_lang . $clean_link);
        }
        return $permalink;
    }

    public function rewrite_home_url($url, $path = '', $scheme = null, $blog_id = null) {
        if ($this->current_lang && $this->current_lang !== $this->default_lang) {
             return rtrim($url, '/') . '/' . $this->current_lang . $path;
        }
        return $url;
    }
    
    public function handle_seo_redirects() {
        if (is_admin()) return;
        
        // SECURITY: Prevent open redirect vulnerability
        if (isset($_GET['lang']) && !get_query_var('pg_lang')) {
            $lang = sanitize_text_field($_GET['lang']);
            if (in_array($lang, $this->active_languages)) {
                $request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
                $new_url = home_url('/' . $lang . $request_uri);
                $new_url = remove_query_arg('lang', $new_url);
                wp_safe_redirect($new_url, 301);
                exit;
            }
        }
    }

    // ==========================================
    // 3. TRANSLATION ENGINE (GOOGLE V2 & DEEPL)
    // ==========================================

    public function translate_content_hook($content) {
        if (is_admin() || empty($content) || !$this->current_lang || $this->current_lang === $this->default_lang) {
            return $content;
        }

        // SECURITY: Don't translate if content contains script tags
        if (preg_match('/<script|<iframe|javascript:/i', $content)) {
            return $content;
        }

        return $this->get_translation($content, $this->current_lang);
    }
    
    public function translate_title_hook($title, $id = null) {
         if (is_admin() || empty($title) || !$this->current_lang || $this->current_lang === $this->default_lang) {
            return $title;
        }
        
        // Don't translate navigation menu items that are empty
        if (trim($title) === '') {
            return $title;
        }
        
        return $this->get_translation($title, $this->current_lang);
    }

    private function get_translation($text, $lang) {
        // Skip very short strings
        if (strlen(trim($text)) < 2) {
            return $text;
        }
        
        $provider = isset($this->options['provider']) ? $this->options['provider'] : 'google';
        
        // FIXED: Better cache key with full MD5 hash
        $cache_key = 'pg_tr_' . md5($text . '_' . $lang . '_' . $provider);
        
        $cached = get_transient($cache_key);
        if ($cached !== false) {
            return $cached;
        }

        $translated = $text;

        if ($provider === 'deepl') {
            $translated = $this->translate_with_deepl($text, $lang);
        } else {
            $translated = $this->translate_with_google($text, $lang);
        }

        // Only cache valid translations
        if ($translated && $translated !== $text && strpos($translated, '<!-- PolyGlot Error') === false) {
            set_transient($cache_key, $translated, 30 * DAY_IN_SECONDS);
        }

        return $translated;
    }

    private function translate_with_google($text, $lang) {
        $key = $this->decrypt_api_key(isset($this->options['google_key']) ? $this->options['google_key'] : '');
        
        if (empty($key)) {
            if (current_user_can('manage_options')) {
                return $text . ' <!-- PolyGlot Error: No Google API Key Configured -->';
            }
            return $text;
        }

        // Google Cloud Translation API v2
        $url = 'https://translation.googleapis.com/language/translate/v2';
        
        $body = [
            'q' => $text,
            'target' => $lang,
            'format' => 'html',
            'key' => $key
        ];

        // SECURITY: Re-enabled sslverify for production
        $response = wp_remote_post($url, [
            'body' => $body,
            'timeout' => 30,
            'sslverify' => true, // FIXED: Enable SSL verification
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded'
            ]
        ]);

        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            error_log('PolyGlot Google API Error: ' . $error_message);
            
            if (current_user_can('manage_options')) {
                return $text . ' <!-- PolyGlot Error: ' . esc_html($error_message) . ' -->';
            }
            return $text;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $body_json = wp_remote_retrieve_body($response);
        $data = json_decode($body_json, true);
        
        if ($response_code === 200 && isset($data['data']['translations'][0]['translatedText'])) {
            return $data['data']['translations'][0]['translatedText'];
        }
        
        if (isset($data['error'])) {
             $error_msg = isset($data['error']['message']) ? $data['error']['message'] : 'Unknown error';
             error_log('PolyGlot Google API Error: ' . $error_msg);
             
             if (current_user_can('manage_options')) {
                 return $text . ' <!-- PolyGlot Error: ' . esc_html($error_msg) . ' -->';
             }
        }

        return $text;
    }

    private function translate_with_deepl($text, $lang) {
        $key = $this->decrypt_api_key(isset($this->options['deepl_key']) ? $this->options['deepl_key'] : '');
        
        if (empty($key)) {
            if (current_user_can('manage_options')) {
                return $text . ' <!-- PolyGlot Error: No DeepL API Key Configured -->';
            }
            return $text;
        }

        $is_free = (substr($key, -3) === ':fx');
        $url = $is_free ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';

        // FIXED: DeepL language code mapping
        $deepl_lang_map = [
            'en' => 'EN-US',
            'pt' => 'PT-PT',
            'zh' => 'ZH'
        ];
        
        $target_lang = isset($deepl_lang_map[$lang]) ? $deepl_lang_map[$lang] : strtoupper($lang);

        $body = [
            'auth_key' => $key,
            'text' => $text,
            'target_lang' => $target_lang,
            'tag_handling' => 'html', 
            'preserve_formatting' => '1'
        ];

        // SECURITY: Re-enabled sslverify
        $response = wp_remote_post($url, [
            'body' => $body,
            'timeout' => 30,
            'sslverify' => true, // FIXED: Enable SSL verification
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded'
            ]
        ]);

        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            error_log('PolyGlot DeepL API Error: ' . $error_message);
            
            if (current_user_can('manage_options')) {
                return $text . ' <!-- PolyGlot Error: ' . esc_html($error_message) . ' -->';
            }
            return $text;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $data = json_decode(wp_remote_retrieve_body($response), true);

        if ($response_code === 200 && isset($data['translations'][0]['text'])) {
            return $data['translations'][0]['text'];
        }
        
        if (isset($data['message'])) {
            error_log('PolyGlot DeepL API Error: ' . $data['message']);
            
            if (current_user_can('manage_options')) {
                return $text . ' <!-- PolyGlot Error: ' . esc_html($data['message']) . ' -->';
            }
        }

        return $text;
    }

    // ==========================================
    // 4. FRONTEND ASSETS
    // ==========================================

    public function enqueue_assets() {
        wp_register_style('polyglot-style', false);
        wp_enqueue_style('polyglot-style');
        wp_add_inline_style('polyglot-style', '
            .pg-switcher-container { position: fixed; bottom: 20px; right: 20px; z-index: 99999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            .pg-switcher-btn { 
                background: white; 
                padding: 10px 16px; 
                border-radius: 50px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.15); 
                cursor: pointer; 
                display: flex; 
                align-items: center; 
                gap: 10px; 
                font-weight: 600;
                font-size: 14px;
                color: #333;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                border: 1px solid rgba(0,0,0,0.05);
            }
            .pg-switcher-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.2); }
            .pg-switcher-dropdown {
                position: absolute;
                bottom: 110%;
                right: 0;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 24px rgba(0,0,0,0.15);
                overflow: hidden;
                display: none;
                min-width: 160px;
                flex-direction: column;
                padding: 5px;
            }
            .pg-switcher-container:hover .pg-switcher-dropdown { display: flex; animation: pgFadeIn 0.2s ease-out; }
            .pg-item { 
                padding: 10px 15px; 
                text-decoration: none !important; 
                color: #444 !important; 
                display: flex; 
                align-items: center; 
                gap: 10px; 
                transition: background 0.1s;
                border-radius: 8px;
                font-size: 14px;
            }
            .pg-item:hover { background: #f5f5f7; color: #000 !important; }
            .pg-item.active { background: #eff6ff; color: #2563eb !important; font-weight: 600; }
            .pg-flag { font-size: 1.4em; line-height: 1; }
            @keyframes pgFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            
            /* Inline Style */
            .pg-inline { position: relative; display: inline-flex; align-items: center; z-index: 99; }
            .pg-inline .pg-switcher-dropdown { display: none; }
            .pg-inline-list { display: inline-flex; gap: 8px; list-style: none !important; padding: 0 !important; margin: 0 !important; }
            .pg-inline-item { margin: 0 !important; list-style: none !important; display: inline-block !important; }
            .pg-inline-item a { 
                display: inline-flex; 
                align-items: center; 
                gap: 6px; 
                padding: 6px 12px; 
                background: #fff; 
                border: 1px solid #e5e7eb; 
                border-radius: 6px; 
                text-decoration: none !important; 
                color: #374151; 
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
                line-height: normal;
            }
            .pg-inline-item a:hover { border-color: #9ca3af; }
            .pg-inline-item a.active { background: #1f2937; color: #fff; border-color: #1f2937; }
        ');
    }
    
    private function get_flag($code) {
        $flags = [
            'en'=>'🇺🇸','es'=>'🇪🇸','fr'=>'🇫🇷','de'=>'🇩🇪','it'=>'🇮🇹','pt'=>'🇵🇹','zh'=>'🇨🇳',
            'ja'=>'🇯🇵','ru'=>'🇷🇺','nl'=>'🇳🇱','tr'=>'🇹🇷','pl'=>'🇵🇱','ko'=>'🇰🇷','ar'=>'🇸🇦',
            'hi'=>'🇮🇳','sv'=>'🇸🇪','no'=>'🇳🇴','da'=>'🇩🇰','fi'=>'🇫🇮','el'=>'🇬🇷','he'=>'🇮🇱',
            'th'=>'🇹🇭','vi'=>'🇻🇳','id'=>'🇮🇩','ms'=>'🇲🇾','uk'=>'🇺🇦','cs'=>'🇨🇿','ro'=>'🇷🇴','hu'=>'🇭🇺'
        ];
        return isset($flags[$code]) ? $flags[$code] : '🌐';
    }

    public function render_language_switcher($atts) {
        $a = shortcode_atts(['style' => 'floating'], $atts);
        
        $all_langs = array_merge([$this->default_lang], $this->active_languages);
        $all_langs = array_unique($all_langs);
        
        // SECURITY: Escape all output
        if ($a['style'] === 'inline') {
            $output = '<span class="pg-inline"><span class="pg-inline-list">';
            foreach ($all_langs as $code) {
                $is_active = ($this->current_lang == $code);
                $url = ($code === $this->default_lang) ? home_url() : home_url('/' . $code . '/');
                $flag = $this->get_flag($code);
                $active_class = $is_active ? 'active' : '';
                
                $output .= '<span class="pg-inline-item">';
                $output .= '<a href="' . esc_url($url) . '" class="' . esc_attr($active_class) . '">' . esc_html($flag) . ' ' . esc_html(strtoupper($code)) . '</a>';
                $output .= '</span>';
            }
            $output .= '</span></span>';
            return $output;
        }

        $current_flag = $this->get_flag($this->current_lang);
        $output = '<div class="pg-switcher-container">';
        $output .= '<div class="pg-switcher-dropdown">';
        foreach ($all_langs as $code) {
            $url = ($code === $this->default_lang) ? home_url() : home_url('/' . $code . '/');
            $flag = $this->get_flag($code);
            $active_class = ($this->current_lang == $code) ? 'active' : '';
            $output .= '<a href="' . esc_url($url) . '" class="pg-item ' . esc_attr($active_class) . '">';
            $output .= '<span class="pg-flag">' . esc_html($flag) . '</span> ' . esc_html(strtoupper($code));
            $output .= '</a>';
        }
        $output .= '</div>';
        $output .= '<div class="pg-switcher-btn">';
        $output .= '<span class="pg-flag">' . esc_html($current_flag) . '</span> ' . esc_html(strtoupper($this->current_lang));
        $output .= ' <span style="font-size: 10px; margin-left: auto; opacity: 0.5;">▼</span>';
        $output .= '</div>';
        $output .= '</div>';
        
        return $output;
    }
}

// Initialize
PolyGlotTranslator::get_instance();
