import { useState } from 'react';
import styled from 'styled-components';

// Initials on a neutral fill — per-person colors carry no meaning here
// (docs/design-system.md: color is for team/tier/result only).
const Circle = styled.div<{ $size: number }>`
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: ${({ $size }) => Math.max(10, Math.round($size * 0.42))}px;
  line-height: 1;
  color: ${({ theme }) => theme.color.text.secondary};
  background: ${({ theme }) => theme.color.surface.hover};
  /* Hairline ring so the circle survives on hover/selected rows, which share its fill. */
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color.border.strong};
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
  return (
    <Circle $size={size} className={className} aria-label={name} role="img">
      {initial}
    </Circle>
  );
}
