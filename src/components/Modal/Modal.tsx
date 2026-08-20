import type { ReactNode } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  z-index: 100;
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.gradient.card};
  border: 1px solid ${({ theme }) => theme.color.border.strong};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  padding: ${({ theme }) => theme.space.lg}px;
  min-width: 320px;
`;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
}

// TODO: focus trap, escape-to-close, portal rendering.
export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>{children}</Panel>
    </Overlay>
  );
}
