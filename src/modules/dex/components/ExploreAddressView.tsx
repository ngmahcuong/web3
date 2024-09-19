import styled from 'styled-components';
import { ExplorerLink } from '../../../components/ExplorerLink';
import iconLink from '../../../assets/icons/ic-link.svg';

export type ExploreAddressViewProps = {
  visible?: boolean;
  address?: string;
  type?: 'address' | 'token' | 'tx' | 'blocks';
};

export const ExploreAddressView: React.FC<ExploreAddressViewProps> = ({
  visible,
  address,
  type,
}) => {
  return visible && address ? (
    <ExplorerLink type={type ?? 'address'} address={address}>
      <StyleBodyAddressDetail>
        View on explorer <img src={iconLink} alt="icon-link" />
      </StyleBodyAddressDetail>
    </ExplorerLink>
  ) : (
    <></>
  );
};

const StyleBodyAddressDetail = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: ${({ theme }) => theme.success};
  :hover {
    color: ${({ theme }) => theme.button.primary.hover};
  }
  img {
    margin-left: 4px;
  }
  font-size: 14px;
`;
