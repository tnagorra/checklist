import React from 'react';
import ReactDOM from 'react-dom';

import Root from './Root';

console.info('React version', React.version);

const rootElement = document.getElementById('checklist-root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<Root />);
} else {
    console.error('Root element was not found');
}
