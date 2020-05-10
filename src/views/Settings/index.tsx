import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

const Settings = (props: Props) => {
    const { className } = props;

    return (
        <div
            className={_cs(
                styles.settings,
                className,
            )}
        >
            N/A
        </div>
    );
};

export default Settings;
