import { Box, IconButton, useTheme } from '@mui/material';
import { useContext, useState, useRef, useEffect } from 'react';
import InputBase from '@mui/material/InputBase';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { FaRightFromBracket } from 'react-icons/fa6';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SearchIcon from '@mui/icons-material/Search';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { Buffer } from 'buffer';

// icon
import { IoPersonSharp } from 'react-icons/io5';

import { ColorModeContext, tokens } from '../../theme';
import styles from './topbar.module.scss';

const cx = classNames.bind(styles);

const Topbar = () => {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  const btnLoginRef = useRef(null);
  const navigate = useNavigate();
  const colorMode = useContext(ColorModeContext);
  const userLogin = useSelector((state) => state.auth.user?.payload);
  console.log('check user login', userLogin);

  // Convert base64 image to binary for avatar
  let base64UrlImage = userLogin?.userData?.image?.data 
    ? Buffer.from(userLogin.userData.image.data, 'base64').toString('binary')
    : null;

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
          {/* <SearchIcon /> */}
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
            className="flex items-center"
          >
            {base64UrlImage ? (
              <img
                alt="profile-user"
                src={base64UrlImage}
                style={{
                  cursor: 'pointer',
                  borderRadius: '50%',
                  objectFit: 'contain',
                  width: '30px',
                  height: '30px',
                  backgroundColor: '#f0f0f0'
                }}
              />
            ) : (
              <PersonOutlinedIcon />
            )}
          </div>
        </IconButton>
      </div>
      {showModal && (
        <div 
          ref={modalRef} 
          className="absolute right-0 top-12 z-50"
        >
          <div className="w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-700">
              <div className="flex items-center space-x-3">
                {base64UrlImage && (
                  <div className={cx('profile-avata')}>
                  {base64UrlImage && (
                    <img
                      alt="profile-user"
                      src={base64UrlImage}
                      style={{
                        borderRadius: '50%',
                        objectFit: 'contain',
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#f0f0f0'
                      }}
                    />
                  )}
                </div>
                )}
                <div className="min-w-0">
                  <span className="block text-sm text-blue-400 truncate">Xin chào</span>
                  <h5 className="font-semibold text-white truncate">
                    {userLogin?.userData?.fullName}
                  </h5>
                </div>
              </div>
            </div>
            <ul className="divide-y divide-gray-700">
              <li 
                className="px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => {
                   navigate('/profile');
                }}
              >
                <div className="flex items-center">
                  <IoPersonSharp className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />
                  <span className="text-gray-200">Hồ sơ</span>
                </div>
              </li>
              
              <li className="px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors">
                <div 
                  className="flex items-center"
                  onClick={() => {
                    Cookies.remove('login');
                    setShowModal(false);
                    navigate('/login');
                  }}
                >
                  <FaRightFromBracket className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                  <span className="text-red-400">Đăng xuất</span>
                </div>
              </li>

              <li className="px-4 py-3 bg-gray-750 text-xs text-gray-400">
                <div className="truncate">
                  Cập nhật mới nhất: 29/12/2023
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
