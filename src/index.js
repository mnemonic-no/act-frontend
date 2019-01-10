import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-roboto';

import './index.css';
import App from './App';

const rootEl = document.getElementById('root');

ReactDOM.render(<App />, rootEl);

// Hot reloading
// https://medium.com/superhighfives/hot-reloading-create-react-app-73297a00dcad
if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    ReactDOM.render(<NextApp />, rootEl);
  });
}
