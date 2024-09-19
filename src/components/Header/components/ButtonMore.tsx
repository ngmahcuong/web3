import { useWeb3React } from '@web3-react/core';
import React from 'react';
import styled from 'styled-components';
import { ChainId } from '../../../config';
import { useToggleTheme } from '../../../state/application/hooks';
import { ExternalLinks } from '../../../utils/constants';
import { screenUp } from '../../../utils/styles';
import { Dropdown, DropdownMenu, DropdownToggle } from '../../Dropdown';
import { Toggle } from '../../Toggle';

const ButtonMore: React.FC = () => {
  const [theme, toggle] = useToggleTheme();
  const { chainId } = useWeb3React();

  return (
    <StyledContainer>
      <Dropdown>
        <DropdownToggle>
          <StyledButtonMore>
            <i className="fal fa-ellipsis-h-alt" />
          </StyledButtonMore>
        </DropdownToggle>
        <StyledDropdownMenu position="right">
          <ul>
            <li>
              <a href={ExternalLinks.documentation} target="_blank" rel="noreferrer">
                <span>Documentation</span>
                <i className="far fa-books"></i>
              </a>
            </li>
            <li>
              <a href={ExternalLinks.code} target="_blank" rel="noreferrer">
                <span>Code</span>
                <i className="fab fa-github"></i>
              </a>
            </li>
            <li>
              <a href={ExternalLinks.medium} target="_blank" rel="noreferrer">
                <span>Medium</span>
                <i className="fab fa-medium"></i>
              </a>
            </li>
            <li>
              <a href={ExternalLinks.twitter} target="_blank" rel="noreferrer">
                <span>Twitter</span>
                <i className="fab fa-twitter"></i>
              </a>
            </li>
            <li>
              <a href={ExternalLinks.discord} target="_blank" rel="noreferrer">
                <span>Discord</span>
                <i className="fab fa-discord"></i>
              </a>
            </li>
            <div className="separator" />
            <li className="flex">
              <span>Dark mode</span>
              <Toggle checked={theme === 'dark'} onClick={toggle} />
            </li>
            {chainId === ChainId.aurora ? (
              <li>
                <a href="//testnet.chai.xyz" rel="noreferrer">
                  <span>Testnet</span>
                </a>
              </li>
            ) : (
              <li>
                <a href="//app.chai.xyz" rel="noreferrer">
                  <span>Mainnet</span>
                </a>
              </li>
            )}
          </ul>
        </StyledDropdownMenu>
      </Dropdown>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: none;
  margin-left: 15px;
  ${screenUp('lg')`
    display: block;
  `}
`;

const StyledButtonMore = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  appearance: none;
  border-radius: 5px;
  height: 42px;
  width: 42px;
  color: ${({ theme }) => theme.white};
  border: solid 1px #e2e0e030;
  font-size: 24px;
  :hover {
    background: ${({ theme }) => theme.button.primary.hover};
  }
`;

const StyledDropdownMenu = styled(DropdownMenu)`
  margin-top: 10px;
  width: 200px;
  min-width: auto;
  ::after {
    content: '';
    background: none;
  }
  ul {
    padding: 5px 0;
    margin: 0;
    li {
      padding: 10px 16px;
      margin: 0;
      a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        font-weight: normal;
        display: flex;
        align-items: center;
        transition: all 0.1s ease-in-out 0s;
        i {
          width: 25px;
        }
        &:hover {
          color: ${({ theme }) => theme.success};
        }
      }
      &.flex {
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.1s ease-in-out 0s;
      }
    }
  }
  .separator {
    margin: 10px 16px;
    height: 1px;
    border: solid 1px ${({ theme }) => theme.input.border};
  }
`;

export default ButtonMore;
