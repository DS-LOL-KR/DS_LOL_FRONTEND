# DS_LOL Design System — v2 (Dark Monochrome)

> 토큰 원본: `src/styles/tokens.css`. 이 문서는 규칙과 레퍼런스 스니펫이다.
> 스니펫은 plain HTML/CSS로 쓰였고, 실제 구현은 styled-components에서 `var(--token)`을 참조한다.

---

## 1. 디자인 원칙

1. **회색이 기본, 색은 정보다.** 화면은 무채색으로 짓고, 색은 팀(레드/블루) · 티어(1~5) · 승패/증감에만 쓴다. 색을 빼도 구조가 읽혀야 한다.
2. **계층은 밝기로만.** canvas → app → surface → surface-raised → hover 순으로 한 단계씩 밝아지고, 카드는 1px 보더로 영역을 나눈다. 그림자·그라데이션은 없다.
3. **숫자가 주인공.** MMR · 승률 · 밸런스는 크게, tabular-nums로 정렬하고, 라벨은 작고 흐리게 둔다.
4. **한 화면에 결정은 하나.** 흰색 primary 버튼은 그 화면의 핵심 액션 1개에만 쓰고, 나머지는 어두운 secondary로 둔다.
5. **넓은 화면은 그리드로 채운다.** KPI → 차트 → 리스트 순으로 12컬럼 그리드에 배치해서 우측이 비지 않게 한다.

---

## 2. `:root` CSS 변수

`src/styles/tokens.css` 전체. 요청한 토큰은 그대로 두고, 컴포넌트 규칙에 필요한 파생 토큰만 추가했다.
(`*-soft` 티어 배경, `--status-lose-soft`, `--team-red-line`, `--text-on-primary`, `--bg-overlay`, `--focus-ring`, 사이즈/모션)

```css
:root {
  /* Background */
  --bg-canvas: #08090c;
  --bg-app: #0c0d11;
  --bg-sidebar: #0f1015;
  --bg-surface: #14161c;
  --bg-surface-raised: #1b1d25;
  --bg-hover: #22252e;
  --bg-overlay: rgba(8, 9, 12, 0.72);

  /* Border */
  --border-subtle: #1f222a;
  --border-default: #2a2d37;

  /* Text */
  --text-primary: #ecedf0;
  --text-secondary: #9a9fab;
  --text-muted: #7d828e;
  --text-on-primary: #0c0d11;

  /* Team */
  --team-red: #e8636b;
  --team-red-soft: rgba(232, 99, 107, 0.12);
  --team-red-line: rgba(232, 99, 107, 0.3);
  --team-blue: #6b8cf5;
  --team-blue-soft: rgba(107, 140, 245, 0.12);

  /* Status */
  --status-win: #5dd39e;
  --status-win-soft: rgba(93, 211, 158, 0.14);
  --status-lose: #e8636b;
  --status-lose-soft: rgba(232, 99, 107, 0.12);

  /* Group tier */
  --tier-1: #7dd3e8;  --tier-1-soft: rgba(125, 211, 232, 0.1);
  --tier-2: #5fd3b4;  --tier-2-soft: rgba(95, 211, 180, 0.1);
  --tier-3: #f2c94c;  --tier-3-soft: rgba(242, 201, 76, 0.1);
  --tier-4: #a1a6b3;  --tier-4-soft: rgba(161, 166, 179, 0.1);
  --tier-5: #6a6f7b;  --tier-5-soft: rgba(106, 111, 123, 0.1);

  /* Chart */
  --chart-bar: #262b3a;
  --chart-bar-active: #7a9cf7;
  --chart-grid: #1f222a;
  --chart-mine: var(--text-primary);
  --chart-avg: var(--text-muted);

  /* Focus */
  --focus-ring: 0 0 0 2px var(--bg-app), 0 0 0 4px var(--text-secondary);

  /* Typography */
  --font-sans: 'Pretendard', 'Inter', system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  --type-hero: 700 56px/1.05 var(--font-sans);    --type-hero-tracking: -0.02em;
  --type-display: 700 28px/1.25 var(--font-sans); --type-display-tracking: -0.01em;
  --type-metric: 600 28px/1.2 var(--font-sans);
  --type-heading: 600 16px/1.4 var(--font-sans);
  --type-body: 400 15px/1.5 var(--font-sans);
  --type-body-strong: 600 15px/1.5 var(--font-sans);
  --type-label: 400 13px/1.45 var(--font-sans);
  --type-caption: 400 12px/1.4 var(--font-sans);
  --type-badge: 600 12px/1 var(--font-sans);

  /* Spacing (4px base) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-12: 48px;
  --card-padding: var(--space-5);
  --card-gap: var(--space-3);
  --section-gap: 40px;

  /* Sizes */
  --sidebar-width: 248px;
  --sidebar-item-height: 32px;
  --control-height: 36px;
  --control-height-sm: 28px;
  --table-row-height: 52px;
  --icon-box: 32px;
  --content-max: 1320px;

  /* Radius */
  --radius-frame: 16px;
  --radius-card: 12px;
  --radius-control: 8px;
  --radius-badge: 6px;
  --radius-full: 999px;

  /* Border */
  --border-card: 1px solid var(--border-subtle);
  --border-control: 1px solid var(--border-default);

  /* Motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 120ms;
  --duration-base: 180ms;
}
```

### 토큰 사용 매트릭스

| 레이어 | 배경 | 보더 | 예 |
|---|---|---|---|
| 0 canvas | `--bg-canvas` | — | 앱 프레임 바깥 여백 |
| 1 app / sidebar | `--bg-app` / `--bg-sidebar` | `--border-subtle` | 앱 프레임, 사이드바 |
| 2 surface | `--bg-surface` | `--border-subtle` | 카드, 모달 |
| 3 raised | `--bg-surface-raised` | `--border-default` | 카드 안의 행, 버튼, 인풋, 세그먼트 트랙 |
| 4 hover | `--bg-hover` | `--border-default` | hover, 세그먼트 선택 항목 |

