import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useMe } from '../../features/auth/hooks';
import { useGroupMembers, useGroups } from '../../features/groups/hooks';
import { setActiveGroupId, useActiveGroupId } from '../../utils/activeGroup';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { Avatar } from '../Avatar/Avatar';
import { Icon, type IconName } from '../Icon/Icon';
import { Wordmark } from '../Wordmark/Wordmark';

// docs/design-system.md → Sidebar: logo → group switcher → nav → (spacer) →
// 그룹원 → 디스코드 상태. No primary button lives here.
const MEMBER_LIMIT = 8;

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md}px;
  height: 100%;
  padding: ${({ theme }) => theme.space.md}px ${({ theme }) => theme.space.sm}px;
  background: ${({ theme }) => theme.color.sidebar};
  border-right: 1px solid ${({ theme }) => theme.color.border.base};
  overflow-y: auto;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 4px;
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProfileLink = styled(Link)`
  display: flex;
  border-radius: var(--radius-full);
`;

const CloseButton = styled.button`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  margin-right: -8px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.control}px;
  background: transparent;
  color: ${({ theme }) => theme.color.text.secondary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.color.surface.hover};
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const SwitcherWrap = styled.div`
  position: relative;
`;

const Switcher = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: 44px;
  padding: 0 ${({ theme }) => theme.space.sm}px;
  background: ${({ theme }) => theme.color.surface.subtle};
  border: 1px solid ${({ theme }) => theme.color.border.strong};
  border-radius: ${({ theme }) => theme.radius.control}px;
  color: ${({ theme }) => theme.color.text.primary};
  text-align: left;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);

  &:hover {
    background: ${({ theme }) => theme.color.surface.hover};
  }
`;

const SwitcherText = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const GroupName = styled.span`
  font: ${({ theme }) => theme.type.bodyStrong};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Caption = styled.span`
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  background: ${({ theme }) => theme.color.surface.card};
  border: 1px solid ${({ theme }) => theme.color.border.strong};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const PopoverItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};

  &:hover {
    background: ${({ theme }) => theme.color.surface.hover};
    color: ${({ theme }) => theme.color.text.primary};
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const PopoverDivider = styled.hr`
  margin: 2px 4px;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NavItem = styled(Link)<{ $active?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--sidebar-item-height);
  padding: 0 8px;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.color.border.strong : 'transparent')};
  border-radius: ${({ theme }) => theme.radius.control}px;
  background: ${({ theme, $active }) => ($active ? theme.color.surface.subtle : 'transparent')};
  font: ${({ theme, $active }) => ($active ? theme.type.labelStrong : theme.type.label)};
  color: ${({ theme, $active }) => ($active ? theme.color.text.primary : theme.color.text.secondary)};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);

  &:hover {
    background: ${({ theme, $active }) => ($active ? theme.color.surface.subtle : theme.color.surface.hover)};
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const Spacer = styled.div`
  flex: 1;
  min-height: ${({ theme }) => theme.space.md}px;
`;

const SectionLabel = styled.h3`
  padding: 0 8px 4px;
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.muted};
`;

// 펼치면 전체 그룹원을 그리되 높이는 접힌 목록(MEMBER_LIMIT행)과 같게 두고 안에서
// 스크롤 — 인원이 많은 그룹에서 사이드바 아래 디스코드 카드가 밀려나지 않게.
const MemberList = styled.ul<{ $scroll: boolean }>`
  list-style: none;
  ${({ $scroll }) =>
    $scroll &&
    `
    max-height: calc(var(--sidebar-item-height) * ${MEMBER_LIMIT});
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--border-default) transparent;
    /* 스크롤바가 MMR 숫자를 덮지 않게 */
    padding-right: 6px;
  `}
`;

const MemberRow = styled(Link)`
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  height: var(--sidebar-item-height);
  padding: 0 8px;
  border-radius: ${({ theme }) => theme.radius.control}px;

  &:hover {
    background: ${({ theme }) => theme.color.surface.hover};
  }
`;

const MemberName = styled.span`
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MemberMmr = styled.span`
  font: ${({ theme }) => theme.type.caption};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.muted};
`;

const MoreButton = styled.button`
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  font: ${({ theme }) => theme.type.caption};
  color: ${({ theme }) => theme.color.text.secondary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.color.text.primary};
  }
`;

const DiscordCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: ${({ theme }) => theme.space.sm}px;
  background: ${({ theme }) => theme.color.surface.card};
  border: 1px solid ${({ theme }) => theme.color.border.base};
  border-radius: ${({ theme }) => theme.radius.control}px;
`;

const DiscordStatus = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Dot = styled.span<{ $on: boolean }>`
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  background: ${({ theme, $on }) => ($on ? theme.color.state.success : theme.color.text.muted)};
`;

const SmallLinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  height: var(--control-height-sm);
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.color.border.strong};
  border-radius: ${({ theme }) => theme.radius.control}px;
  background: ${({ theme }) => theme.color.surface.subtle};
  font: ${({ theme }) => theme.type.captionStrong};
  color: ${({ theme }) => theme.color.text.primary};

  &:hover {
    background: ${({ theme }) => theme.color.surface.hover};
  }
`;

