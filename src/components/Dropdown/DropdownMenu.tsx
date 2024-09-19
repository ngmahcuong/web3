import React, { ReactNode, useContext } from 'react';
import { useCallback } from 'react';
import styled from 'styled-components';
import { DropdownContext } from './Dropdown';

export type DropdownMenuProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  position?: 'right' | 'left';
  direction?: 'up' | 'down';
  children: ReactNode;
  disableAutoClose?: boolean;
};

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  disableAutoClose,
  ref: _ref,
  ...props
}) => {
  const { isOpen, toggle } = useContext(DropdownContext);

  const onClick = useCallback(() => {
    if (!disableAutoClose) {
      toggle();
    }
  }, [toggle, disableAutoClose]);

  return (
    <StyledDropdownMenu isOpen={isOpen} {...props} onClick={onClick}>
      {children}
    </StyledDropdownMenu>
  );
};

const StyledDropdownMenu = styled.div<
  Omit<DropdownMenuProps, 'children'> & { isOpen: boolean }
>`
  position: absolute;
  margin-top: 1px;
  ${(p) => (p.direction === 'up' ? 'bottom: 100%' : 'top: 100%')};
  ${(p) => (p.position === 'right' ? 'right: 0' : 'left: 0')};
  z-index: ${({ isOpen }) => (isOpen ? 100 : -1)};
  min-width: 240px;
  opacity: ${(p) => (p.isOpen ? 1 : 0)};
  transform: scaleY(${(p) => (p.isOpen ? '100%' : '0%')});
  transition: all 0.25s linear;
  transform-origin: top;
  background: ${(p) => p.theme.box.background};
  border: 1px solid ${(p) => p.theme.box.border};
  padding: 5px;
`;
