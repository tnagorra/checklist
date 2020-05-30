import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Position {
    x: number;
    y: number;
}


const POSITION: Position = {
    x: 0,
    y: 0,
};

interface Props<T> {
    children: React.ReactElement;
    id: T;
    onDrag: (attr: { translation: Position; id: T }) => void;
    onDragEnd: (attr: { translation: Position; id: T }) => void;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

function Draggable<T extends string | number>(props: Props<T>) {
    const {
        children,
        id,
        onDrag,
        onDragEnd,
        className,
        style,
        disabled,
    } = props;

    const [state, setState] = useState({
        isDragging: false,
        origin: POSITION,
        translation: POSITION,
    });

    const timeoutRef = useRef<number | undefined>();

    const handleMouseDown = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            const { button, clientX, clientY } = event;
            if (button !== 0) {
                return;
            }
            timeoutRef.current = window.setTimeout(
                () => {
                    timeoutRef.current = undefined;
                    setState(prevState => ({
                        ...prevState,
                        isDragging: true,
                        origin: { x: clientX, y: clientY },
                    }));
                },
                50,
            );
        },
        [],
    );
    const handleMouseUp = useCallback(
        () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = 0;
            }
        },
        [],
    );

    const handleDrag = useCallback(
        ({ clientX, clientY }) => {
            const translation = {
                x: clientX - state.origin.x,
                y: clientY - state.origin.y,
            };

            setState(prevState => ({
                ...prevState,
                translation,
            }));

            onDrag({ translation, id });
        },
        [state.origin, onDrag, id],
    );

    const handleDragEnd = useCallback(
        ({ clientX, clientY }) => {
            const translation = {
                x: clientX - state.origin.x,
                y: clientY - state.origin.y,
            };

            setState(prevState => ({
                ...prevState,
                translation: POSITION,
                isDragging: false,
            }));

            onDragEnd({ translation, id });
        },
        [state.origin, onDragEnd, id],
    );

    useEffect(
        () => {
            if (!state.isDragging) {
                return () => {};
            }

            window.addEventListener('mousemove', handleDrag);
            window.addEventListener('mouseup', handleDragEnd);

            return () => {
                window.removeEventListener('mousemove', handleDrag);
                window.removeEventListener('mouseup', handleDragEnd);

                setState(prevState => ({
                    ...prevState,
                    translation: POSITION,
                }));
            };
        },
        [state.isDragging, handleDrag, handleDragEnd],
    );

    const divStyle: React.CSSProperties = useMemo(
        () => ({
            ...style,
            transform: `translate(0px, ${state.translation.y}px)`,
        }),
        [state.translation, style],
    );

    const childProps = {
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
    };

    return (
        <div
            style={divStyle}
            className={_cs(
                className,
                styles.draggable,
                state.isDragging && styles.dragging,
            )}
        >
            {disabled ? children : React.cloneElement(children, childProps)}
        </div>
    );
}

export default Draggable;