function GroupSwitcher({ activeGroupId, groupName, memberCount }: {
  activeGroupId: string | null;
  groupName?: string;
  memberCount?: number;
}) {
  const { data: groups } = useGroups();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <SwitcherWrap ref={wrapRef}>
      <Switcher type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <SwitcherText>
          <GroupName>{groupName ?? '그룹 선택'}</GroupName>
          <Caption>{memberCount !== undefined ? `멤버 ${memberCount}명` : '내전할 그룹을 골라요'}</Caption>
        </SwitcherText>
        <Icon name="chevronDown" />
      </Switcher>
      {open && (
        <Popover role="menu">
          {(groups ?? []).map((g) => (
            <PopoverItem
              key={g.id}
              role="menuitem"
              to={`/groups/${g.id}/matches`}
              $active={String(g.id) === activeGroupId}
              onClick={() => setActiveGroupId(String(g.id))}
            >
              <span>{g.name}</span>
              {String(g.id) === activeGroupId && <Icon name="check" />}
            </PopoverItem>
          ))}
          {(groups?.length ?? 0) > 0 && <PopoverDivider />}
          <PopoverItem role="menuitem" to="/groups">
            <span>모든 그룹 · 새 그룹</span>
            <Icon name="chevronRight" />
          </PopoverItem>
        </Popover>
      )}
    </SwitcherWrap>
  );
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { pathname } = useLocation();
  const { data: me } = useMe();
  const activeGroupId = useActiveGroupId();
  const groupId = activeGroupId ? Number(activeGroupId) : NaN;
  const { group, members } = useGroupMembers(groupId);

  const hasGroup = Boolean(activeGroupId);
  const base = hasGroup ? `/groups/${activeGroupId}` : '/groups';

  const navItems: { key: string; label: string; icon: IconName; to: string; active: boolean; needsGroup?: boolean }[] = [
    {
      key: 'matches',
      label: '내전',
      icon: 'matches',
      to: hasGroup ? `${base}/matches` : '/groups',
      active: pathname.includes('/matches'),
      needsGroup: true,
    },
    {
      key: 'tiers',
      label: '티어표',
      icon: 'tiers',
      to: hasGroup ? `${base}/tiers` : '/groups',
      active: pathname.includes('/tiers'),
      needsGroup: true,
    },
    { key: 'stats', label: '내 전적', icon: 'stats', to: '/stats', active: pathname === '/stats' },
    {
      key: 'manage',
      label: '그룹 설정',
      icon: 'settings',
      to: hasGroup ? `${base}/manage` : '/groups',
      active: pathname.endsWith('/manage'),
      needsGroup: true,
    },
  ];

  // MMR 높은 순, 계정 미연동(null)은 뒤로.
  const sorted = [...members].sort((a, b) => (b.mmr ?? -Infinity) - (a.mmr ?? -Infinity));
  const [membersExpanded, setMembersExpanded] = useState(false);
  const memberListId = useId();
  useEffect(() => setMembersExpanded(false), [activeGroupId]);
  const visible = membersExpanded ? sorted : sorted.slice(0, MEMBER_LIMIT);
  const hidden = sorted.length - Math.min(sorted.length, MEMBER_LIMIT);
  const discordOn = Boolean(group?.discordGuildId || group?.discordWebhookUrl);

  return (
    <Aside aria-label="사이드바">
      <Top>
        <Link to="/groups" aria-label="DS_LOL 홈">
          <Wordmark size={18} />
        </Link>
        <TopActions>
          <ProfileLink to="/onboarding" title="내 프로필" aria-label="내 프로필 설정">
            <Avatar name={me?.nickname ?? '?'} imageUrl={resolveAssetUrl(me?.profileImageUrl)} size={24} />
          </ProfileLink>
          {onClose && (
            <CloseButton type="button" aria-label="메뉴 닫기" onClick={onClose}>
              <Icon name="close" size={18} />
            </CloseButton>
          )}
        </TopActions>
      </Top>

      <GroupSwitcher
        activeGroupId={activeGroupId}
        groupName={group?.name}
        memberCount={group ? group.members.length : undefined}
      />

      <Nav aria-label="주요 메뉴">
        {navItems.map((item) => (
          <NavItem
            key={item.key}
            to={item.to}
            $active={item.active}
            $disabled={item.needsGroup && !hasGroup}
            aria-current={item.active ? 'page' : undefined}
          >
            <Icon name={item.icon} />
            {item.label}
          </NavItem>
        ))}
      </Nav>

      <Spacer />

      {group && members.length > 0 && (
        <section aria-label="그룹원">
          <SectionLabel>그룹원 · {members.length}</SectionLabel>
          <MemberList id={memberListId} $scroll={membersExpanded}>
            {visible.map((m) => (
              <li key={m.userId}>
                <MemberRow to={`/users/${m.userId}`}>
                  <Avatar name={m.nickname} imageUrl={resolveAssetUrl(m.profileImageUrl)} size={20} />
                  <MemberName>{m.nickname}</MemberName>
                  <MemberMmr>{m.mmr !== null ? m.mmr.toLocaleString() : '—'}</MemberMmr>
                </MemberRow>
              </li>
            ))}
          </MemberList>
          {hidden > 0 && (
            <MoreButton
              type="button"
              aria-expanded={membersExpanded}
              aria-controls={memberListId}
              onClick={() => setMembersExpanded((v) => !v)}
            >
              {membersExpanded ? '접기' : `+${hidden}명 더 보기`}
            </MoreButton>
          )}
        </section>
      )}

      {group && (
        <DiscordCard>
          <DiscordStatus>
            <Dot $on={discordOn} />
            {discordOn ? '디스코드 연결됨' : '디스코드 미연결'}
          </DiscordStatus>
          {!discordOn && <SmallLinkButton to={`${base}/manage`}>봇 초대하기</SmallLinkButton>}
        </DiscordCard>
      )}
    </Aside>
  );
}
