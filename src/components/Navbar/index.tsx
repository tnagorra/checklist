import React from 'react';
import { NavLink } from 'react-router-dom';
// import { FiSettings } from 'react-icons/fi';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

const Navbar = (props: Props) => {
    const { className } = props;

    return (
        <nav className={_cs(className, styles.navbar)}>
            <NavLink
                exact
                className={styles.appBrand}
                activeClassName={styles.active}
                to="/index.html"
            >
                checklist
            </NavLink>
            {/*
            <div className={styles.navLinks}>
                <NavLink
                    exact
                    className={styles.link}
                    activeClassName={styles.active}
                    to="/settings/"
                >
                    <FiSettings />
                </NavLink>
            </div>
            */}
        </nav>
    );
};

export default Navbar;
