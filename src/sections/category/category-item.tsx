import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type CategoryItemProps = {
  id: string;
  name: string;
  image: string;
  description: string;
  status: boolean;
};

export function CategoryItem({ category }: { category: CategoryItemProps }) {
  const renderStatus = (
    <Chip
      label={category.status ? 'Active' : 'Inactive'}
      color={category.status ? 'success' : 'default'}
      size="small"
      sx={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 9,
      }}
    />
  );

  const renderImg = (
    <Box
      component="img"
      alt={category.name}
      src={category.image}
      sx={{
        top: 0,
        width: 1,
        height: 200,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative', height: 200 }}>
        {renderStatus}
        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="subtitle1" noWrap>
          {category.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {category.description}
        </Typography>
      </Stack>
    </Card>
  );
}