**규칙:** 한 요소는 자기 부모보다 정확히 한 단계 밝다. surface 안에 surface를 넣지 않는다(카드 안 카드 금지 → raised 행으로).

### 공통 베이스

```css
html { color-scheme: dark; }
body {
  background: var(--bg-canvas);
  color: var(--text-primary);
  font: var(--type-body);
  -webkit-font-smoothing: antialiased;
  word-break: keep-all;
  overflow-wrap: anywhere;
}
.num, [data-num] { font-variant-numeric: tabular-nums; }
:focus-visible { outline: none; box-shadow: var(--focus-ring); }
```

`--focus-ring`은 box-shadow를 쓰지만 elevation이 아니라 포커스 표시다. "그림자 없음" 규칙의 유일한 예외.

---

## 3. 컴포넌트 규칙

### 3.0 App Shell & 그리드

- 데스크톱: canvas 위에 8px 여백을 두고 앱 프레임(`--bg-app`, radius 16, 1px subtle)을 띄운다. 프레임 = [사이드바 248px | 콘텐츠].
- 콘텐츠: 최대 1320px, 좌우 padding 32px, 상단 padding 32px.
- 대시보드 그리드: 12컬럼, gap 12px. 기본 배치는 **KPI 4개(각 3칸) → 차트 8칸 + 리스트 4칸 → 테이블 12칸**.
- **같은 행의 카드는 높이가 맞춰진다(stretch).** 그래서 한 행에 놓을 카드끼리는 내용 양이 비슷해야 한다. 짧은 카드는 아래에 보조 정보(로스터, 최근 목록)를 채우거나, 행을 나눈다. 카드 하단에 40% 넘게 빈 공간이 생기면 배치를 다시 짠다(표본 렌더링에서 팀 구성 카드가 레이더 카드 높이에 끌려 절반 가까이 비었음).
- ≤1100px: KPI 2×2(각 6칸), 차트/리스트 12칸씩 세로로.
- ≤720px(모바일): 앱 프레임 제거(radius 0, 여백 0), 사이드바는 56px 상단 바 + 드로어로. 그리드는 **2컬럼**: KPI(`col-3`)는 한 칸씩 2×2, 나머지는 두 칸 전체. KPI를 한 줄에 하나씩 쌓으면 첫 화면이 KPI 4장으로 꽉 찬다(표본 렌더링 확인). 콘텐츠 좌우 padding 16px.
- 모바일 타이포: hero 56→40px, display 28→24px (`tokens.css`에 미디어쿼리로 들어 있음). 숫자는 `white-space: nowrap`.

```html
<div class="app-frame">
  <aside class="sidebar">…</aside>
  <main class="content">
    <header class="page-header">…</header>
    <section class="grid">
      <div class="kpi col-3">…</div>
      <div class="card col-8">…</div>
      <div class="card col-4">…</div>
    </section>
  </main>
</div>
```

```css
.app-frame {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: calc(100vh - 16px);
  margin: 8px;
  background: var(--bg-app);
  border: var(--border-card);
  border-radius: var(--radius-frame);
  overflow: hidden;
}
.content { max-width: var(--content-max); width: 100%; margin: 0 auto; padding: var(--space-8); }
.grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--card-gap); }
.grid + .grid, .section + .section { margin-top: var(--section-gap); }
.col-3 { grid-column: span 3; } .col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; } .col-8 { grid-column: span 8; } .col-12 { grid-column: span 12; }

.card {
  background: var(--bg-surface);
  border: var(--border-card);
  border-radius: var(--radius-card);
  padding: var(--card-padding);
  min-width: 0;
}

@media (max-width: 1100px) {
  .col-3 { grid-column: span 6; }
  .col-4, .col-8 { grid-column: span 12; }
}
@media (max-width: 720px) {
  .app-frame { display: block; margin: 0; border: 0; border-radius: 0; min-height: 100vh; }
  .content { padding: var(--space-6) var(--space-4); }
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid > * { grid-column: span 2; }
  .grid > .col-3 { grid-column: span 1; }
}
```

---

### 3.1 Sidebar

**구조 (위 → 아래):** 로고 → 그룹 스위처 → Nav → (flex spacer) → 그룹원 → 디스코드 상태 카드

- 배경 `--bg-sidebar`, 우측 1px `--border-subtle`. padding 16px 12px.
- 로고: 기존 `Wordmark` 그대로 (18px, 언더바 레드|블루 하드 스플릿). 하드 스톱 2색 분할은 그라데이션 금지 규칙의 예외.
- 그룹 스위처: 높이 44px, raised 배경 + default 보더. 그룹명(body-strong) / 멤버 수(caption) + 우측 chevron. 클릭 시 그룹 목록 팝오버.
- Nav 아이템: 높이 32px, radius 8, 아이콘 16px + 라벨 13px. 기본 `--text-secondary`, hover는 `--bg-hover`, active는 raised 배경 + default 보더 + `--text-primary`. **active에 색을 쓰지 않는다.**
- 그룹원: 섹션 라벨(caption, muted, "그룹원 · 12") + 행 32px: 20px 이니셜 아바타 + 이름(label, secondary, 말줄임) + 우측 MMR(caption, muted, tabular). 최대 8명 노출, 나머지는 "+4명 더 보기" ghost 링크. MMR 내림차순.
- 디스코드 카드: surface 배경 + subtle 보더, radius 8, padding 12. 연결 상태는 6px 점(연결됨 = `--status-win`, 미연결 = `--text-muted`) + 텍스트. 미연결이면 secondary 버튼 "봇 초대하기" (sm). **사이드바에는 primary 버튼을 두지 않는다.**
- MMR이 `null`(계정 미연동)이면 숫자 대신 `—`를 muted로. 가짜 값 금지.

