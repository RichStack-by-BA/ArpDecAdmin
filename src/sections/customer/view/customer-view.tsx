import type { RootState, AppDispatch } from 'src/store';
import type { User } from 'src/store/slices/usersSlice';
import type { Column } from 'src/components/baseComponents';

import { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { formatDate } from 'src/utils/format-date';

import { PAGE_LIMIT, VIEW_ICONS } from 'src/constant';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchUsers } from 'src/store/slices/usersSlice';
import { Iconify } from 'src/components/iconify';
import {
  BaseBox,
  BaseCard,
  BaseGrid,
  BaseAlert,
  DataTable,
  BaseDialog,
  BaseButton,
  BaseTextField,
  BaseTypography,
  BasePagination,
  BaseIconButton,
  BaseCircularProgress,
} from 'src/components/baseComponents';

// ----------------------------------------------------------------------

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  originalCustomer: User;
};

export function CustomerView() {
  const dispatch = useDispatch<AppDispatch>();
  const { users: customers, loading, error, totalCount } = useSelector((state: RootState) => state.users);

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsers({ page, limit: PAGE_LIMIT, role: 'customer' }));
  }, [dispatch, page]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (search) {
      setPage(1);
    }
  }, [search]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewCustomer = (customer: User) => {
    setSelectedCustomer(customer);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCustomer(null);
  };

  // Transform customers into rows for the table
  const tableRows: CustomerRow[] = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone || 'N/A',
    role: customer.role,
    status: customer.status ? 'Active' : 'Inactive',
    originalCustomer: customer,
  }));

  // Filter rows based on search query
  const filteredRows = tableRows.filter((row) => {
    if (!search) return true;

    const searchLower = search.toLowerCase().trim();

    const matchName = row.name?.toLowerCase().includes(searchLower);
    const matchEmail = row.email?.toLowerCase().includes(searchLower);
    const matchPhone = row.phone?.toLowerCase().includes(searchLower);
    const matchStatus = row.status?.toLowerCase().includes(searchLower);

    return matchName || matchEmail || matchPhone || matchStatus;
  });

  const columns: Column<CustomerRow>[] = [
    {
      id: 'name',
      label: 'Name',
      align: 'left',
    },
    {
      id: 'email',
      label: 'Email',
      align: 'left',
    },
    {
      id: 'phone',
      label: 'Phone',
      align: 'left',
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      format: (value) => (
        <BaseBox
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 0.75,
            display: 'inline-flex',
            bgcolor: value === 'Active' ? 'success.lighter' : 'error.lighter',
            color: value === 'Active' ? 'success.dark' : 'error.dark',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        >
          {value}
        </BaseBox>
      ),
    },
    {
      id: 'id',
      label: 'Actions',
      align: 'center',
      format: (value, row) => (
        <BaseBox sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <BaseIconButton
            size="small"
            color="primary"
            onClick={() => {
              handleViewCustomer(row.originalCustomer);
            }}
          >
            <Iconify icon="solar:eye-bold" />
          </BaseIconButton>
        </BaseBox>
      ),
    },
  ];

  return (
    <DashboardContent>
      <BaseBox sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <BaseTypography variant="h4" sx={{ flexGrow: 1 }}>
          Customers
        </BaseTypography>
      </BaseBox>

      {error && (
        <BaseAlert severity="error" sx={{ mb: 3 }}>
          {error}
        </BaseAlert>
      )}

      <BaseCard>
        <BaseBox sx={{ p: 3, pb: 0 }}>
          <BaseBox sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BaseTextField
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              slotProps={{
                input: {
                  startAdornment: (
                    <BaseBox sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <Iconify icon="eva:search-fill" width={20} />
                    </BaseBox>
                  ),
                },
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

        {loading ? (
          <BaseBox
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <BaseCircularProgress />
          </BaseBox>
        ) : (
          <>
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
                      lg: 'repeat(4, 1fr)',
                    },
                  }}
                >
                  {filteredRows.map((row) => (
                    <BaseCard key={row.id} sx={{ overflow: 'hidden', '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.3s' }}>
                      <BaseBox sx={{ p: 2 }}>
                        <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <BaseBox
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 0.75,
                              display: 'inline-flex',
                              bgcolor: row.status === 'Active' ? 'success.lighter' : 'error.lighter',
                              color: row.status === 'Active' ? 'success.dark' : 'error.dark',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            {row.status}
                          </BaseBox>
                          <BaseIconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewCustomer(row.originalCustomer);
                            }}
                          >
                            <Iconify icon="solar:eye-bold" width={18} />
                          </BaseIconButton>
                        </BaseBox>
                        <BaseTypography variant="h6" sx={{ mb: 1 }}>
                          {row.name}
                        </BaseTypography>
                        <BaseBox sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <BaseTypography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.875rem', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
                            title={row.email}
                          >
                            {row.email}
                          </BaseTypography>
                          <BaseTypography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {row.phone}
                          </BaseTypography>
                        </BaseBox>
                      </BaseBox>
                    </BaseCard>
                  ))}
                </BaseBox>
              </BaseBox>
            )}

            {!error && !search && totalCount > PAGE_LIMIT && (
              <BaseBox sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <BasePagination
                  count={Math.ceil(totalCount / PAGE_LIMIT)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </BaseBox>
            )}
          </>
        )}
      </BaseCard>

      {/* View Customer Modal */}
      <BaseDialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <BaseDialog.Title>
          <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
            <BaseTypography variant="h5">Customer Details</BaseTypography>
            <BaseIconButton onClick={handleCloseModal} size="small">
              <Iconify icon="mingcute:close-line" />
            </BaseIconButton>
          </BaseBox>
        </BaseDialog.Title>
        <BaseDialog.Content dividers>
          {selectedCustomer && (
            <BaseGrid container spacing={3}>
              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Name
                </BaseTypography>
                <BaseTypography variant="body1">{selectedCustomer.name}</BaseTypography>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Email
                </BaseTypography>
                <BaseTypography variant="body1" sx={{
                  maxWidth: 260,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                }} title={selectedCustomer.email}>
                  {selectedCustomer.email}
                </BaseTypography>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Phone
                </BaseTypography>
                <BaseTypography variant="body1">{selectedCustomer.phone || 'N/A'}</BaseTypography>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </BaseTypography>
                <BaseBox
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 0.75,
                    display: 'inline-flex',
                    bgcolor: selectedCustomer.status ? 'success.lighter' : 'error.lighter',
                    color: selectedCustomer.status ? 'success.dark' : 'error.dark',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  {selectedCustomer.status ? 'Active' : 'Inactive'}
                </BaseBox>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created At
                </BaseTypography>
                <BaseTypography variant="body1">
                  {selectedCustomer.createdAt ? formatDate(selectedCustomer.createdAt) : 'N/A'}
                </BaseTypography>
              </BaseGrid>
            </BaseGrid>
          )}
        </BaseDialog.Content>
        {/* Bottom Close Button */}
        <BaseBox sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2 }}>
          <BaseButton variant="outlined" onClick={handleCloseModal}>
            Close
          </BaseButton>
        </BaseBox>
      </BaseDialog>
    </DashboardContent>
  );
}
