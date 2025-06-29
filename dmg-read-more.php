<?php
/**
 * Plugin Name: DMG Read More
 * Description: A WordPress plugin with a Gutenberg block for linking to posts and a WP-CLI command for searching block usage.
 * Version: 1.0.0
 * Author: Ryan Noon
 * Text Domain: dmg-read-more
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

define('DMG_READ_MORE_VERSION', '1.0.0');
define('DMG_READ_MORE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('DMG_READ_MORE_PLUGIN_URL', plugin_dir_url(__FILE__));

class DMG_Read_More {
    
    public function __construct() {
        add_action('init', array($this, 'init'));

        // Load WP-CLI command if WP-CLI is available
        if (defined('WP_CLI') && WP_CLI) {
            $this->load_cli_command();
        }
    }
    
    public function init() {
        // Block registration
        $this->register_block();
    }

    public function register_block() {
        register_block_type(
            DMG_READ_MORE_PLUGIN_DIR . 'src/read-more-block'
        );
    }

    private function load_cli_command() {
        require_once DMG_READ_MORE_PLUGIN_DIR . 'includes/class-dmg-read-more-cli.php';
        WP_CLI::add_command('dmg-read-more', 'DMG_Read_More_CLI');
    }
}

new DMG_Read_More();
