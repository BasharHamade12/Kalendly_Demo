import React from 'react';
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';

interface LoginProps {
  onLoginSuccess: (res: GoogleLoginResponse | GoogleLoginResponseOffline) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const handleLoginSuccess = (res: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    if ('profileObj' in res) {  // Check if it's an online response
      console.log('LOGIN SUCCESS! Current user:', res.profileObj);
      onLoginSuccess(res);
    }
  };

  const handleLoginFailure = (res: any) => {
    console.log('LOGIN FAILED! res:', res);
  };

  return (
    <div>
      <GoogleLogin
        clientId="468100319032-necjis060o1gmt66hu51srr9nhqbrsfo.apps.googleusercontent.com"
        buttonText="Login"
        onSuccess={handleLoginSuccess}
        onFailure={handleLoginFailure}
        cookiePolicy={'single_host_origin'}
        isSignedIn={true}
      />
    </div>
  );
};

export default Login;
