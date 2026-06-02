import type { RootState, AppDispatch } from 'src/store';
import type { Order } from 'src/store/slices/orderSlice';
import type { Column } from 'src/components/baseComponents/table';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { formatDate } from 'src/utils/format-date';
import { getStatusColor } from 'src/utils/status-utils';

import { PAGE_LIMIT, VIEW_ICONS } from 'src/constant';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchOrders } from 'src/store/slices/orderSlice';
import { Iconify } from 'src/components/iconify';
import {
  BaseBox,
  BaseCard,
  BaseAlert,
  DataTable,
  BaseButton,
  BaseTextField,
  BaseTypography,
  BasePagination,
  BaseIconButton,
  BaseCircularProgress,
} from 'src/components/baseComponents';

type OrderRow = {
  id: string;
  productName: string;
  customerName: string;
  orderId: string;
  amount: number;
  status: string;
  originalOrder: Order;
  itemId: string;
};

export function OrdersView() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error, totalCount } = useSelector((state: RootState) => state.order);

  const [search, setSearch] = React.useState('');
  const [view, setView] = React.useState<'table' | 'grid'>('table');
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [page, setPage] = React.useState(1);

  useEffect(() => {
    dispatch(fetchOrders({ page, limit: PAGE_LIMIT }));
  }, [dispatch, page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  // Transform orders into rows for the table (one row per order)
  const tableRows: OrderRow[] = orders.map((order) => {
    const firstProduct = order.items[0]?.name || 'N/A';
    const additionalItems = order.items.length - 1;
    const productName = additionalItems > 0
      ? `${firstProduct} +${additionalItems} more`
      : firstProduct;

    const amount = order.totalAmount ?? order.items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    return {
      id: order.id,
      productName,
      customerName: order.shippingAddress?.name || order.userId || 'N/A',
      orderId: order.id,
      amount,
      status: order.orderStatus,
      originalOrder: order,
      itemId: order.items[0]?._id || '',
    };
  });

  // Filter rows based on search query
  const filteredRows = tableRows.filter((row) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();
    return (
      row.productName.toLowerCase().includes(searchLower) ||
      row.customerName.toLowerCase().includes(searchLower) ||
      row.orderId.toLowerCase().includes(searchLower) ||
      row.status.toLowerCase().includes(searchLower) ||
      row.amount.toString().includes(searchLower)
    );
  });

  // Calculate statistics
  const totalOrders = totalCount || orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
  const pendingOrders = orders.filter((order) => order.orderStatus === 'pending').length;
  const completedOrders = orders.filter((order) => order.orderStatus === 'completed').length;

  const columns: Column<OrderRow>[] = [
    {
      id: 'orderId',
      label: 'Order ID',
      align: 'left',
      format: (value) => `#${value}`,
    },
    {
      id: 'customerName',
      label: 'Customer Name',
      align: 'left',
    },
    {
      id: 'productName',
      label: 'Product Name',
      align: 'left',
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
      label: 'Actions',
      align: 'center',
      format: (value, row) => (
        <BaseBox sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <BaseIconButton
            size="small"
            color="primary"
            onClick={() => handleOpenDetails(row.originalOrder)}
          >
            <Iconify icon="solar:eye-bold" />
          </BaseIconButton>
        </BaseBox>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardContent>
        <BaseBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <BaseCircularProgress />
        </BaseBox>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <BaseAlert severity="error">{error}</BaseAlert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <BaseBox sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <BaseTypography variant="h4" sx={{ flexGrow: 1 }}>
          Orders
        </BaseTypography>
      </BaseBox>

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

      <BaseCard>
        <BaseBox sx={{ p: 3, pb: 0 }}>
          <BaseBox sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BaseTextField
              fullWidth
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <BaseBox sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </BaseBox>
                ),
              }}
            />

            <BaseBox sx={{ display: 'flex', gap: 1 }}>
              <BaseButton
                variant={view === 'table' ? 'contained' : 'outlined'}
                color="inherit"
                onClick={() => setView('table')}
                sx={{ width: 40, height: 40, minWidth: 0, borderRadius: 1, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Iconify icon={VIEW_ICONS.TABLE} />
              </BaseButton>
              <BaseButton
                variant={view === 'grid' ? 'contained' : 'outlined'}
                color="inherit"
                onClick={() => setView('grid')}
                sx={{ width: 40, height: 40, minWidth: 0, borderRadius: 1, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Iconify icon={VIEW_ICONS.GRID} />
              </BaseButton>
            </BaseBox>
          </BaseBox>
        </BaseBox>

        {view === 'table' ? (
          <DataTable columns={columns} rows={filteredRows} />
        ) : (
          <BaseBox sx={{ p: 3 }}>
            <BaseBox
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
              }}
            >
              {filteredRows.map((row) => (
                <BaseCard key={row.id} sx={{ overflow: 'hidden', '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.3s', cursor: 'pointer' }} onClick={() => handleOpenDetails(row.originalOrder)}>
                  <BaseBox sx={{ p: 2 }}>
                    <BaseTypography variant="h6" sx={{ mb: 1 }}>
                      #{row.orderId}
                    </BaseTypography>
                    <BaseTypography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={row.productName}
                    >
                      {row.productName}
                    </BaseTypography>
                    <BaseTypography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={row.customerName}
                    >
                      {row.customerName}
                    </BaseTypography>
                    <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <BaseTypography variant="h6" color="primary">
                        ₹{row.amount}
                      </BaseTypography>
                      <BaseBox
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 0.75,
                          display: 'inline-flex',
                          bgcolor: getStatusColor(row.status),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {row.status}
                      </BaseBox>
                    </BaseBox>
                  </BaseBox>
                </BaseCard>
              ))}
            </BaseBox>
          </BaseBox>
        )}

        {/* Pagination */}
        {totalCount > PAGE_LIMIT && (
          <BaseBox sx={{ display: 'flex', justifyContent: 'center', p: 3, pt: 2 }}>
            <BasePagination
              count={Math.ceil(totalCount / PAGE_LIMIT)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </BaseBox>
        )}
      </BaseCard>

      {/* Order Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5">Order Details</Typography>
          <Typography variant="body2" color="text.secondary">
            Order ID: #{selectedOrder?.id}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Customer Information */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Customer Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Customer Name
                    </Typography>
                    <Typography variant="body2">
                      {selectedOrder.shippingAddress?.name || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Customer ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {selectedOrder.userId || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Order Items */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Order Items ({selectedOrder.items.length})
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.name || 'N/A'}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">₹{item.price}</TableCell>
                        <TableCell align="right">₹{item.price * item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Divider />



              {/* Payment & Order Info */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Payment & Status
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Payment Status
                    </Typography>
                    {selectedOrder.paymentStatus ? (
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: selectedOrder.paymentStatus?.toLowerCase() === 'paid' ? '#22c55e' : '#fbbf24',
                          color: 'white',
                          fontWeight: 500,
                          fontSize: 12,
                          textTransform: 'uppercase',
                          mt: 0.5,
                        }}
                      >
                        {selectedOrder.paymentStatus}
                      </Box>
                    ) : (
                      <Typography variant="body2">N/A</Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Order Status
                    </Typography>
                    {selectedOrder.orderStatus ? (
                      <Box
                        sx={{
                          width: 'fit-content',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: getStatusColor(selectedOrder.orderStatus),
                          color: 'white',
                          fontWeight: 500,
                          fontSize: 12,
                          textTransform: 'uppercase',
                          mt: 0.5,
                        }}
                      >
                        {selectedOrder.orderStatus}
                      </Box>
                    ) : (
                      <Typography variant="body2">N/A</Typography>
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                      {selectedOrder.paymentMethod || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₹{selectedOrder.totalAmount ?? selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Timestamps */}
              <Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Order Date
                    </Typography>
                    <Typography variant="body2">
                      {selectedOrder.createdAt ? formatDate(selectedOrder.createdAt, 'DD/MM/YYYY') : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {selectedOrder.updatedAt ? formatDate(selectedOrder.updatedAt, 'DD/MM/YYYY') : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />
                            {/* Shipping Address */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Shipping Address
                </Typography>
                <Typography variant="body2">
                  {selectedOrder.shippingAddress.name}<br />
                  {selectedOrder.shippingAddress.addressLine1}<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}<br />
                  {selectedOrder.shippingAddress.country}<br />
                  {selectedOrder.shippingAddress.phone}
                </Typography>
              </Box>

            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

