import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { api } from 'src/api';


export function VerifyOtpView() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Get email from URL query params
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      
      // Redirect to reset password page with token or email
      router.push(`/reset-password?email=${encodeURIComponent(email)}&verified=true`);
    } catch (err: any) {
      console.error('Failed to verify OTP:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, otp, router]);

  const handleResendOtp = useCallback(async () => {
    setResending(true);
    setError('');

    try {
      await api.post('/auth/forget-password', { email });
      setError('');
      // Show success message
      setOtp('');
    } catch (err: any) {
      console.error('Failed to resend OTP:', err);
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  }, [email]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

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
        <Typography variant="h5">Verify OTP</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
          }}
        >
          Please enter the 6-digit OTP sent to
          <br />
          <strong>{email}</strong>
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TextField
          fullWidth
          name="otp"
          label="Enter OTP"
          value={otp}
          onChange={handleOtpChange}
          sx={{ mb: 3 }}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              inputProps: {
                maxLength: 6,
                style: { letterSpacing: '0.5em', fontSize: '1.5rem', textAlign: 'center' },
              },
            },
          }}
          error={!!error}
          helperText={error}
          placeholder="000000"
        />

        <Button
          fullWidth
          size="large"
          type="button"
          color="inherit"
          variant="contained"
          onClick={handleVerifyOtp}
          disabled={!otp || otp.length !== 6 || loading}
          sx={{ mb: 2 }}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Didn't receive the code?{' '}
            <Link
              variant="body2"
              sx={{ cursor: 'pointer', fontWeight: 600 }}
              onClick={handleResendOtp}
              component="button"
              disabled={resending}
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </Link>
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
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
    </>
  );
}
