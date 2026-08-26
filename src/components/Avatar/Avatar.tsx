import { useState } from 'react';
import styled from 'styled-components';

// Fixed rotation of muted accent tints so a list of names reads with a little
// visual rhythm instead of a wall of identical gray circles.
const PALETTE = ['#598FFF', '#5CCCBD', '#F5C761', '#CC9169', '#FF8FA3', '#8C7CF0'];

function paletteIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % PALETTE.length;
}

const Circle = styled.div<{ $size: number; $color: string }>`
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-weight: 600;
  font-size: ${({ $size }) => Math.round($size * 0.42)}px;
  color: #121315;
  background: ${({ $color }) => $color}99;
`;

const Image = styled.img<{ $size: number }>`
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  object-fit: cover;
`;

export interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, imageUrl, size = 24, className }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageUrl && !imageFailed) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        $size={size}
        className={className}
        onError={() => setImageFailed(true)}
      />
    );
  }

  const initial = name.trim().charAt(0) || '?';
  const color = PALETTE[paletteIndex(name || '?')];
  return (
    <Circle $size={size} $color={color} className={className}>
      {initial}
    </Circle>
  );
}
