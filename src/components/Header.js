import React, { useState } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);

  const onLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser(decoded);
    localStorage.setItem('user', JSON.stringify(decoded));
    console.log('[Login Success] User:', decoded);
  };

  const onLoginError = () => {
    console.log('[Login Failed]');
  };

  const handleSignOut = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('user');
    console.log('Logged out successfully');
  };

  return (
    <header>
      <div>
        <div className="header">
          <div>
            <h1>Your Logo</h1>
          </div>

          <div className='nav'>
            <a>Home</a>
            <a>About</a>
            <a>Services</a>
            <a>Contact</a>
          </div>

          <div>
            {!user ? (
              <GoogleLogin
                onSuccess={onLoginSuccess}
                onError={onLoginError}
                useOneTap
                type="text"
                shape="circle"
              />
            ) : (
              <div>
                <div>
                  {/* <img 
                    src={user.picture} 
                    alt="Profile" 
                    className="rounded-full w-8 h-8"
                  /> */}
                  <span className="text-sm font-medium text-gray-700">Welcome {user.given_name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;