import style from './defaultLayout.module.scss';
import classNames from 'classnames/bind';
import React, { useState } from 'react';

// import Header from '../components/header';
// import Footer from '../components/footer';
import Sidebar from '~/scenes/global/Sidebar';
import Topbar from '~/scenes/global/Topbar';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ColorModeContext, useMode } from '../../theme';
// import Sidebar from '../components/sidebar/Sidebar';

const cx = classNames.bind(style);

function DefaultLayout({ children }) {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  return (
    // <div className={cx('wrapper')}>
    //   <div>
    //     <Sidebar />
    //   </div>
    //   <div className={cx('container')}>
    //     <div className={cx('content')}>{children}</div>
    //   </div>
    // </div>
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {/* <Sidebar /> */}
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <div className={cx('content')}>{children}</div>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
export default DefaultLayout;
