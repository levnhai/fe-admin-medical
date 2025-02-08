import React, { useState } from 'react';
import { fetchLogin, loginUser } from '~/redux/auth/authSlice';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { unwrapResult } from '@reduxjs/toolkit';
import { useNavigate } from 'react-router-dom';
import styles from './Modal.module.scss';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

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

      Cookies.set('login', result.token, {
        expires: rememberMe ? 7 : 1,
        path: '/',
        sameSite: 'Lax'
      });

      if (result.status) {
        dispatch(loginUser(response));
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className={styles['login-wrapper']}>
      <div className={styles['login-container']}>
        <div className={styles['login-logo']}>
          <img
            src={require('../../assets/images/logo.png')}
            alt="Company Logo"
            className={styles['logo-image']}
          />
        </div>
        <form onSubmit={handleOnSubmit}>
        <label 
            htmlFor="phoneNumber" 
            className={styles['input-label']}
          >
            User name:
          </label>
          <div className={styles['input-group']}>
            <input
              type="tel"
              id="phoneNumber"
              className={styles['input-field']}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <label 
            htmlFor="password" 
            className={styles['input-label']}
          >
            Password:
          </label>
          <div className={`${styles['input-group']} ${styles['password-input-group']}`}>
            
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`${styles['input-field']} ${styles['password-input']}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div 
              onClick={handleShowHidePassword}
              className={styles['password-toggle']}
            >
              {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
            </div>
          </div>

          <div className={styles['remember-container']}>
            <input
              type="checkbox"
              id="remember"
              className={styles['remember-checkbox']}
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="remember">Remember me</label>
          </div>

          <button
            type="submit"
            className={styles['submit-button']}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;