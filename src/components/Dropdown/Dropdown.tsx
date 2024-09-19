import React, { createContext, ReactNode, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import useOutsideClick from '../../hooks/useOutsideClick';

type Context = {
  isOpen: boolean;
  toggle: () => void;
};
export const DropdownContext = createContext<Context>(null);

export type DropdownProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  children: ReactNode;
};

export const Dropdown: React.FC<DropdownProps> = ({ children, ref: _, ...props }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>();

  useOutsideClick(ref, () => {
    setOpen(false);
  });

  const value = useMemo(() => {
    return {
      isOpen: open,
      toggle: () => {
        setOpen((x) => !x);
      },
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={value}>
      <StyledDropdownContainer ref={ref} {...props}>
        {children}
      </StyledDropdownContainer>
    </DropdownContext.Provider>
  );
};

const StyledDropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;
