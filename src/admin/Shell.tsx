// Admin shell — sidebar + topbar; routes nest under <Outlet />.
import { useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Icon } from "../components/Icon";
import { useStore } from "../lib/store";
import { signOut } from "./auth";
import { HAS_SUPABASE } from "../lib/supabase";

const ADMIN_NAV = [
  { to: "/admin", end: true, label: "總覽", icon: "layout-dashboard" },
  { to: "/admin/news", label: "最新消息", icon: "megaphone" },
  { to: "/admin/pages", label: "頁面內容", icon: "file-pen" },
  { to: "/admin/members", label: "會員管理", icon: "users-round" },
  { to: "/admin/messages", label: "聯絡訊息", icon: "mail" },
  { to: "/admin/settings", label: "設定", icon: "settings" },
];

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "總覽", subtitle: "白露協會內容管理一覽。" },
  "/admin/news": { title: "最新消息", subtitle: "發布、編輯與管理官網的消息與招募資訊。" },
  "/admin/pages": { title: "頁面內容", subtitle: "編輯首頁、關於、聯絡等頁面的文字。" },
  "/admin/members": { title: "會員管理", subtitle: "檢視入會申請與會員繳費狀態。" },
  "/admin/messages": { title: "聯絡訊息", subtitle: "讀者透過聯絡表單寄來的訊息。" },
  "/admin/settings": { title: "設定", subtitle: "資料管理與後台設定。" },
};

export function Shell({ onSignOut }: { onSignOut: () => void }) {
  const { news } = useStore();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const meta = TITLES[loc.pathname] ?? TITLES["/admin"];
  const close = () => setOpen(false);

  const out = async () => {
    await signOut();
    onSignOut();
    nav("/admin");
  };

  return (
    <div className="shell">
      <aside className={"side" + (open ? " open" : "")}>
        <div className="side-brand">
          <img src="/assets/logo-transparent.png" alt="社團法人台灣白露社會福利服務協會" />
          <div>
            <div className="zh" style={{ fontSize: 13.5, lineHeight: 1.25 }}>
              社團法人台灣白露社會福利服務協會
            </div>
            <div className="en">Admin</div>
          </div>
        </div>
        <nav className="side-nav">
          {ADMIN_NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={close}
              className={({ isActive }) => "navi" + (isActive ? " active" : "")}
            >
              <Icon name={n.icon} />
              {n.label}
              {n.to === "/admin/news" && <span className="count">{news.length}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <a className="navi" href="/index.html" target="_blank" rel="noreferrer">
            <Icon name="external-link" />
            查看官網
          </a>
          <button className="navi" onClick={out}>
            <Icon name="log-out" />
            登出
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button className="iconbtn side-toggle" onClick={() => setOpen(!open)} aria-label="選單">
            <Icon name="menu" />
          </button>
          <h2>{meta.title}</h2>
          {!HAS_SUPABASE && (
            <span
              style={{
                marginLeft: 12,
                padding: "4px 10px",
                borderRadius: 999,
                background: "var(--butter-100)",
                color: "#8A6520",
                fontSize: 12.5,
                fontWeight: 700,
              }}
              title="未連線資料庫，所有變更僅留在這個瀏覽器分頁"
            >
              展示模式
            </span>
          )}
          <div className="spacer"></div>
          <a className="btn btn-secondary btn-sm" href="/index.html" target="_blank" rel="noreferrer">
            <Icon name="external-link" />
            查看官網
          </a>
          <div className="who">
            <div className="avatar">白</div>
          </div>
        </div>
        <div className="content">
          <div className="page-head">
            <div className="ph-l">
              <h1>{meta.title}</h1>
              {meta.subtitle && <p>{meta.subtitle}</p>}
            </div>
            <div className="spacer"></div>
            <NewsAddButtonIfApplicable />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function NewsAddButtonIfApplicable() {
  const loc = useLocation();
  if (loc.pathname !== "/admin/news") return null;
  return (
    <button
      className="btn btn-primary"
      onClick={() => window.dispatchEvent(new CustomEvent("wd-news-add"))}
    >
      <Icon name="plus" />
      新增消息
    </button>
  );
}

export function PageWrap({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
