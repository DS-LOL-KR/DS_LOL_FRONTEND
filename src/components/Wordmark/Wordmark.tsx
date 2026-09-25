import styled from 'styled-components';

// The logo is a red star folding into a blue one — the two sides of a 내전.
// The wordmark carries the same idea in type: the underscore in "DS_LOL" is
// drawn as a hard red|blue split. The real "_" stays in the text so the name
// reads (and is crawled/verified) exactly as "DS_LOL".
const Mark = styled.span<{ $size: number }>`
  display: inline-flex;
  align-items: baseline;
  font-family: ${({ theme }) => theme.fontFamily.sans};
  font-size: ${({ $size }) => $size}px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.color.text.primary};
  white-space: nowrap;
`;

const Split = styled.span`
  position: relative;
  display: inline-block;
  width: 0.62em;
  margin: 0 0.04em;
  color: transparent;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0.02em;
    height: 0.14em;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.color.team.red} 0 50%,
      ${({ theme }) => theme.color.team.blue} 50% 100%
    );
  }
`;

export function Wordmark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <Mark $size={size} className={className}>
      DS<Split>_</Split>LOL
    </Mark>
  );
}