```html
<aside class="sidebar">
  <div class="sb-logo"><!-- <Wordmark size={18} /> --></div>

  <button class="sb-switcher" aria-haspopup="listbox">
    <span class="sb-switcher-text">
      <span class="sb-group-name">금요 내전단</span>
      <span class="caption">멤버 12명</span>
    </span>
    <svg class="icon" width="16" height="16" aria-hidden="true"><path d="M5 6l3 3 3-3" /></svg>
  </button>

  <nav class="sb-nav">
    <a class="sb-item is-active" aria-current="page" href="/matches"><svg class="icon">…</svg>내전</a>
    <a class="sb-item" href="/tiers"><svg class="icon">…</svg>티어표</a>
    <a class="sb-item" href="/me"><svg class="icon">…</svg>내 전적</a>
    <a class="sb-item" href="/group/settings"><svg class="icon">…</svg>그룹 설정</a>
  </nav>

  <div class="sb-spacer"></div>

  <section class="sb-members">
    <h3 class="caption">그룹원 · 12</h3>
    <ul>
      <li class="sb-member">
        <span class="avatar avatar-20">김</span>
        <span class="sb-member-name">김민준</span>
        <span class="caption num">1,842</span>
      </li>
    </ul>
  </section>

  <div class="sb-discord">
    <span class="dot dot-on"></span>
    <span class="label">디스코드 연결됨</span>
  </div>
</aside>
```

```css
.sidebar {
  display: flex; flex-direction: column; gap: var(--space-4);
  padding: var(--space-4) var(--space-3);
  background: var(--bg-sidebar);
  border-right: var(--border-card);
  min-height: 100%;
}
.sb-logo { padding: var(--space-1) var(--space-2) var(--space-2); }
.sb-switcher {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-2);
  height: 44px; padding: 0 var(--space-3);
  background: var(--bg-surface-raised); border: var(--border-control); border-radius: var(--radius-control);
  color: var(--text-primary); cursor: pointer; text-align: left;
  transition: background var(--duration-fast) var(--ease-out);
}
.sb-switcher:hover { background: var(--bg-hover); }
.sb-switcher-text { display: flex; flex-direction: column; min-width: 0; }
.sb-group-name { font: var(--type-body-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sb-nav { display: flex; flex-direction: column; gap: 2px; }
.sb-item {
  display: flex; align-items: center; gap: var(--space-2);
  height: var(--sidebar-item-height); padding: 0 var(--space-2);
  border: 1px solid transparent; border-radius: var(--radius-control);
  font: var(--type-label); color: var(--text-secondary);
  transition: background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
}
.sb-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.sb-item.is-active { background: var(--bg-surface-raised); border-color: var(--border-default); color: var(--text-primary); }

.sb-spacer { flex: 1; }
.sb-members h3 { padding: 0 var(--space-2) var(--space-1); font-weight: 400; }
.sb-member {
  display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; align-items: center; gap: var(--space-2);
  height: var(--sidebar-item-height); padding: 0 var(--space-2); border-radius: var(--radius-control);
}
.sb-member:hover { background: var(--bg-hover); }
.sb-member-name { font: var(--type-label); color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sb-discord {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3); background: var(--bg-surface);
  border: var(--border-card); border-radius: var(--radius-control);
}
.dot { width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--text-muted); flex-shrink: 0; }
.dot-on { background: var(--status-win); }

.avatar {
  display: inline-grid; place-items: center; flex-shrink: 0;
  border-radius: var(--radius-full);
  background: var(--bg-hover); color: var(--text-secondary);
  font: 600 10px/1 var(--font-sans);
}
.avatar-20 { width: 20px; height: 20px; }
.avatar-32 { width: 32px; height: 32px; font-size: 12px; }
```

아바타는 이니셜 + 무채색 배경. 사람별로 색을 다르게 주지 않는다(의미 없는 색).

---

### 3.2 Page Header

- 제목(display) + 메타(label, secondary, 예: "19시간 전 갱신 · 동기화된 경기 128판") + 우측 액션.
- 우측 액션 순서: `[secondary …] [primary]` — primary는 항상 가장 오른쪽, 최대 1개.
- 헤더와 첫 그리드 사이 32px. 모바일에서는 액션이 제목 아래로 내려가고 버튼이 가로로 늘어난다.

```html
<header class="page-header">
  <div>
    <h1 class="display">내 전적</h1>
    <p class="label">19시간 전 갱신 · 동기화된 경기 기준</p>
  </div>
  <div class="page-actions">
    <button class="btn btn-secondary">기간 설정</button>
    <button class="btn btn-primary">지금 갱신</button>
  </div>
</header>
```

```css
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-8); }
.display { font: var(--type-display); letter-spacing: var(--type-display-tracking); }
.label   { font: var(--type-label); color: var(--text-secondary); margin-top: var(--space-1); }
.caption { font: var(--type-caption); color: var(--text-muted); }
.page-actions { display: flex; gap: var(--space-2); flex-shrink: 0; }

@media (max-width: 720px) {
  .page-header { flex-direction: column; align-items: stretch; }
  .page-actions > .btn { flex: 1; }
}
```

---

### 3.3 KPI Card

- 순서 고정: 라벨(label) → 숫자(metric) → 보조 정보(caption).
- 증감은 `↑ +24` (win) / `↓ −12` (lose) — 화살표와 부호를 **둘 다** 붙여 색 없이도 읽히게. 변화 없음은 `— 0` muted.
- 숫자와 단위: 단위("%", "판")는 숫자보다 작게(16px, secondary).
- 한 줄에 KPI는 최대 4개.
- **티어 KPI**는 metric 자리에 작은 배지를 넣지 않는다(다른 KPI 숫자 옆에서 너무 약해 보임). 숫자를 티어 색 metric으로 쓰고 "티어"를 unit으로 붙인다: `<p class="metric num" style="color: var(--tier-1)">1<span class="unit">티어</span></p>`.

