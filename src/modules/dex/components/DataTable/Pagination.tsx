import { FC, useCallback, useMemo } from 'react';
import styled from 'styled-components';

export type PaginationProps = {
  rowsPerPage: number;
  rowCount: number;
  onChangePage: (p: number) => void;
  onChangeRowsPerPage: (r: number) => void;
  currentPage: number;
};

const Pagination: FC<PaginationProps> = ({
  rowsPerPage,
  rowCount,
  onChangePage,
  onChangeRowsPerPage,
  currentPage,
}) => {
  const onChangeRows = useCallback(
    (e) => {
      onChangeRowsPerPage(+e.target.value);
    },
    [onChangeRowsPerPage],
  );

  const handleBackButtonClick = () => {
    onChangePage(currentPage - 1);
  };

  const handleNextButtonClick = () => {
    onChangePage(currentPage + 1);
  };

  const numberOfPage = useMemo(() => {
    return rowCount < rowsPerPage ? 1 : Math.ceil(rowCount / rowsPerPage);
  }, [rowCount, rowsPerPage]);

  return (
    <StyleContainer>
      <StyledRowPerPage>
        <span className="title">Rows per page:</span>
        <StyledRowPerPageWrapper>
          <StyledRowPerPageOption aria-label="Rows per page:" onChange={onChangeRows}>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
            <option value={30}>30</option>
          </StyledRowPerPageOption>
          <div>
            <i className="far fa-angle-down"></i>
          </div>
        </StyledRowPerPageWrapper>
      </StyledRowPerPage>
      <StyledPagination>
        <StyledNav onClick={handleBackButtonClick} disabled={currentPage === 1}>
          <i className="fal fa-angle-double-left"></i>
        </StyledNav>
        <span className="page">
          {(currentPage - 1) * rowsPerPage + 1}-
          {currentPage * rowsPerPage > rowCount ? rowCount : currentPage * rowsPerPage} of{' '}
          {rowCount}
        </span>
        <StyledNav onClick={handleNextButtonClick} disabled={currentPage >= numberOfPage}>
          <i className="fal fa-angle-double-right"></i>
        </StyledNav>
      </StyledPagination>
    </StyleContainer>
  );
};

export default Pagination;

const StyleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-top: 24px;
`;

const StyledRowPerPage = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 8px;
  }
  .title {
    color: ${({ theme }) => theme.gray3};
  }
`;

const StyledRowPerPageWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  > div {
    position: absolute;
    top: 0;
    right: 10px;
    cursor: pointer;
    user-select: none;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: end;
    width: 100%;
    height: 100%;
  }
`;

const StyledRowPerPageOption = styled.select`
  cursor: pointer;
  height: 30px;
  max-width: 100%;
  user-select: none;
  padding-left: 8px;
  padding-right: 24px;
  box-sizing: content-box;
  font-size: inherit;
  color: inherit;
  background-color: transparent;
  appearance: none;
  direction: ltr;
  flex-shrink: 0;
  outline: none;
  font-size: 14px;
  background-color: ${({ theme }) => theme.box.itemBackground};
  border: solid 1px ${({ theme }) => theme.box.border};
  option {
    background-color: ${({ theme }) => theme.box.background};
    &:hover {
      background-color: ${({ theme }) => theme.success};
    }
  }
`;

const StyledPagination = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 13px;
  }
  .page {
    color: ${({ theme }) => theme.text.primary};
  }
`;

const StyledNav = styled.div<{ disabled?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 5px;
  border: solid 1px ${({ theme, disabled }) => (disabled ? theme.muted : theme.success)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.text.primary};
  }
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  color: ${({ theme, disabled }) => (disabled ? theme.muted : theme.success)};
  i {
    font-size: 14px;
  }
`;
