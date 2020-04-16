import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props {
    className?: string;
    labels?: React.ReactNode;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactElement<any>;
}

function Input(props: Props) {
    const {
        className,
        labels,
        icons,
        actions,
        children,
    } = props;

    return (
        <div className={_cs(styles.inputContainer, className)}>
            {labels && (
                <div className={styles.label}>
                    { labels }
                </div>
            )}
            <div className={styles.main}>
                { icons && (
                    <div className={styles.icons}>
                        { icons }
                    </div>
                )}
                {React.cloneElement(
                    children,
                    { className: _cs(children.props.className, styles.input) },
                )}
                { actions && (
                    <div className={styles.actions}>
                        { actions }
                    </div>
                )}
            </div>
        </div>
    );
}

export default Input;
