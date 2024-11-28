import React, { useState } from 'react';
import { fetchLogin, loginUser } from '~/redux/auth/authSlice';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { unwrapResult } from '@reduxjs/toolkit';
import { useNavigate } from 'react-router-dom';
import styles from './Modal.module.scss';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleOnSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    try {
      const response = await dispatch(fetchLogin({ phoneNumber, password }));
      const result = unwrapResult(response);
      
      // Set cookie with conditional expiration based on rememberMe
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
      // TODO: Add error handling, e.g., show error message to user
    }
  };

  return (
    <div className={styles['login-container']}>
      <h2 className={styles['login-title']}>Admin Login</h2>
      <form onSubmit={handleOnSubmit}>
        <div className={styles['input-group']}>
          <label 
            htmlFor="phoneNumber" 
            className={styles['input-label']}
          >
            Phone Number
          </label>
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
        
        <div className={styles['input-group']}>
          <label 
            htmlFor="password" 
            className={styles['input-label']}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className={styles['input-field']}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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
  );
}

export default Login;