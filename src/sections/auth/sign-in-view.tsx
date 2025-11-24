import type { AppDispatch } from 'src/store'; // Add this import

import { useState, useCallback } from 'react';
// Add these imports
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { loginUser, fetchUserDetails } from 'src/store/slices/userSlice';

import { Iconify } from 'src/components/iconify';

export function SignInView() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>(); // Type your dispatch
  const loading = useSelector((state: any) => state.user.loading);
  const error = useSelector((state: any) => state.user.error);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('98saanchal@gmail.com');
  const [password, setPassword] = useState('12345678');

  const handleSignIn = useCallback(async () => {
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      // Fetch user details immediately after successful login
      await dispatch(fetchUserDetails());
      router.push('/');
    }
    // Optionally handle error here
  }, [dispatch, email, password, router]);

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      <TextField
        fullWidth
        name="email"
        label="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <Link 
        variant="body2" 
        color="inherit" 
        sx={{ mb: 1.5, cursor: 'pointer' }}
        onClick={() => router.push('/forgot-password')}
      >
        Forgot password?
      </Link>

      <TextField
        fullWidth
        name="password"
        label="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="button"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
        disabled={loading}
      >
        Sign in
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link
          variant="subtitle2"
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push('/need-help')}
        >
          Need Help?
        </Link>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Sign in</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Don’t have an account?
          <Link variant="subtitle2" sx={{ ml: 0.5 }}>
            Get started
          </Link>
        </Typography>
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:google" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:github" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:twitter" />
        </IconButton>
      </Box>
    </>
  );
}