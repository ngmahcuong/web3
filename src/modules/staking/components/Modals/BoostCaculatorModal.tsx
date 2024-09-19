import { BigNumber } from '@ethersproject/bignumber';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BigNumberValue } from '../../../../components/BigNumberValue';
import { Dropdown, DropdownMenu, DropdownToggle } from '../../../../components/Dropdown';
import Modal from '../../../../components/Modal';
import { TokenInputWithMaxButton } from '../../../../components/TokenInput';
import { CustomModalContent } from '../../../lending/views/Lending/components/Modals/ModalShare';
import { TokenInputWithSelectCurrency } from './TokenInputWithSelectCurrency';
import { ReactComponent as IcRocket } from '../../../../assets/icons/ic-rocket.svg';
import { ReactComponent as IcFirer } from '../../../../assets/icons/ic-firer.svg';
import { ReactComponent as IcLock } from '../../../../assets/icons/ic-lock.svg';
import { Precision } from '../../../../utils/constants';
import useFetchPoolInfo from '../../hooks/useFetchPoolInfo';
import { Zero } from '@ethersproject/constants';
import { useTokenPrice } from '../../../../state/tokens/hooks';
import { useTokenBalance } from '../../../../state/user/hooks';
import { sqrt } from '../../../../utils/numbers';
import useFetchUserPoolInfo from '../../hooks/useFetchUserPoolInfo';

const TOTAL_SEC_PER_YEAR = 60 * 60 * 24 * 356;

export type BoostCaculatorModalProps = {
  onDismiss?: () => void;
  totalSupply?: BigNumber;
  minedValue?: BigNumber;
};

