import React, { useCallback } from 'react';
import styled from 'styled-components';

export type CheckboxProps = {
  active?: boolean;
  value?: string | number;
  text: string;
  onClick: (value?: string | number) => void;
  color?: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({ text, value, active, onClick, color }) => {
  const onCheckboxClick = useCallback(() => {
    onClick(value);
  }, [onClick, value]);

  return (
    <StyledContainer onClick={onCheckboxClick}>
      <StyledCheckbox active={active} color={color}>
        {active && <StyleCheck className="far fa-check" active={active} color={color} />}
      </StyledCheckbox>
      {text}
    </StyledContainer>
  );
};

const StyledContainer = styled.button`
  display: flex;
  align-items: center;
  width: fit-content;
  padding: 0px;
  margin: 4px 0px;
  text-align: left;
`;

const StyleCheck = styled.i<{ active?: boolean; color?: string }>`
  color: ${({ active, theme, color }) =>
    active ? (color ? color : theme.success) : theme.gray3};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
`;

const StyledCheckbox = styled.div<{ active?: boolean; color?: string }>`
  position: relative;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 4px;
  border: 1px solid
    ${({ active, theme, color }) =>
      active ? (color ? color : theme.input.border) : theme.box.border};
`;
