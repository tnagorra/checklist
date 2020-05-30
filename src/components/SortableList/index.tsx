import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FiMeh } from 'react-icons/fi';
import { _cs } from '@togglecorp/fujs';

import Draggable from '../Draggable';

import styles from './styles.css';

interface Position {
    x: number;
    y: number;
}

interface Props<T, K, P> {
    className?: string;
    height: number;
    items: T[];
    keySelector: (item: T) => K;
    visibleSelector: (item: T) => boolean;
    lowerLimitSelector?: (item: T) => boolean;
    renderer: React.ComponentType<P>;
    rendererClassName?: string;
    rendererParams: (key: K, datum: T, index: number, data: T[]) => P;
    onChange: (items: T[]) => void;
}

function SortableList<T, K extends string | number, P>(props: Props<T, K, P>) {
    const {
        className,
        items,
        height,
        keySelector,
        visibleSelector,
        renderer: Renderer,
        rendererParams,
        rendererClassName,
        onChange,
        lowerLimitSelector,
    } = props;

    const filteredItems = useMemo(
        () => items.filter(visibleSelector),
        [items, visibleSelector],
    );

    const [dragOrder, setDragOrder] = useState(filteredItems);

    const [draggedIndex, setDraggedIndex] = useState<K | undefined>();

    // NOTE: just dropped item should not be transitioned
    const [droppedIndex, setDroppedIndex] = useState<K | undefined>();


    useEffect(
        () => {
            setDragOrder(filteredItems);
        },
        [filteredItems],
    );

    // TODO: throttle this
    const handleDrag = useCallback(
        ({ translation, id }: { translation: Position; id: K }) => {
            const delta = Math.round(translation.y / height);
            const index = filteredItems.findIndex(i => keySelector(i) === id);
            const myItem = filteredItems[index];

            if (lowerLimitSelector && lowerLimitSelector(myItem)) {
                return;
            }

            const newIndex = index + delta;
            const lowerIndex = lowerLimitSelector
                ? filteredItems.findIndex(item => lowerLimitSelector(item))
                : -1;
            if (
                newIndex < 0
                || newIndex > (lowerIndex !== -1 ? lowerIndex - 1 : filteredItems.length)
            ) {
                return;
            }

            const newDragOrder = filteredItems.filter(i => keySelector(i) !== id);
            newDragOrder.splice(newIndex, 0, myItem);
            setDragOrder(newDragOrder);

            setDraggedIndex(id);
            setDroppedIndex(undefined);
        },
        [filteredItems, height, keySelector, lowerLimitSelector],
    );

    const handleDragEnd = useCallback(
        ({ translation, id }: { translation: Position; id: K }) => {
            const delta = Math.round(translation.y / height);
            const index = filteredItems.findIndex(i => keySelector(i) === id);
            const myItem = filteredItems[index];

            const newIndex = index + delta;
            if (newIndex >= 0 && newIndex <= filteredItems.length) {
                const displacedItem = filteredItems[newIndex];
                const placeToDropIrl = items.findIndex(
                    item => keySelector(item) === keySelector(displacedItem),
                );
                const newItems = items.filter(i => keySelector(i) !== id);
                newItems.splice(placeToDropIrl, 0, myItem);
                onChange(newItems);
            }
            setDroppedIndex(id);
            setDraggedIndex(undefined);
        },
        [items, filteredItems, height, keySelector, onChange],
    );

    if (filteredItems.length <= 0) {
        return (
            <div className={_cs(className, styles.emptyMessage)}>
                <FiMeh className={styles.icon} />
                <span>Nothing here</span>
            </div>
        );
    }

    return (
        <div
            className={_cs(
                styles.list,
                className,
            )}
            style={{
                // NOTE: I have no idea why 2px works
                height: `${filteredItems.length * height}px`,
            }}
        >
            {filteredItems.map((item, i) => {
                const key = keySelector(item);
                const isDragging = draggedIndex === key;
                const isDropped = droppedIndex === key;
                const top = dragOrder.findIndex(o => keySelector(o) === key) * (height);
                const draggedTop = filteredItems.findIndex(o => keySelector(o) === key) * (height);
                const myTop = isDragging ? draggedTop : top;

                const style: React.CSSProperties = {
                    height: `${height}px`,
                    top: `${myTop}px`,
                };

                const extraProps = rendererParams(key, item, i, items);

                const children = (
                    <Renderer
                        key={key}
                        className={rendererClassName}
                        {...extraProps}
                    />
                );

                return (
                    <Draggable
                        className={_cs(
                            styles.item,
                            (isDragging || isDropped) && styles.nonTransitionable,
                            draggedIndex && styles.nonSelectable,
                        )}
                        key={String(key)}
                        id={key}
                        disabled={lowerLimitSelector && lowerLimitSelector(item)}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        style={style}
                    >
                        {children}
                    </Draggable>
                );
            })}
        </div>
    );
}

export default SortableList;
