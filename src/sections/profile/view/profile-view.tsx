import type { RootState } from 'src/store';

import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function ProfileView() {
  const { userDetails, loading } = useSelector((state: RootState) => state.user);

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </DashboardContent>
    );
  }

  const user = userDetails?.user || {};

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header Card */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Avatar
              src={user.photoURL}
              alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
              sx={{
                width: 80,
                height: 80,
                fontSize: 32,
                bgcolor: 'primary.main',
              }}
            >
              {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email || 'user@example.com'}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Personal Information Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Personal Information
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  First Name
                </Typography>
                <Typography variant="body1">{user.firstName || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Last Name
                </Typography>
                <Typography variant="body1">{user.lastName || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Email Address
                </Typography>
                <Typography variant="body1">{user.email || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Phone Number
                </Typography>
                <Typography variant="body1">{user.phone || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Role
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {user.role || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Account Details Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Account Details
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Account Status
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: user.status === 'active' ? 'success.main' : 'error.main',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: 12,
                    textTransform: 'uppercase',
                  }}
                >
                  {user.status || 'N/A'}
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Email Verified
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: user.isEmailVerified ? 'success.main' : 'warning.main',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: 12,
                    textTransform: 'uppercase',
                  }}
                >
                  {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Phone Verified
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: user.isPhoneVerified ? 'success.main' : 'warning.main',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: 12,
                    textTransform: 'uppercase',
                  }}
                >
                  {user.isPhoneVerified ? 'Verified' : 'Not Verified'}
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'N/A'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
