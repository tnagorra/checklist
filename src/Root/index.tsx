import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

interface Props {
}

const Root = (props: Props) => (
    <BrowserRouter>
        <App {...props} />
    </BrowserRouter>
);

export default Root;
