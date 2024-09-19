import { BigNumber } from 'ethers';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../components/BigNumberValue';
import { TokenSymbol } from '../../../components/TokenSymbol';
import { useTokenBalance } from '../../../state/user/hooks';
import {
  StyledBar,
  StyledButton,
  StyledContent,
  StyledInputContainer,
  StyledInputHeader,
  StyledLabel,
  StyledNotWhitelist,
  StyledPoolInfo,
  StyledPoolInfoContent,
  StyledPoolInfoContentItem,
  StyledPoolInfoNotice,
  StyledPoolInfoTitle,
  StyledPresaleDescription,
  StyledSale,
  StyledSaleBottom,
  StyledSaleInfoItem,
  StyledSaleTokenName,
  StyledSaleTop,
  StyledSaleWrapper,
  StyledSold,
  StyledTotalSale,
  StyledValue,
} from './components/Share';
import { Countdown } from './components/Countdown';
import Header from './components/Header';
import { TokenInputWithMaxButton } from '../../../components/TokenInput';
import { formatBigNumber } from '../../../utils/numbers';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { Precision, TokenThreshold } from '../../../utils/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { getLaunchpadAddress, getLaunchpadConfigs, getNativeToken } from '../../../config';
import { useLaunchpad } from '../hooks/useLaunchpad';
import useFetchLaunchpadDetail from '../hooks/useFetchLaunchpadDetail';
import useFetchLaunchpadUserInfo from '../hooks/useFetchLaunchpadUserInfo';
import { useTokenConfig } from '../../../hooks/useTokenConfig';
import { Timestamp } from '../../../components/Timestamp';
import { Zero } from '@ethersproject/constants';
import { ExplorerLink } from '../../../components/ExplorerLink';
import { IDOStatus, Status } from '../models';
import { WithdrawButton } from './components/WithdrawButton';
import { VerifyKYCInfo } from './components/VerifyKYCInfo';
import { useMerkleTreeInfo } from '../hooks/useMerkleTreeInfo';

