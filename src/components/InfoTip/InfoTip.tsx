import { type ReactNode, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Icon } from '../Icon/Icon';

// 부가 설명을 화면에 늘어놓지 않고 ⓘ 아이콘에 숨겨둠 — 마우스를 올리거나(PC), 탭하거나(모바일),
// 키보드로 포커스하면 보여요. 말풍선은 body에 portal로 띄워서 overflow: hidden인 카드(flush
// 카드·테이블)나 모달 안에서도 잘리지 않게 함. 위치는 아이콘 아래(공간이 없으면 위)에 두고
// 화면 좌우 끝을 넘지 않게 맞춤.

const GAP = 6;
const EDGE = 12;

const Trigger = styled.button`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  margin-left: 4px;
  vertical-align: middle;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.color.text.muted};
  cursor: help;

  &:hover,
  &[aria-expanded='true'] {
    color: ${({ theme }) => theme.color.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.border.strong};
    outline-offset: 1px;
  }
`;

const Bubble = styled.div`
  position: fixed;
  z-index: 110; /* 모달(100) 위 */
  max-width: min(280px, calc(100vw - ${EDGE * 2}px));
  padding: 8px 10px;
  background: ${({ theme }) => theme.color.surface.subtle};
  border: 1px solid ${({ theme }) => theme.color.border.strong};
  border-radius: ${({ theme }) => theme.radius.control}px;
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.35);
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.secondary};
  white-space: normal;
  text-wrap: pretty;
  pointer-events: none;
`;

export interface InfoTipProps {
  children: ReactNode;
  /** 스크린리더용 버튼 이름 */
  label?: string;
}

export function InfoTip({ children, label = '설명 보기' }: InfoTipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return;
    const t = trigger.getBoundingClientRect();
    const b = bubble.getBoundingClientRect();
    const below = t.bottom + GAP;
    const top = below + b.height > window.innerHeight - EDGE ? t.top - GAP - b.height : below;
    const centered = t.left + t.width / 2 - b.width / 2;
    const left = Math.min(Math.max(centered, EDGE), window.innerWidth - EDGE - b.width);
    setPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
    else setPos(null);
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onPointer = (e: PointerEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        // 카드 전체가 링크/버튼인 곳에서 눌러도 이동하지 않게
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Icon name="info" size={14} />
      </Trigger>
      {open &&
        createPortal(
          <Bubble
            ref={bubbleRef}
            id={id}
            role="tooltip"
            style={pos ?? { top: 0, left: 0, visibility: 'hidden' }}
          >
            {children}
          </Bubble>,
          document.body,
        )}
    </>
  );
}

// 제목/라벨 바로 옆에 ⓘ를 붙일 때 감싸는 줄.
export const HintRow = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;
