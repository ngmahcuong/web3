import styled from 'styled-components';
import imgNoData from '../../../../../assets/images/lending-no-data.png';

export const LockDropNoData: React.FC = () => {
  return (
    <StyleContainer>
      <StyleImageWallet src={imgNoData} />
      <StyleDescription>{`You haven't added lockdrop pool`}</StyleDescription>
    </StyleContainer>
  );
};

const StyleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 140px;
`;

const StyleDescription = styled.div`
  color: ${({ theme }) => theme.gray3};
  text-align: center;
  margin-top: 19px;
`;
const StyleImageWallet = styled.img`
  width: 69px;
  margin: auto;
`;
