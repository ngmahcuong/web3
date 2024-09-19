import styled from 'styled-components';
import { screenUp } from '../../utils/styles';
import { ReactComponent as IconBack } from '../../assets/icons/ic-back.svg';

type ModalSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
export interface ModalProps {
  onDismiss?: () => void;
  size?: ModalSize;
}

const getModalSize = (size: ModalSize = 'sm') => {
  switch (size) {
    case 'xxs':
      return 400;
    case 'xs':
      return 450;
    case 'sm':
      return 500;
    case 'md':
      return 800;
    case 'lg':
      return 1140;
    default:
      return 300;
  }
};

export const Modal = styled.div<{ size?: ModalSize }>`
  margin: 0 10px;
  width: 100%;
  max-width: ${(p) => getModalSize(p.size)}px;
  z-index: 1000;
  background: ${(p) => p.theme.box.itemBackground};
  border-radius: 0;
  ${screenUp('lg')`
    margin: 0 auto;
  `}
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background-color: ${(p) => p.theme.box.innerBackground};
`;

export const ModalTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

export const ModalCloseButton = styled.button.attrs({
  children: <i className="fal fa-times" />,
})`
  order: 9;
  font-size: 20px;
  margin-left: auto;
`;

export const ModalContent = styled.div`
  padding: 24px 24px 10px 24px;
`;

export const ModalBackButton = styled.button.attrs(({ children }: { children: string }) => ({
  children: (
    <>
      <IconBack />
      {children}
    </>
  ),
}))`
  width: fit-content;
  display: flex;
  align-items: center;
  padding: 0;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.gray3};
  svg {
    width: 22px;
    margin-right: 10px;
    fill: ${({ theme }) => theme.gray3};
  }
  :hover {
    color: #428f66;
    svg {
      fill: #428f66;
    }
  }
`;

export default Modal;
