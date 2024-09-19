import styled from 'styled-components';
// import bgLaunchpadLeft from '../../../../assets/images/launchpad-left.png';
import bgLaunchpadRight from '../../../../assets/images/launchpad-right.png';
import imgTotalSale from '../../../../assets/icons/lending-total-supply.svg';
import imgParticipants from '../../../../assets/icons/participants.svg';
import { screenUp } from '../../../../utils/styles';
import { BigNumber } from 'ethers';
import { BigNumberValue } from '../../../../components/BigNumberValue';
import PageHeaderContainer, {
  PageHeaderMetaInfo,
} from '../../../../components/PageHeaderContainer';

export type HeaderProps = {
  participants: number;
  totalSale: BigNumber;
  saleToken: any;
};
const Header: React.FC<HeaderProps> = ({ participants, totalSale, saleToken }) => {
  return (
    <PageHeaderContainer title={'Launchpad'} iconBg={bgLaunchpadRight}>
      <PageHeaderMetaInfoWrap>
        <PageHeaderMetaInfo>
          <img src={imgParticipants} alt="participants" />
          <div className="info">
            <div className="title">Participants</div>
            <span className="value">{participants || '-'}</span>
          </div>
        </PageHeaderMetaInfo>
        <PageHeaderMetaInfo>
          <img src={imgTotalSale} alt="totalsales" />
          <div className="info">
            <div className="title">Total sales</div>
            <span className="value">
              <BigNumberValue
                value={totalSale}
                decimals={saleToken?.decimals}
                fractionDigits={4}
              />
            </span>
          </div>
        </PageHeaderMetaInfo>
      </PageHeaderMetaInfoWrap>
    </PageHeaderContainer>
  );
};
const PageHeaderMetaInfoWrap = styled.div`
  margin-top: 12px;
  display: flex;
  grid-column-gap: 70px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  ${screenUp('lg')`
    flex-direction: row;
    width: fit-content;
  `}
`;
export default Header;
