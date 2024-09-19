import { Contract } from 'ethers';
import { Interface, parseUnits } from 'ethers/lib/utils';
import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../../components/Buttons';
import { Dropdown, DropdownMenu, DropdownToggle } from '../../../components/Dropdown';
import { TokenSymbol } from '../../../components/TokenSymbol';
import { getTokenConfig } from '../../../config';
import { useHandleTransactionReceipt } from '../../../hooks/useHandleTransactionReceipt';
import { useTokenConfig } from '../../../hooks/useTokenConfig';
import { useUserWallet } from '../../../providers/UserWalletProvider';
import { container } from '../../../utils/styles';

const iface = new Interface(['function mint(uint256 amount) externals']);

const Faucet: React.FC = () => {
  const { chainId, library, account } = useUserWallet();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const [token, setToken] = useState('WBTC');
  const tokenConfig = useTokenConfig(token);
  const [amount, setAmount] = useState('1');
  const [loading, setLoading] = useState(false);

  const mint = useCallback(async () => {
    if (!account) {
      return;
    }

    setLoading(true);
    const { address, decimals } = getTokenConfig(chainId, token);
    const amountBn = parseUnits(amount, decimals);
    const tokenContract = new Contract(address, iface, library.getSigner(account));
    try {
      const tx = await handleTransactionReceipt(
        `Request faucet ${amount} of mock ${token}`,
        () => tokenContract.mint(amountBn),
        undefined,
        true,
      );
      await tx.wait();
      setLoading(false);
    } catch (ex) {
      setLoading(false);
    }
  }, [account, amount, chainId, handleTransactionReceipt, library, token]);

  return (
    <StyledContainer>
      <StyledHeader>Request test token</StyledHeader>
      <Disclaimer>
        These following tokens have no real value and are used for testing on CHAI only.
      </Disclaimer>

      <Grid>
        <div>
          <label htmlFor="token">Token</label>
          <Dropdown style={{ display: 'block' }}>
            <DropdownToggle>
              <Select>
                <TokenSymbol symbol={tokenConfig.symbol} />
                {tokenConfig.name}
                <i className="fa fa-caret-down"></i>
              </Select>
            </DropdownToggle>
            <DropdownMenu style={{ width: '100%' }}>
              <DropdownItem onClick={() => setToken('WBTC')}>testWBTC</DropdownItem>
              <DropdownItem onClick={() => setToken('USDC')}>testUSDC</DropdownItem>
              <DropdownItem onClick={() => setToken('USDT')}>testUSDT</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div>
          <label htmlFor="token">Amount</label>
          <Dropdown style={{ display: 'block' }}>
            <DropdownToggle>
              <Select>
                {amount} {tokenConfig.name}
                <i className="fa fa-caret-down"></i>
              </Select>
            </DropdownToggle>
            <DropdownMenu style={{ width: '100%' }}>
              <DropdownItem onClick={() => setAmount('0.1')}>
                0.1 {tokenConfig.name}
              </DropdownItem>
              <DropdownItem onClick={() => setAmount('1')}>1 {tokenConfig.name}</DropdownItem>
              <DropdownItem onClick={() => setAmount('10')}>10 {tokenConfig.name}</DropdownItem>
              <DropdownItem onClick={() => setAmount('100')}>
                100 {tokenConfig.name}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </Grid>
      <StyledFooter>
        <StyledButton onClick={mint} isLoading={loading} disabled={!account || loading}>
          {account ? 'Request' : 'Please connect to request'}
        </StyledButton>
      </StyledFooter>
    </StyledContainer>
  );
};

export default Faucet;

const StyledContainer = styled.div`
  ${container}
  margin-top: 32px;
  max-width: 600px;
`;
const StyledHeader = styled.h2`
  text-align: center;
  margin-bottom: 10px;
`;

const Disclaimer = styled.div`
  margin-bottom: 20px;
`;

const DropdownItem = styled.div`
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    background: ${({ theme }) => theme.box.innerBackground};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1;
  grid-gap: 30px;
  margin: 0 0 30px 0;

  label {
    display: block;
    margin-bottom: 4px;
  }
`;

const Select = styled.div`
  width: 100%;
  padding: 10px 15px;
  border: 1px solid ${(p) => p.theme.box.border};
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  background: ${(p) => p.theme.box.background};

  &:hover {
    background: ${({ theme }) => theme.box.innerBackground};
  }

  i {
    margin-left: auto;
    opacity: 0.8;
  }
`;
const StyledFooter = styled.div`
  text-align: center;
`;
const StyledButton = styled(Button)`
  padding-left: 20px;
  padding-right: 20px;
`;
