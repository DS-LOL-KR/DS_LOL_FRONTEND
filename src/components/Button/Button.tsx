import styled, { css } from 'styled-components';

// docs/design-system.md → Button.
// `secondary` is the default on purpose: the white `primary` is one-per-screen
// (the screen's key action), so it has to be asked for explicitly.
// `danger` and `dangerGhost` render the same outline — solid red fills are out.
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerGhost';
type Size = 'md' | 'sm';

export const Button = styled.button<{ $variant?: Variant; $size?: Size }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius.control}px;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);

  ${({ $size = 'md', theme }) =>
    $size === 'sm'
      ? css`
          height: var(--control-height-sm);
          padding: 0 10px;
          font: ${theme.type.captionStrong};
        `
      : css`
          height: var(--control-height);
          padding: 0 14px;
          font: ${theme.type.labelStrong};

          /* Touch target — 36px is fine for a pointer, tight for a thumb. */
          ${theme.media.mobile} {
            height: 40px;
          }
        `}

  ${({ $variant = 'secondary', theme }) => {
    if ($variant === 'primary')
      return css`
        background: ${theme.color.text.primary};
        color: ${theme.color.text.onPrimary};

        &:hover:not(:disabled) {
          background: #ffffff;
        }
      `;
    if ($variant === 'ghost')
      return css`
        background: transparent;
        color: ${theme.color.text.secondary};
        padding-left: 8px;
        padding-right: 8px;

        &:hover:not(:disabled) {
          background: ${theme.color.surface.hover};
          color: ${theme.color.text.primary};
        }
      `;
    if ($variant === 'danger' || $variant === 'dangerGhost')
      return css`
        background: transparent;
        color: ${theme.color.team.red};
        border-color: ${theme.color.state.dangerLine};

        &:hover:not(:disabled) {
          background: ${theme.color.team.redSoft};
        }
      `;
    return css`
      background: ${theme.color.surface.subtle};
      color: ${theme.color.text.primary};
      border-color: ${theme.color.border.strong};

      &:hover:not(:disabled) {
        background: ${theme.color.surface.hover};
      }
    `;
  }}

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
