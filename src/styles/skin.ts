// 디자인 스위치 두 가지.
//
// SKIN — 생김새(색·표면·둥글기)
//   - 'classic': 원래 다크 모노크롬 디자인 (tokens.css 그대로, docs/design-system.md) ← 기본
//   - 'apple'  : Liquid Glass 스킨 (src/styles/skins/apple.css)
//
// MOTION — 움직임만 (생김새는 안 바꿈)
//   - 'apple': 스프링 모션, 버튼 눌림, 모달/메뉴 등장, 배경 블러 (src/styles/skins/apple-motion.css) ← 기본
//   - 'none' : 원래 움직임
//
// .env에 VITE_SKIN / VITE_MOTION 을 넣거나 아래 DEFAULT_* 를 바꾸면 된다.
// 각 CSS는 :root[data-skin='apple'] / :root[data-motion='apple'] 아래에만 걸려 있어서 끄면 영향이 없다.
export type Skin = 'apple' | 'classic';
export type Motion = 'apple' | 'none';

const DEFAULT_SKIN: Skin = 'classic';
const DEFAULT_MOTION: Motion = 'apple';

const env = import.meta.env;

export const SKIN: Skin = env.VITE_SKIN === 'classic' || env.VITE_SKIN === 'apple' ? env.VITE_SKIN : DEFAULT_SKIN;

export const MOTION: Motion = env.VITE_MOTION === 'apple' || env.VITE_MOTION === 'none' ? env.VITE_MOTION : DEFAULT_MOTION;
