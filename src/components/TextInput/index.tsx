import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Input, { Props as InputProps } from '../Input';
import RawInput, { Props as RawInputProps } from '../RawInput';
import styles from './styles.css';

export interface Props extends Omit<InputProps, 'children'>, RawInputProps {
    inputClassName?: string;
}

function TextInput(props: Props) {
    const {
        className,
        labels,
        icons,
        actions,
        inputClassName,
        ...otherProps
    } = props;

    return (
        <Input
            className={_cs(styles.textInput, className)}
            labels={labels}
            icons={icons}
            actions={actions}
        >
            <RawInput
                className={inputClassName}
                type="text"
                {...otherProps}
            />
        </Input>
    );
}

export default TextInput;
