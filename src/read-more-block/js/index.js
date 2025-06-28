import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

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
    const [ error, setError ] = useState('');

    // Load recent posts on component mount
    useEffect(() => {
        loadRecentPosts();
    }, []);

    // Function to load recent posts
    const loadRecentPosts = async () => {
        setIsLoading(true);
        try {
            // TODO: API call to get recent posts (placeholder for now)
            setRecentPosts([
                { id: 1, title: { rendered: 'Sample Post 1' }, link: '#' },
                { id: 2, title: { rendered: 'Sample Post 2' }, link: '#' }
            ]);
        } catch (err) {
            setError(__('Failed to load recent posts', 'dmg-read-more'));
        }
        setIsLoading(false);
    };

    // Function to handle search (placeholder)
    const searchPosts = async () => {
        setIsLoading(true);
        setError('');

        try {
            // TODO: Implement actual search logic in next commit
            setSearchResults([]);
        } catch (err) {
            setError(__('Search failed', 'dmg-read-more'));
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
                    {posts.map(post => (
                        <li key={post.id} style={{ marginBottom: '8px' }}>
                            <Button
                                variant="secondary"
                                onClick={() => selectPost(post)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    whiteSpace: 'normal',
                                    height: 'auto',
                                    padding: '8px'
                                }}
                            >
                                {post.title.rendered || __('(No title)', 'dmg-read-more')}
                            </Button>
                        </li>
                    ))}
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
                            onClick={searchPosts}
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

                    {/* Show recent posts by default */}
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
