// News CRUD — table + right-side drawer editor.
import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { useStore, WDStore } from "../lib/store";
import { fmtDate } from "../lib/data";
import { Toggle } from "./Toast";
import type { NewsItem } from "../lib/types";

const NEWS_CATS = ["會員招募", "協會公告", "活動預告", "活動花絮"];
const NEWS_ICONS = [
  { v: "megaphone", l: "喇叭・公告" },
  { v: "users-round", l: "人群・招募" },
  { v: "sprout", l: "萌芽・成立" },
  { v: "wind", l: "微風・放鬆" },
  { v: "calendar-heart", l: "行事曆・活動" },
  { v: "heart-handshake", l: "牽手・服務" },
  { v: "sparkles", l: "閃耀・花絮" },
];

const CAT_DOT: Record<string, { bg: string; c: string }> = {
  "會員招募": { bg: "var(--mint-100)", c: "#5A8A74" },
  "協會公告": { bg: "var(--sky-100)", c: "#3E7E8C" },
  "活動預告": { bg: "var(--peach-100)", c: "#C0764A" },
  "活動花絮": { bg: "var(--butter-100)", c: "#A9803B" },
};
function catDot(cat: string) {
  return CAT_DOT[cat] ?? { bg: "var(--teal-100)", c: "#3E7E8C" };
}

function emptyNews(): NewsItem {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: "",
    title: "",
    category: "協會公告",
    icon: "megaphone",
    date: today,
    excerpt: "",
    body: "",
    published: true,
  };
}

function NewsDrawer({
  item,
  onClose,
  toast,
}: {
  item: NewsItem;
  onClose: () => void;
  toast: (m: string) => void;
}) {
  const isNew = !item.id;
  const [f, setF] = useState<NewsItem>({ ...emptyNews(), ...item });
  const set =
    <K extends keyof NewsItem>(k: K) =>
    (e: { target: { value: string } }) =>
      setF({ ...f, [k]: e.target.value as NewsItem[K] });

  const save = async () => {
    if (!f.title.trim()) {
      toast("請填寫消息標題");
      return;
    }
    try {
      if (isNew) {
        const { id: _ignore, ...rest } = f;
        await WDStore.addNews(rest);
        toast("已發布新消息");
      } else {
        const { id, ...patch } = f;
        await WDStore.updateNews(id, patch);
        toast("已更新消息");
      }
      onClose();
    } catch (e) {
      toast("儲存失敗：" + (e as Error).message);
    }
  };
  const remove = async () => {
    if (!confirm("確定要刪除這則消息嗎？")) return;
    try {
      await WDStore.deleteNews(item.id);
      toast("已刪除消息");
      onClose();
    } catch (e) {
      toast("刪除失敗：" + (e as Error).message);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3>{isNew ? "新增消息" : "編輯消息"}</h3>
          <div className="spacer"></div>
          <button className="iconbtn" onClick={onClose} aria-label="關閉">
            <Icon name="x" />
          </button>
        </div>
        <div className="drawer-body">
          <div className="f full">
            <label>標題</label>
            <input value={f.title} onChange={set("title")} placeholder="消息標題" />
          </div>
          <div className="fgrid">
            <div className="f">
              <label>分類</label>
              <select value={f.category} onChange={set("category")}>
                {NEWS_CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="f">
              <label>日期</label>
              <input type="date" value={f.date} onChange={set("date")} />
            </div>
          </div>
          <div className="f full">
            <label>圖示</label>
            <select value={f.icon} onChange={set("icon")}>
              {NEWS_ICONS.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.l}
                </option>
              ))}
            </select>
            <div className="hint">顯示於消息卡片的小圖示，搭配分類色彩。</div>
          </div>
          <div className="f full">
            <label>摘要</label>
            <textarea
              value={f.excerpt}
              onChange={set("excerpt")}
              placeholder="列表上顯示的一兩句重點"
              style={{ minHeight: 70 }}
            />
          </div>
          <div className="f full">
            <label>內文</label>
            <textarea
              value={f.body}
              onChange={set("body")}
              placeholder="點開消息後的完整內容"
              style={{ minHeight: 150 }}
            />
          </div>
          <div className="f full" style={{ marginBottom: 0 }}>
            <Toggle
              on={f.published}
              onChange={(v) => setF({ ...f, published: v })}
              label={f.published ? "已發布於官網" : "儲存為草稿（不公開）"}
            />
          </div>
        </div>
        <div className="drawer-foot">
          {!isNew && (
            <button className="btn btn-danger" onClick={remove}>
              <Icon name="trash-2" />
              刪除
            </button>
          )}
          <div className="spacer" style={{ flex: 1 }}></div>
          <button className="btn btn-ghost" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={save}>
            <Icon name="check" />
            {isNew ? "發布" : "儲存"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewsAdmin({ toast }: { toast: (m: string) => void }) {
  const { news } = useStore();
  const [editing, setEditing] = useState<NewsItem | null>(null);

  useEffect(() => {
    const h = () => setEditing(emptyNews());
    window.addEventListener("wd-news-add", h);
    return () => window.removeEventListener("wd-news-add", h);
  }, []);

  return (
    <>
      <div className="panel">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: "46%" }}>標題</th>
              <th>分類</th>
              <th>日期</th>
              <th>狀態</th>
              <th style={{ textAlign: "right" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {news.map((n) => {
              const d = catDot(n.category);
              return (
                <tr className="rowhover" key={n.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        className="dot"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: d.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flex: "none",
                        }}
                      >
                        <Icon name={n.icon} style={{ color: d.c }} size={17} />
                      </span>
                      <span className="t-title">{n.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className="pill pill-cat" style={{ background: d.bg, color: d.c }}>
                      {n.category}
                    </span>
                  </td>
                  <td style={{ fontFamily: "Nunito", color: "var(--ink-muted)" }}>
                    {fmtDate(n.date)}
                  </td>
                  <td>
                    <span className={"pill " + (n.published ? "pill-on" : "pill-off")}>
                      {n.published ? "已發布" : "草稿"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="iconbtn"
                        title="編輯"
                        onClick={() => setEditing(n)}
                      >
                        <Icon name="pencil" />
                      </button>
                      <button
                        className="iconbtn del"
                        title="刪除"
                        onClick={async () => {
                          if (!confirm("確定要刪除這則消息嗎？")) return;
                          try {
                            await WDStore.deleteNews(n.id);
                            toast("已刪除消息");
                          } catch (e) {
                            toast("刪除失敗：" + (e as Error).message);
                          }
                        }}
                      >
                        <Icon name="trash-2" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {news.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--ink-muted)", padding: 32 }}>
                  目前沒有任何消息，按右上「新增消息」開始發布。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editing && <NewsDrawer item={editing} onClose={() => setEditing(null)} toast={toast} />}
    </>
  );
}