const LaunchPad: React.FC = () => {
  const { chainId } = useWeb3React();
  const launchpadConfigs = getLaunchpadConfigs(chainId);
  const userMerkleTreeInfo = useMerkleTreeInfo();
  const index = 0;
  const proof = useMemo(() => {
    return ['0xf0ab796a01c94eec3ae40073a3a19b30b5955730fc641f39ffd44dcc40202a13'];
  }, []);
  const launchpadAddress = getLaunchpadAddress(chainId, index);
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const saleToken = useTokenConfig(launchpadConfigs[index].saleToken);
  const nativeToken = getNativeToken(chainId);
  const nativeTokenBalance = useTokenBalance(nativeToken?.symbol);
  const paymentToken = useTokenConfig(launchpadConfigs[index].paymentToken);
  const paymentTokenBalance = useTokenBalance(paymentToken?.symbol);
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const launchpadContract = useLaunchpad(index);
  const info = useFetchLaunchpadDetail(launchpadAddress);
  const userInfo = useFetchLaunchpadUserInfo(
    launchpadAddress,
    userMerkleTreeInfo?.index,
    userMerkleTreeInfo?.proof,
  );
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
      return info.totalPaymentReceive?.mul(Precision).div(info.salePrice) || Zero;
    }
    return Zero;
  }, [info]);

  const percent = useMemo(() => {
    if (info?.saleAmount && info?.saleAmount?.gt(0)) {
      return totalAmountSold.mul(100).div(info?.saleAmount).toNumber();
    }
    return 0;
  }, [info?.saleAmount, totalAmountSold]);
  const balance = useMemo(() => {
    if (launchpadConfigs[index]?.paymentToken === nativeToken?.symbol) {
      return nativeTokenBalance;
    }
    return paymentTokenBalance;
  }, [paymentTokenBalance, launchpadConfigs, nativeToken?.symbol, nativeTokenBalance]);

  const receiveAmount = useMemo(() => {
    if (amount && amount.gt(0) && info?.salePrice?.gt(0)) {
      return amount.mul(Precision).div(info?.salePrice);
    }
    if (userInfo) {
      return userInfo?.chaiAmount;
    }
    return Zero;
  }, [amount, info?.salePrice, userInfo]);

  const onClickBalance = useCallback(() => {
    setAmount(balance);
  }, [balance]);

  const isWhitelist = useMemo(() => {
    if (userInfo?.isWhitelist) {
      return true;
    }
    return false;
  }, [userInfo?.isWhitelist]);

  const purchaseTransaction = useCallback(async () => {
    return (await launchpadContract.purchase(amount, proof)) as TransactionResponse;
  }, [amount, launchpadContract, proof]);

  const claimTransaction = useCallback(async () => {
    return (await launchpadContract.claim()) as TransactionResponse;
  }, [launchpadContract]);

  const onPurchase = useCallback(async () => {
    if (!launchpadContract || !amount) {
      return;
    }
    setLoading(true);
    try {
      const tx = await handleTransactionReceipt(
        `Buy ${formatBigNumber(
          amount,
          paymentToken?.decimals,
          {
            fractionDigits: 3,
          },
          TokenThreshold[paymentToken?.symbol] || TokenThreshold.DEFAULT,
        )} ${paymentToken?.symbol}`,
        purchaseTransaction,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }, [amount, purchaseTransaction, handleTransactionReceipt, launchpadContract, paymentToken]);

  const onClaim = useCallback(async () => {
    if (!launchpadContract || !amount) {
      return;
    }
    setLoading(true);
    try {
      const tx = await handleTransactionReceipt(
        `Claim ${formatBigNumber(
          receiveAmount,
          saleToken?.decimals,
          {
            fractionDigits: 3,
          },
          TokenThreshold[saleToken?.symbol] || TokenThreshold.DEFAULT,
        )} ${saleToken?.symbol}`,
        claimTransaction,
      );
      if (tx) {
        await tx.wait();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }, [
    launchpadContract,
    amount,
    handleTransactionReceipt,
    receiveAmount,
    saleToken?.decimals,
    saleToken?.symbol,
    claimTransaction,
  ]);
  return (
    <StyledContainer>
      <Header
        participants={info?.purchaserCount}
        totalSale={info?.saleAmount}
        saleToken={saleToken}
      />
      <StyledContent>
        <StyledPoolInfo>
          <StyledPoolInfoTitle>Sale detail</StyledPoolInfoTitle>
          <StyledPoolInfoNotice>
            <i className="fas fa-exclamation-triangle"></i>
            <span>Please note here</span>
          </StyledPoolInfoNotice>
          <StyledPoolInfoContent>
            <StyledPoolInfoContentItem>
              <StyledLabel>Token name</StyledLabel>
              <StyledValue>{saleToken?.name}</StyledValue>
            </StyledPoolInfoContentItem>
            <StyledPoolInfoContentItem>
              <StyledLabel>Public Sale Token Price</StyledLabel>
              <StyledValue>
                1 {saleToken?.symbol} ={' '}
                <BigNumberValue
                  value={info?.salePrice}
                  decimals={saleToken?.decimals}
                  fractionDigits={4}
                />{' '}
                {paymentToken?.symbol}
              </StyledValue>
            </StyledPoolInfoContentItem>
            <StyledPoolInfoContentItem>
              <StyledLabel>Token Address</StyledLabel>
              <StyledValue className="address">
                <ExplorerLink type={'address'} address={saleToken?.address}>
                  {saleToken?.address}
                  <i className="far fa-external-link"></i>
                </ExplorerLink>
              </StyledValue>
            </StyledPoolInfoContentItem>
            <StyledPoolInfoContentItem>
              <StyledLabel>Presale Start Time</StyledLabel>
              <StyledValue>
                {info?.startTime ? <Timestamp secs={info?.startTime?.toNumber()} /> : '-'}
              </StyledValue>
            </StyledPoolInfoContentItem>
            <StyledPoolInfoContentItem>
              <StyledLabel>Presale End Time</StyledLabel>
              <StyledValue>
                {info?.endTime ? <Timestamp secs={info?.endTime?.toNumber()} /> : '-'}
              </StyledValue>
            </StyledPoolInfoContentItem>
            <StyledPoolInfoContentItem>
              <StyledLabel>Min Purchase</StyledLabel>
              <StyledValue>
                <BigNumberValue
                  value={info?.minEthPayment}
                  decimals={paymentToken?.decimals}
                  fractionDigits={4}
                />{' '}
                {paymentToken?.symbol}
              </StyledValue>
            </StyledPoolInfoContentItem>
            <StyledPoolInfoContentItem>
              <StyledLabel>Max Purchase</StyledLabel>
              <StyledValue>
                <BigNumberValue
                  value={info?.maxEthPayment}
                  decimals={paymentToken?.decimals}
                  fractionDigits={4}
                />{' '}
                {paymentToken?.symbol}
              </StyledValue>
            </StyledPoolInfoContentItem>
          </StyledPoolInfoContent>
        </StyledPoolInfo>
        <StyledSale>
          <StyledSaleTop>
            <TokenSymbol symbol={saleToken?.symbol} size="64" />
            <StyledSaleTokenName>{saleToken?.symbol}</StyledSaleTokenName>
            <StyledPresaleDescription
              className={
                statusInfo === Status.Cancel || statusInfo === Status.Ended ? 'warning' : ''
              }
            >
              {textDescription}
            </StyledPresaleDescription>
            {statusInfo === Status.Upcomming ? (
              <Countdown timestamp={info?.startTime?.toNumber()} />
            ) : statusInfo === Status.Salelive ? (
              <Countdown timestamp={info?.endTime?.toNumber()} />
            ) : (
              <Countdown timestamp={info?.endTime?.toNumber() + info?.withdrawDelay} />
            )}
            <StyledBar percent={percent}></StyledBar>
            <StyledSaleWrapper>
              <StyledSold>
                Sold:{' '}
                <span>
                  <BigNumberValue
                    value={totalAmountSold}
                    decimals={saleToken?.decimals}
                    fractionDigits={4}
                  />
                </span>{' '}
                {saleToken?.symbol}
              </StyledSold>
              <StyledTotalSale>
                Total sale:{' '}
                <span>
                  <BigNumberValue
                    value={info?.saleAmount}
                    decimals={saleToken?.decimals}
                    fractionDigits={4}
                  />{' '}
                  {saleToken?.symbol}
                </span>
              </StyledTotalSale>
            </StyledSaleWrapper>
            {Date.now() >= info?.startTime?.toNumber() * 1000 &&
              Date.now() <= info?.endTime?.toNumber() * 1000 && (
                <div>
                  <StyledInputHeader>
                    Amount
                    <div className="balance">
                      Wallet balance:
                      <button onClick={onClickBalance}>
                        <BigNumberValue
                          value={nativeTokenBalance}
                          decimals={nativeToken?.decimals}
                          fractionDigits={4}
                        />
                      </button>
                      <span>{nativeToken?.name}</span>
                    </div>
                  </StyledInputHeader>
                  <StyledInputContainer>
                    <TokenInputWithMaxButton
                      maxValue={nativeTokenBalance}
                      decimals={nativeToken?.decimals}
                      value={amount}
                      symbol={nativeToken?.symbol}
                      onChange={setAmount}
                      size="lg"
                    />
                  </StyledInputContainer>
                </div>
              )}
          </StyledSaleTop>
          <StyledSaleBottom>
            {!isWhitelist ? (
              <div>
                {statusInfo === Status.Upcomming || !info?.startTime ? (
                  <VerifyKYCInfo />
                ) : (
                  <>
                    <StyledSaleInfoItem>
                      <StyledLabel>Requirement</StyledLabel>
                      <StyledValue>KYC</StyledValue>
                    </StyledSaleInfoItem>
                    <StyledSaleInfoItem>
                      <StyledLabel>Access</StyledLabel>
                      <StyledValue>Everyone</StyledValue>
                    </StyledSaleInfoItem>
                    <StyledNotWhitelist>
                      <i className="fas fa-database"></i>
                      <span>You are not in whitelist</span>
                    </StyledNotWhitelist>
                  </>
                )}
              </div>
            ) : (
              <>
                <StyledSaleInfoItem>
                  <StyledLabel>Requirement</StyledLabel>
                  <StyledValue>KYC</StyledValue>
                </StyledSaleInfoItem>
                <StyledSaleInfoItem>
                  <StyledLabel>Access</StyledLabel>
                  <StyledValue>Everyone</StyledValue>
                </StyledSaleInfoItem>
                {statusInfo === Status.Cancel && !userInfo?.claimed && userInfo?.chaiAmount && (
                  <>
                    <StyledSaleInfoItem>
                      <StyledLabel>You had deposited</StyledLabel>
                      <StyledValue>
                        <BigNumberValue
                          value={userInfo?.paymentAmount}
                          decimals={paymentToken?.decimals}
                          fractionDigits={4}
                        />{' '}
                        {paymentToken?.symbol}
                      </StyledValue>
                    </StyledSaleInfoItem>
                    <WithdrawButton
                      index={index}
                      paymentAmount={userInfo?.paymentAmount}
                      paymentToken={paymentToken}
                    />
                  </>
                )}
                {statusInfo === Status.Salelive && (
                  <>
                    <StyledSaleInfoItem>
                      <StyledLabel>You will receive</StyledLabel>
                      <StyledValue>
                        <BigNumberValue
                          value={receiveAmount}
                          decimals={saleToken?.decimals}
                          fractionDigits={4}
                        />{' '}
                        {saleToken?.symbol}
                      </StyledValue>
                    </StyledSaleInfoItem>
                    <StyledButton size="md" isLoading={loading} onClick={onPurchase}>
                      Buy
                    </StyledButton>
                  </>
                )}
                {statusInfo === Status.Claimable && !userInfo?.claimed && userInfo?.chaiAmount && (
                  <>
                    <StyledSaleInfoItem>
                      <StyledLabel>You can claimable</StyledLabel>
                      <StyledValue>
                        <BigNumberValue
                          value={receiveAmount}
                          decimals={saleToken?.decimals}
                          fractionDigits={4}
                        />{' '}
                        {saleToken?.symbol}
                      </StyledValue>
                    </StyledSaleInfoItem>
                    <StyledButton size="md" isLoading={loading} onClick={onClaim}>
                      Claim
                    </StyledButton>
                  </>
                )}
                {statusInfo === Status.Claimable && userInfo?.claimed && userInfo?.chaiAmount && (
                  <StyledNotWhitelist>
                    <i className="fas fa-database"></i>
                    <span>You had claimed</span>
                    <BigNumberValue
                      value={userInfo?.chaiAmount}
                      decimals={saleToken?.decimals}
                      fractionDigits={4}
                    />
                  </StyledNotWhitelist>
                )}
              </>
            )}
          </StyledSaleBottom>
        </StyledSale>
      </StyledContent>
    </StyledContainer>
  );
};

const StyledContainer = styled.div``;
export default LaunchPad;
