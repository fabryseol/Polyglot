# Contributing to PolyGlot Translator

Thank you for your interest in contributing! We want to make this the best free translation plugin for WordPress.

## How to Contribute

### Reporting Bugs
- Open an issue on GitHub.
- Provide clear reproduction steps and your environment details (PHP version, WP version).

### Submitting Changes
1. **Fork** the repository on GitHub.
2. **Clone** your fork locally.
3. Create a new **branch** for your feature or fix:
   `git checkout -b feature/my-awesome-feature`
4. **Commit** your changes with meaningful messages.
5. **Push** to your fork and submit a **Pull Request**.

## Coding Standards
- We follow [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/).
- Ensure all inputs are sanitized (`sanitize_text_field`, etc.) and outputs are escaped (`esc_html`, etc.).
- Prefix all functions and classes with `PolyGlot` or `pg_` to avoid collisions.

## Security
If you discover a security vulnerability, please do **not** open a public issue. Email us directly or use the GitHub Security Advisory feature.
