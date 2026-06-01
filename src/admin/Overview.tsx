// Admin overview — stats + recent news + pending members.
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { useStore } from "../lib/store";
import { fmtDate } from "../lib/data";

const CAT_DOT: Record<string, { bg: string; c: string }> = {
  "會員招募": { bg: "var(--mint-100)", c: "#5A8A74" },
  "協會公告": { bg: "var(--sky-100)", c: "#3E7E8C" },
  "活動預告": { bg: "var(--peach-100)", c: "#C0764A" },
  "活動花絮": { bg: "var(--butter-100)", c: "#A9803B" },
};
function catDot(cat: string) {
  return CAT_DOT[cat] ?? { bg: "var(--teal-100)", c: "#3E7E8C" };
}

export default function Overview() {
  const { news, members } = useStore();
  const nav = useNavigate();
  const published = news.filter((n) => n.published).length;
  const paid = members.filter((m) => m.status === "已繳費").length;
  const stats = [
    { ic: "megaphone", bg: "var(--mint-100)", c: "#5A8A74", num: news.length, lbl: "消息總數" },
    { ic: "eye", bg: "var(--sky-100)", c: "#3E7E8C", num: published, lbl: "已發布消息" },
    { ic: "users-round", bg: "var(--peach-100)", c: "#C0764A", num: members.length, lbl: "會員人數" },
    { ic: "badge-check", bg: "var(--butter-100)", c: "#A9803B", num: paid, lbl: "已繳費會員" },
  ];
  const recent = news.slice(0, 4);
  const pending = members.filter((m) => m.status === "審查中");

  return (
    <>
      <div className="stats">
        {stats.map((x, i) => (
          <div className="stat" key={i}>
            <div className="ic" style={{ background: x.bg }}>
              <Icon name={x.ic} style={{ color: x.c }} />
            </div>
            <div className="num">{x.num}</div>
            <div className="lbl">{x.lbl}</div>
          </div>
        ))}
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22, alignItems: "start" }}
        className="ov-grid"
      >
        <div className="panel">
          <div className="panel-head">
            <h3>近期消息</h3>
            <div className="spacer"></div>
            <button className="btn btn-secondary btn-sm" onClick={() => nav("/admin/news")}>
              <Icon name="arrow-right" />
              前往管理
            </button>
          </div>
          <div className="panel-pad" style={{ paddingTop: 8, paddingBottom: 8 }}>
            <div className="recent">
              {recent.map((n) => {
                const d = catDot(n.category);
                return (
                  <div className="r" key={n.id}>
                    <div className="dot" style={{ background: d.bg }}>
                      <Icon name={n.icon} style={{ color: d.c }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="t"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {n.title}
                      </div>
                      <div className="d">
                        {fmtDate(n.date)}・{n.category}
                      </div>
                    </div>
                    <span className={"pill " + (n.published ? "pill-on" : "pill-off")}>
                      {n.published ? "已發布" : "草稿"}
                    </span>
                  </div>
                );
              })}
              {recent.length === 0 && (
                <p style={{ color: "var(--ink-muted)", padding: "16px 0" }}>還沒有消息。</p>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="panel panel-pad">
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--ink-head)", margin: "0 0 4px" }}>
              快速操作
            </h3>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: "0 0 16px" }}>
              常用的內容維護入口。
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className="btn btn-primary"
                style={{ justifyContent: "flex-start" }}
                onClick={() => {
                  nav("/admin/news");
                  setTimeout(
                    () => window.dispatchEvent(new CustomEvent("wd-news-add")),
                    100
                  );
                }}
              >
                <Icon name="plus" />
                發布新消息
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start" }}
                onClick={() => nav("/admin/pages")}
              >
                <Icon name="file-pen" />
                編輯頁面內容
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start" }}
                onClick={() => nav("/admin/members")}
              >
                <Icon name="users-round" />
                查看會員名單
              </button>
            </div>
          </div>

          <div className="panel panel-pad">
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--ink-head)", margin: "0 0 4px" }}>
              待審查會員
            </h3>
            {pending.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: "8px 0 0" }}>
                目前沒有待審查的申請。
              </p>
            ) : (
              <div className="recent" style={{ marginTop: 4 }}>
                {pending.map((m) => (
                  <div className="r" key={m.id}>
                    <div className="dot" style={{ background: "var(--butter-100)" }}>
                      <Icon name="user-round" style={{ color: "#A9803B" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="t">{m.name}</div>
                      <div className="d">
                        {m.type}・{fmtDate(m.date)}
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => nav("/admin/members")}
                    >
                      處理
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
