// Static structural data — six service pillars, home entries, membership tiers, news category colours.
// These are *structure* not content (icons, layout, colour mapping); editable content lives in the store.

export interface Pillar {
  num: string;
  icon: string;
  bg: string;
  color: string;
  title: string;
  desc: string;
}

export interface Entry {
  to: string;
  icon: string;
  bg: string;
  color: string;
  label: string;
}

export interface Tier {
  name: string;
  sub: string;
  join: string;
  year: string;
  feat: boolean;
  perks: string[];
}

export const PILLARS: Pillar[] = [
  {
    num: "01",
    icon: "graduation-cap",
    bg: "var(--sky-100)",
    color: "#4E8FA0",
    title: "專業精進與訓練",
    desc: "舉辦工作坊、研討會，與業界專家交流合作，提供最優質的社工專業知識。",
  },
  {
    num: "02",
    icon: "hand-heart",
    bg: "var(--mint-100)",
    color: "#5A8A74",
    title: "自我照顧與量能",
    desc: "透過專業心理輔導、瑜珈冥想，鼓勵成員關愛自己，學會有效地照顧自己。",
  },
  {
    num: "03",
    icon: "users-round",
    bg: "var(--teal-100)",
    color: "#3E7E8C",
    title: "團隊協作與溝通",
    desc: "透過團隊建設活動、沙盤遊戲，強化成員間的相互信任與有效溝通。",
  },
  {
    num: "04",
    icon: "wind",
    bg: "var(--peach-100)",
    color: "#C0764A",
    title: "放鬆與壓力釋放",
    desc: "組織集體旅行、戶外活動，讓每位成員在忙碌之餘也能感受生活的美好。",
  },
  {
    num: "05",
    icon: "heart-handshake",
    bg: "var(--butter-100)",
    color: "#A9803B",
    title: "服務社區，回饋社會",
    desc: "積極參與社區服務活動，為弱勢群體提供支援與關懷，讓愛心傳遞到每個角落。",
  },
  {
    num: "06",
    icon: "folder-heart",
    bg: "var(--mint-100)",
    color: "#5A8A74",
    title: "服務個案",
    desc: "社會工作者的使命是回饋社會，本會願意承接任何有助於個人之方案或計畫。",
  },
];

export const ENTRIES: Entry[] = [
  { to: "/about",    icon: "info",            bg: "var(--mint-100)",  color: "#5A8A74", label: "了解協會" },
  { to: "/services", icon: "hand-heart",      bg: "var(--sky-100)",   color: "#4E8FA0", label: "尋求協助" },
  { to: "/news",     icon: "calendar-heart",  bg: "var(--peach-100)", color: "#C0764A", label: "報名活動" },
  { to: "/services", icon: "folder-heart",    bg: "var(--butter-100)",color: "#A9803B", label: "查看資源" },
  { to: "/contact",  icon: "message-circle",  bg: "var(--teal-100)",  color: "#3E7E8C", label: "聯繫中心" },
];

export const TIERS: Tier[] = [
  {
    name: "個人會員",
    sub: "熱愛我們理念的朋友，填表通過審查即可成為一份子。",
    join: "500",
    year: "500",
    feat: false,
    perks: ["參與協會所有活動", "專業課程與工作坊", "社群交流與支持網絡"],
  },
  {
    name: "團體會員",
    sub: "歡迎各機構團體加入，選派一位代表參與活動。",
    join: "500",
    year: "500",
    feat: true,
    perks: ["機構代表參與資格", "團體培訓與合作機會", "資源共享與轉介", "優先合辦活動"],
  },
  {
    name: "贊助會員",
    sub: "認同理念、願意提供資源協助的個人或團體。",
    join: "—",
    year: "隨喜",
    feat: false,
    perks: ["支持協會長期營運", "贊助徵信與感謝", "受邀參與重要活動"],
  },
];

/* news category → colour mapping (kept here, not editable from admin) */
export const NEWS_STYLE: Record<string, { bg: string; c: string }> = {
  "會員招募": { bg: "var(--mint-100)",   c: "#7FB59C" },
  "協會公告": { bg: "var(--sky-100)",    c: "#8FC2D1" },
  "活動預告": { bg: "var(--peach-100)",  c: "#E0A878" },
  "活動花絮": { bg: "var(--butter-100)", c: "#D9B96A" },
};
export function newsStyle(cat: string) {
  return NEWS_STYLE[cat] ?? { bg: "var(--teal-100)", c: "#7FB1BE" };
}

export function fmtDate(d: string | undefined): string {
  return (d ?? "").replaceAll("-", ".");
}
