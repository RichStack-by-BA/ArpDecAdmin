import type { RootState, AppDispatch } from 'src/store';
import type { User } from 'src/store/slices/usersSlice';
import type { Column } from 'src/components/baseComponents';

import { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { PAGE_LIMIT } from 'src/constant';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchUsers } from 'src/store/slices/usersSlice';
import { Iconify } from 'src/components/iconify';
import {
  BaseBox,
  BaseCard,
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
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsers({ page, limit: PAGE_LIMIT, role: 'customer' }));
  }, [dispatch, page]);

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
    const matchRole = row.role?.toLowerCase().includes(searchLower);
    const matchStatus = row.status?.toLowerCase().includes(searchLower);

    return matchName || matchEmail || matchPhone || matchRole || matchStatus;
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
      id: 'role',
      label: 'Role',
      align: 'center',
      format: (value) => (
        <BaseBox
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 0.75,
            display: 'inline-flex',
            bgcolor: 'info.lighter',
            color: 'info.dark',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'capitalize',
          }}
        >
          {value}
        </BaseBox>
      ),
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
        <BaseBox sx={{ p: 3 }}>
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
            <DataTable columns={columns} rows={filteredRows} />

            {!error && totalCount > PAGE_LIMIT && (
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
        title="Customer Details"
        maxWidth="sm"
      >
        {selectedCustomer && (
          <BaseBox sx={{ p: 2 }}>
            <BaseBox sx={{ mb: 3 }}>
              <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                Name
              </BaseTypography>
              <BaseTypography variant="body1">{selectedCustomer.name}</BaseTypography>
            </BaseBox>

            <BaseBox sx={{ mb: 3 }}>
              <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                Email
              </BaseTypography>
              <BaseTypography variant="body1">{selectedCustomer.email}</BaseTypography>
            </BaseBox>

            <BaseBox sx={{ mb: 3 }}>
              <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                Phone
              </BaseTypography>
              <BaseTypography variant="body1">{selectedCustomer.phone || 'N/A'}</BaseTypography>
            </BaseBox>

            <BaseBox sx={{ mb: 3 }}>
              <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                Role
              </BaseTypography>
              <BaseTypography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {selectedCustomer.role}
              </BaseTypography>
            </BaseBox>

            <BaseBox sx={{ mb: 3 }}>
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
            </BaseBox>

            <BaseBox sx={{ mb: 3 }}>
              <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                Created At
              </BaseTypography>
              <BaseTypography variant="body1">
                {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleString() : 'N/A'}
              </BaseTypography>
            </BaseBox>

            <BaseBox sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
              <BaseButton variant="contained" onClick={handleCloseModal}>
                Close
              </BaseButton>
            </BaseBox>
          </BaseBox>
        )}
      </BaseDialog>
    </DashboardContent>
  );
}