```html
<article class="card kpi col-3">
  <p class="label">그룹 MMR</p>
  <p class="metric num">1,842</p>
  <p class="kpi-sub">
    <span class="delta delta-up num">↑ +24</span>
    <span class="caption">최근 7일</span>
  </p>
</article>

<article class="card kpi col-3">
  <p class="label">내전 승률</p>
  <p class="metric num">58.3<span class="unit">%</span></p>
  <p class="kpi-sub"><span class="caption num">21승 15패</span></p>
</article>
```

```css
.kpi { display: flex; flex-direction: column; gap: var(--space-2); }
.kpi .label { margin: 0; }
.metric { font: var(--type-metric); font-variant-numeric: tabular-nums; color: var(--text-primary); }
.unit { font: 600 16px/1 var(--font-sans); color: var(--text-secondary); margin-left: 2px; }
.kpi-sub { display: flex; align-items: center; gap: var(--space-2); }
.delta { font: 600 12px/1.4 var(--font-sans); font-variant-numeric: tabular-nums; }
.delta-up   { color: var(--status-win); }
.delta-down { color: var(--status-lose); }
.delta-flat { color: var(--text-muted); }
```

**Hero Number** (내 MMR, 팀 합계 MMR): KPI의 큰 버전. 카드당 1개, 페이지당 최대 2개(블루 vs 레드 대결 구도, 블루가 왼쪽).

```css
.hero-number { font: var(--type-hero); letter-spacing: var(--type-hero-tracking); font-variant-numeric: tabular-nums; white-space: nowrap; }
.hero-number.is-red  { color: var(--team-red); }   /* 팀 합계일 때만 팀 색 */
.hero-number.is-blue { color: var(--team-blue); }
```

---

### 3.4 Tier Badge

- 그룹 내부 티어(1~5) 전용. 텍스트는 티어 색, 배경은 같은 색 10%.
- 높이 22px, padding 0 8px, radius 6, 12px/600. 표기는 `1티어`(목록) 또는 `T1`(좁은 공간).
- 라이엇 공식 티어("PLATINUM III")에는 **색을 쓰지 않는다** — 무채색 텍스트(label, secondary). 두 값이 섞이지 않게.

```html
<span class="tier-badge" data-tier="1">1티어</span>
<span class="tier-badge" data-tier="3">3티어</span>
<span class="official-tier">PLATINUM III</span>
```

```css
.tier-badge {
  display: inline-flex; align-items: center; height: 22px; padding: 0 var(--space-2);
  border-radius: var(--radius-badge); font: var(--type-badge); white-space: nowrap;
}
.tier-badge[data-tier="1"] { color: var(--tier-1); background: var(--tier-1-soft); }
.tier-badge[data-tier="2"] { color: var(--tier-2); background: var(--tier-2-soft); }
.tier-badge[data-tier="3"] { color: var(--tier-3); background: var(--tier-3-soft); }
.tier-badge[data-tier="4"] { color: var(--tier-4); background: var(--tier-4-soft); }
.tier-badge[data-tier="5"] { color: var(--tier-5); background: var(--tier-5-soft); box-shadow: inset 0 0 0 1px var(--border-default); }
.official-tier { font: var(--type-label); color: var(--text-secondary); }
```

5티어는 10% 배경이 surface와 거의 구분되지 않아서 1px inset 보더를 더한다.

---

### 3.5 Team Balance Bar

- **팀 순서는 항상 블루 → 레드** (블루가 왼쪽·앞). 막대, 예상 승률 숫자, 팀 카드, 승리 선택 버튼, 변동 내역 행 모두 같은 순서를 따른다. 로고 언더바(레드|블루)는 브랜드 마크라 예외.
- 막대 왼쪽 구간 너비 = **블루 예상 승률** (블루 49% → 블루 49% / 레드 51%). 중앙(50%)에 고정된 흰 마커 = 완전 균형 기준선. 마커에서 경계가 멀수록 불균형.
- 막대 높이 6px, radius full, 두 구간 사이 2px 틈.
- 위 행: 좌측 "밸런스 98%"(body-strong + num), 우측 "예상 승률 **49** : **51**"(블루 숫자는 team-blue, 레드 숫자는 team-red).
- 접근성: 컨테이너에 `role="img"` + `aria-label="밸런스 98%, 예상 승률 블루 49 대 레드 51"`.

```html
<div class="balance" role="img" aria-label="밸런스 98%, 예상 승률 블루 49 대 레드 51" style="--blue: 49%">
  <div class="balance-meta">
    <span class="balance-score">밸런스 <b class="num">98%</b></span>
    <span class="label">예상 승률
      <b class="num t-blue">49</b> : <b class="num t-red">51</b>
    </span>
  </div>
  <div class="balance-track">
    <span class="balance-blue"></span>
    <span class="balance-red"></span>
    <span class="balance-marker"></span>
  </div>
</div>
```

```css
.balance { display: flex; flex-direction: column; gap: var(--space-2); }
.balance-meta { display: flex; justify-content: space-between; align-items: baseline; }
.balance-score { font: var(--type-body); color: var(--text-secondary); }
.balance-score b { font-weight: 600; color: var(--text-primary); }
.t-red  { color: var(--team-red); }
.t-blue { color: var(--team-blue); }

.balance-track { position: relative; display: flex; gap: 2px; height: 6px; }
.balance-blue { width: var(--blue); background: var(--team-blue); border-radius: var(--radius-full); }
.balance-red  { flex: 1;            background: var(--team-red);  border-radius: var(--radius-full); }
.balance-marker {
  position: absolute; left: 50%; top: -3px; width: 2px; height: 12px;
  transform: translateX(-50%); background: var(--text-primary); border-radius: 1px;
  box-shadow: 0 0 0 2px var(--bg-surface); /* 막대와 분리하는 knockout, 그림자 아님 */
}
```