const BoostCaculatorModal: React.FC<BoostCaculatorModalProps> = ({
  onDismiss,
  totalSupply,
  minedValue,
}) => {
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [chaiAmount, setChaiAmount] = useState<BigNumber | undefined>(undefined);
  const [veChaiAmount, setVeChaiAmount] = useState<BigNumber | undefined>(undefined);
  const [useChai, setUseChai] = useState<boolean>(false);
  const [poolIndex, setPoolIndex] = useState<number>();
  const {
    liquidity,
    chaiPerSec,
    dialutingRepartition,
    nonDialutingRepartition,
    sumOfFactors,
    fetchData,
  } = useFetchPoolInfo();
  const { deposited, userFactor } = useFetchUserPoolInfo(poolIndex);
  const chaiPrice = useTokenPrice('CHAI');
  const lpPrice = useTokenPrice('CHAI'); // FAKE
  const balanceCHAI = useTokenBalance('CHAI');
  const balanceVeCHAI = useTokenBalance('VECHAI');

  const veChaiShare = useMemo(() => {
    const newVeChaiAmount = (minedValue || Zero).add(veChaiAmount || Zero);
    if (newVeChaiAmount?.gt(0) && totalSupply?.gt(0)) {
      return newVeChaiAmount.mul(100).div(totalSupply);
    }
    return Zero;
  }, [totalSupply, minedValue, veChaiAmount]);
  const poolShare = useMemo(() => {
    const newDeposit = deposited ? deposited.add(amount || Zero) : amount;
    const newLiquidity = liquidity ? liquidity.add(amount || Zero) : amount;
    if (newDeposit?.gt(0) && newLiquidity?.gt(0)) {
      return newDeposit.mul(Precision).div(newLiquidity);
    }
    return Zero;
  }, [amount, deposited, liquidity]);

  const baseAPR = useMemo(() => {
    if (liquidity?.gt(0) && chaiPerSec && lpPrice && dialutingRepartition) {
      const valueFarm = chaiPerSec
        .mul(dialutingRepartition)
        .mul(TOTAL_SEC_PER_YEAR)
        .mul(chaiPrice)
        .div(1000);
      return valueFarm.div(liquidity?.mul(lpPrice));
    }
    return Zero;
  }, [chaiPerSec, chaiPrice, dialutingRepartition, liquidity, lpPrice]);

  const currentBoostedAPR = useMemo(() => {
    if (
      userFactor?.gt(0) &&
      sumOfFactors?.gt(0) &&
      liquidity?.gt(0) &&
      chaiPerSec?.gt(0) &&
      lpPrice?.gt(0) &&
      dialutingRepartition
    ) {
      return userFactor
        .mul(chaiPerSec)
        .mul(nonDialutingRepartition)
        .mul(TOTAL_SEC_PER_YEAR)
        .mul(chaiPrice)
        .div(1000)
        .div(sumOfFactors)
        .div(liquidity.mul(lpPrice));
    }
    return Zero;
  }, [
    chaiPerSec,
    chaiPrice,
    dialutingRepartition,
    liquidity,
    lpPrice,
    nonDialutingRepartition,
    sumOfFactors,
    userFactor,
  ]);

  const estimatedBoostedAPR = useMemo(() => {
    let lpTokenDeposit = deposited || Zero;
    if (amount?.gt(0)) {
      lpTokenDeposit = lpTokenDeposit.add(amount);
    }
    let totalVeChai = balanceVeCHAI || Zero;
    if (veChaiAmount?.gt(0)) {
      totalVeChai = totalVeChai.add(veChaiAmount);
    }
    const data = lpTokenDeposit?.mul(totalVeChai);
    const newInputFactor = sqrt(data);
    const newSumOfFactor = (sumOfFactors || Zero)
      .add(newInputFactor || Zero)
      .sub(userFactor || Zero);
    if (
      newInputFactor?.gt(0) &&
      sumOfFactors?.gt(0) &&
      liquidity?.gt(0) &&
      chaiPerSec?.gt(0) &&
      lpPrice?.gt(0) &&
      dialutingRepartition
    ) {
      return newInputFactor
        .mul(chaiPerSec)
        .mul(nonDialutingRepartition)
        .mul(TOTAL_SEC_PER_YEAR)
        .mul(chaiPrice)
        .div(1000)
        .div(newSumOfFactor)
        .div(liquidity.mul(lpPrice));
    }
    return Zero;
  }, [
    deposited,
    amount,
    balanceVeCHAI,
    veChaiAmount,
    sumOfFactors,
    userFactor,
    liquidity,
    chaiPerSec,
    lpPrice,
    dialutingRepartition,
    nonDialutingRepartition,
    chaiPrice,
  ]);

  const handleOnToggle = () => {
    setVeChaiAmount(Zero);
    setChaiAmount(Zero);
    setUseChai((useChai) => !useChai);
  };

  const onTokenLPSelect = useCallback(
    (token: string, index: number) => {
      fetchData(token, index);
      setPoolIndex(index);
    },
    [fetchData],
  );

  return (
    <Modal size="xs">
      <CustomModalHeader>
        <StyledModalTitle> Booster Calculator</StyledModalTitle>
        <StyledModalClose onClick={onDismiss}>
          <i className="fal fa-times" />
        </StyledModalClose>
      </CustomModalHeader>
      <CustomModalContent>
        <StyledStakedDeposit>
          <StyledStakedDepositTitle>
            <IcRocket /> My Staked Deposit
          </StyledStakedDepositTitle>
          <StyledBox>
            <TokenInputWithSelectCurrency
              currency={null}
              value={amount}
              onChange={setAmount}
              label={'Input'}
              onTokenLPSelect={onTokenLPSelect}
            />
          </StyledBox>

          <StyledRowInfo>
            <div className="title">Pool Liquidity</div>
            <div className="value hightlight">
              <span>
                {' '}
                <BigNumberValue value={liquidity} decimals={18} fractionDigits={3} keepCommas />
              </span>
            </div>
          </StyledRowInfo>

          <StyledRowInfo>
            <div className="title">Pool Share</div>
            <div className="value">
              <BigNumberValue
                value={poolShare}
                decimals={18}
                fractionDigits={3}
                percentage
                keepCommas
              />
            </div>
          </StyledRowInfo>
        </StyledStakedDeposit>

        <StyledBoosterWrapper>
          <StyledBoosterHeader>
            <StyledBoosterTitle>
              <IcFirer /> Booster
            </StyledBoosterTitle>
            <StyledToggleUse>
              <label>
                <input
                  id="useChai"
                  type="checkbox"
                  checked={useChai}
                  onChange={handleOnToggle}
                />
                <span></span>
              </label>
              <label className="title" htmlFor={'useChai'}>
                Use CHAI
              </label>
            </StyledToggleUse>
          </StyledBoosterHeader>
          <StyledBoosterBody>
            {useChai ? (
              <>
                <StyledInputHeader>
                  Input CHAI
                  <div className="balance">
                    Balance:
                    <button
                      onClick={() => {
                        setChaiAmount(balanceCHAI);
                      }}
                    >
                      <BigNumberValue value={balanceCHAI} decimals={18} fractionDigits={4} />
                    </button>
                  </div>
                </StyledInputHeader>
                <StyledInputContainer>
                  <TokenInputWithMaxButton
                    maxValue={balanceCHAI}
                    decimals={18}
                    value={chaiAmount}
                    symbol={'CHAI'}
                    onChange={setChaiAmount}
                    size="lg"
                    showTokenName
                  />
                </StyledInputContainer>

                <Dropdown className="d-block">
                  <DropdownToggle>
                    <StyledButtonMore>
                      <IcLock /> <span>Lock for 5 month</span>{' '}
                      <i className="far fa-chevron-down"></i>
                    </StyledButtonMore>
                  </DropdownToggle>
                  <StyledDropdownMenu position="right">
                    <ul>
                      <li>1 month</li>
                      <li>2 month</li>
                      <li>3 month</li>
                      <li>4 month</li>
                      <li>5 month</li>
                    </ul>
                  </StyledDropdownMenu>
                </Dropdown>

                <StyledRowInfo>
                  <div className="title">Estimated veCHAI balance</div>
                  <div className="value">
                    <span>0.0</span>
                  </div>
                </StyledRowInfo>

                <StyledRowInfo>
                  <div className="title">Total veCHAI Supply</div>
                  <div className="value hightlight">
                    <span>
                      <BigNumberValue value={totalSupply} decimals={18} fractionDigits={3} />
                    </span>
                  </div>
                </StyledRowInfo>
              </>
            ) : (
              <>
                <StyledInputHeader>
                  Input veCHAI
                  <div className="balance">
                    Balance:
                    <button
                      onClick={() => {
                        setVeChaiAmount(balanceVeCHAI);
                      }}
                    >
                      <BigNumberValue value={balanceVeCHAI} decimals={18} fractionDigits={4} />
                    </button>
                  </div>
                </StyledInputHeader>
                <StyledInputContainer>
                  <TokenInputWithMaxButton
                    maxValue={balanceVeCHAI}
                    decimals={18}
                    value={veChaiAmount}
                    symbol={'VECHAI'}
                    onChange={setVeChaiAmount}
                    size="lg"
                    showTokenName
                  />
                </StyledInputContainer>

                <StyledRowInfo>
                  <div className="title">Total veCHAI Supply</div>
                  <div className="value hightlight">
                    <span>
                      <BigNumberValue value={totalSupply} decimals={18} fractionDigits={3} />
                    </span>
                  </div>
                </StyledRowInfo>
              </>
            )}
            <StyledBoosterInfoBox>
              <StyledRowInfo>
                <div className="title">veCHAI share</div>
                <div className="value">
                  <span>
                    {' '}
                    <BigNumberValue
                      value={veChaiShare}
                      decimals={2}
                      fractionDigits={3}
                      percentage
                    />
                  </span>
                </div>
              </StyledRowInfo>

              <StyledRowInfo>
                <div className="title">Base APR</div>
                <div className="value">
                  <span>
                    {' '}
                    {baseAPR && (
                      <BigNumberValue
                        value={baseAPR}
                        decimals={1}
                        fractionDigits={3}
                        keepCommas
                        percentage
                      />
                    )}
                  </span>
                </div>
              </StyledRowInfo>
              <StyledRowInfo>
                <div className="title">Current Boosted APR</div>
                <div className="value">
                  <span>
                    {' '}
                    {currentBoostedAPR && (
                      <BigNumberValue
                        value={currentBoostedAPR}
                        decimals={0}
                        fractionDigits={3}
                        keepCommas
                        percentage
                      />
                    )}
                  </span>
                </div>
              </StyledRowInfo>

              <StyledRowInfo className="boost-hightlight ">
                <div className="title">Estimated Boosted APR</div>
                <div className="value">
                  <IcFirer />{' '}
                  <span>
                    <BigNumberValue
                      value={estimatedBoostedAPR}
                      decimals={0}
                      fractionDigits={3}
                      keepCommas
                      percentage
                    />
                  </span>
                </div>
              </StyledRowInfo>
            </StyledBoosterInfoBox>
          </StyledBoosterBody>
        </StyledBoosterWrapper>
      </CustomModalContent>
    </Modal>
  );
};

