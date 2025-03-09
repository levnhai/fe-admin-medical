import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { unwrapResult } from '@reduxjs/toolkit';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

//icon
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import { fetchLogin, loginUser } from '~/redux/auth/authSlice';
import styles from './login.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleShowHidePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await dispatch(fetchLogin({ phoneNumber, password }));
      const result = unwrapResult(response);
      console.log('check', result);

      Cookies.set('login', result.token, {
        expires: rememberMe ? 7 : 1,
        path: '/',
        sameSite: 'Lax',
      });

      if (result.status) {
        dispatch(loginUser(response));
        navigate('/');
      } else {
        console.log('chreck hair le');
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className={cx('login-wrapper')}>
      <div className={cx('login-container')}>
        <div className={cx('login-logo')}>
          <img src={require('../../assets/images/logo.png')} alt="Company Logo" className={cx('logo-image')} />
        </div>
        <form onSubmit={handleOnSubmit}>
          <label htmlFor="phoneNumber" className={cx('input-label')}>
            User name:
          </label>
          <div className={cx('input-group')}>
            <input
              type="tel"
              id="phoneNumber"
              className={cx('input-field')}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <label htmlFor="password" className={cx('input-label')}>
            Password:
          </label>
          <div className={`${cx('input-group')} ${cx('password-input-group')}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`${cx('input-field')} ${cx('password-input')}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div onClick={handleShowHidePassword} className={cx('password-toggle')}>
              {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
            </div>
          </div>

          <div className={cx('remember-container')}>
            <input
              type="checkbox"
              id="remember"
              className={cx('remember-checkbox')}
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="remember">Remember me</label>
          </div>

          <button type="submit" className={cx('submit-button')}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