---

### 3.6 Win Rate Bar

- 승(`--status-win`) / 패(`--status-lose`) 2색, 높이 4px, radius full, 구간 사이 2px 틈.
- 우측에 `58%` (label, tabular, 최소 폭 40px 우측 정렬). 테이블 안에서는 바 폭 80px 고정.
- 판수 0이면 바 대신 `—` muted.
- **테이블(5행 이상) 안에서는 `.winrate-compact`**: 패 구간을 `--chart-bar`(무채색)로 낮춘다. 행마다 빨강이 반복되면 레드팀 표시(좌측 바, 팀명)와 섞여서 표 전체가 빨갛게 보이기 때문이다(표본 렌더링에서 확인). 카드 단독 사용 시에는 2색 그대로.

```html
<div class="winrate" style="--win: 58%">
  <div class="winrate-track"><span class="w"></span><span class="l"></span></div>
  <span class="winrate-pct num">58%</span>
</div>
```

```css
.winrate { display: flex; align-items: center; gap: var(--space-2); }
.winrate-track { display: flex; gap: 2px; flex: 1; min-width: 80px; height: 4px; }
.winrate-track .w { width: var(--win); background: var(--status-win); border-radius: var(--radius-full); }
.winrate-track .l { flex: 1; background: var(--status-lose); border-radius: var(--radius-full); }
.winrate-compact .winrate-track .l { background: var(--chart-bar); }
.winrate-pct { width: 40px; text-align: right; font: var(--type-label); color: var(--text-primary); font-variant-numeric: tabular-nums; }
```

---

### 3.7 Recent Form (최근 10판)

- 24×24 칩, radius 6, 12px/600. 텍스트 "승"/"패" — **색만으로 구분하지 않는다.**
- 승 = win-soft 배경 + win 텍스트, 패 = raised 배경 + muted 텍스트 (패는 강조하지 않음).
- 최신 경기가 **왼쪽**. 칩 사이 4px. 10판 미만이면 있는 만큼만(빈 칩 채우지 않기).

```html
<ol class="form" aria-label="최근 10판: 승 승 패 승 …">
  <li class="form-chip is-win">승</li>
  <li class="form-chip is-win">승</li>
  <li class="form-chip is-lose">패</li>
</ol>
```

```css
.form { display: flex; gap: var(--space-1); list-style: none; }
.form-chip {
  display: grid; place-items: center; width: 24px; height: 24px;
  border-radius: var(--radius-badge); font: var(--type-badge);
}
.form-chip.is-win  { background: var(--status-win-soft); color: var(--status-win); }
.form-chip.is-lose { background: var(--bg-surface-raised); color: var(--text-muted); }
```

---

### 3.8 Position Icon + Label

- 표기: `TOP / JUG / MID / ADC / SUP` (내전 배정용 값). 라이엇 원본값(`JUNGLE`, `BOTTOM` …)은 표시 전에 매핑.
- 아이콘: 16px **추상 미니맵**. 세 라인(좌·상 외곽 = TOP, 대각선 = MID, 하·우 외곽 = BOT)을 25% 불투명도로 깔고, 해당 라인만 100%로 그린다. 공식 라인 아이콘 사용 금지.
  - TOP: 좌+상 외곽선 / MID: 대각선 / ADC: 하+우 외곽선 / JUG: 정글 두 점 / SUP: 봇 코너 점 + 봇 라인
- ≤480px이거나 레드/블루 로스터를 좌우로 나란히 둘 때는 **아이콘만** 쓰고 약어는 `aria-label`로 옮긴다. 라벨까지 두면 이름이 한 글자씩 세로로 깨진다(표본 렌더링 확인). 이름은 `white-space: nowrap` + 말줄임.
- 닫힌 사각 프레임 + 작은 채움 블록은 쓰지 않는다 — 테이블 안에서 **체크박스처럼 읽힌다**(표본 렌더링에서 확인).
- 색: `currentColor`, 기본 `--text-secondary`. 라벨 12~13px secondary. 주 라인만 `--text-primary`로 강조 가능(색 금지).

```html
<span class="pos">
  <svg class="pos-icon" viewBox="0 0 16 16" aria-hidden="true">
    <g class="pos-base"><path d="M2.5 13.5V2.5h11" /><path d="M2.5 13.5h11v-11" /><path d="M3.5 12.5l9-9" /></g>
    <path d="M2.5 13.5V2.5h11" />                                        <!-- TOP -->
  </svg>
  TOP
</span>

<!-- MID: <path d="M3.5 12.5l9-9" /> -->
<!-- ADC: <path d="M2.5 13.5h11v-11" /> -->
<!-- JUG: <circle cx="6" cy="6.5" r="1.4" class="fill" /><circle cx="10" cy="9.5" r="1.4" class="fill" /> -->
<!-- SUP: <path d="M7 13.5h6.5V7" /><circle cx="13.5" cy="13.5" r="1.8" class="fill" /> -->
```

```css
.pos { display: inline-flex; align-items: center; gap: 6px; font: 500 12px/1 var(--font-sans); color: var(--text-secondary); letter-spacing: 0.02em; }
.pos-icon { width: 16px; height: 16px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.pos-icon .pos-base { opacity: 0.25; }
.pos-icon .fill { fill: currentColor; stroke: none; }
.pos.is-main { color: var(--text-primary); }
.pos-compact { font-size: 0; gap: 0; } /* 아이콘만, 약어는 aria-label */
```

---

### 3.9 Table

