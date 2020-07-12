import React from 'react';

import styles from './styles.css';

function FourHundredThree() {
    return (
        <div className={styles.fourHundredThree}>
            <h1 className={styles.heading}>
                403
            </h1>
            <p className={styles.message}>
                You do not have enough permissions to view this page.
            </p>
        </div>
    );
}

export default FourHundredThree;