export default BoostCaculatorModal;

const StyledBoosterInfoBox = styled.div`
  padding: 13px 16px;
  background-color: ${(p) => p.theme.card.secondary};
`;

const StyledInputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  padding-bottom: 8px;
  .balance {
    font-size: 14px;
    font-weight: normal;
    color: ${(p) => p.theme.muted};
    button {
      padding: 0 3px 0 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.text.primary};
      line-height: 1;
      :hover {
        color: ${({ theme }) => theme.success};
      }
    }
    span {
      font-size: 14px;
      font-weight: normal;
      color: ${(p) => p.theme.black};
    }
  }
`;

const StyledButtonMore = styled.div`
  cursor: pointer;
  display: flex;
  gap: 8px;
  padding: 18px;
  align-items: center;
  justify-content: center;
  appearance: none;
  background-color: ${({ theme }) => theme.input.background};
  border: solid 1px ${({ theme }) => theme.input.border};
  font-size: 16px;
  color: ${(p) => p.theme.text.primary};
  margin-bottom: 16px;

  svg {
    path {
      fill: gray !important;
    }
  }

  i {
    margin-left: auto;
    color: ${(p) => p.theme.text.muted};
  }
`;

const StyledDropdownMenu = styled(DropdownMenu)`
  margin-top: 10px;
  width: 100%;
  min-width: auto;
  background-color: ${({ theme }) => theme.background};
  ::after {
    content: '';
    background: none;
  }
  ul {
    padding: 5px 0;
    margin: 0;
    li {
      cursor: pointer;
      padding: 10px 16px;
      margin: 0;
      &:hover {
        color: ${({ theme }) => theme.success};
        // background-color: ${({ theme }) => theme.gray1};
      }
    }
  }
