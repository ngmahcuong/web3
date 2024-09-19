import { nanoid } from '@reduxjs/toolkit';
import React, { useRef, MouseEvent, useLayoutEffect } from 'react';
import { useCallback } from 'react';
import styled from 'styled-components';

export type ToggleProps = {
  checked?: boolean;
  disabled?: boolean;
  onClick?: (e?: MouseEvent) => void;
};

export const Toggle: React.FC<ToggleProps> = ({ checked, disabled, onClick }) => {
  const id = useRef(nanoid());
  const ref = useRef<HTMLInputElement>();

  useLayoutEffect(() => {
    ref.current.checked = checked;
  }, [checked]);

  const onToggle = useCallback(
    (ev: React.MouseEvent<HTMLLabelElement>) => {
      if (disabled) {
        return;
      }
      ev.stopPropagation();
      onClick();
    },
    [disabled, onClick],
  );

  return (
    <StyledToggle disabled={disabled}>
      <input disabled ref={ref} type="checkbox" id={id.current} />
      <StyledLabel disabled={disabled} onClick={onToggle} htmlFor={id.current}>
        Toggle
      </StyledLabel>
    </StyledToggle>
  );
};

const StyledLabel = styled.label<{ disabled?: boolean }>`
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  text-indent: -9999px;
  width: 35px;
  height: 20px;
  display: inline-block;
  position: relative;
  font-size: 1.1em;

  &:before {
    content: '';
    width: 35px;
    height: 20px;
    top: 0;
    border-radius: 100px;
    background: ${({ theme }) => theme.gray5};
    left: 0;
    position: absolute;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    margin: auto;
    width: 18px;
    height: 18px;
    border-radius: 100px;
    transition: 0.1s;
    background: ${({ theme }) => theme.white};
  }
`;

const StyledToggle = styled.span<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};

  input[type='checkbox'] {
    height: 0;
    width: 0;
    visibility: hidden;
    position: absolute;
  }

  input:checked + ${StyledLabel}:before {
    background: ${({ theme }) => theme.success};
  }

  input:checked + ${StyledLabel}:after {
    left: 100%;
    background: ${({ theme }) => theme.white};
    transform: translateX(-19px);
  }
`;
