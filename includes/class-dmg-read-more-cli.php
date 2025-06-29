<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * WP-CLI command for DMG Read More plugin
 */
class DMG_Read_More_CLI {

    /**
     * Search for posts containing the DMG Read More block within a date range.
     *
     * ## OPTIONS
     *
     * [--date-before=<date>]
     * : Search for posts published before this date (YYYY-MM-DD format).
     *
     * [--date-after=<date>]
     * : Search for posts published after this date (YYYY-MM-DD format).
     *
     * ## EXAMPLES
     *
     *     wp dmg-read-more search
     *     wp dmg-read-more search --date-after=2024-01-01 --date-before=2024-12-31
     *     wp dmg-read-more search --date-after=2024-06-01
     *
     * @when after_wp_load
     */
    public function search($args, $assoc_args) {
        $date_before = isset($assoc_args['date-before']) ? $assoc_args['date-before'] : null;
        $date_after = isset($assoc_args['date-after']) ? $assoc_args['date-after'] : null;

        // Default to last 30 days if no dates provided
        if (!$date_before && !$date_after) {
            $date_after = date('Y-m-d', strtotime('-30 days'));
            WP_CLI::log("No date range specified. Searching last 30 days (since {$date_after}).");
        }

        // Validate date formats
        if ($date_before && !$this->validate_date($date_before)) {
            WP_CLI::error("Invalid date-before format. Use YYYY-MM-DD.");
        }

        if ($date_after && !$this->validate_date($date_after)) {
            WP_CLI::error("Invalid date-after format. Use YYYY-MM-DD.");
        }

        WP_CLI::log("Searching for posts containing DMG Read More blocks...");

        try {
            $post_ids = $this->find_posts_with_block($date_before, $date_after);

            if (empty($post_ids)) {
                WP_CLI::log("No posts found containing the DMG Read More block in the specified date range.");
                return;
            }

            WP_CLI::log(sprintf("Found %d post(s) containing the DMG Read More block:", count($post_ids)));

            foreach ($post_ids as $post_id) {
                WP_CLI::log("Post ID: {$post_id}");
            }

        } catch (Exception $e) {
            WP_CLI::error("Error during search: " . $e->getMessage());
        }
    }

    /**
     * Find posts containing the DMG Read More block using optimized query
     *
     * @param string|null $date_before
     * @param string|null $date_after
     * @return array Array of post IDs
     */
    private function find_posts_with_block($date_before = null, $date_after = null) {
        global $wpdb;

        // Build the date query part
        $date_conditions = array();

        if ($date_after) {
            $date_conditions[] = $wpdb->prepare("post_date >= %s", $date_after . ' 00:00:00');
        }

        if ($date_before) {
            $date_conditions[] = $wpdb->prepare("post_date <= %s", $date_before . ' 23:59:59');
        }

        $date_where = '';
        if (!empty($date_conditions)) {
            $date_where = 'AND ' . implode(' AND ', $date_conditions);
        }

        // Optimized query to search for block content
        // Using LIKE with specific block markers for performance
        $sql = "
            SELECT ID 
            FROM {$wpdb->posts} 
            WHERE post_status = 'publish' 
            AND post_type = 'post'
            AND (
                post_content LIKE '%<!-- wp:dmg/read-more%'
                OR post_content LIKE '%\"name\":\"dmg/read-more\"%'
            )
            {$date_where}
            ORDER BY post_date DESC
        ";

        $results = $wpdb->get_col($sql);

        // Secondary validation to ensure the block is actually present
        // This step verifies the block exists and isn't just a false positive
        $validated_ids = array();

        foreach ($results as $post_id) {
            $post = get_post($post_id);
            if ($post && $this->post_contains_dmg_block($post->post_content)) {
                $validated_ids[] = (int) $post_id;
            }
        }

        return $validated_ids;
    }

    /**
     * More precise check to verify the post contains our specific block
     *
     * @param string $content Post content
     * @return bool
     */
    private function post_contains_dmg_block($content) {
        // Check for Gutenberg block syntax
        if (strpos($content, '<!-- wp:dmg/read-more') !== false) {
            return true;
        }

        // Check for block in JSON format (for reusable blocks or REST API)
        if (strpos($content, '"name":"dmg/read-more"') !== false) {
            return true;
        }

        // Parse blocks if available (WordPress 5.0+)
        if (function_exists('parse_blocks')) {
            $blocks = parse_blocks($content);
            return $this->search_blocks_recursively($blocks, 'dmg/read-more');
        }

        return false;
    }

    /**
     * Recursively search through blocks to find our block type
     *
     * @param array $blocks Array of block data
     * @param string $block_name Block name to search for
     * @return bool
     */
    private function search_blocks_recursively($blocks, $block_name) {
        foreach ($blocks as $block) {
            if ($block['blockName'] === $block_name) {
                return true;
            }

            // Search in inner blocks
            if (!empty($block['innerBlocks'])) {
                if ($this->search_blocks_recursively($block['innerBlocks'], $block_name)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Validate date format
     *
     * @param string $date Date string
     * @return bool
     */
    private function validate_date($date) {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
}
