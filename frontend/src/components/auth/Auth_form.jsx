import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signup, loginUser } from '../../Store/auth/authSlice';
import axiosInstance from '../../helper/axios';

const Auth_form = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState(null); // For warnings
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Handle file input change
  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  // Handle form submission with FormData
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create FormData object
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    if (!isLogin) {
      formData.append('name', name);
      formData.append('surname', surname);
      formData.append('bio', bio);
      if (profilePic) {
        
        formData.append('profilepic', profilePic); // File field
      }
    }

    // Dispatch action based on login or signup
    if (isLogin) {
      dispatch(loginUser(formData));
    } else {
      dispatch(signup(formData));
    }
  };

  // Check username availability on blur
  const handleBlur = async (e) => {
    const username = e.target?.value;
    if (!username) {
      setMessage('Username is required');
      return;
    }
    try {
      const response = await axiosInstance.post('/api/auth/usernameExists', { username });
      if (!response.data.success) {
        setMessage(response.data.message);
      } else {
        setMessage(null); // Clear message if username is available
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setMessage('Error checking username');
    }
  };

  // Redirect on successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        navigate('/chat');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {/* DaisyUI Warning Alert */}
        {message && (
          <div className="alert alert-warning mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"
              />
            </svg>
            <span>{message}</span>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Username</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full"
              onChange={(e) => setUsername(e.target.value)}
              onBlur={handleBlur}
              name="username"
              id="username"
              placeholder="Username"
              autoComplete="username"
              required
            />
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">
                {isLogin ? 'Password' : 'Create Password'}
              </span>
            </div>
            <input
              type="password"
              className="input input-bordered w-full"
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              id="password"
              placeholder="Password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
          </label>

          {!isLogin && (
            <>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Name</span>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  onChange={(e) => setName(e.target.value)}
                  name="name"
                  id="name"
                  placeholder="Name"
                  required
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Surname</span>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  onChange={(e) => setSurname(e.target.value)}
                  name="surname"
                  id="surname"
                  placeholder="Surname"
                  required
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Profile Picture</span>
                </div>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  name="profilepic"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Bio</span>
                </div>
                <textarea
                  className="textarea textarea-bordered w-full resize-none"
                  onChange={(e) => setBio(e.target.value)}
                  name="bio"
                  id="bio"
                  placeholder="Tell us about yourself"
                />
              </label>
            </>
          )}

          <button type="submit" className="btn btn-primary mt-4">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            className="link link-primary"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth_form;