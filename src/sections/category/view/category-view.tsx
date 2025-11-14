import type { RootState, AppDispatch } from 'src/store';
import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import CircularProgress from '@mui/material/CircularProgress';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchCategories } from 'src/store/slices/categorySlice';

import { CategoryItem } from '../category-item';

export function CategoryView() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector(
    (state: RootState) => state.category
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) {
    return (
      <DashboardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <Alert severity="error">{error}</Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Categories
      </Typography>

      {categories.length > 0 ? (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid key={category.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <CategoryItem category={category} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 5 }}>
          No categories found
        </Typography>
      )}
    </DashboardContent>
  );
}