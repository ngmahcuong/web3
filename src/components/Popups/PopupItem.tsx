import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { PopupContent } from '../../state/application/actions';
import { useRemovePopup } from '../../state/application/hooks';
import { ErrorPopup } from './ErrorPopup';
import { TransactionPopup } from './TransactionPopup';
import { WaitingPopup } from './WaitingPopup';

interface PopupItemProps {
  popupId: string;
  content: PopupContent;
  removeAfterMs: number | null;
}

export const PopupItem: React.FC<PopupItemProps> = ({ removeAfterMs, popupId, content }) => {
  const removePopup = useRemovePopup();

  const removeThisPopup = useCallback(() => removePopup(popupId), [popupId, removePopup]);

  useEffect(() => {
    if (removeAfterMs == null) return undefined;

    const timeout = setTimeout(() => {
      removeThisPopup();
    }, removeAfterMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [removeAfterMs, removeThisPopup]);

  let contentDiv = null;

  switch (content.type) {
    case 'waiting':
      contentDiv = <WaitingPopup {...content} />;
      break;
    case 'error':
      contentDiv = <ErrorPopup {...content} />;
      break;
    case 'transaction':
      contentDiv = <TransactionPopup {...content} />;
      break;
  }

  return (
    <StyledPopup>
      <StyledClose onClick={removeThisPopup}></StyledClose>
      {contentDiv}
    </StyledPopup>
  );
};

const StyledPopup = styled.div`
  position: relative;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 22px;
  background-color: ${(p) => p.theme.box.background};
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.15);
`;

const StyledClose = styled.button.attrs({
  children: <i className="fal fa-times" />,
})`
  z-index: 2;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  right: 5px;
  top: 2px;
  color: ${(p) => p.theme.text.primary};
  font-size: 16px;
`;
