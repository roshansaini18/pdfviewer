import { GoogleOAuthProvider } from '@react-oauth/google';
import Header from './components/Header';
import FileUpload from './components/Fileupload';

function App() {
  return (
    <>
     <GoogleOAuthProvider clientId="34770263296-nguj678419hvstjk7qc0dum0gr865guq.apps.googleusercontent.com">
      <div>
        <Header />
      </div>
    </GoogleOAuthProvider>
    <div>
      <FileUpload/>
      </div></>
   
  );
}

export default App;