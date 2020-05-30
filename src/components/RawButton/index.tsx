import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

type ButtonType = 'button' | 'submit' | 'reset';

export interface Props extends Omit<React.HTMLProps<HTMLButtonElement>, 'onClick' | 'ref' | 'type'>{
    className?: string;
    onClick?: (name: string, e: React.MouseEvent<HTMLButtonElement>) => void;
    // elementRef: React.RefObject<HTMLButtonElement>;
    type: ButtonType;
    variant?: 'danger';
}

function RawButton(props: Props) {
    const {
        className,
        onClick,
        type,
        variant,
        ...otherProps
    } = props;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const {
            currentTarget: {
                name,
            },
        } = e;

        if (onClick) {
            onClick(name, e);
        }
    };

    return (
        // eslint-disable-next-line react/button-has-type
        <button
            type={type}
            className={_cs(
                className,
                styles.rawButton,
                variant === 'danger' && styles.danger,
            )}
            onClick={onClick ? handleClick : undefined}
            {...otherProps}
        />
    );
}
RawButton.defaultProps = {
    type: 'button',
};

export default RawButton;
