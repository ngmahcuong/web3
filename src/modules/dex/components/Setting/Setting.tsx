import { useMemo } from 'react';
import styled from 'styled-components';
import useModal from '../../../../hooks/useModal';
import SettingModal from './SettingModal';

const Setting: React.FC = () => {
  const settingModal = useMemo(() => <SettingModal />, []);
  const [showSettingModal] = useModal(settingModal, 'setting');

  return (
    <StyledSetting onClick={showSettingModal}>
      <i className="fal fa-cog" />
    </StyledSetting>
  );
};

export default Setting;

const StyledSetting = styled.button`
  padding: 0;
  height: 32px;
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: ${({ theme }) => theme.muted};
  background-color: ${({ theme }) => theme.box.itemBackground};
  color: ${({ theme }) => theme.success};
  border-radius: 3px;
  &:hover {
    color: ${({ theme }) => theme.text.primary};
  }
`;
