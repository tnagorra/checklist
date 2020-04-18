import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import { FiSquare, FiCheckSquare, FiPlus, FiTrash2 } from 'react-icons/fi';
import { _cs, randomString } from '@togglecorp/fujs';

import TextInput from '#components/TextInput';
import RawButton from '#components/RawButton';
import useDebounce from '#components/useDebounce';

import styles from './styles.css';

interface Item {
    key: string;
    value: string;
    archived?: boolean;
}

interface Props {
    className?: string;
}

const Home = (props: Props) => {
    const { className } = props;

    const [focusedItem, setFocusedItem] = useState<string | undefined>();
    const [items, setItems] = useState<Item[]>([]);

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

    const handleKeyUp = useCallback(
        (key: string, value: string, name: string) => {
            if (key === 'Enter') {
                const index = activeItems.findIndex(item => item.key === name);
                if (index !== -1 && index !== activeItems.length - 1) {
                    const newIndex = index + 1;
                    const newItem = activeItems[newIndex];
                    setFocusedItem(newItem.key);
                }
            } else if (key === 'Backspace' && value === '') {
                const index = activeItems.findIndex(item => item.key === name);
                if (index !== activeItems.length - 1) {
                    handleDelete(name);
                    if (index !== -1 && index !== 0) {
                        const newIndex = index - 1;
                        const newItem = activeItems[newIndex];
                        setFocusedItem(newItem.key);
                    }
                }
            }
        },
        [activeItems, handleDelete],
    );

    const [rehydrating, setRehydrating] = useState(true);
    useEffect(
        () => {
            chrome.storage.local.get(['items'], (storedItems) => {
                const safeStoredItems = storedItems as { items: Item[] };
                console.warn(safeStoredItems);
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

    const itemsCount = activeItems.length - 1;
    useEffect(
        () => {
            if (rehydrating) {
                return;
            }

            if (itemsCount === 0) {
                chrome.browserAction.setBadgeText({ text: '' });
            } else {
                chrome.browserAction.setBadgeText({ text: String(itemsCount) });
                chrome.browserAction.setBadgeBackgroundColor({
                    color: '#ff0000',
                });
            }
        },
        [itemsCount, rehydrating],
    );

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

    return (
        <div className={_cs(className, styles.home)}>
            {activeItems.length > 0 && (
                <h3>
                    Todo
                </h3>
            )}
            <CSSTransitionGroup
                className={styles.group}
                transitionName={{
                    enter: styles.enter,
                    enterActive: styles.enterActive,
                    leave: styles.leave,
                    leaveActive: styles.leaveActive,
                }}
                transitionEnterTimeout={300}
                transitionLeaveTimeout={300}
            >
                {activeItems.map((item, index) => (
                    <div
                        className={styles.item}
                        key={item.key}
                    >
                        <TextInput
                            focused={focusedItem === item.key}
                            className={styles.text}
                            inputClassName={styles.textArea}
                            // wrap="soft"
                            // rows={1}
                            // autoFocus={item.key === autoFocusKey}
                            name={item.key}
                            onChange={handleEdit}
                            onKeyUp={handleKeyUp}
                            value={item.value}
                            disabled={rehydrating}
                            placeholder={
                                index === activeItems.length - 1
                                    ? 'Add new task'
                                    : undefined
                            }
                            icons={index !== activeItems.length - 1 ? (
                                <RawButton
                                    className={styles.checkbox}
                                    name={item.key}
                                    onClick={handleArchiveToggle}
                                    tabIndex={-1}
                                    title="Mark as done"
                                >
                                    <FiSquare />
                                </RawButton>
                            ) : (
                                <RawButton
                                    className={styles.checkbox}
                                    // name={item.key}
                                    // onClick={handleArchiveToggle}
                                    tabIndex={-1}
                                    title="Add new task"
                                    disabled
                                >
                                    <FiPlus />
                                </RawButton>
                            )}
                            actions={
                                index !== activeItems.length - 1 && (
                                    <RawButton
                                        className={styles.deleteButton}
                                        name={item.key}
                                        onClick={handleDelete}
                                        tabIndex={-1}
                                        title="Delete"
                                    >
                                        <FiTrash2 />
                                    </RawButton>
                                )
                            }
                        />
                    </div>
                ))}
            </CSSTransitionGroup>
            {archivedItems.length > 0 && (
                <h3>
                    Done
                </h3>
            )}
            <CSSTransitionGroup
                className={styles.group}
                transitionName={{
                    enter: styles.enter,
                    enterActive: styles.enterActive,
                    leave: styles.leave,
                    leaveActive: styles.leaveActive,
                }}
                transitionEnterTimeout={300}
                transitionLeaveTimeout={300}
            >
                {archivedItems.map((item, index) => (
                    <div
                        className={styles.item}
                        key={item.key}
                    >
                        <TextInput
                            className={styles.text}
                            inputClassName={styles.textArea}
                            wrap="soft"
                            name={item.key}
                            onChange={handleEdit}
                            value={item.value}
                            rows={1}
                            disabled={rehydrating}
                            readOnly
                            icons={(
                                <RawButton
                                    className={styles.checkbox}
                                    name={item.key}
                                    onClick={handleArchiveToggle}
                                    tabIndex={-1}
                                    title="Mark as todo"
                                >
                                    <FiCheckSquare />
                                </RawButton>
                            )}
                            actions={(
                                <RawButton
                                    className={styles.deleteButton}
                                    name={item.key}
                                    onClick={handleDelete}
                                    tabIndex={-1}
                                    title="Delete"
                                >
                                    <FiTrash2 />
                                </RawButton>
                            )}
                        />
                    </div>
                ))}
            </CSSTransitionGroup>
        </div>
    );
};

export default Home;
