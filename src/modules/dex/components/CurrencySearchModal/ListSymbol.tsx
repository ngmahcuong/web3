import { FC, useState } from 'react';
import styled from 'styled-components';
import NO_NAME from '../../../../assets/tokens/NO_NAME.png';

const BAD_SRCS: { [key: string]: true } = {};

const ListSymbol: FC<{ uris: string[]; width: number; alt?: string }> = ({
  uris,
  width,
  alt,
}) => {
  const [, refresh] = useState<number>(0);
  const src = uris.find((src) => !BAD_SRCS[src]);

  return (
    <StyledImg
      width={width}
      src={src || NO_NAME}
      onError={() => {
        if (src) BAD_SRCS[src] = true;
        refresh((i) => i + 1);
      }}
      alt={alt}
    />
  );
};

export default ListSymbol;

const StyledImg = styled.img<{ rounded?: boolean }>`
  object-fit: contain;
  border-radius: ${({ rounded = true }) => rounded && '9999px'};
`;
