import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

const Edit = ({ attributes, setAttributes }) => {
    const { postId, postTitle, postUrl } = attributes;
    const blockProps = useBlockProps();

    return (
        <div {...blockProps}>
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
