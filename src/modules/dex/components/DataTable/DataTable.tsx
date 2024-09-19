import { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { screenUp } from '../../../../utils/styles';
import Pagination from './Pagination';

export interface TableColumn<T> {
  id: string;
  name?: string | number | React.ReactNode;
  sortField?: string;
  cell?: (row: T, rowIndex: number, column: TableColumn<T>) => React.ReactNode;
  width?: string;
  right?: boolean;
  center?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading: boolean;
  onRowClicked?: (row: T) => void;
  highlightOnHover?: boolean;
  pagination?: boolean;
  noDataComponent?: React.ReactNode;
}

export const DataTable = <T extends object>({
  data,
  columns,
  loading,
  highlightOnHover,
  onRowClicked,
  pagination = true,
  noDataComponent,
}: DataTableProps<T>) => {
  const enabledPagination = useMemo(
    () => pagination && !loading && data?.length > 0,
    [data, loading, pagination],
  );

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPerPage] = useState<number>(1);

  const tableRows = useMemo(() => {
    if (pagination) {
      const lastIndex = currentPage * rowsPerPage;
      const firstIndex = lastIndex - rowsPerPage;

      return data?.slice(firstIndex, lastIndex);
    }

    return data;
  }, [currentPage, data, pagination, rowsPerPage]);

  const handleChangePage = useCallback((page: number) => setCurrentPerPage(page), []);

  const handleChangeRowsPerPage = useCallback(
    (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      if (tableRows?.length) {
        const rowCount = tableRows.length;
        const updatedPage = Math.ceil(rowCount / newRowsPerPage);
        const recalculatedPage = Math.min(currentPage, updatedPage);
        handleChangePage(recalculatedPage);
      }
    },
    [currentPage, handleChangePage, tableRows?.length],
  );

  useEffect(() => {
    handleChangePage(1);
  }, [data?.length, handleChangePage]);

  return (
    <>
      {loading ? (
        <StyledLoading>
          <i className="fal fa-spinner-third fa-spin fa-2x text-muted" />
        </StyledLoading>
      ) : (
        <>
          {!data?.length && noDataComponent ? (
            noDataComponent
          ) : (
            <StyledDataTable>
              <StyledTable>
                <StyledTableHeader>
                  <tr>
                    {columns.map((column) => (
                      <StyledTableColumnHead
                        key={column.id}
                        width={column.width}
                        right={column.right}
                        center={column.center}
                      >
                        {column.name}
                      </StyledTableColumnHead>
                    ))}
                  </tr>
                </StyledTableHeader>
                <StyledTableBody>
                  {tableRows?.length ? (
                    tableRows?.map((row, i) => {
                      return (
                        <StyledTableRow
                          key={i}
                          onClick={() => onRowClicked?.(row)}
                          highlightOnHover={highlightOnHover}
                        >
                          {columns.map((column) => {
                            return (
                              <StyledTableCell
                                id={`cell-${column.id}-${i}`}
                                key={`cell-${column.id}-${i}`}
                                width={column.width}
                                right={column.right}
                                center={column.center}
                              >
                                {column.cell && column.cell(row, i, column)}
                              </StyledTableCell>
                            );
                          })}
                        </StyledTableRow>
                      );
                    })
                  ) : (
                    <StyledNoData>
                      <td colSpan={columns?.length}>There is no orders found</td>
                    </StyledNoData>
                  )}
                </StyledTableBody>
              </StyledTable>
              {enabledPagination && (
                <Pagination
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                  rowCount={data?.length}
                  currentPage={currentPage}
                  rowsPerPage={rowsPerPage}
                />
              )}
            </StyledDataTable>
          )}
        </>
      )}
    </>
  );
};

const StyledDataTable = styled.div`
  overflow: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  caption-side: bottom;
  border-collapse: collapse;
  overflow: hidden;
`;

const StyledTableHeader = styled.thead`
  background-color: ${({ theme }) => theme.box.header};
  border-bottom: solid 1px ${({ theme }) => theme.box.border};
  font-size: 13px;
  font-weight: 500;
`;

const StyledTableColumnHead = styled.th<{ width?: string; right?: boolean; center?: boolean }>`
  width: ${({ width }) => (width ? width : 'auto')};
  padding: 1rem 0.75rem;
  text-align: left;
  ${({ right }) => right && 'text-align: right'};
  ${({ center }) => center && 'text-align: center'};
  color: ${({ theme }) => theme.gray3};
  white-space: nowrap;
  cursor: pointer;
`;

const StyledTableBody = styled.tbody`
  background-color: ${({ theme }) => theme.box.itemBackground};
`;

const StyledTableRow = styled.tr<{ highlightOnHover?: boolean }>`
  border-bottom: solid 1px ${({ theme }) => theme.box.border};
  ${screenUp('lg')`
    padding: 0 20px;
  `}
  ${({ highlightOnHover }) =>
    highlightOnHover &&
    css`
      cursor: pointer;
      &:hover {
        color: ${({ theme }) => theme.success};
      }
    `};
`;

const StyledTableCell = styled.td<{ width?: string; right?: boolean; center?: boolean }>`
  width: ${({ width }) => (width ? width : 'auto')};
  padding: 1rem 0.75rem;
  ${({ right }) => right && 'text-align: right'};
  ${({ center }) => center && 'text-align: center'};
  font-size: 14px;
  ${screenUp('lg')`
    font-size: 16px;
  `}
`;

const StyledNoData = styled.tr`
  text-align: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.text.muted};
  background-color: ${({ theme }) => theme.box.itemBackground};
  td {
    padding: 24px;
  }
`;

const StyledLoading = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.box.itemBackground};
  padding: 20px 0;
  border-radius: 0;
`;
export default DataTable;