- 카드 안에 넣는다(카드 padding 0, 테이블 좌우 셀 padding 20px로 카드 여백 재현).
- 헤더: caption(12px, muted), 높이 40px, 하단 1px subtle. 정렬 가능한 컬럼은 hover 시 secondary.
- 행: 52px, 하단 1px subtle(마지막 행 제외), hover `--bg-hover`.
- 숫자 컬럼은 **우측 정렬 + tabular-nums**. 텍스트 컬럼은 좌측.
- 팀 표시: 첫 셀 좌측 3px 세로 바(행 높이의 60%, radius 2) + 팀명은 팀 컬러 텍스트. 행 배경은 칠하지 않는다.
- 레드팀 색(`#E8636B`)과 패배 색이 같다 → 한 행에 팀과 승패가 같이 나오면 승패는 **"승"/"패" 텍스트 배지**로 쓰고 셀 전체를 빨갛게 하지 않는다.
- 모바일: 부가 컬럼(`data-optional`)을 숨기고 가로 스크롤은 카드 내부에서만.

```html
<div class="card card-flush">
  <table class="table">
    <thead>
      <tr><th>#</th><th>플레이어</th><th>라인</th><th class="r">MMR</th><th class="r" data-optional>승률</th></tr>
    </thead>
    <tbody>
      <tr data-team="red">
        <td class="num muted">1</td>
        <td><span class="team-cell">김민준</span></td>
        <td><span class="pos">MID</span></td>
        <td class="r num">1,842</td>
        <td class="r" data-optional><!-- winrate --></td>
      </tr>
    </tbody>
  </table>
</div>
```

```css
.card-flush { padding: 0; overflow: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th {
  height: 40px; padding: 0 var(--space-3); text-align: left; white-space: nowrap;
  font: var(--type-caption); color: var(--text-muted); border-bottom: var(--border-card);
}
.table td {
  height: var(--table-row-height); padding: 0 var(--space-3);
  font: var(--type-body); border-bottom: var(--border-card);
}
.table th:first-child, .table td:first-child { padding-left: var(--space-5); }
.table th:last-child,  .table td:last-child  { padding-right: var(--space-5); }
.table tbody tr:last-child td { border-bottom: 0; }
.table tbody tr { transition: background var(--duration-fast) var(--ease-out); }
.table tbody tr:hover { background: var(--bg-hover); }
.table .r { text-align: right; }
.table .num { font-variant-numeric: tabular-nums; }
.table .muted { color: var(--text-muted); }

.table tr[data-team] td:first-child { position: relative; }
.table tr[data-team] td:first-child::before {
  content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 3px; border-radius: 0 2px 2px 0;
}
.table tr[data-team="red"]  td:first-child::before { background: var(--team-red); }
.table tr[data-team="blue"] td:first-child::before { background: var(--team-blue); }
.table tr[data-team="red"]  .team-cell { color: var(--team-red); }
.table tr[data-team="blue"] .team-cell { color: var(--team-blue); }

@media (max-width: 720px) { .table [data-optional] { display: none; } }
```

---

### 3.10 Button

| variant | 배경 | 텍스트 | 보더 | 용도 |
|---|---|---|---|---|
| primary | `--text-primary` (흰색) | `--text-on-primary` | 없음 | **화면당 1개.** 팀 구성하기, 지금 갱신, 결과 확정 |
| secondary | `--bg-surface-raised` | `--text-primary` | `--border-default` | 기본값. 나머지 모든 액션 |
| danger | transparent | `--team-red` | `--team-red-line` | 삭제, 그룹 나가기, 내전 취소 |
| ghost | transparent | `--text-secondary` | 없음 | 전체 보기, 취소, 인라인 보조 |

- 높이 36px(기본) / 28px(sm, 테이블·사이드바 내부). padding 0 14px(sm 0 10px). radius 8. 13px/600.
- 아이콘 버튼: 36×36 정사각, secondary 스타일, `aria-label` 필수.
- 상태: hover = 한 단계 밝게(secondary → hover, primary → `#FFFFFF`), active = `transform: translateY(1px)`, disabled = opacity .4 + `cursor: not-allowed`, loading = 라벨 유지 + 좌측 14px 스피너(폭 변화 없음).
- 모달 안의 primary는 모달이 떠 있는 동안 "그 화면"의 primary로 친다(뒤 페이지 primary는 딤 처리로 가려짐).
- danger에 솔리드 빨강 배경을 쓰지 않는다. 확인 모달의 최종 삭제 버튼도 danger(outline).
- **테이블 행마다 반복되는 액션**(추방, 위임, 편집)은 ghost sm으로 둔다. danger는 확인 모달의 최종 버튼에서만 쓴다 — 행마다 빨간 아웃라인이 반복되면 표 전체가 빨갛게 보인다(실제 그룹 설정 화면에서 확인).
- 모바일(≤720px)에서 md 버튼과 인풋은 터치 대상 확보를 위해 40px로 커진다.

