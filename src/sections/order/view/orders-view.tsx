import type { RootState, AppDispatch } from 'src/store';
import type { Order } from 'src/store/slices/orderSlice';
import type { Column } from 'src/components/baseComponents/table';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchOrders } from 'src/store/slices/orderSlice';
import { Iconify } from 'src/components/iconify';
import { DataTable } from 'src/components/baseComponents/table';
import { BaseTextField } from 'src/components/baseComponents/BaseTextField';

type OrderRow = {
  id: string;
  productName: string;
  customerEmail: string;
  orderId: string;
  amount: number;
  status: string;
  originalOrder: Order;
  itemId: string;
};

export function OrdersView() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.order);

  const [search, setSearch] = React.useState('');
  const [view, setView] = React.useState<'table' | 'grid'>('table');

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Transform orders into flat rows for the table
  const tableRows: OrderRow[] = orders.flatMap((order) =>
    order.items.map((item) => ({
      id: `${order.id}-${item._id}`,
      productName: item.productId?.name || 'N/A',
      customerEmail: order.userId?.email || '',
      orderId: order.id,
      amount: order.totalAmount,
      status: order.orderStatus,
      originalOrder: order,
      itemId: item._id,
    }))
  );

  // Filter rows based on search query
  const filteredRows = tableRows.filter((row) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      row.productName.toLowerCase().includes(searchLower) ||
      row.customerEmail.toLowerCase().includes(searchLower) ||
      row.orderId.toLowerCase().includes(searchLower) ||
      row.status.toLowerCase().includes(searchLower) ||
      row.amount.toString().includes(searchLower)
    );
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter((order) => order.orderStatus === 'pending').length;
  const completedOrders = orders.filter((order) => order.orderStatus === 'completed').length;

  const columns: Column<OrderRow>[] = [
    {
      id: 'productName',
      label: 'Product Name',
      align: 'left',
    },
    {
      id: 'customerEmail',
      label: 'Customer Name',
      align: 'left',
    },
    {
      id: 'orderId',
      label: 'Order ID',
      align: 'left',
      format: (value) => `#${value}`,
    },
    {
      id: 'amount',
      label: 'Amount',
      align: 'left',
      format: (value) => `₹${value}`,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'left',
      format: (value) => (
        <Box
          sx={{
            display: 'inline-block',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: getStatusColor(value),
            color: 'white',
            fontWeight: 500,
            fontSize: 13,
            textTransform: 'uppercase',
          }}
        >
          {value}
        </Box>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      align: 'left',
      format: () => (
        <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}>
          Details
        </Typography>
      ),
    },
  ];

  const searchBar = (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <BaseTextField
        placeholder="Search by product, order ID, customer, amount, status..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" width={20} />
            </InputAdornment>
          ),
        }}
        sx={{ flexGrow: 1, minWidth: 300 }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box
          onClick={() => setView('table')}
          sx={{
            p: 1,
            cursor: 'pointer',
            borderRadius: 1,
            bgcolor: view === 'table' ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Iconify icon="ic:round-filter-list" width={24} />
        </Box>
        <Box
          onClick={() => setView('grid')}
          sx={{
            p: 1,
            cursor: 'pointer',
            borderRadius: 1,
            bgcolor: view === 'grid' ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Iconify icon="solar:home-angle-bold-duotone" width={24} />
        </Box>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
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
      <Typography variant="h4" sx={{ mb: 2 }}>
        Orders List
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Here you can find all of your Orders
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:cart-3-bold" width={24} sx={{ color: 'common.white' }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ mb: 0 }}>
                  {totalOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Total Orders
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:clock-circle-outline" width={24} sx={{ color: 'common.white' }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ mb: 0 }}>
                  {pendingOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Pending Orders
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'common.white' }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ mb: 0 }}>
                  {completedOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Completed
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="eva:trending-up-fill" width={24} sx={{ color: 'common.white' }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ mb: 0 }}>
                  ₹{totalAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Total Revenue
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        rows={filteredRows}
        getRowKey={(row) => row.id}
        searchBar={searchBar}
        emptyMessage="No orders found"
        view={view}
        gridItemSize={{ xs: 12, sm: 6, md: 4 }}
        renderGridItem={(row) => (
          <Box
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={row.productName}
            >
              {row.productName}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={`#${row.orderId}`}
            >
              #{row.orderId}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={row.customerEmail}
            >
              {row.customerEmail}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                ₹{row.amount}
              </Typography>
              <Box
                sx={{
                  display: 'inline-block',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: getStatusColor(row.status),
                  color: 'white',
                  fontWeight: 500,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                {row.status}
              </Box>
            </Box>
          </Box>
        )}
      />
    </DashboardContent>
  );
}

// Helper to get status color
function getStatusColor(status: string) {
  switch (status) {
    case 'accepted':
      return '#22c55e'; // green
    case 'completed':
      return '#2563eb'; // blue
    case 'pending':
      return '#fbbf24'; // yellow
    case 'rejected':
      return '#ef4444'; // red
    case 'cancelled':
      return '#ef4444'; // red
    case 'shipped':
      return '#0ea5e9'; // cyan
    default:
      return '#64748b'; // gray
  }
}
