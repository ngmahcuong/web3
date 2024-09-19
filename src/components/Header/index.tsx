import React, { useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Button, ButtonConnect } from '../Buttons';
import styled from 'styled-components';
import { usePendingTransactionCount } from '../../state/transactions/hooks';
import { shortenAddress } from '../../utils/addresses';
import useModal from '../../hooks/useModal';
import AccountModal from '../AccountModal/AccountModal';
import { NavBar } from './components/NavBar';
import ImgLogo from '../../assets/images/logo.png';
import ImgAccount from '../../assets/icons/account.svg';
import imgHeaderTvl from '../../assets/images/header-tvl.svg';
import ButtonMore from './components/ButtonMore';
import { screenUp } from '../../utils/styles';
import { useToggleMainNav } from '../../state/application/hooks';
import { NavLink } from 'react-router-dom';
import { useUserWallet } from '../../providers/UserWalletProvider';
import { useTvl } from '../../hooks/useTvl';
import { formatNumber } from '../../utils/numbers';
import { ChainId } from '../../config';

const Header: React.FC = () => {
  const { account } = useUserWallet();
  const shortenAccount = shortenAddress(account || '');
  const [showAccountModal] = useModal(<AccountModal />);
  const pendingTransactionCount = usePendingTransactionCount();
  const toggleMainNav = useToggleMainNav();
  const tvl = useTvl();
  const { chainId } = useWeb3React();

  const onToggleClick = useCallback(
    (ev: React.MouseEvent) => {
      ev.stopPropagation();
      toggleMainNav();
    },
    [toggleMainNav],
  );

  return (
    <StyledHeader>
      <ButtonToggleMenu className="fal fa-bars" onClick={onToggleClick} />
      <StyledLogoNavLink to="/">
        <StyledLogo src={ImgLogo} />
      </StyledLogoNavLink>
      <NavBar />
      <StyledInfoContainer>
        {chainId === ChainId.ropsten && (
          <StyledTestnet>
            <span>Testnet</span>
          </StyledTestnet>
        )}

        <StyledTvl>
          <img src={imgHeaderTvl} alt="tvl" />
          TVL:{' '}
          {formatNumber(tvl, {
            fractionDigits: 0,
            currency: 'USD',
            compact: false,
          })}
        </StyledTvl>
        {account ? (
          <ButtonAccount onClick={showAccountModal}>
            {pendingTransactionCount > 0 ? (
              <>
                <span>
                  {pendingTransactionCount} Pending
                  {pendingTransactionCount > 1 ? 's' : ''}
                </span>
                <i className="far fa-circle-notch fa-spin" />
              </>
            ) : (
              <>
                <img src={ImgAccount} alt="account" />
                <span>{shortenAccount}</span>
              </>
            )}
          </ButtonAccount>
        ) : (
          <ButtonConnect />
        )}
        <ButtonMore />
      </StyledInfoContainer>
    </StyledHeader>
  );
};

const StyledHeader = styled.header`
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  background-color: ${({ theme }) => theme.header.background2};
  position: relative;
  z-index: 9;
  ${screenUp('lg')`
    padding: 0 32px;
  `}
`;

const ButtonToggleMenu = styled.i<{ isClose?: boolean }>`
  color: ${({ theme }) => theme.white};
  font-size: 20px;
  margin-right: 8px;
  opacity: 0.8;
  ${screenUp('lg')`
    display: none;
  `}
`;

const StyledLogoNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
`;

const StyledLogo = styled.img`
  width: 90px;
  margin-bottom: 8px;
  ${screenUp('lg')`
    width: 140px;
    margin-bottom: 10px;
  `}
`;

const StyledInfoContainer = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledTvl = styled.div`
  display: none;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 10px 0 1px;
  border: solid 1px #e2e0e030;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.white};
  img {
    width: 36px;
    margin-right: 10px;
  }
  ${screenUp('lg')`
    display: flex;
  `}
`;

const ButtonAccount = styled(Button)`
  margin-left: 15px;
  height: 42px;
  background-color: transparent;
  border: solid 1px #e2e0e030;
  border-radius: 5px;
  color: ${({ theme }) => theme.white};
  img {
    width: 20px;
  }
  i {
    font-size: 14px;
    margin-left: 5px;
  }
  :not(:disabled) {
    :hover {
      background: ${({ theme }) => theme.button.primary.hover};
    }
  }
`;
const StyledTestnet = styled.div`
  margin-right: 15px;
  display: none;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 20px;
  border: solid 1px ${({ theme }) => theme.orange};
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.white};
  background: ${({ theme }) => theme.orange};
  ${screenUp('lg')`
    display: flex;
  `}
`;
export default Header;
