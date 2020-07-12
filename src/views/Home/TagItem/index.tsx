import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import { Tag } from '../types';
import styles from './styles.css';

interface TagItemProps {
    tag: Tag | undefined;
    tagTitle: string;
    minimal?: boolean;
    draggable?: boolean;
    onClick?: (tag: string) => void;
    title?: string;
    count?: number;
    selected?: boolean;
    className?: string;
}

function TagItem(props: TagItemProps) {
    const {
        tagTitle,
        tag,
        minimal,
        draggable,
        onClick,
        title,
        count,
        selected,
        className,
    } = props;

    const handleDragStart = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.dataTransfer.dropEffect = 'copy';
            e.dataTransfer.setData('text/plain', JSON.stringify(tag));
        },
        [tag],
    );

    const handleClick = useCallback(
        () => {
            if (onClick) {
                onClick(tagTitle);
            }
        },
        [tagTitle, onClick],
    );

    return (
        <div
            className={_cs(
                className,
                styles.tag,
                minimal && styles.minimal,
                draggable && styles.draggable,
                selected && styles.selected,
                !!onClick && styles.clickable,
            )}
            title={title}
            style={{
                backgroundColor: tag?.color || 'hsl(0, 0%, 90%)',
            }}
            role="presentation"
            draggable={draggable}
            onDragStart={handleDragStart}
            onClick={handleClick}
        >
            {minimal ? (
                <span>
                    {tagTitle.slice(0, 2).toLowerCase()}
                </span>
            ) : (
                <>
                    {count && count > 0 && (
                        <b className={styles.count}>
                            {count}
                        </b>
                    )}
                    <span>
                        {tagTitle}
                    </span>
                </>
            )}
        </div>
    );
}

export default TagItem;