`;
const StyledInputContainer = styled.div`
  margin-bottom: 1rem;
`;

const StyledBoosterWrapper = styled.div``;

const StyledBoosterHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledBoosterBody = styled.div``;

const StyledToggleUse = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${(p) => p.theme.text.muted};
  .title {
    width: fit-content;
    height: unset;
    white-space: nowrap;
  }
  label {
    position: relative;
    display: inline-block;
    width: 28px;
    height: 16px;
  }

  input {
    opacity: 0;
    width: 0;
    height: 0;
    &:checked {
      & + span {
        background-color: ${(p) => p.theme.success};
        &::before {
          transform: translateX(12px) translateY(-50%);
        }
      }
    }

    &:focus {
      & + span {
        box-shadow: 0 0 1px ${(p) => p.theme.success};
      }
    }
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 34px;
    &::before {
      position: absolute;
      content: '';
      height: 14px;
      width: 14px;
      left: 1px;
      top: 50%;
      transform: translateY(-50%);

      box-sizing: border-box;

      background-color: white;
      -webkit-transition: 0.4s;
      transition: 0.4s;
      border-radius: 50%;
    }
  }
`;

const StyledBoosterTitle = styled.div`
  display: flex;
  gap: 8px;
  color: ${(p) => p.theme.text.highlight};
  text-transform: uppercase;
  font-weight: 600;
`;

const StyledStakedDeposit = styled.div`
  position: relative;
  padding-bottom: 1rem;
  border-bottom: dashed 1px #e2e0e0;
  margin-bottom: 1rem;
`;
const StyledStakedDepositTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  color: #e77836;
  margin-bottom: 14px;
`;
const StyledBox = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const CustomModalHeader = styled.div`
  position: relative;
  display: flex;
  place-items: center;
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.box.innerBackground};
`;

const StyledModalTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.text.primary};
`;

const StyledModalClose = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 8px;
  cursor: pointer;
  opacity: 0.6;
  font-size: 20px;

  :hover {
    opacity: 1;
  }
`;

const StyledRowInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  &.boost-hightlight {
    color: ${(p) => p.theme.success};
    .title {
      color: ${(p) => p.theme.success};
      font-weight: 500;
    }

    .value {
      font-size: 20px;
      font-weight: bold;
      svg {
        path {
          fill: ${(p) => p.theme.success};
        }
      }
    }
  }
  .title {
    font-size: 16px;
    font-weight: 400;
    color: ${(p) => p.theme.text.muted};
  }
  .value {
    span {
      font-weight: 500;
    }
    &.hightlight {
      color: #e77836;
    }
  }
`;
