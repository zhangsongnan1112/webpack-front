import React from 'react';
import { HashRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App';
import { init } from '@rematch/core';
import { Provider } from 'react-redux';
import models  from  './store'
// import reduxStore from './reduxStore'


const store = init({
    models,
});

window.addEventListener('error', (error) => { 
    console.log('error', error)
 })

const rootElement = document.getElementById('app') 
const root = createRoot(rootElement);
root.render(
    <HashRouter>
        <Provider store={store}>
            <App />
        </Provider>
    </HashRouter>,
);