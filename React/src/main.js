import React from 'react';
import { HashRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App';


const rootElement = document.getElementById('app') 
const root = createRoot(rootElement);
root.render(
    <HashRouter>
        <App />
    </HashRouter>,
);