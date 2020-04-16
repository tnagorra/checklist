import React, { useEffect, useRef, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props extends Omit<React.HTMLProps<HTMLTextAreaElement>, 'onChange'>{
    className?: string;
    onChange: (value: string, name: string) => void;
}

function RawTextArea(props: Props) {
    const {
        className,
        onChange,
        value,
        ...otherProps
    } = props;

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = '0px';
            const { scrollHeight } = textAreaRef.current;
            textAreaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [value]);

    const handleChange = useCallback(
        (e: React.FormEvent<HTMLTextAreaElement>) => {
            const {
                currentTarget: {
                    value: newValue,
                    name,
                },
            } = e;

            onChange(newValue, name);
        },
        [onChange],
    );

    return (
        <textarea
            ref={textAreaRef}
            onChange={handleChange}
            className={_cs(className, styles.rawTextArea)}
            value={value}
            {...otherProps}
        />
    );
}

export default RawTextArea;
