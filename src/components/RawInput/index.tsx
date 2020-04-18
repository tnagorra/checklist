import React, { useRef, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange' | 'onKeyUp'>{
    className?: string;
    onChange: (value: string, name: string) => void;
    onKeyUp?: (key: string, value: string, name: string) => void;
    focused?: boolean;
}

function RawInput(props: Props) {
    const {
        className,
        onChange,
        onKeyUp,
        focused,
        ...otherProps
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        const {
            currentTarget: {
                value,
                name,
            },
        } = e;

        onChange(value, name);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const {
            key,
            currentTarget: {
                value,
                name,
            },
        } = e;

        if (onKeyUp) {
            onKeyUp(key, value, name);
        }
    };

    useEffect(
        () => {
            const { current: inputElement } = inputRef;
            if (focused && inputElement) {
                inputElement.focus();
            }
        },
        [focused],
    );

    return (
        <input
            ref={inputRef}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            className={_cs(className, styles.rawInput)}
            {...otherProps}
        />
    );
}

export default RawInput;
