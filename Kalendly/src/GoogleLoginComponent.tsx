import React from 'react';
import { GoogleLogin, googleLogout, useGoogleLogin, TokenResponse } from '@react-oauth/google';

const GoogleLoginComponent: React.FC = () => {
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Handle success callback
  const handleLoginSuccess = (tokenResponse: TokenResponse) => {
    fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`)
      .then((response) => response.json())
      .then((data) => {
        setUserInfo(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch user info:', err);
        setError('Failed to fetch user info');
      });
  };

  // Handle failure callback
  const handleLoginFailure = (response: any) => {
    console.error('Login failed:', response);
    setError('Login failed');
  };

  const handleLogout = () => {
    googleLogout();
    setUserInfo(null);
  };

  return (
    <div>
      <h2>Login with Google</h2>

      {!userInfo ? (
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginFailure}
        />
      ) : (
        <div>
          <h3>Welcome, {userInfo.name}</h3>
          <img src={userInfo.picture} alt={userInfo.name} />
          <p>Email: {userInfo.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default GoogleLoginComponent;
