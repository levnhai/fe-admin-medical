import React from 'react';
import ReactDOM from 'react-dom/client';
import i18n from './translation/i18n';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import GlobalStyles from './components/globalStyles';

import App from './App';
import Store from './redux/store';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={Store}>
    <GlobalStyles>
      <React.StrictMode>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </React.StrictMode>
    </GlobalStyles>
  </Provider>,
);
