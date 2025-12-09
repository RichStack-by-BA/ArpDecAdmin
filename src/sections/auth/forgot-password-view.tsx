import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { api } from 'src/api';

import { Iconify } from 'src/components/iconify';

export function ForgotPasswordView() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forget-password', { email });
      // Redirect to verify OTP page with email
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error('Failed to send reset password email:', err);
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, router]);

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TextField
        fullWidth
        name="email"
        label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
        error={!!error}
        helperText={error}
      />

      <Button
        fullWidth
        size="large"
        type="button"
        color="inherit"
        variant="contained"
        onClick={handleSubmit}
        disabled={!email || loading}
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
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
        Check your email
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        We have sent a password reset link to
        <br />
        <strong>{email}</strong>
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
            <Typography variant="h5">Forgot Password?</Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              Please enter the email address associated with your account and we will email you a
              link to reset your password.
            </Typography>
          </Box>
          {renderForm}
        </>
      )}

      {submitted && renderSuccess}
    </>
  );
}
