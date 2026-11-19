import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Theme } from '@carbon/react';
import '@carbon/charts-react/styles.css';
import './index.scss';
import './App.scss';
import App from './App.jsx';

// HashRouter: GitHub Pages serves static files only, so deep links must not need server rewrites.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Theme theme="g90">
        <App />
      </Theme>
    </HashRouter>
  </React.StrictMode>,
);
