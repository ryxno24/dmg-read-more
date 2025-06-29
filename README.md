# DMG Read More WordPress Plugin

A WordPress plugin that provides a Gutenberg block for creating stylised "Read More" links to other posts, plus a WP-CLI command for finding posts that use the block.

## Features

### Gutenberg Block

- **Post Search & Selection**: Search for posts by title or post ID with real-time results
- **Pagination Support**: Navigate through search results with Previous/Next buttons
- **Visual Preview**: Editor shows styled preview matching the exact frontend appearance
- **Inspector Controls**: Sidebar panel with intuitive search functionality and clear selection
- **Recent Posts**: Shows 10 most recent posts when no search term is entered
- **Responsive Design**: Mobile-first approach with optimised breakpoints
- **Accessible**: Clean hover states and proper focus management

### WP-CLI Command

- **Search Command**: Find posts containing the DMG Read More block
- **Date Range Filtering**: Filter results by publication date with flexible options
- **Database Optimisation**: Efficient queries designed for large databases (10M+ records)
- **Multiple Detection Methods**: Robust block detection using Gutenberg syntax, JSON format, and recursive parsing
- **Error Handling**: Comprehensive validation with clear success/failure messages

### Modern Sass Architecture

- **Organised Variables**: Centralised design tokens in `_variables.scss`
- **Reusable Mixins**: DRY approach with shared style components
- **Build System**: Optimised compilation with organised output structure
- **Future-Proof**: Modern `@use` syntax ready for Dart Sass 2.0

## Installation

1. Upload the plugin folder to `/wp-content/plugins/`
2. Activate the plugin through the WordPress admin
3. The "DMG Read More" block will be available in the Gutenberg editor under Widgets

## Usage

### Using the Gutenberg Block

1. In the Gutenberg editor, add a new block and search for "DMG Read More"
2. Use the sidebar panel to search for posts by title or enter a specific post ID
3. Navigate through results using pagination if needed
4. Click on a post to select it - the block will show a preview
5. Use "Clear Selection" to choose a different post
6. The frontend will display a styled "Read More: [Post Title]" button

### Using WP-CLI Commands

#### Standard WordPress Installations

```bash
# Search all posts with the block (defaults to last 30 days)
wp dmg-read-more search

# Search posts after a specific date
wp dmg-read-more search --date-after=2024-01-01

# Search posts before a specific date  
wp dmg-read-more search --date-before=2024-12-31

# Search within a date range
wp dmg-read-more search --date-after=2024-01-01 --date-before=2024-12-31
```

#### Docker Installations

```bash
# Search all posts with the block (defaults to last 30 days)
wp dmg-read-more search --allow-root

# Search posts after a specific date
wp dmg-read-more search --date-after=2024-01-01 --allow-root

# Search posts before a specific date  
wp dmg-read-more search --date-before=2024-12-31 --allow-root

# Search within a date range
wp dmg-read-more search --date-after=2024-01-01 --date-before=2024-12-31 --allow-root
```

## Development

### Building the Plugin

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start development server
npm run start
```

### File Structure

```
dmg-read-more/
├── dmg-read-more.php                    # Main plugin file
├── includes/
│   └── class-dmg-read-more-cli.php     # WP-CLI command implementation
├── src/read-more-block/
│   ├── js/index.js                      # React Gutenberg block
│   ├── scss/
│   │   ├── _variables.scss             # Shared design variables
│   │   ├── _mixins.scss                # Reusable style mixins
│   │   ├── style.scss                  # Frontend styles
│   │   └── editor.scss                 # Editor styles
│   └── block.json                      # Block configuration
├── build/
│   ├── js/read-more-block.js           # Compiled JavaScript
│   └── css/
│       ├── style.css                   # Compiled frontend styles
│       └── editor.css                  # Compiled editor styles
└── package.json                        # Build dependencies
```

#### Block Functionality

The main block logic is in `src/read-more-block/js/index.js`. Key areas:

- **Search Logic**: `searchPosts()` function handles API calls
- **Pagination**: Built into the search results display
- **State Management**: Uses React hooks for clean state handling

## Requirements

- **WordPress**: 5.0 or higher (for Gutenberg support)
- **PHP**: 7.4 or higher
- **Node.js**: 16+ (for development/building)
- **WP-CLI**: Latest version (for CLI functionality)

## Browser Support

- Modern browsers with ES6+ support
- Internet Explorer 11+ (with polyfills)
- Mobile browsers (responsive design)
