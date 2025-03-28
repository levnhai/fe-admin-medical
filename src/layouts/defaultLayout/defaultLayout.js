import style from './defaultLayout.module.scss';
import classNames from 'classnames/bind';
import React, { useState } from 'react';

import Sidebar from '~/scenes/global/Sidebar';
import Topbar from '~/scenes/global/Topbar';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ColorModeContext, useMode } from '../../theme';

const cx = classNames.bind(style);

function DefaultLayout({ children }) {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {/* <Sidebar /> */}
          <div className={cx('sidebar')}>
            <Sidebar isSidebar={isSidebar} />
          </div>
          <main className={cx('body')}>
            <div className={cx('header')}>
              <Topbar setIsSidebar={setIsSidebar} />
            </div>
            <div className={cx('content')}>{children}</div>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
export default DefaultLayout;
