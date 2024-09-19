import React, { ReactText } from 'react';
import DAILogo from '../assets/tokens/DAI.png';
import USDCLogo from '../assets/tokens/USDC.png';
import USDTLogo from '../assets/tokens/USDT.png';
import WETH from '../assets/tokens/WETH.png';
import WBTC from '../assets/tokens/WBTC.png';
import WNEAR from '../assets/tokens/NEAR.png';
import USN from '../assets/tokens/USN.svg';
import CH_WBTC from '../assets/tokens/CH_WBTC.svg';
import CH_ETH from '../assets/tokens/CH_WETH.svg';
import CH_NEAR from '../assets/tokens/CH_NEAR.svg';
import CH_USDC from '../assets/tokens/CH_USDC.svg';
import CH_USDT from '../assets/tokens/CH_USDT.svg';
import CH_DAI from '../assets/tokens/CH_DAI.svg';
import CH_USN from '../assets/tokens/CH_USN.svg';
import CHAI from '../assets/tokens/CHAI.png';
import VECHAI from '../assets/tokens/VECHAI.svg';
import USCA from '../assets/tokens/USCA.png';
import NO_NAME from '../assets/tokens/NO_NAME.png';
import styled from 'styled-components';

export type TokenSymbolProps = {
  symbol: string;
  size?: ReactText;
  autoHeight?: boolean;
};

const logosBySymbol: { [title: string]: string } = {
  DAI: DAILogo,
  USDC: USDCLogo,
  USDT: USDTLogo,
  WETH: WETH,
  WNEAR: WNEAR,
  USN: USN,
  ETH: WETH,
  WBTC: WBTC,
  CHAI: CHAI,
  USCA: USCA,
  CH_WBTC: CH_WBTC,
  CH_ETH: CH_ETH,
  CH_NEAR: CH_NEAR,
  CH_USDC: CH_USDC,
  CH_USDT: CH_USDT,
  CH_USCA: USCA,
  CH_DAI: CH_DAI,
  NO_NAME: NO_NAME,
  CH_USN: CH_USN,
  VECHAI: VECHAI,
};

export const TokenSymbol: React.FC<TokenSymbolProps> = ({
  symbol,
  size = 32,
  autoHeight = false,
}) => {
  return (
    <StyledImg
      className="token-symbol"
      src={logosBySymbol[symbol?.toUpperCase()] || logosBySymbol.NO_NAME}
      alt={`${symbol} Logo`}
      width={size}
      height={autoHeight ? 'auto' : size}
      rounded
    />
  );
};

const StyledImg = styled.img<{ rounded?: boolean }>`
  object-fit: contain;
  border-radius: ${({ rounded }) => rounded && '9999px'};
`;