```html
<button class="btn btn-primary">팀 구성하기</button>
<button class="btn btn-secondary">참가자 편집</button>
<button class="btn btn-danger">내전 취소</button>
<button class="btn btn-ghost">전체 보기</button>
<button class="btn btn-secondary btn-sm">봇 초대하기</button>
```

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: var(--control-height); padding: 0 14px; flex-shrink: 0; white-space: nowrap;
  border: 1px solid transparent; border-radius: var(--radius-control);
  font: 600 13px/1 var(--font-sans); cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out);
}
.btn:active:not(:disabled) { transform: translateY(1px); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-sm { height: var(--control-height-sm); padding: 0 10px; font-size: 12px; }

.btn-primary   { background: var(--text-primary); color: var(--text-on-primary); }
.btn-primary:hover:not(:disabled) { background: #ffffff; }

.btn-secondary { background: var(--bg-surface-raised); color: var(--text-primary); border-color: var(--border-default); }
.btn-secondary:hover:not(:disabled) { background: var(--bg-hover); }

.btn-danger    { background: transparent; color: var(--team-red); border-color: var(--team-red-line); }
.btn-danger:hover:not(:disabled) { background: var(--team-red-soft); }

.btn-ghost     { background: transparent; color: var(--text-secondary); padding: 0 var(--space-2); }
.btn-ghost:hover:not(:disabled) { color: var(--text-primary); background: var(--bg-hover); }
```

**Input**도 같은 컨트롤 규격: 36px, raised 배경, default 보더, radius 8, body 텍스트, placeholder muted, focus 시 보더 `--text-secondary` + `--focus-ring`, 에러는 보더 `--team-red-line` + 아래 caption을 `--status-lose`로.

---

### 3.11 Segmented Control

- 트랙: raised 배경 + subtle 보더, padding 2px, radius 8, 높이 36px.
- 옵션: 균등 폭, 13px. 비선택 = secondary 텍스트. 선택 = `--bg-hover` + `--text-primary` + 600. **흰 배경 선택 상태 금지.**
- 옵션 2~5개. 그 이상이면 Select/Tabs로.
- `role="radiogroup"` + 각 옵션 `role="radio" aria-checked`. 좌우 화살표로 이동.

```html
<div class="segmented" role="radiogroup" aria-label="기간">
  <button role="radio" aria-checked="true">최근 20판</button>
  <button role="radio" aria-checked="false">이번 시즌</button>
  <button role="radio" aria-checked="false">전체</button>
</div>
```

```css
.segmented {
  display: inline-flex; gap: 2px; height: var(--control-height); padding: 2px;
  background: var(--bg-surface-raised); border: var(--border-card); border-radius: var(--radius-control);
}
.segmented > button {
  flex: 1; padding: 0 var(--space-3); border: 0; border-radius: 6px; background: transparent;
  font: var(--type-label); color: var(--text-secondary); cursor: pointer; white-space: nowrap;
  transition: background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
}
.segmented > button:hover { color: var(--text-primary); }
.segmented > button[aria-checked="true"] { background: var(--bg-hover); color: var(--text-primary); font-weight: 600; }
```

---

### 3.12 Radar Chart (라인별 MMR)

- 5축 고정 순서(12시부터 시계방향): TOP → JUG → MID → ADC → SUP.
- 그리드: 동심 오각형 4단계, `--chart-grid` 1px. 축 라벨은 Position 라벨 스타일(12px secondary), 값은 caption.
- **내 값**: `--chart-mine` 1.5px 실선 + 채움 `rgba(236,237,240,0.06)` + 꼭짓점 3px 점.
- **그룹 평균**: `--chart-avg` 1px 점선(`stroke-dasharray: 3 3`), 채움 없음.
- 범례는 차트 위에 인라인: `— 나   ┄ 그룹 평균` (선 모양으로 구분, 색에 의존 안 함).
- 데이터가 없는 라인은 축은 그리되 값은 0이 아니라 **점 생략 + 라벨에 `—`**.
- 스케일: 그룹 내 최소~최대 MMR을 0~100%로 정규화(0부터 시작하면 모든 값이 바깥에 몰림). 스케일 기준을 caption으로 명시.

```html
<figure class="card radar">
  <figcaption class="radar-head">
    <h3 class="heading">라인별 MMR</h3>
    <span class="radar-legend caption"><i class="lg-mine"></i>나 <i class="lg-avg"></i>그룹 평균</span>
  </figcaption>
  <svg viewBox="0 0 240 240" role="img" aria-label="라인별 MMR: TOP 1,720, JUG 1,650 …">
    <g class="radar-grid"><!-- 4 pentagons + 5 spokes --></g>
    <polygon class="radar-avg"  points="…" />
    <polygon class="radar-mine" points="…" />
  </svg>
</figure>
```

```css
.heading { font: var(--type-heading); }
.radar-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.radar-grid  { fill: none; stroke: var(--chart-grid); stroke-width: 1; }
.radar-mine  { fill: rgba(236, 237, 240, 0.06); stroke: var(--chart-mine); stroke-width: 1.5; stroke-linejoin: round; }
.radar-avg   { fill: none; stroke: var(--chart-avg); stroke-width: 1; stroke-dasharray: 3 3; }
.radar-legend { display: inline-flex; align-items: center; gap: var(--space-2); }
.radar-legend i { display: inline-block; width: 14px; height: 0; border-top: 1.5px solid var(--chart-mine); }
.radar-legend i.lg-avg { border-top: 1px dashed var(--chart-avg); margin-left: var(--space-2); }
```

**막대 차트 공통:** 기본 막대 `--chart-bar`, 강조(현재/hover/선택) 1개만 `--chart-bar-active`. 막대 radius 4(상단만), 격자선 `--chart-grid`, 축 라벨 caption. `--chart-bar-active`는 팀 블루와 톤이 가까우므로 **레드/블루 팀 비교 차트에는 쓰지 않는다**(팀 차트는 팀 색만).

---

### 3.13 Section Header

- 32px 아이콘 박스(raised 배경 + default 보더, radius 8, 아이콘 16px secondary) + 제목(heading) + 설명(caption) + 우측 "전체 보기"(ghost).
- 카드 안 상단에 쓸 때는 아래로 16px, 페이지 섹션 머리로 쓸 때는 아래로 12px 후 그리드.
- 설명은 한 줄. 넘치면 말줄임.

```html
<div class="section-header">
  <span class="icon-box"><svg class="icon" width="16" height="16">…</svg></span>
  <div class="section-title">
    <h2 class="heading">최근 내전</h2>
    <p class="caption">이 그룹에서 끝난 내전 10개</p>
  </div>
  <a class="btn btn-ghost btn-sm" href="/matches">전체 보기</a>
</div>
```

```css
.section-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); }
.icon-box {
  display: grid; place-items: center; flex-shrink: 0;
  width: var(--icon-box); height: var(--icon-box);
  background: var(--bg-surface-raised); border: var(--border-control); border-radius: var(--radius-control);
  color: var(--text-secondary);
}
.section-title { flex: 1; min-width: 0; }
.section-title .caption { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.icon { stroke: currentColor; stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
```

---

### 3.14 보조 규칙 (Modal · Empty · Loading)

- **Modal:** `--bg-overlay` 딤 + surface 패널, `--border-default` 1px, radius 12, 최대 폭 480px, padding 24. 그림자 없음. 하단 액션은 우측 정렬 `[ghost 취소] [primary 확인]`.
- **Empty state:** 카드 안 중앙, 32px 아이콘 박스 + heading + label 한 줄 + (필요하면) secondary 버튼 1개. 일러스트 없음.
- **Loading:** 스켈레톤 = raised 배경 블록, radius는 대상과 동일. shimmer 애니메이션 대신 opacity .6↔1 펄스(1.4s), reduced-motion이면 정지.
- **Null 데이터:** 미연동·미동기화는 `—` + caption 안내("라이엇 계정을 연동하면 표시돼요"). 0이나 가짜 값으로 채우지 않는다.
- **서버가 채운 기본값:** 팀 구성처럼 계산에 필요해서 서버가 기본 MMR(예: 1,500)을 넣어 보내는 경우, 합계와 맞춰 볼 수 있게 숫자는 남기되 `--text-muted` + 일반 굵기로 낮추고 `title`/caption으로 "기본값"임을 밝힌다.

---

## 4. Do / Don't 체크리스트

### Color
- [ ] **Do** 색은 팀 · 티어 · 승패/증감에만 쓴다. 그 외 강조는 밝기(primary ↔ secondary ↔ muted)와 굵기로.
- [ ] **Do** 승패·증감은 색 + 텍스트/기호(승/패, ↑/↓, +/−)를 같이 쓴다.
- [ ] **Do** 공식 티어(PLATINUM III)는 무채색, 그룹 티어(1~5)만 티어 색.
- [ ] **Don't** active nav, 링크, 포커스, 선택 상태에 파랑을 쓰지 않는다 (팀 블루와 헷갈림).
- [ ] **Don't** 한 행에서 레드팀 색과 패배 색을 둘 다 배경으로 칠하지 않는다.
- [ ] **Don't** 아바타·그룹마다 랜덤 컬러를 주지 않는다.

### Surface & Shape
- [ ] **Do** 모든 카드는 surface + 1px `--border-subtle`, radius 12.
- [ ] **Do** 카드 안의 하위 영역은 raised 행으로, 한 단계만 밝게.
- [ ] **Don't** 카드 안에 카드를 넣지 않는다.
- [ ] **Don't** 그라데이션, 네온 글로우, 금속/빛 효과, drop shadow를 쓰지 않는다. (예외: 로고 언더바 하드 스플릿, 포커스 링)
- [ ] **Don't** radius 20px 이상을 쓰지 않는다 (아바타·진행 바의 full 제외).

### Typography & Numbers
- [ ] **Do** 모든 숫자(MMR, 승률, 판수, 순위)에 `tabular-nums`, 테이블 숫자 컬럼은 우측 정렬.
- [ ] **Do** 페이지당 hero-number는 최대 2개(블루 vs 레드), display 제목은 1개.
- [ ] **Do** 두 팀을 나란히 보여줄 때는 항상 블루 → 레드 순서(블루가 왼쪽·앞).
- [ ] **Do** 천 단위 구분 쉼표(1,842), 퍼센트는 정수 또는 소수 1자리로 화면 안에서 통일.
- [ ] **Don't** 이모지를 쓰지 않는다.

### Action
- [ ] **Do** 화면마다 primary(흰 버튼)가 뭔지 먼저 정하고, 나머지는 secondary.
- [ ] **Do** primary는 액션 그룹의 가장 오른쪽.
- [ ] **Don't** 흰 솔리드 버튼을 한 화면에 2개 이상 두지 않는다. 사이드바에는 0개.
- [ ] **Don't** danger에 솔리드 빨강 배경을 쓰지 않는다.
- [ ] **Don't** 세그먼트 선택 상태를 흰 배경으로 하지 않는다.

### Layout
- [ ] **Do** 넓은 화면은 12컬럼 그리드로 KPI → 차트 → 리스트 순으로 채운다.
- [ ] **Do** 카드 간 12px, 섹션 간 40px, 카드 padding 20px을 지킨다.
- [ ] **Do** 모바일(≤720px)은 사이드바 → 상단 바 + 드로어, 1컬럼.
- [ ] **Don't** 배경(app) 위에 카드 없이 데이터를 바로 올리지 않는다. 페이지 헤더만 예외.

### Asset
- [ ] **Don't** 롤 공식 에셋, 챔피언 일러스트, 라이엇 로고, 공식 라인 아이콘을 쓰지 않는다. 아이콘은 1.5px stroke 추상 도형.

---

## 5. 열어둔 결정 (리뷰 필요)

1. ~~**폰트 크기 축소 폭.**~~ **결정 (2026-09-27):** body를 15px로 올림(`--type-body`, `--type-body-strong`). label 13px, caption 12px은 유지. 기존 `theme.ts`의 body 19px보다는 여전히 작으므로 전환 후 가독성 피드백을 다시 본다.
2. ~~**`--text-muted` 대비.**~~ **결정 (2026-09-27):** `#6A6F7B` → `#7D828E`. 대비는 sidebar 4.9:1, surface 4.7:1로 AA 통과, surface-raised 위에서는 4.4:1로 살짝 미달이다. **raised 위에서 muted는 텍스트 자체로 의미가 전달되는 곳(패 칩의 "패")에만 쓰고, 읽어야 하는 정보는 secondary로 올린다.** `--tier-5`는 `#6A6F7B` 그대로 두었다(티어 색은 배지 배경과 함께 읽히는 값이라 별도 결정).
3. **레드팀 = 패배 색.** 두 토큰이 같은 hex다. 규칙(텍스트 배지로 승패 표기)으로 막았지만, 분리하려면 `--status-lose`를 `#E5484D` 등으로 살짝 옮기는 방법이 있다.
