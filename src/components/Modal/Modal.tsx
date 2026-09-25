import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space.md}px;
  background: rgba(3, 4, 8, 0.66);
  z-index: 100;
  animation: modalFade 0.16s ease-out;

  @keyframes modalFade {
    from { opacity: 0; }
  }
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.color.surface.raised};
  border: 1px solid ${({ theme }) => theme.color.border.strong};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${({ theme }) => theme.space.lg}px;
  width: min(100%, max-content);
  min-width: min(360px, 100%);
  max-width: 100%;
  max-height: calc(100dvh - ${({ theme }) => theme.space.md * 2}px);
  overflow-y: auto;
  outline: none;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  animation: modalRise 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes modalRise {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const FOCUSABLE_SELECTOR =
  'a[href], button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // 호출부가 onClose={() => ...} 처럼 인라인 함수를 넘기면 렌더될 때마다 참조가
  // 바뀜 — 이 값을 아래 effect의 deps에 넣으면(예전 코드) 모달 내부 입력창에
  // 타이핑할 때마다(부모가 리렌더될 때마다) effect가 다시 실행되면서
  // panelRef.current?.focus()가 매 글자마다 포커스를 패널로 빼앗아갔음(실제
  // 버그로 발견됨, 2026-09-12). ref에 최신 onClose만 담아두고 effect 자체는
  // open이 실제로 바뀔 때만 다시 돌게 함.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <Overlay onClick={onClose}>
      <Panel ref={panelRef} role="dialog" aria-modal="true" tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        {children}
      </Panel>
    </Overlay>,
    document.body,
  );
}
