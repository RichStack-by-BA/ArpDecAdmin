import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { api } from 'src/api';

import { Iconify } from 'src/components/iconify';

export function ResetPasswordView() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get email from URL query params
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // If no email, redirect back to forgot password
      router.push('/forgot-password');
    }
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        email,
        newPassword: password,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to reset password:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, confirmPassword]);

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TextField
        fullWidth
        name="password"
        label="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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

      <TextField
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        type={showConfirmPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  <Iconify
                    icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
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
        onClick={handleSubmit}
        disabled={!password || !confirmPassword || loading}
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link
          variant="subtitle2"
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push('/sign-in')}
        >
          Back to Sign In
        </Link>
      </Box>

      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <Link
          variant="body2"
          sx={{ cursor: 'pointer', color: 'text.secondary' }}
          onClick={() => router.push('/need-help')}
        >
          Need Help?
        </Link>
      </Box>
    </Box>
  );

  const renderSuccess = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          mb: 3,
          width: 80,
          height: 80,
          display: 'flex',
          borderRadius: '50%',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'success.lighter',
        }}
      >
        <Iconify icon="solar:check-circle-bold" width={48} sx={{ color: 'success.main' }} />
      </Box>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Password Reset Successfully
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Your password has been successfully reset.
        <br />
        You can now sign in with your new password.
      </Typography>

      <Button
        fullWidth
        size="large"
        color="inherit"
        variant="contained"
        onClick={() => router.push('/sign-in')}
      >
        Back to Sign In
      </Button>
    </Box>
  );

  return (
    <>
      {!submitted && (
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
            <Typography variant="h5">Reset Password</Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              Please enter your new password below.
            </Typography>
          </Box>
          {renderForm}
        </>
      )}

      {submitted && renderSuccess}
    </>
  );
}
