import styled from 'styled-components';
import { BigNumberValue } from '../../../../components/BigNumberValue';
import { LaunchPadConfig } from '../../../../config';
import { useTokenConfig } from '../../../../hooks/useTokenConfig';
import { TokenSymbol } from '../../../../components/TokenSymbol';
import { StyledBar } from './Share';
import { IDOStatus, LaunchpadInfo, Status } from '../../models';
import { useMemo, useState } from 'react';
import { Zero } from '@ethersproject/constants';
import { Precision } from '../../../../utils/constants';

export type LaunchPadItemProps = {
  config: LaunchPadConfig;
  index: number;
  info?: LaunchpadInfo;
};
const LaunchpadItem: React.FC<LaunchPadItemProps> = ({ config, index, info }) => {
  const saleToken = useTokenConfig(config?.saleToken);
  const paymentToken = useTokenConfig(config?.paymentToken);
  const [textDescription, setTextDescription] = useState<string>();

  const statusInfo = useMemo(() => {
    if (info?.status === IDOStatus.Cancel) {
      setTextDescription('Ido had cancel');
      return Status.Cancel;
    }
    if (info?.status === IDOStatus.Inactive) {
      setTextDescription('Ido not active');
      return Status.Inactive;
    }
    if (Date.now() < info?.startTime?.toNumber() * 1000) {
      setTextDescription('Presale start in');
      return Status.Upcomming;
    }
    if (
      Date.now() >= info?.startTime?.toNumber() * 1000 &&
      Date.now() < info?.endTime?.toNumber() * 1000
    ) {
      setTextDescription('Presale end in');
      return Status.Salelive;
    }
    if (
      Date.now() >= info?.endTime?.toNumber() * 1000 &&
      Date.now() < (info?.endTime?.toNumber() + info?.withdrawDelay) * 1000
    ) {
      setTextDescription('Presale ended');
      return Status.Ended;
    }
    if (Date.now() >= (info?.endTime?.toNumber() + info?.withdrawDelay) * 1000) {
      setTextDescription('Presale can claimable');
      return Status.Claimable;
    }
    return;
  }, [info]);

  const totalAmountSold = useMemo(() => {
    if (info) {
      return info.totalPaymentReceive?.mul(Precision).div(info.salePrice);
    }
    return Zero;
  }, [info]);

  const percent = useMemo(() => {
    if (info?.saleAmount && info?.saleAmount.gt(0)) {
      return totalAmountSold.mul(100).div(info?.saleAmount).toNumber();
    }
    return 0;
  }, [info?.saleAmount, totalAmountSold]);

  return (
    <StyledItem>
      <StyledHeader>
        <TokenSymbol symbol={saleToken?.symbol} size="42" />
        <StyledHeaderInfo>
          <StyledSaleTokenName>{saleToken?.symbol}</StyledSaleTokenName>
          {info && (
            <StyledSalePrice>
              1 {saleToken?.symbol} ={' '}
              <BigNumberValue
                value={info?.salePrice}
                decimals={saleToken?.decimals}
                fractionDigits={4}
              />{' '}
              {paymentToken?.symbol}
            </StyledSalePrice>
          )}
        </StyledHeaderInfo>
        <StyledStatus>{statusInfo}</StyledStatus>
      </StyledHeader>
      <StyledContent>
        <StyledContentItem>
          <StyledKey>Token for sale</StyledKey>
          <StyledValue>10,000,000 {saleToken?.symbol}</StyledValue>
        </StyledContentItem>
        <StyledContentItem>
          <StyledKey>Requirement</StyledKey>
          <StyledValue>KYC</StyledValue>
        </StyledContentItem>
        <StyledContentItem>
          <StyledKey>Pay in</StyledKey>
          <StyledValue>
            <TokenSymbol symbol={paymentToken?.symbol} size="16" />
            {paymentToken?.symbol}
          </StyledValue>
        </StyledContentItem>
        <StyledContentItem>
          <StyledKey>Soft/Hard Cap</StyledKey>
          <StyledValue>50,000,000 {saleToken?.symbol}</StyledValue>
        </StyledContentItem>
        <StyledContentItem>
          <StyledKey>Progress</StyledKey>
          <StyledValue>Sold: 100 {saleToken?.symbol}</StyledValue>
        </StyledContentItem>
        <StyledBar percent={percent}></StyledBar>
      </StyledContent>
      <StyledItemFooterSeparate></StyledItemFooterSeparate>
      <StyledItemFooter>
        <StyledDescriptionStatus>{textDescription || '-'}</StyledDescriptionStatus>
        <StyledCountdown>-</StyledCountdown>
      </StyledItemFooter>
    </StyledItem>
  );
};
const StyledItem = styled.div`
  background: ${({ theme }) => theme.box.itemBackground};
  color: ${(p) => p.theme.text.primary};
  border: 1px solid #dbd9d9;
`;
const StyledHeader = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.box.innerBackground};
  display: flex;
`;
const StyledContent = styled.div`
  padding: 8px 16px 8px 16px;
  font-size: 14px;
`;
const StyledContentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;
const StyledItemFooterSeparate = styled.hr`
  margin-left: 16px;
  margin-right: 16px;
  border-style: dashed;
  border-color: ${({ theme }) => theme.box.border};
`;
const StyledItemFooter = styled.div`
  padding: 8px 16px 16px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.gray3};
`;
const StyledDescriptionStatus = styled.div``;
const StyledCountdown = styled.div``;

const StyledHeaderInfo = styled.div`
  margin-left: 10px;
`;

const StyledSaleTokenName = styled.div`
  font-weight: 500;
`;
const StyledSalePrice = styled.div`
  font-size: 14px;
`;
const StyledKey = styled.div`
  color: ${(p) => p.theme.gray3};
`;
const StyledValue = styled.div`
  font-weight: 500;
  display: flex;
  align-items: center;
  img {
    margin-right: 5px;
  }
`;
const StyledStatus = styled.div``;

export default LaunchpadItem;
