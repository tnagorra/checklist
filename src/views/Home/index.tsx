import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { _cs, randomString, isDefined, intersection, listToMap } from '@togglecorp/fujs';
import { FiTrash2 } from 'react-icons/fi';

import RawButton from '#components/RawButton';
import SortableList from '#components/SortableList';

import TagItem from './TagItem';
import Item from './Item';

import { Tag, ChecklistItem } from './types';
import defaultTags from './tags';

import styles from './styles.css';

function getCounts(values: string[]) {
    const mapping: {
        [key: string]: number | undefined;
    } = {};
    values.forEach((value) => {
        const mappingValue = mapping[value];
        mapping[value] = isDefined(mappingValue)
            ? mappingValue + 1
            : 1;
    });
    return mapping;
}

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

function Home(props: Props) {
    const { className } = props;

    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    const [filters, setFilters] = useState<string[]>([]);
    const [focusedItem, setFocusedItem] = useState<string | undefined>();
    // TODO: move rehydrating logic outside Home component
    const [rehydrating, setRehydrating] = useState(true);

    const tagsMapping: {
        [key: string]: Tag & { order: number } | undefined;
    } = useMemo(
        () => listToMap(
            tags,
            item => item.title.toLocaleLowerCase(),
            (item, _, i) => ({
                ...item,
                order: i,
            }),
        ),
        [tags],
    );

    const activeItems = useMemo(
        () => items.filter(item => !item.archived),
        [items],
    );

    const archivedItems = useMemo(
        () => items.filter(item => !!item.archived),
        [items],
    );

    const tagsUsageMapping = useMemo(
        () => {
            const tgs = activeItems
                .map(item => item.tags)
                .filter(isDefined)
                .flat()
                .filter(isDefined)
                .map(item => item.toLowerCase());
            return getCounts(tgs);
        },
        [activeItems],
    );

    const usedTags = useMemo(
        () => tags.filter((tag) => {
            if (tag.groupName !== 'Custom') {
                return true;
            }
            const usageCount = tagsUsageMapping[tag.title.toLowerCase()];
            return isDefined(usageCount) && usageCount > 0;
        }),
        [tags, tagsUsageMapping],
    );

    const handleTagItemClick = useCallback(
        (item: string) => {
            setFilters((oldFilters) => {
                const index = oldFilters.findIndex(f => f === item);
                let newFilters = [...oldFilters];
                if (index === -1) {
                    const tag = tagsMapping[item.toLowerCase()];
                    if (tag) {
                        newFilters = newFilters.filter(
                            f => tagsMapping[f.toLowerCase()]?.groupName !== tag.groupName,
                        );
                    }
                    newFilters.push(item);
                } else {
                    newFilters.splice(index, 1);
                }
                return newFilters;
            });
        },
        [tagsMapping],
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
                    newItem.tags = [];
                } else {
                    newItem.tags = newItem.tags.filter(i => (
                        tagsMapping[i.toLowerCase()]?.groupName !== tag.groupName
                    ));
                }
                newItem.tags.push(tag.title);
                const newStateItems = [...stateItems];
                newStateItems.splice(index, 1, newItem);
                return newStateItems;
            });
        },
        [tagsMapping],
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

    const isArchived = useCallback(
        (item: ChecklistItem) => (
            !!item.archived && hasAll(item.tags, filters)
        ),
        [filters],
    );

    const archivedFilteredItems = useMemo(() => (
        items.filter(item => !!item.archived && hasAll(item.tags, filters))
    ), [items, filters]);

    const handleDeleteAllCompleted = useCallback(() => {
        setItems(stateItems => stateItems.filter(item => !isArchived(item)));
    }, [setItems, isArchived]);

    const handleKeyDown = useCallback(
        (
            key: string,
            value: string,
            name: string,
            event: React.KeyboardEvent<HTMLInputElement>,
        ) => {
            if (key === ' ' || key === 'Tab' || key === 'Enter') {
                const matching = /\s+@\w+$/;
                const match = value.match(matching);
                if (match) {
                    event.preventDefault();

                    const newValue = value.slice(0, value.length - match[0].length);
                    handleEdit(newValue, name);

                    const newColor = Math.floor(Math.random() * 360);

                    // Trim so that we remove all the white space
                    // Slice to remove the initial @ symbol
                    const tagName = match[0].trim().slice(1);

                    const tag = tagsMapping[tagName.toLowerCase()];

                    if (tag) {
                        handleTagDrop(tag, name);
                    } else {
                        const newTag: Tag = {
                            color: `hsl(${newColor}, 100%, 85%)`,
                            title: tagName,
                            groupName: 'Custom',
                        };
                        setTags((myTags) => {
                            if (myTags.find(item => item.title === tagName)) {
                                return myTags;
                            }
                            return [
                                ...myTags,
                                newTag,
                            ];
                        });
                        handleTagDrop(newTag, name);
                    }
                    return;
                }
            }

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
        [activeItems, handleDelete, handleEdit, handleTagDrop, tagsMapping],
    );

    const activeItemRendererParams = useCallback(
        (_: string, item: ChecklistItem, index: number) => ({
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
        }),
        [
            handleDelete, handleEdit, handleArchiveToggle,
            handleFocusOut, handleKeyDown,
            handleTagDrop, handleTagRemove,
            activeItems.length, focusedItem, tagsMapping,
        ],
    );

    const archivedItemRendererParams = useCallback(
        (_: string, item: ChecklistItem) => ({
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
        }),
        [
            handleDelete, handleEdit, handleArchiveToggle,
            handleFocusOut, handleKeyDown,
            handleTagDrop, handleTagRemove,
            focusedItem, tagsMapping,
        ],
    );

    const lowerLimitSelector = useCallback(
        (item: ChecklistItem) => {
            const locationInItem = activeItems.findIndex(i => i.key === item.key);
            return locationInItem === activeItems.length - 1;
        },
        [activeItems],
    );

    const isActive = useCallback(
        (item: ChecklistItem) => (
            !item.archived && hasAll(item.tags, filters)
        ),
        [filters],
    );

    // Load items from storage
    useEffect(
        () => {
            chrome.storage.local.get(['items', 'tags'], (storedItems) => {
                interface Storage {
                    items: ChecklistItem[] | undefined;
                    tags: Tag[] | undefined;
                }

                const safeStoredItems = storedItems as Storage;

                if (safeStoredItems.items && safeStoredItems.items.length > 0) {
                    setItems(safeStoredItems.items);
                } else {
                    setItems([
                        { key: '0', value: '' },
                    ]);
                }

                if (safeStoredItems.tags && safeStoredItems.tags.length > 0) {
                    setTags(safeStoredItems.tags);
                } else {
                    setTags(defaultTags);
                }

                setRehydrating(false);
            });
        },
        [],
    );

    // TODO: debounce writing to storage
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
    useEffect(
        () => {
            if (rehydrating) {
                return;
            }

            chrome.storage.local.set({
                tags: usedTags,
            });
        },
        [usedTags, rehydrating],
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
                        <div className={styles.heading}>
                            <h3 className={styles.header}>
                                Done
                            </h3>
                            {archivedFilteredItems.length > 0 && (
                                <RawButton
                                    className={styles.button}
                                    name="delete-all"
                                    onClick={handleDeleteAllCompleted}
                                    tabIndex={-1}
                                    title="Remove filtered done items"
                                    variant="danger"
                                >
                                    <FiTrash2 />
                                </RawButton>
                            )}
                        </div>
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
                        // Note: could have just shown usedTags but you
                        // can't clear out the filter if the badge just disappears
                        <TagItem
                            className={_cs(
                                index !== tags.length - 1
                                && tags[index + 1]?.groupName !== tag.groupName
                                && styles.breaker,
                            )}
                            key={tag.title}
                            tag={tag}
                            tagTitle={tag.title}
                            draggable
                            title={`${tag.groupName}: ${tag.title}`}
                            count={tagsUsageMapping[tag.title.toLowerCase()]}
                            selected={filters.includes(tag.title)}
                            onClick={handleTagItemClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;
