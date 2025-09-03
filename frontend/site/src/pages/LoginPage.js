
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  max-width: 400px;
  margin: 50px auto;
`;

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(username, password);
    navigate('/dashboard');
  };

  return (
    <Wrapper>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Username
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>

        <button type="submit">Login</button>
      </form>
    </Wrapper>
  );
};

// ✅ This is essential:
export default LoginPage;
