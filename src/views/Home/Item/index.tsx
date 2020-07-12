import React, { useCallback, useMemo } from 'react';
import { FiSquare, FiCheckSquare, FiPlusSquare, FiTrash2 } from 'react-icons/fi';
import { FaGripVertical } from 'react-icons/fa';
import { _cs, compareNumber } from '@togglecorp/fujs';

import useDropHandler from '#components/useDropHandler';
import TextInput from '#components/TextInput';
import RawButton from '#components/RawButton';

import styles from './styles.css';

import { Tag, ChecklistItem } from '../types';
import TagItem from '../TagItem';

interface ItemProps {
    item: ChecklistItem;
    focusedItem: string | undefined;
    onDelete: (key: string) => void;
    onEdit: (value: string, key: string) => void;
    onKeyDown: (
        key: string,
        value: string,
        name: string,
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => void;
    onFocusOut: () => void;
    onArchiveToggle: (key: string) => void;
    onTagDrop: (tag: Tag, key: string) => void;
    onTagRemove: (tagName: string, key: string) => void;
    disabled?: boolean;
    readOnly?: boolean;
    lastItem?: boolean;

    onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onMouseUp?: () => void;
    tagsMapping: {
        [key: string]: Tag & { order: number } | undefined;
    };
}
function Item(props: ItemProps) {
    const {
        item,
        disabled,
        readOnly,
        focusedItem,
        lastItem,

        onMouseDown,
        onMouseUp,

        onDelete,
        onEdit,
        onFocusOut,
        onKeyDown,
        onArchiveToggle,
        onTagDrop,
        onTagRemove,

        tagsMapping,
    } = props;

    const handleDragEnter = useCallback(
        () => {
            // no-op
        },
        [],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            try {
                const data = e.dataTransfer.getData('text/plain');
                const parsedData = JSON.parse(data) as Tag;
                onTagDrop(parsedData, item.key);
            } catch (ex) {
                console.error(ex);
            }
        },
        [item.key, onTagDrop],
    );

    const {
        dropping,
        onDragOver,
        onDragEnter,
        onDragLeave,
        onDrop,
    } = useDropHandler(handleDragEnter, handleDrop);

    const handleTagRemove = useCallback(
        (tagName: string) => {
            onTagRemove(tagName, item.key);
        },
        [onTagRemove, item.key],
    );

    const sortedTags = useMemo(
        () => (
            item.tags && item.tags.length > 0
                ? [...item.tags]
                    .sort((a, b) => compareNumber(
                        tagsMapping[a.toLowerCase()]?.order,
                        tagsMapping[b.toLowerCase()]?.order,
                    ))
                : undefined
        ),
        [item.tags, tagsMapping],
    );

    return (
        <div
            className={_cs(
                styles.item,
                dropping && styles.dropping,
                lastItem && styles.lastItem,
            )}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <TextInput
                focused={focusedItem === item.key}
                className={styles.text}
                inputClassName={styles.textArea}
                name={item.key}
                onChange={onEdit}
                onBlur={onFocusOut}
                onKeyDown={onKeyDown}
                value={item.value}
                disabled={disabled}
                readOnly={readOnly}
                placeholder={
                    lastItem
                        ? 'Add new task'
                        : undefined
                }
                icons={!lastItem ? (
                    <RawButton
                        name={item.key}
                        onClick={onArchiveToggle}
                        tabIndex={-1}
                        title={item.archived ? 'Mark as todo' : 'Mark as done'}
                    >
                        {item.archived ? <FiCheckSquare /> : <FiSquare />}
                    </RawButton>
                ) : (
                    <RawButton
                        tabIndex={-1}
                        title="Add new task"
                        disabled
                    >
                        <FiPlusSquare />
                    </RawButton>
                )}
                actions={
                    !lastItem && (
                        <>
                            <RawButton
                                className={styles.deleteButton}
                                name={item.key}
                                onClick={onDelete}
                                tabIndex={-1}
                                title="Remove task"
                                variant="danger"
                            >
                                <FiTrash2 />
                            </RawButton>
                            <div
                                className={styles.grab}
                                role="presentation"
                                onMouseDown={onMouseDown}
                                onMouseMove={onMouseUp}
                                onMouseUp={onMouseUp}
                                title="Drag task"
                            >
                                <FaGripVertical />
                            </div>
                            {sortedTags && (
                                <div className={styles.tags}>
                                    {sortedTags.map(tag => (
                                        <TagItem
                                            key={tag}
                                            tagTitle={tag}
                                            tag={tagsMapping[tag.toLowerCase()]}
                                            minimal
                                            title={`Remove tag '${tag}'`}
                                            onClick={handleTagRemove}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )
                }
            />
        </div>
    );
}

export default Item;
