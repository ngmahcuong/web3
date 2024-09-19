import { useCallback, useMemo } from 'react';
import Select from 'react-select';
import styled from 'styled-components';
import { LimitOrderExpiredOptions, LimitOrderExpireType } from '../../../../../utils/constants';

export type LimitOrderExpiredProps = {
  onChangeExpiredTime?: (type?: LimitOrderExpireType) => void;
  expireTimeType?: LimitOrderExpireType;
};

export const LimitOrderExpired: React.FC<LimitOrderExpiredProps> = ({
  onChangeExpiredTime,
  expireTimeType,
}) => {
  const onChangItem = useCallback(
    (item) => {
      onChangeExpiredTime(item?.value);
    },
    [onChangeExpiredTime],
  );

  const value = useMemo((): { value?: LimitOrderExpireType; label?: string } => {
    return (
      LimitOrderExpiredOptions.find((item) => item.value === expireTimeType) ??
      LimitOrderExpiredOptions[0]
    );
  }, [expireTimeType]);

  return (
    <StyledLimitOrderExpiresWrapper>
      <span>
        <StyledSelect
          classNamePrefix="header-select"
          options={LimitOrderExpiredOptions}
          isSearchable={false}
          onChange={onChangItem}
          value={value}
        />
      </span>
    </StyledLimitOrderExpiresWrapper>
  );
};

const StyledLimitOrderExpiresWrapper = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: end;
`;

export const StyledSelect = styled(Select)`
  width: 100%;
  .header-select__control {
    font-size: 16px;
    background: none;
    border: solid 1px ${({ theme }) => theme.box.itemBackground};
    border-radius: 0px;
    min-height: 28px;
    :hover,
    :focus,
    :active {
      border: solid 1px ${({ theme }) => theme.box.itemBackground};
      color: ${({ theme }) => theme.text.highlight};
      .header-select__value-container {
        color: ${({ theme }) => theme.text.highlight};
      }
      .header-select__indicator {
        color: ${({ theme }) => theme.text.highlight};
      }
    }
  }
  .header-select__control--is-focused {
    border: solid 1px ${({ theme }) => theme.box.itemBackground};
    outline: none;
    box-shadow: none;
  }
  .header-select__indicator-separator {
    display: none;
  }
  .header-select__indicator {
    padding: 0px 4px;
    color: ${({ theme }) => theme.text.primary};
  }

  .header-select__menu {
    margin-top: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: 14px;
    font-weight: normal;
    background-color: ${({ theme }) => theme.box.itemBackground};
    border-radius: 0px;
  }
  .header-select__menu {
    width: 100px;
  }
  .header-select__value-container {
    padding: 0;
  }
  .header-select__single-value {
    margin-left: auto;
    color: ${({ theme }) => theme.text.primary};
    :hover {
      color: ${({ theme }) => theme.text.highlight};
    }
  }
  .header-select__option--is-selected {
    background-color: transparent !important;
    color: ${({ theme }) => theme.text.highlight};
  }
  .header-select__option--is-focused {
    background-color: transparent !important;
    color: ${({ theme }) => theme.text.highlight};
  }

  @media (max-width: 768px) {
    min-width: 120px;
  }
`;
