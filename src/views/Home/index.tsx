import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { _cs, randomString, isDefined, intersection } from '@togglecorp/fujs';

import SortableList from '#components/SortableList';

import TagItem from './TagItem';
import Item from './Item';

import { Tag, ChecklistItem } from './types';
import { tags, tagsMapping } from './tags';

import styles from './styles.css';

function hasAll<T>(foo: T[] | undefined, bar: T[] | undefined) {
    if (!bar || bar.length <= 0) {
        return true;
    }
    if (!foo) {
        return false;
    }
    const fooSet = new Set(foo);
    const barSet = new Set(bar);
    const commonSet = intersection(fooSet, barSet);
    return commonSet.size === barSet.size;
}

const keySelector = (item: ChecklistItem) => item.key;

interface Props {
    className?: string;
}

const Home = (props: Props) => {
    const { className } = props;

    const [focusedItem, setFocusedItem] = useState<string | undefined>();
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [filters, setFilters] = useState<string[]>([]);

    const handleTagItemClick = useCallback(
        (item: string) => {
            setFilters((oldFilters) => {
                const index = oldFilters.findIndex(f => f === item);
                let newFilters = [...oldFilters];
                if (index === -1) {
                    const tag = tagsMapping[item];
                    if (tag) {
                        newFilters = newFilters.filter(
                            f => tagsMapping[f]?.groupName !== tag.groupName,
                        );
                    }
                    newFilters.push(item);
                } else {
                    newFilters.splice(index, 1);
                }
                return newFilters;
            });
        },
        [],
    );

    const handleFocusOut = useCallback(
        () => {
            setFocusedItem(undefined);
        },
        [],
    );

    const handleEdit = useCallback(
        (value: string, key: string) => {
            setItems((stateItems) => {
                const filteredStateItems = stateItems.filter(item => !item.archived);
                const filteredIndex = filteredStateItems.findIndex(item => item.key === key);
                const isLastElement = filteredIndex === filteredStateItems.length - 1;

                const index = stateItems.findIndex(item => item.key === key);
                if (index === -1) {
                    console.error('Cannot find element to edit');
                    return stateItems;
                }

                const item = stateItems[index];
                const newStateItems = [...stateItems];
                newStateItems.splice(index, 1, { ...item, value });
                if (isLastElement) {
                    newStateItems.push({ key: randomString(), value: '' });
                }
                return newStateItems;
            });
        },
        [],
    );

    const handleTagDrop = useCallback(
        (tag: Tag, key: string) => {
            setItems((stateItems) => {
                const filteredStateItems = stateItems.filter(item => !item.archived);
                const filteredIndex = filteredStateItems.findIndex(item => item.key === key);
                const isLastElement = filteredIndex === filteredStateItems.length - 1;

                if (isLastElement) {
                    return stateItems;
                }

                const index = stateItems.findIndex(item => item.key === key);
                if (index === -1) {
                    console.error('Cannot find element to edit');
                    return stateItems;
                }

                const item = stateItems[index];
                const newItem = { ...item };
                if (!newItem.tags || newItem.tags.length <= 0) {
                    newItem.tags = [tag.title];
                } else {
                    newItem.tags = newItem.tags.filter(
                        i => tagsMapping[i].groupName !== tag.groupName,
                    );
                    newItem.tags.push(tag.title);
                }
                const newStateItems = [...stateItems];
                newStateItems.splice(index, 1, newItem);
                return newStateItems;
            });
        },
        [],
    );
    const handleTagRemove = useCallback(
        (tagName: string, key: string) => {
            setItems((stateItems) => {
                const filteredStateItems = stateItems.filter(item => !item.archived);
                const filteredIndex = filteredStateItems.findIndex(item => item.key === key);
                const isLastElement = filteredIndex === filteredStateItems.length - 1;

                if (isLastElement) {
                    return stateItems;
                }

                const index = stateItems.findIndex(item => item.key === key);
                if (index === -1) {
                    console.error('Cannot find element to edit');
                    return stateItems;
                }

                const item = stateItems[index];
                const newItem = { ...item };
                if (newItem.tags) {
                    newItem.tags = newItem.tags.filter(tag => tag !== tagName);
                }
                const newStateItems = [...stateItems];
                newStateItems.splice(index, 1, newItem);
                return newStateItems;
            });
        },
        [],
    );

    const handleArchiveToggle = useCallback(
        (key: string) => {
            setItems((stateItems) => {
                const index = stateItems.findIndex(item => item.key === key);
                if (index === -1) {
                    console.error('Cannot find element to archive');
                    return stateItems;
                }
                const item = stateItems[index];
                const newStateItems = [...stateItems];
                newStateItems.splice(index, 1, { ...item, archived: !item.archived });
                return newStateItems;
            });
        },
        [],
    );

    const handleDelete = useCallback(
        (key: string) => {
            setItems((stateItems) => {
                const index = stateItems.findIndex(item => item.key === key);
                if (index === -1) {
                    console.error('Cannot find element to delete');
                    return stateItems;
                }
                const newStateItems = [...stateItems];
                newStateItems.splice(index, 1);
                return newStateItems;
            });
        },
        [],
    );

    const activeItems = useMemo(
        () => items.filter(item => !item.archived),
        [items],
    );

    const archivedItems = useMemo(
        () => items.filter(item => !!item.archived),
        [items],
    );

    const handleKeyDown = useCallback(
        (
            key: string,
            value: string,
            name: string,
            event: React.KeyboardEvent<HTMLInputElement>,
        ) => {
            if (key === 'Enter') {
                event.preventDefault();

                const index = activeItems.findIndex(item => item.key === name);
                if (index === -1) {
                    return;
                }

                // No need to go further if it is the last element
                if (index !== activeItems.length - 1) {
                    const newItem = activeItems[index + 1];
                    setFocusedItem(newItem.key);
                }
            } else if (key === 'Backspace') {
                if (value !== '') {
                    return;
                }

                event.preventDefault();

                const index = activeItems.findIndex(item => item.key === name);
                // NOTE: lets not delete the last item
                if (index === -1 || index === activeItems.length - 1) {
                    return;
                }

                handleDelete(name);

                if (index !== activeItems.length - 1) {
                    const newItem = activeItems[index + 1];
                    setFocusedItem(newItem.key);
                }
            }
        },
        [activeItems, handleDelete],
    );

    // TODO: memoize this
    const activeItemRendererParams = (_: string, item: ChecklistItem, index: number) => ({
        item,
        focusedItem,
        onDelete: handleDelete,
        onEdit: handleEdit,
        onFocusOut: handleFocusOut,
        onKeyDown: handleKeyDown,
        onArchiveToggle: handleArchiveToggle,
        onTagDrop: handleTagDrop,
        onTagRemove: handleTagRemove,
        lastItem: index === activeItems.length - 1,
        tagsMapping,
    });

    // TODO: memoize this
    const archivedItemRendererParams = (_: string, item: ChecklistItem) => ({
        item,
        focusedItem,
        onDelete: handleDelete,
        onEdit: handleEdit,
        onFocusOut: handleFocusOut,
        onKeyDown: handleKeyDown,
        onArchiveToggle: handleArchiveToggle,
        onTagDrop: handleTagDrop,
        onTagRemove: handleTagRemove,
        lastItem: false,
        tagsMapping,
        readOnly: true,
    });

    const lowerLimitSelector = useCallback(
        (item: ChecklistItem) => {
            const locationInItem = activeItems.findIndex(i => i.key === item.key);
            return locationInItem === activeItems.length - 1;
        },
        [activeItems],
    );

    const [rehydrating, setRehydrating] = useState(true);

    // TODO: memoize this
    const allTags = activeItems
        ?.map(item => item.tags)
        .flat()
        .filter(isDefined);

    const isActive = useCallback(
        (item: ChecklistItem) => (
            !item.archived && hasAll(item.tags, filters)
        ),
        [filters],
    );

    const isArchived = useCallback(
        (item: ChecklistItem) => (
            !!item.archived && hasAll(item.tags, filters)
        ),
        [filters],
    );

    // Load items from storage
    useEffect(
        () => {
            chrome.storage.local.get(['items'], (storedItems) => {
                const safeStoredItems = storedItems as { items: ChecklistItem[] };
                if (safeStoredItems.items && safeStoredItems.items.length > 0) {
                    setItems(safeStoredItems.items);
                } else {
                    setItems([
                        { key: '0', value: '' },
                    ]);
                }
                setRehydrating(false);
            });
        },
        [],
    );

    // Set items to storage
    useEffect(
        () => {
            if (rehydrating) {
                return;
            }

            chrome.storage.local.set({
                items,
            });
        },
        [items, rehydrating],
    );

    if (rehydrating) {
        return null;
    }

    return (
        <div className={_cs(className, styles.home)}>
            <div className={styles.content}>
                {activeItems.length > 0 && (
                    <>
                        <h3 className={styles.header}>
                            Todo
                        </h3>
                        <SortableList
                            items={items}
                            onChange={setItems}
                            height={32}
                            keySelector={keySelector}
                            visibleSelector={isActive}
                            lowerLimitSelector={lowerLimitSelector}
                            renderer={Item}
                            rendererParams={activeItemRendererParams}
                        />
                    </>
                )}
                {archivedItems.length > 0 && (
                    <>
                        <h3 className={styles.header}>
                            Done
                        </h3>
                        <SortableList
                            items={items}
                            onChange={setItems}
                            height={32}
                            keySelector={keySelector}
                            visibleSelector={isArchived}
                            renderer={Item}
                            rendererParams={archivedItemRendererParams}
                        />
                    </>
                )}
            </div>
            <div className={styles.footer}>
                <div
                    className={styles.header}
                >
                    Tags
                </div>
                <div className={styles.tags}>
                    {tags.map((tag, index) => (
                        <TagItem
                            className={_cs(
                                index !== tags.length - 1
                                && tags[index + 1].groupName !== tag.groupName
                                && styles.breaker,
                            )}
                            key={tag.title}
                            tag={tag}
                            tagTitle={tag.title}
                            draggable
                            title={`${tag.groupName}: ${tag.title}`}
                            // TODO: could be optimized later
                            count={allTags?.filter(t => t === tag.title).length}
                            selected={filters.includes(tag.title)}
                            onClick={handleTagItemClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
