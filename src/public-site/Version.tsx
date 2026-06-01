// Dev/ops page: shows folder/branch/commit/built-at so users can verify
// "is this the right version?" without asking. Satisfies the global
// Preview Version Alignment rule.
import { VERSION } from "../version";
import { HAS_SUPABASE } from "../lib/supabase";

export default function VersionPage() {
  return (
    <main style={{ padding: "80px 28px", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ color: "var(--ink-head)" }}>網站版本資訊</h1>
      <p style={{ color: "var(--ink-muted)" }}>
        這頁讓你（與 Claude）一眼確認目前線上跑的是哪一版。
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
        <tbody>
          <Row k="branch" v={VERSION.branch} />
          <Row k="commit" v={VERSION.commit} />
          <Row k="built at" v={VERSION.builtAt} />
          <Row k="origin" v={window.location.origin} />
          <Row k="supabase 連線" v={HAS_SUPABASE ? "已連線" : "OFFLINE（使用預設內容）"} />
          <Row k="user agent" v={navigator.userAgent} />
        </tbody>
      </table>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <td
        style={{
          padding: "12px 14px",
          fontWeight: 700,
          color: "var(--ink-head)",
          borderBottom: "1px solid var(--line)",
          width: 160,
          fontFamily: "Nunito, monospace",
        }}
      >
        {k}
      </td>
      <td
        style={{
          padding: "12px 14px",
          color: "var(--ink)",
          borderBottom: "1px solid var(--line)",
          fontFamily: "Nunito, monospace",
          wordBreak: "break-all",
        }}
      >
        {v}
      </td>
    </tr>
  );
}
