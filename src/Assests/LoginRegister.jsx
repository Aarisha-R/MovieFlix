import React, { useState } from 'react';
import './LoginRegister.css';
import { FaUserCircle } from "react-icons/fa";
import { IoMdLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";

const LoginRegister = () => {
  const [action, setAction] = useState('');

  const showRegister = () => {
    setAction('active');
  };

  const showLogin = () => {
    setAction('');
  };

  return (
    <div className={`wrapper ${action}`}>
      {/* Login Form */}
      <div className='form-box login'>
        <form>
          <h1>Login</h1>

          <div className='input-box'>
            <input type='text' placeholder='Username' required />
            <FaUserCircle className='icon' />
          </div>

          <div className='input-box'>
            <input type="password" placeholder='Password' required />
            <IoMdLock className='icon' />
          </div>

          <div className='remember-forgot'>
            <label><input type="checkbox" />Remember me</label>
            <a href="#">Forgot Password</a>
          </div>

          <button type='submit'>Login</button>

          <div className='loginregister'>
            <p>Don't have an account? <a href="#" onClick={showRegister}>Register</a></p>
          </div>
        </form>
      </div>

      {/* Register Form */}
      <div className='form-box register'>
        <form>
          <h1>Register</h1>

          <div className='input-box'>
            <input type='text' placeholder='Username' required />
            <FaUserCircle className='icon' />
          </div>

          <div className='input-box'>
            <input type='email' placeholder='Email' required />
            <MdEmail className='icon' />
          </div>

          <div className='input-box'>
            <input type="password" placeholder='Password' required />
            <IoMdLock className='icon' />
          </div>

          <div className='remember-forgot'>
            <label><input type="checkbox" />I agree to the terms & conditions.</label>
          </div>

          <button type='submit'>Register</button>

          <div className='loginregister'>
            <p>Already have an account? <a href="#" onClick={showLogin}>Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
