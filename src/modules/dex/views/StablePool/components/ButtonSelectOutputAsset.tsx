import React from 'react';
import { useMemo } from 'react';
import { useCallback } from 'react';
import styled from 'styled-components';
import { Dropdown, DropdownMenu, DropdownToggle } from '../../../../../components/Dropdown';
import theme from '../../../../../providers/Theme/light';
import { screenUp } from '../../../../../utils/styles';

export type ButtonSelectOutputAssetAssetProps = {
  selected: number;
  onSelect: (id: number) => void;
  onUseSingleOutput: (singleOutput: boolean) => void;
  assetInfos?: any[];
};

export const ButtonSelectOutputAsset: React.FC<ButtonSelectOutputAssetAssetProps> = ({
  selected,
  onSelect,
  onUseSingleOutput,
  assetInfos,
}) => {
  const allToken = 'All tokens';

  const symbol = useMemo(() => {
    return selected !== -1 ? assetInfos[selected]?.name : allToken;
  }, [selected, assetInfos]);

  const tokens = useMemo(() => {
    return assetInfos?.map((t) => t.name);
  }, [assetInfos]);

  const onSelectToken = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>) => {
      const value = ev.currentTarget.dataset.symbol;
      if (value === allToken) {
        onUseSingleOutput(false);
        return;
      }
      onUseSingleOutput(true);
      onSelect(tokens.indexOf(value));
    },
    [onSelect, onUseSingleOutput, tokens],
  );

  return (
    <Dropdown>
      <DropdownToggle>
        <StyledToken>
          {symbol}
          <i className="far fa-angle-down" />
        </StyledToken>
      </DropdownToggle>
      <DropdownMenu position="right">
        <StyledDropdownHeader>Token</StyledDropdownHeader>
        <StyleDropdownList>
          {[allToken]?.concat(tokens)?.map((token, index) => (
            <StyleDropdownItem
              active={token === symbol}
              data-symbol={token}
              key={index}
              onClick={onSelectToken}
            >
              {token}
            </StyleDropdownItem>
          ))}
        </StyleDropdownList>
      </DropdownMenu>
    </Dropdown>
  );
};

const StyledToken = styled.span`
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.success};
  i {
    margin-left: 4px;
  }
  :hover {
    color: ${({ theme }) => theme.text.highlight};
    i {
      color: ${({ theme }) => theme.text.highlight};
    }
  }
  ${screenUp('lg')`
    font-size: 16px;
    i {
      margin-left: 6px;
    }
  `}
`;

const StyledDropdownHeader = styled.div`
  margin-bottom: 0px;
  padding-bottom: 8px;
  font-size: 16px;
  font-weight: bold;
  padding-left: 8px;
  color: ${({ theme }) => theme.text.primary};
  border-bottom: 1px dashed ${({ theme }) => theme.box.border};
`;

const StyleDropdownList = styled.div`
  margin-top: 10px;
  margin-left: -8px;
  margin-right: -8px;
  font-size: 16px;
  font-weight: 600;
`;

const StyleDropdownItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: normal;
  color: ${({ active }) => (active ? theme.text.highlight : '')};
  :hover {
    color: ${({ theme }) => theme.text.highlight};
  }
`;
