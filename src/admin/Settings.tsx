// 設定 — 關於後台 + 資料管理。
import { Icon } from "../components/Icon";
import { signOut } from "./auth";
import { useNavigate } from "react-router-dom";
import { HAS_SUPABASE } from "../lib/supabase";
import { VERSION } from "../version";

export default function Settings({ toast }: { toast: (m: string) => void }) {
  const nav = useNavigate();
  const out = async () => {
    await signOut();
    toast("已登出後台");
    nav("/admin");
    setTimeout(() => window.location.reload(), 300);
  };
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, alignItems: "start" }}
      className="ov-grid"
    >
      <div className="panel panel-pad">
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--ink-head)", margin: "0 0 4px" }}>
          關於此後台
        </h3>
        <p style={{ fontSize: 14.5, color: "var(--ink-muted)", lineHeight: 1.7, margin: "0 0 16px" }}>
          這是社團法人台灣白露社會福利服務協會官方網站的內容管理系統。
          {HAS_SUPABASE
            ? "所有變更會即時寫入資料庫，並同步更新所有觀看官網的使用者。"
            : "目前為展示模式，所有變更只會留在這個瀏覽器分頁。"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start" }}
            href="/index.html"
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="external-link" />
            在新分頁開啟官網
          </a>
        </div>
      </div>
      <div className="panel panel-pad">
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--ink-head)", margin: "0 0 4px" }}>
          資料與帳號
        </h3>
        <p style={{ fontSize: 14.5, color: "var(--ink-muted)", lineHeight: 1.7, margin: "0 0 16px" }}>
          帳號管理請至 Supabase Dashboard 操作；如需增加管理員，請另設新使用者並於該專案啟用 email 登入。
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn btn-ghost" style={{ justifyContent: "flex-start" }} onClick={out}>
            <Icon name="log-out" />
            登出後台
          </button>
        </div>
      </div>
      <div className="panel panel-pad" style={{ gridColumn: "1 / -1" }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--ink-head)", margin: "0 0 4px" }}>
          版本資訊
        </h3>
        <p style={{ fontSize: 13.5, color: "var(--ink-muted)", margin: 0, fontFamily: "Nunito, monospace" }}>
          branch <strong>{VERSION.branch}</strong> · commit <strong>{VERSION.commit}</strong> · built{" "}
          {VERSION.builtAt}
        </p>
      </div>
    </div>
  );
}
