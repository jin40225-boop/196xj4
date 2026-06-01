// 會員管理 — 篩選 + 列表 + 切換繳費/審查狀態 + 移除。
import { useState } from "react";
import { Icon } from "../components/Icon";
import { useStore, WDStore } from "../lib/store";
import { fmtDate } from "../lib/data";
import type { Member } from "../lib/types";

const MTYPES = ["個人會員", "團體會員", "贊助會員"];

export default function Members({ toast }: { toast: (m: string) => void }) {
  const { members } = useStore();
  const [filter, setFilter] = useState("全部");
  const list = filter === "全部" ? members : members.filter((m) => m.type === filter);

  const toggleStatus = async (m: Member) => {
    const next = m.status === "已繳費" ? "審查中" : "已繳費";
    try {
      await WDStore.updateMember(m.id, { status: next });
      toast(next === "已繳費" ? "已標記為已繳費" : "已改為審查中");
    } catch (e) {
      toast("更新失敗：" + (e as Error).message);
    }
  };

  const removeMember = async (m: Member) => {
    if (!confirm("確定要移除這位會員嗎？")) return;
    try {
      await WDStore.deleteMember(m.id);
      toast("已移除會員");
    } catch (e) {
      toast("刪除失敗：" + (e as Error).message);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["全部", ...MTYPES].map((t) => (
          <button
            key={t}
            className={"btn btn-sm " + (filter === t ? "btn-primary" : "btn-secondary")}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="panel">
        <table className="tbl">
          <thead>
            <tr>
              <th>姓名 / 名稱</th>
              <th>會員類別</th>
              <th>申請日期</th>
              <th>狀態</th>
              <th style={{ textAlign: "right" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr className="rowhover" key={m.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      className="avatar"
                      style={{ width: 34, height: 34, fontSize: 14, flex: "none" }}
                    >
                      {m.name.slice(0, 1)}
                    </span>
                    <div>
                      <div className="t-title">{m.name}</div>
                      {m.email && (
                        <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{m.email}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--ink-muted)" }}>{m.type}</td>
                <td style={{ fontFamily: "Nunito", color: "var(--ink-muted)" }}>{fmtDate(m.date)}</td>
                <td>
                  <button
                    className={"pill " + (m.status === "已繳費" ? "pill-paid" : "pill-pending")}
                    style={{ border: "none", cursor: "pointer" }}
                    onClick={() => toggleStatus(m)}
                    title="點擊切換狀態"
                  >
                    <Icon name={m.status === "已繳費" ? "check" : "clock"} size={13} />
                    {m.status}
                  </button>
                </td>
                <td>
                  <div className="actions">
                    <button className="iconbtn del" title="刪除" onClick={() => removeMember(m)}>
                      <Icon name="trash-2" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", color: "var(--ink-muted)", padding: "30px 0" }}
                >
                  沒有符合的會員。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
