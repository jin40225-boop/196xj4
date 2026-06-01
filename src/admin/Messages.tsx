// 聯絡訊息檢視（從 Supabase contact_messages 讀取）。
// 離線模式時直接顯示提示，因為沒有資料來源。
import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { supabase, HAS_SUPABASE } from "../lib/supabase";
import { fmtDate } from "../lib/data";
import type { ContactMessage } from "../lib/types";

export default function Messages({ toast }: { toast: (m: string) => void }) {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let alive = true;
    const load = async () => {
      const { data, error } = await supabase!
        .from("contact_messages")
        .select("id,name,email,topic,message,created_at,handled")
        .order("created_at", { ascending: false });
      if (!alive) return;
      if (error) toast("讀取失敗：" + error.message);
      else setItems((data as ContactMessage[]) ?? []);
      setLoading(false);
    };
    load();
    const ch = supabase!
      .channel("wd-msgs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        load
      )
      .subscribe();
    return () => {
      alive = false;
      supabase!.removeChannel(ch);
    };
  }, [toast]);

  const toggleHandled = async (m: ContactMessage) => {
    if (!supabase || !m.id) return;
    const next = !m.handled;
    const { error } = await supabase
      .from("contact_messages")
      .update({ handled: next })
      .eq("id", m.id);
    if (error) toast("更新失敗：" + error.message);
    else toast(next ? "已標記為處理完畢" : "已改為未處理");
  };

  if (!HAS_SUPABASE) {
    return (
      <div className="panel panel-pad">
        <p style={{ color: "var(--ink-muted)" }}>
          聯絡訊息需要連線資料庫才能讀取。請依 <code>README.md</code> 完成 Supabase 設定。
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <table className="tbl">
        <thead>
          <tr>
            <th>姓名</th>
            <th>主題</th>
            <th>聯絡方式</th>
            <th>送出時間</th>
            <th>狀態</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 30, color: "var(--ink-muted)" }}>
                載入中…
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 30, color: "var(--ink-muted)" }}>
                還沒有任何訊息。
              </td>
            </tr>
          ) : (
            items.map((m) => (
              <tr key={m.id} className="rowhover">
                <td>
                  <div className="t-title">{m.name}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4, whiteSpace: "pre-wrap" }}>
                    {m.message}
                  </div>
                </td>
                <td style={{ color: "var(--ink-muted)" }}>{m.topic}</td>
                <td style={{ color: "var(--ink-muted)" }}>
                  <a href={"mailto:" + m.email}>{m.email}</a>
                </td>
                <td style={{ fontFamily: "Nunito", color: "var(--ink-muted)" }}>
                  {fmtDate((m.created_at ?? "").slice(0, 10))}
                </td>
                <td>
                  <button
                    className={"pill " + (m.handled ? "pill-on" : "pill-pending")}
                    style={{ border: "none", cursor: "pointer" }}
                    onClick={() => toggleHandled(m)}
                  >
                    <Icon name={m.handled ? "check" : "clock"} size={13} />
                    {m.handled ? "已處理" : "未處理"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
