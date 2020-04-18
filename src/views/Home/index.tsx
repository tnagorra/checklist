import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
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
                console.warn(activeItems);
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
                    console.warn('focused item', newItem.key);
                    setFocusedItem(newItem.key);
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
                <h3 className={styles.header}>
                    {`Todo (${activeItems.length - 1})`}
                </h3>
            )}
            <TransitionGroup className={styles.group}>
                {activeItems.map((item, index) => (
                    <CSSTransition
                        key={item.key}
                        classNames={{
                            enter: styles.enter,
                            enterActive: styles.enterActive,
                            exit: styles.exit,
                            exitActive: styles.exitActive,
                        }}
                        timeout={{ enter: 300, exit: 300 }}
                    >
                        <div
                            className={styles.item}
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
                                onBlur={handleFocusOut}
                                onKeyDown={handleKeyDown}
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
                    </CSSTransition>
                ))}
            </TransitionGroup>
            {archivedItems.length > 0 && (
                <h3 className={styles.header}>
                    {`Done (${archivedItems.length})`}
                </h3>
            )}
            <TransitionGroup className={styles.group}>
                {archivedItems.map((item, index) => (
                    <CSSTransition
                        key={item.key}
                        classNames={{
                            enter: styles.enter,
                            enterActive: styles.enterActive,
                            exit: styles.exit,
                            exitActive: styles.exitActive,
                        }}
                        timeout={{ enter: 300, exit: 300 }}
                    >
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
                    </CSSTransition>
                ))}
            </TransitionGroup>
        </div>
    );
};

export default Home;
