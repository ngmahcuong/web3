import React, { useCallback, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import styled from 'styled-components';
import { useBodyClass } from '../../../hooks/useBodyClass';
import {
  useIsMainNavOpen,
  useSetMainNavOpen,
  useToggleTheme,
} from '../../../state/application/hooks';
import { ExternalLinks } from '../../../utils/constants';
import { screenUp } from '../../../utils/styles';
import ImgLogo from '../../../assets/images/logo.png';
import imgBgMenu from '../../../assets/images/bg-menu.png';
import { useTvl } from '../../../hooks/useTvl';
import imgHeaderTvl from '../../../assets/images/header-tvl.svg';
import { formatNumber } from '../../../utils/numbers';
import { ChainId } from '../../../config';
import { Toggle } from '../../Toggle';

export const NavBar: React.FC = () => {
  const location = useLocation();
  const isOpen = useIsMainNavOpen();
  const { chainId } = useWeb3React();
  const setMainNavOpen = useSetMainNavOpen();
  useBodyClass(isOpen, 'no-scroll');
  const [isShowMore, setIsShowMore] = useState(true);
  const toggleShowMore = useCallback(() => {
    setIsShowMore((s) => !s);
  }, []);
  const tvl = useTvl();
  const [theme, toggle] = useToggleTheme();

  const onClose = useCallback(() => {
    if (isOpen) {
      setMainNavOpen(false);
    }
  }, [isOpen, setMainNavOpen]);

  const onClickItem = useCallback(() => {
    if (isOpen) {
      setMainNavOpen(false);
    }
  }, [isOpen, setMainNavOpen]);

  return (
    <StyledBackdrop>
      <StyledContainer open={isOpen}>
        <StyledHeader>
          <StyledLogoNavLink to="/">
            <img src={ImgLogo} alt="CHAI" />
          </StyledLogoNavLink>
        </StyledHeader>
        <StyledTvl>
          <img src={imgHeaderTvl} alt="tvl" />
          TVL:
          <span>
            {formatNumber(tvl, {
              fractionDigits: 0,
              currency: 'USD',
              compact: false,
            })}
          </span>
        </StyledTvl>
        <StyledNav>
          <StyledNavItemWeb>
            <StyledNavLink
              className={
                /markets/.test(location.pathname) || /market/g.test(location.pathname)
                  ? 'active'
                  : ''
              }
              onClick={onClickItem}
              to="/lending"
              exact
            >
              Lending
            </StyledNavLink>
          </StyledNavItemWeb>
          <StyledNavItemMobile>
            <StyledNavLink onClick={onClickItem} to="/lending" exact>
              Dashboard
            </StyledNavLink>
          </StyledNavItemMobile>
          <StyledNavItemMobile>
            <StyledNavLink
              onClick={onClickItem}
              to="/lending/markets"
              className={
                /markets/.test(location.pathname) || /market/g.test(location.pathname)
                  ? 'active'
                  : ''
              }
              exact
            >
              Markets
            </StyledNavLink>
          </StyledNavItemMobile>
          <StyledNavItem>
            <StyledNavLink onClick={onClickItem} to="/swap">
              Swap
            </StyledNavLink>
          </StyledNavItem>
          <StyledNavItem>
            <StyledNavLink onClick={onClickItem} to="/pools">
              Pools
            </StyledNavLink>
          </StyledNavItem>
          <StyledNavItem>
            <StyledNavLink onClick={onClickItem} to="/lockdrop">
              Lockdrop
            </StyledNavLink>
          </StyledNavItem>
          <StyledNavItem>
            <StyledNavLink onClick={onClickItem} to="/staking">
              Staking
            </StyledNavLink>
          </StyledNavItem>
          <StyledNavItem>
            <StyledNavLink onClick={onClickItem} to="/launchpad">
              Launchpad
            </StyledNavLink>
          </StyledNavItem>
          {chainId === ChainId.ropsten && (
            <StyledNavItem>
              <StyledNavLink onClick={onClickItem} to="/faucet">
                Faucet
              </StyledNavLink>
            </StyledNavItem>
          )}
          <StyledMore>
            <StyledMoreHeader active={!isShowMore} onClick={toggleShowMore}>
              More
              <i className={isShowMore ? 'far fa-chevron-down' : 'far fa-chevron-up'}></i>
            </StyledMoreHeader>
            <StyledMoreContent open={isShowMore}>
              <StyledNavExternalLink
                href={ExternalLinks.documentation}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="icon">
                  <i className="far fa-books"></i>
                  <span>Documentation</span>
                </span>
              </StyledNavExternalLink>
              <StyledNavExternalLink
                href={ExternalLinks.code}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="icon">
                  <i className="fab fa-github"></i>
                  <span>Code</span>
                </span>
              </StyledNavExternalLink>
              <StyledNavExternalLink
                href={ExternalLinks.medium}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="icon">
                  <i className="fab fa-medium"></i>
                  <span>Medium</span>
                </span>
              </StyledNavExternalLink>
              <StyledNavExternalLink
                href={ExternalLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="icon">
                  <i className="fab fa-twitter"></i>
                  <span>Twitter</span>
                </span>
              </StyledNavExternalLink>
              <StyledNavExternalLink
                href={ExternalLinks.discord}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="icon">
                  <i className="fab fa-discord"></i>
                  <span>Discord</span>
                </span>
              </StyledNavExternalLink>
              {chainId === ChainId.aurora ? (
                <StyledNavExternalLink
                  href="//testnet.chai.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="icon">
                    <span>Testnet</span>
                  </span>
                </StyledNavExternalLink>
              ) : (
                <StyledNavExternalLink
                  href="//app.chai.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="icon">
                    <span>Mainnet</span>
                  </span>
                </StyledNavExternalLink>
              )}
            </StyledMoreContent>
          </StyledMore>
          <StyledDarkMode>
            <span>Dark mode</span>
            <Toggle checked={theme === 'dark'} onClick={toggle} />
          </StyledDarkMode>
        </StyledNav>
      </StyledContainer>
      <div className="backdrop" onClick={onClose}></div>
    </StyledBackdrop>
  );
};

const StyledBackdrop = styled.div``;

const StyledContainer = styled.nav<{ open?: boolean }>`
  position: fixed;
  width: 80%;
  height: 100%;
  padding: 20px;
  background-color: ${({ theme }) => theme.header.background};
  overflow: auto;
  z-index: 999;
  left: 0;
  top: 0;
  bottom: 0;
  will-change: transform;
  transform: ${(p) => (p.open ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.2s ease-out;
  background-image: url(${imgBgMenu});
  background-size: 164px;
  background-repeat: no-repeat;
  background-position: bottom right;

  & + .backdrop {
    position: fixed;
    display: block;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 8;
    background-color: #00000073;
    will-change: opacity;
    transition: opacity 150ms ease-out;
    opacity: ${(p) => (p.open ? '.4' : '0')};
    pointer-events: ${(p) => (p.open ? 'auto' : 'none')};
  }

  ::-webkit-scrollbar {
    width: 5px;
  }

  ::-webkit-scrollbar-track {
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: var(--color-box-background-secondary);
  }

  ${screenUp('lg')`
    margin-left: auto;
    transform: unset;
    position: relative;
    padding: 0px;
    overflow: unset;
    background: none;
    width:fit-content;
    ::after {
      display: none;
    }

    &+.backdrop{
      display: none;
    }
  `}
`;

const StyledHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 500;
  color: ${({ theme }) => theme.white};
  ${screenUp('lg')`
    display: none;
  `}
`;

const StyledTvl = styled.div`
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 4px 10px 4px 4px;
  background-color: #d8d8d81a;
  border-radius: 5px;
  font-size: 16px;
  font-weight: normal;
  color: ${({ theme }) => theme.white};
  img {
    width: 36px;
    margin-right: 10px;
  }
  span {
    margin-left: 8px;
    font-size: 16px;
    font-weight: bold;
    color: ${({ theme }) => theme.white};
  }
  ${screenUp('lg')`
    display: none;
  `}
`;

const StyledLogoNavLink = styled(NavLink)`
  img {
    width: 130px;
  }
`;

const StyledNav = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 0;
  margin: 15px 0 0;
  ${screenUp('lg')`
    height: 100%;
    margin: 0;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  `}
`;

const StyledNavItem = styled.li`
  padding: 0;
  margin: 0;
  ${screenUp('lg')`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 19px;
    padding: 0;
    text-align: left;
  `}
`;

const StyledNavItemMobile = styled(StyledNavItem)`
  display: flex;
  width: 100%;
  a {
    width: 100%;
  }
  ${screenUp('lg')`
    display: none;
  `}
`;

const StyledNavItemWeb = styled(StyledNavItem)`
  display: none;
  ${screenUp('lg')`
    display: flex;
  `}
`;

const StyledNavLink = styled(NavLink)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 16px;
  font-weight: 500;
  color: #ffffffcc;
  height: fit-content;
  opacity: 0.7;
  &:hover {
    color: ${({ theme }) => theme.white};
  }
  &.active {
    font-weight: 500;
    opacity: 1;
    color: ${({ theme }) => theme.white};
    border: none;
  }
  justify-content: flex-start;
  padding: 10px 0;
  ${screenUp('lg')`
     height: 79px;
    color: #ffffffcc;
    font-size: 16px;
    border-bottom: none;
    opacity: 0.7;
    border-bottom: 2px solid transparent;
    &.active {
      opacity: 1;
      border-bottom: 2px solid white;
    }
  `}
`;

const StyledMore = styled.div`
  width: 100%;
  ${screenUp('lg')`
    display: none;
  `}
`;

const StyledMoreHeader = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  padding-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ active, theme }) => (active ? theme.white : '#ffffff99')};
  i {
    font-size: 14px;
  }
`;

const StyledMoreContent = styled.div<{ open?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 5px 0 0 20px;
  transform-origin: top;
  transform: ${(p) => (p.open ? 'scaleY(0)' : 'scaleY(1)')};
  opacity: ${(p) => (p.open ? 0.1 : 1)};
  transition: transform 0.2s linear;
  height: ${(p) => (!p.open ? 'fit-content' : '0px')};
`;

const StyledNavExternalLink = styled.a`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: normal;
  color: ${({ theme }) => theme.white};
  opacity: 0.7;
  padding-bottom: 16px;
  .icon {
    display: flex;
    align-items: center;
    i {
      font-size: 14px;
      margin-right: 12px;
      width: 15px;
    }
  }
`;

const StyledDarkMode = styled.li`
  padding: 0;
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.white};
  justify-content: space-between;
  ${screenUp('lg')`
    display: none;
  `}
`;
