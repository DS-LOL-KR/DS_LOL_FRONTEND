/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 디자인 스킨: 'classic'(기본, 원래 디자인) | 'apple'| 'classic'(원래 디자인). src/styles/skin.ts 참고 */
  readonly VITE_SKIN?: string;
  /** 움직임: 'apple'(기본) | 'none'. src/styles/skin.ts 참고 */
  readonly VITE_MOTION?: string;
  /** '1'이면 개발 서버에서 목 API 사용 (src/mocks/mockAdapter.ts) */
  readonly VITE_MOCK?: string;
}
