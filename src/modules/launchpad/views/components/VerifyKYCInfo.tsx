import React from 'react';
import styled from 'styled-components';
import { Button } from '../../../../components/Buttons';

export const VerifyKYCInfo: React.FC = () => {
  return (
    <StyledVerifyKYC>
      <StyledVerifyTitle>Complete KYC to participate in IDO token sales.</StyledVerifyTitle>
      <StyledVerifyContent>
        <ul>
          <li>
            This sale requires you to pass KYC. Your identity is tied to the connected wallet
            you use during KYC.
          </li>
          <li>
            You can only use a wallet that has passed KYC to subscribe, get allocation, purchase
            and claim.
          </li>
          <li>KYC is not open to users from U.S., China and sanctioned countries.</li>
        </ul>
      </StyledVerifyContent>
      <StyledVerifyKycButton>Verify KYC</StyledVerifyKycButton>
    </StyledVerifyKYC>
  );
};

export const StyledVerifyKYC = styled.div`
  width: 100%;
  margin-top: 20px;
`;

export const StyledVerifyTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: ${(p) => p.theme.text.primary};
`;
export const StyledVerifyContent = styled.div`
  text-align: left;
  ul {
    list-style: disc;
    padding-left: 20px;
    color: ${({ theme }) => theme.gray3};
  }
`;
export const StyledVerifyKycButton = styled(Button)`
  width: 100%;
  margin-top: 20px;
`;
