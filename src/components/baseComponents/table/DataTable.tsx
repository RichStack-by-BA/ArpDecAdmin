import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import { Scrollbar } from 'src/components/scrollbar';
import {
  BaseTable,
  BaseTableRow,
  BaseTableBody,
  BaseTableCell,
  BaseTableHead,
  BaseTableContainer,
} from 'src/components/baseComponents/table';

export interface Column<T = any> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  format?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  rows: T[];
  title?: string;
  searchBar?: React.ReactNode;
  actionButton?: React.ReactNode;
  onRowClick?: (row: T) => void;
  getRowKey: (row: T) => string | number;
  emptyMessage?: string;
  pagination?: boolean;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowsPerPageOptions?: number[];
  view?: 'table' | 'grid';
  renderGridItem?: (row: T) => React.ReactNode;
  gridItemSize?: { xs?: number; sm?: number; md?: number; lg?: number };
}

export function DataTable<T = any>({
  columns,
  rows,
  title,
  searchBar,
  actionButton,
  onRowClick,
  getRowKey,
  emptyMessage = 'No data available',
  pagination = false,
  page = 0,
  rowsPerPage = 10,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25],
  view = 'table',
  renderGridItem,
  gridItemSize = { xs: 12, sm: 6, md: 3 },
}: DataTableProps<T>) {
  return (
    <Box>
      {(title || actionButton) && (
        <Box
          sx={{
            mb: 5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {title && (
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
          )}
          {actionButton}
        </Box>
      )}

      <Card>
        {searchBar && <Box sx={{ p: 2 }}>{searchBar}</Box>}

        {view === 'table' ? (
          <Scrollbar>
              <BaseTableContainer sx={{ overflow: 'unset' }}>
                <BaseTable sx={{ minWidth: 800 }}>
                  <BaseTableHead>
                    <BaseTableRow>
                      {columns.map((column) => (
                        <BaseTableCell
                          key={column.id}
                          align={column.align || 'left'}
                          sx={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </BaseTableCell>
                      ))}
                    </BaseTableRow>
                  </BaseTableHead>
                  <BaseTableBody>
                    {rows.length === 0 ? (
                      <BaseTableRow>
                        <BaseTableCell colSpan={columns.length} align="center">
                          <Typography variant="body2" sx={{ py: 3, color: 'text.secondary' }}>
                            {emptyMessage}
                          </Typography>
                        </BaseTableCell>
                      </BaseTableRow>
                    ) : (
                      rows.map((row) => (
                        <BaseTableRow
                          key={getRowKey(row)}
                          hover
                          onClick={() => onRowClick?.(row)}
                          sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                        >
                          {columns.map((column) => {
                            const value = (row as any)[column.id];
                            return (
                              <BaseTableCell key={column.id} align={column.align || 'left'}>
                                {column.format ? column.format(value, row) : value}
                              </BaseTableCell>
                            );
                          })}
                        </BaseTableRow>
                      ))
                    )}
                  </BaseTableBody>
                </BaseTable>
              </BaseTableContainer>
            </Scrollbar>
        ) : (
          <Box sx={{ p: 3 }}>
            {rows.length === 0 ? (
              <Typography variant="body2" sx={{ py: 3, color: 'text.secondary', textAlign: 'center' }}>
                {emptyMessage}
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {rows.map((row) => (
                  <Grid
                    key={getRowKey(row)}
                    size={{
                      xs: gridItemSize.xs,
                      sm: gridItemSize.sm,
                      md: gridItemSize.md,
                      lg: gridItemSize.lg,
                    }}
                  >
                    {renderGridItem ? renderGridItem(row) : null}
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {pagination && (
          <TablePagination
            component="div"
            page={page}
            count={totalCount || rows.length}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange || (() => {})}
            rowsPerPageOptions={rowsPerPageOptions}
            onRowsPerPageChange={onRowsPerPageChange || (() => {})}
          />
        )}
      </Card>
    </Box>
  );
}
