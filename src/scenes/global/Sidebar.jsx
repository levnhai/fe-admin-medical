import { useState, useEffect } from 'react';
import { ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import 'react-pro-sidebar/dist/css/styles.css';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { Buffer } from 'buffer';

import { tokens } from '../../theme';

// Giữ nguyên các imports icons từ code cũ
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';

import { useTranslation } from 'react-i18next';

const rolePermissions = {
  system_admin: [
    { title: 'Dashboard', to: '/', icon: <HomeOutlinedIcon /> },
    { title: 'Hospital', to: '/hospital', icon: <PeopleOutlinedIcon /> },
    { title: 'User', to: '/user', icon: <PeopleOutlinedIcon /> },
    { title: 'News', to: '/news', icon: <ReceiptOutlinedIcon /> },
    { title: 'Cooperate', to: '/contact-cooperate', icon: <ConnectWithoutContactIcon /> },
    { title: 'Profile Form', to: '/form', icon: <PersonOutlinedIcon /> },
    { title: 'Calendar', to: '/calendar', icon: <CalendarTodayOutlinedIcon /> },
    { title: 'FAQ Page', to: '/faq', icon: <HelpOutlineOutlinedIcon /> },
    { title: 'Bar Chart', to: '/bar', icon: <BarChartOutlinedIcon /> },
    { title: 'Pie Chart', to: '/pie', icon: <PieChartOutlineOutlinedIcon /> },
    { title: 'Line Chart', to: '/line', icon: <TimelineOutlinedIcon /> },
    { title: 'Geography Chart', to: '/geography', icon: <MapOutlinedIcon /> },
  ],
  hospital_admin: [
    { title: 'Dashboard', to: '/', icon: <HomeOutlinedIcon /> },
    { title: 'Docter', to: '/docter', icon: <PeopleOutlinedIcon /> },
    { title: 'User', to: '/user', icon: <PeopleOutlinedIcon /> },
    { title: 'News', to: '/news', icon: <ReceiptOutlinedIcon /> },
    { title: 'Cooperate', to: '/contact-cooperate', icon: <ConnectWithoutContactIcon /> },
  ],
  docter: [
    { title: 'Dashboard', to: '/', icon: <HomeOutlinedIcon /> },
    { title: 'User', to: '/user', icon: <PeopleOutlinedIcon /> },
    { title: 'News', to: '/news', icon: <ReceiptOutlinedIcon /> },
  ],
};

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState('Dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useTranslation();

  const token = Cookies.get('login');

  const userRole = token ? jwtDecode(token).role : 'guest';
  // const decoded = jwtDecode(token);
  const menuItems = rolePermissions[userRole] || [];
  console.log('check user role: ', userRole);

  const user = useSelector((state) => state.auth.user?.payload);
  // let base64UrlImage = Buffer.from(user?.userData?.image, 'base64').toString('binary');

  return (
    <Box
      sx={{
        '& .pro-sidebar': {
          height: '100vh !important',
          position: isMobile ? 'fixed' : 'relative',
          zIndex: isMobile ? 1000 : 1,
          '& .pro-sidebar-inner': {
            background: `${colors.primary[400]} !important`,
            height: '100vh !important',
          },
        },
        '& .pro-icon-wrapper': {
          backgroundColor: 'transparent !important',
        },
        '& .pro-inner-item': {
          padding: '5px 35px 5px 20px !important',
        },
        '& .pro-inner-item:hover': {
          color: '#868dfb !important',
        },
        '& .pro-menu-item.active': {
          color: '#6870fa !important',
        },
        // Thêm styles cho mobile
        ...(isMobile && !isCollapsed && {
          '& .pro-sidebar': {
            width: '100% !important',
            minWidth: '100% !important',
          },
          '& .pro-sidebar-inner': {
            width: '250px !important',
          },
          '& .pro-sidebar-wrapper': {
            width: '250px !important',
          },
          // Thêm overlay khi sidebar mở trên mobile
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          },
        }),
      }}
    >
      <ProSidebar 
        collapsed={isCollapsed}
        style={{
          display: isMobile && isCollapsed ? 'none' : 'block',
        }}
      >
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: '10px 0 20px 0',
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  ADMINIS
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  // src={base64UrlImage}
                  style={{ cursor: 'pointer', borderRadius: '50%' }}
                />
              </Box>
              <Box textAlign="center">
                <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" sx={{ m: '10px 0 0 0' }}>
                  {user.userData.fullName}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {userRole}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : '10%'}>
            {menuItems.map((item) => (
              <Item
                key={item.title}
                title={t(item.title)}
                to={item.to}
                icon={item.icon}
                selected={selected}
                setSelected={setSelected}
              />
            ))}
          </Box>
        </Menu>
      </ProSidebar>

      {/* Menu Button cho mobile khi sidebar đóng */}
      {isMobile && isCollapsed && (
        <IconButton
          onClick={() => setIsCollapsed(false)}
          sx={{
            mt: '43px',
            position: 'fixed',
            left: '10px',
            top: '10px',
            zIndex: 1000,
            bgcolor: colors.primary[400],
            color: colors.grey[100],
            '&:hover': {
              bgcolor: colors.primary[300],
            },
          }}
        >
          <MenuOutlinedIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default Sidebar;