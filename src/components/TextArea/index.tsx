import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Input, { Props as InputProps } from '../Input';
import RawTextArea, { Props as RawTextAreaProps } from '../RawTextArea';
import styles from './styles.css';

export interface Props extends Omit<InputProps, 'children'>, RawTextAreaProps {
    inputClassName?: string;
}

function TextArea(props: Props) {
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
            className={_cs(styles.textArea, className)}
            labels={labels}
            icons={icons}
            actions={actions}
        >
            <RawTextArea
                className={inputClassName}
                {...otherProps}
            />
        </Input>
    );
}

export default TextArea;
