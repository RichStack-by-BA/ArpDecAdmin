import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { _users } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  BaseBox,
  BaseGrid,
  BaseDialog,
  BaseTypography,
  BaseIconButton,
} from 'src/components/baseComponents';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { UserProps } from '../user-table-row';

// ----------------------------------------------------------------------

export function UserView() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const dataFiltered: UserProps[] = applyFilter({
    inputData: _users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const handleViewUser = useCallback((user: UserProps) => {
    setSelectedUser(user);
    setOpenModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
    setSelectedUser(null);
  }, []);

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Users
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New user
        </Button>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={_users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    _users.map((user) => user.id)
                  )
                }
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'company', label: 'Company' },
                  { id: 'role', label: 'Role' },
                  { id: 'isVerified', label: 'Verified', align: 'center' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onViewUser={handleViewUser}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, _users.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={_users.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {/* View User Modal */}
      <BaseDialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <BaseDialog.Title>
          <BaseBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
            <BaseTypography variant="h5">User Details</BaseTypography>
            <BaseIconButton onClick={handleCloseModal} size="small">
              <Iconify icon="mingcute:close-line" />
            </BaseIconButton>
          </BaseBox>
        </BaseDialog.Title>
        <BaseDialog.Content dividers>
          {selectedUser && (
            <BaseGrid container spacing={3}>
              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Name
                </BaseTypography>
                <BaseTypography variant="body1">{selectedUser.name}</BaseTypography>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Company
                </BaseTypography>
                <BaseTypography variant="body1">{selectedUser.company}</BaseTypography>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Role
                </BaseTypography>
                <BaseTypography variant="body1">{selectedUser.role}</BaseTypography>
              </BaseGrid>

              <BaseGrid size={{ xs: 12, sm: 6 }}>
                <BaseTypography variant="subtitle2" color="text.secondary" gutterBottom>
                  Verified
                </BaseTypography>
                <BaseBox
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 0.75,
                    display: 'inline-flex',
                    bgcolor: selectedUser.isVerified ? 'success.lighter' : 'warning.lighter',
                    color: selectedUser.isVerified ? 'success.dark' : 'warning.dark',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  {selectedUser.isVerified ? 'Verified' : 'Not Verified'}
                </BaseBox>
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
                    bgcolor: selectedUser.status === 'banned' ? 'error.lighter' : 'success.lighter',
                    color: selectedUser.status === 'banned' ? 'error.dark' : 'success.dark',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {selectedUser.status}
                </BaseBox>
              </BaseGrid>
            </BaseGrid>
          )}
        </BaseDialog.Content>
      </BaseDialog>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
