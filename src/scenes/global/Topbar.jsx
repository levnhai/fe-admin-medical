import { Box, IconButton, useTheme } from '@mui/material';
import { useContext, useState, useRef, useEffect } from 'react';
import { ColorModeContext, tokens } from '../../theme';
import InputBase from '@mui/material/InputBase';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SearchIcon from '@mui/icons-material/Search';
import classNames from 'classnames/bind';
import styles from './topbar.module.scss';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { IoPersonSharp } from 'react-icons/io5';

const cx = classNames.bind(styles);

const Topbar = () => {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  const btnLoginRef = useRef(null);
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const handleClickOusideModal = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && !btnLoginRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOusideModal);
    return () => {
      document.removeEventListener('click', handleClickOusideModal);
    };
  }, []);

  return (
    <div className="flex relative justify-between p-2">
      <div>
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </div>
      <div>
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === 'dark' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </IconButton>
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton>
          <div
            onClick={() => {
              setShowModal(!showModal);
            }}
            ref={btnLoginRef}
          >
            <PersonOutlinedIcon />
          </div>
        </IconButton>
      </div>
      {showModal && (
        <div ref={modalRef} className={cx('modal', 'absolute right-0 top-12')}>
          <div className={cx('modal-profile')}>
            <div className={cx('profile-header')}>
              <div className={cx('profile-avata')}></div>
              <div className={cx('profile-info')}>
                <span>Xin chào</span>
                <h5> bệnh viện đa khoa đồng nai</h5>
              </div>
            </div>
            <ul className={cx('information-list')}>
              <li
                className={cx('information-item')}
                onClick={() => {
                  // navigate('/user?key=records');
                }}
              >
                <div>
                  <span className={cx('icon')}>
                    <IoPersonSharp style={{ width: '1.7rem', height: '1.7rem' }} />
                  </span>
                  <span className={cx('title')}>Hồ sơ</span>
                </div>
              </li>

              <li className={cx('information-item')}>
                <div
                  onClick={() => {
                    // dispatch(logoutUser());
                    Cookies.remove('login');
                    setShowModal(false);
                    navigate('/login');
                    // toast.success(t('header.logout_success'));
                  }}
                >
                  <span className={cx('icon')}>
                    <i className="fa-solid fa-right-from-bracket"></i>
                  </span>
                  <span className="text-red-500">Đăng xuất</span>
                </div>
              </li>
              <li className={cx('information-item')} disabled>
                <div>
                  <span>Cập nhật mới nhất: 29/12/2023</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;
