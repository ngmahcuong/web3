import React from 'react';
import styled from 'styled-components';
import { container, screenUp } from '../utils/styles';
import headerBg from '../assets/images/header-page.png';
import { NavLink } from 'react-router-dom';
const PageHeaderContainer: React.FC<{
  children: React.ReactNode;
  title?: string;
  iconBg?: string;
  hidden?: boolean;
  reverse?: boolean;
}> = ({ children, title, iconBg, hidden, reverse }) => {
  if (hidden) return <></>;
  return (
    <StyledPageHeader iconBg={iconBg} reverse={reverse}>
      <div className="container">
        {title && <div className="title">{title}</div>}
        {children}
      </div>
    </StyledPageHeader>
  );
};

export default PageHeaderContainer;

const StyledPageHeader = styled.div<{ iconBg: string; reverse: boolean }>`
  background-color: ${({ theme }) => theme.header.background3};
  position: relative;
  color: white;
  overflow: hidden;
  .container {
    ${container};
    padding-bottom: 1rem;
    position: relative;
    min-height: 155px;
    z-index: 0;
    display: flex;
    justify-content: flex-end;
    flex-direction: ${(p) => (p.reverse ? 'column-reverse' : 'column')};

    .title {
      font-size: 24px;
      text-transform: uppercase;
      font-weight: 500;
      color: white;
    }

    &::after {
      content: '';
      background-image: url(${(p) => (p.iconBg ? p.iconBg : headerBg)});
      background-repeat: no-repeat;
      width: 347px;
      height: 171px;
      background-size: contain;
      position: absolute;
      right: 0px;
      bottom: 0;
      display: none;
      ${screenUp('lg')`
        right: 0px;
        display: block;
      `};
    }

    ${screenUp('lg')`
        flex-direction: column;
      `};
  }
`;

export const PageHeaderMetaInfo = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  img {
    width: 20px;
    height: 20px;
  }

  .info {
    min-height: 16px;
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    .title {
      text-transform: none;
      font-size: 16px;
      font-weight: 400;
      opacity: 0.8;
    }
    .value {
      font-size: 16px;
      font-weight: 600;
      line-height: 1.2;
      i {
        font-size: 14px;
      }
    }
  }

  ${screenUp('lg')`
    width: fit-content;
    img {
      width: 32px;
      height: 32px;
    }
    .info {
      display: block;
      min-height: 45px;
      .title {
        font-size: 14px;
      }
      .value {
        font-size: 18px;
      }
    }
  `}
`;

export const StyledHeaderNavSwitch = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 2px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.header.background2};
  margin-bottom: 0px;
  position: relative;
  .indicator {
    background: white;
    width: calc(100% / 2);
    height: 38px;
    position: absolute;
    top: 2px;
    left: 2px;
    z-index: 1;
    border-radius: 4px;
    transition: transform 150ms ease;
  }
  ${screenUp('lg')`
     width: fit-content;
     margin-bottom: 20px;
    `}
`;

export const StyledSwitchItem = styled(NavLink)`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 38px;
  background-color: transparent;
  color: ${({ theme }) => theme.gray1};
  font-weight: 500;
  border-radius: 4px;

  ${screenUp('lg')`
     width: 138px;
    `}
  &.active {
    color: ${({ theme }) => theme.button.toggle.color};
    background-color: ${({ theme }) => theme.button.toggle.background};
  }
  :hover {
    &:not(.active) {
      color: ${({ theme }) => theme.white};
    }
  }
`;
