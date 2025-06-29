import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

import {
    InspectorControls,
    useBlockProps
} from '@wordpress/block-editor';

import {
    PanelBody,
    TextControl,
    Button,
    Spinner,
    Notice
} from '@wordpress/components';

// React hooks
import {
    useState,
    useEffect
} from '@wordpress/element';

const Edit = ({ attributes, setAttributes }) => {
    const { postId, postTitle, postUrl } = attributes;
    const blockProps = useBlockProps();

    // State for search functionality
    const [ searchTerm, setSearchTerm ] = useState('');
    const [ searchResults, setSearchResults ] = useState([]);
    const [ recentPosts, setRecentPosts ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [ error, setError ] = useState('');

    // Load recent posts on component mount
    useEffect(() => {
        loadRecentPosts();
    }, []);

    // Function to load recent posts
    const loadRecentPosts = async () => {
        setIsLoading(true);
        try {
            // Fetch recent posts through API
            const response = await apiFetch({
                path: '/wp/v2/posts?per_page=10&status=publish&_fields=id,title,link'
            });
            setRecentPosts(response);
        } catch (err) {
            setError(__('Failed to load recent posts', 'dmg-read-more'));
        }
        setIsLoading(false);
    };

    // Function to handle search
    const searchPosts = async (term = searchTerm, page = 1) => {
        if (!term.trim()) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            let path;

            // Check if search term is a number (post ID)
            if (/^\d+$/.test(term.trim())) {
                path = `/wp/v2/posts/${term.trim()}?_fields=id,title,link`;
                const post = await apiFetch({ path });
                setSearchResults([post]);
                setTotalPages(1);
                setCurrentPage(1);
            } else {
                // Text search implementation
                path = `/wp/v2/posts?search=${encodeURIComponent(term)}&per_page=10&page=${page}&status=publish&_fields=id,title,link`;

                // Get full response with headers
                const response = await apiFetch({
                    path,
                    parse: false
                });

                const posts = await response.json();
                const totalPagesHeader = response.headers.get('X-WP-TotalPages');

                setSearchResults(posts);
                setTotalPages(parseInt(totalPagesHeader) || 1);
                setCurrentPage(page);
            }
        } catch (err) {
            if (err.code === 'rest_post_invalid_id') {
                setSearchResults([]);
                setError(__('Post not found', 'dmg-read-more'));
            } else {
                setError(__('Search failed', 'dmg-read-more'));
            }
        }
        setIsLoading(false);
    };

    // Function to select a post
    const selectPost = (post) => {
        setAttributes({
            postId: post.id,
            postTitle: post.title.rendered,
            postUrl: post.link
        });
    };

    // Function to clear selection
    const clearSelection = () => {
        setAttributes({
            postId: 0,
            postTitle: '',
            postUrl: ''
        });
    };

    // Component to display post list
    const PostList = ({ posts, title }) => (
        <div>
            <h4>{title}</h4>
            {posts.length === 0 ? (
                <p>{__('No posts found', 'dmg-read-more')}</p>
            ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {posts.map(post => {
                        // Check if this post is currently selected
                        const isSelected = post.id === postId;

                        return (
                            <li key={post.id} style={{ marginBottom: '8px' }}>
                                <Button
                                    variant={isSelected ? "primary" : "secondary"}
                                    onClick={() => selectPost(post)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        whiteSpace: 'normal',
                                        height: 'auto',
                                        padding: '8px',
                                        backgroundColor: isSelected ? '#0073aa' : undefined,
                                        color: isSelected ? 'white' : undefined,
                                        borderColor: isSelected ? '#0073aa' : undefined
                                    }}
                                >
                                    {isSelected && '✓ '}
                                    {post.title.rendered || __('(No title)', 'dmg-read-more')}
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );

    return (
        <div {...blockProps}>
            <InspectorControls>
                <PanelBody title={__('Post Selection', 'dmg-read-more')} initialOpen={true}>
                    <TextControl
                        label={__('Search posts or enter post ID', 'dmg-read-more')}
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder={__('Enter search term or post ID...', 'dmg-read-more')}
                    />

                    <div style={{ marginBottom: '16px' }}>
                        <Button 
                            variant="primary" 
                            onClick={() => searchPosts()}
                            disabled={isLoading || !searchTerm.trim()}
                        >
                            {__('Search', 'dmg-read-more')}
                        </Button>

                        {postId > 0 && (
                            <Button 
                                variant="secondary" 
                                onClick={clearSelection}
                                style={{ marginLeft: '8px' }}
                            >
                                {__('Clear Selection', 'dmg-read-more')}
                            </Button>
                        )}
                    </div>

                    {isLoading && <Spinner />}

                    {error && (
                        <Notice status="error" isDismissible={false}>
                            {error}
                        </Notice>
                    )}

                    {searchResults.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <PostList 
                                posts={searchResults} 
                                title={__('Search Results', 'dmg-read-more')} 
                            />

                            {totalPages > 1 && (
                                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                    <Button
                                        variant="secondary"
                                        disabled={currentPage <= 1 || isLoading}
                                        onClick={() => searchPosts(searchTerm, currentPage - 1)}
                                    >
                                        {__('Previous', 'dmg-read-more')}
                                    </Button>

                                    <span style={{ margin: '0 12px' }}>
                                        {currentPage} / {totalPages}
                                    </span>

                                    <Button
                                        variant="secondary"
                                        disabled={currentPage >= totalPages || isLoading}
                                        onClick={() => searchPosts(searchTerm, currentPage + 1)}
                                    >
                                        {__('Next', 'dmg-read-more')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {searchTerm === '' && recentPosts.length > 0 && (
                        <PostList 
                            posts={recentPosts} 
                            title={__('Recent Posts', 'dmg-read-more')} 
                        />
                    )}
                </PanelBody>
            </InspectorControls>

            <div style={{ 
                border: '2px dashed #ddd', 
                padding: '20px', 
                textAlign: 'center',
                background: '#f9f9f9'
            }}>
                {postId > 0 ? (
                    <p>
                        <a href={postUrl}>
                            {__('Read More: ', 'dmg-read-more')}{postTitle}
                        </a>
                    </p>
                ) : (
                    <p>{__('Select a post to create a "Read More" link.', 'dmg-read-more')}</p>
                )}
            </div>
        </div>
    );
};

const Save = ({ attributes }) => {
    const { postId, postTitle, postUrl } = attributes;
    const blockProps = useBlockProps.save();

    if (!postId || !postTitle || !postUrl) {
        return null;
    }

    return (
        <p {...blockProps} className="dmg-read-more">
            <a href={postUrl}>
                {__('Read More: ', 'dmg-read-more')}{postTitle}
            </a>
        </p>
    );
};

registerBlockType('dmg/read-more', {
    edit: Edit,
    save: Save,
});
