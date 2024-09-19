import styled from 'styled-components';
import { screenUp } from '../../../../../utils/styles';
import { ChangeEvent } from 'react';

const SearchInput: React.FC<{
  keyword: string;
  handleInputChange: (ev?: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}> = ({ keyword, handleInputChange, placeholder }) => {
  return (
    <StyledInputContainer>
      <i className="far fa-search"></i>
      <StyledInput
        type="text"
        id="search-input"
        placeholder={placeholder || 'Search pools'}
        autoComplete="off"
        value={keyword}
        onChange={handleInputChange}
      />
    </StyledInputContainer>
  );
};

export default SearchInput;

const StyledInputContainer = styled.div`
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border-radius: 5px;
  border: solid 1px ${({ theme }) => theme.box.border};
  background-color: ${({ theme }) => theme.box.itemBackground};
  display: flex;
  align-items: center;
  position: relative;
  i {
    font-size: 14px;
    padding-right: 8px;
    color: ${({ theme }) => theme.gray5};
  }
  ${screenUp('lg')`
    width: 300px;
    min-width: 200px;
    height: 46px;
    padding: 0 16px;
    i {
      font-size: 16px;
    }
  `};
  z-index: 2;
`;

const StyledInput = styled.input`
  width: 100%;
  font-size: 14px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text.primary};
  ::placeholder {
    color: ${({ theme }) => theme.input.placeholder};
    font-size: 14px;
  }
  ${screenUp('lg')`
    font-size: 16px;
    ::placeholder {
    font-size: 16px;
    }
  `};
`;
