// 聯絡我們
import { useState, type FormEvent } from "react";
import { Reveal, Button } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStore, WDStore } from "../lib/store";
import { PageHead } from "./About";

const TOPICS = ["了解服務內容", "加入會員", "活動報名", "資源與合作", "其他"];

export default function Contact() {
  const { site } = useStore();
  const s = site.contact;
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: TOPICS[0],
    message: "",
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await WDStore.submitContact(form);
      setSent(true);
    } catch (e) {
      const err = e as Error;
      setErr(err.message ?? "送出失敗，請稍後再試或來信 " + s.email);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main>
      <PageHead
        kick="Contact us"
        title="聯絡我們"
        sub="無論您想了解服務、尋求協助或加入我們，都歡迎與白露協會聯繫。"
      />
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="container contact-grid">
          <Reveal>
            <div className="cinfo">
              <h2 className="prose-h" style={{ marginTop: 0, marginBottom: 8 }}>
                聯絡資訊
              </h2>
              <div className="row">
                <span className="ic">
                  <Icon name="mail" />
                </span>
                <div>
                  <div className="lbl2">電子信箱</div>
                  <div className="val2">
                    <a href={"mailto:" + s.email}>{s.email}</a>
                  </div>
                </div>
              </div>
              {s.phone && (
                <div className="row">
                  <span className="ic">
                    <Icon name="message-circle" />
                  </span>
                  <div>
                    <div className="lbl2">聯絡電話</div>
                    <div className="val2">{s.phone}</div>
                  </div>
                </div>
              )}
              <div className="row">
                <span className="ic">
                  <Icon name="message-circle" />
                </span>
                <div>
                  <div className="lbl2">LINE 官方帳號</div>
                  <div className="val2">{s.line}</div>
                </div>
              </div>
              {s.address && (
                <div className="row">
                  <span className="ic">
                    <Icon name="map-pin" />
                  </span>
                  <div>
                    <div className="lbl2">會址</div>
                    <div className="val2">{s.address}</div>
                  </div>
                </div>
              )}
              <div className="row">
                <span className="ic">
                  <Icon name="building-2" />
                </span>
                <div>
                  <div className="lbl2">組織性質</div>
                  <div className="val2">{s.org}</div>
                </div>
              </div>
              <div className="row">
                <span className="ic">
                  <Icon name="share-2" />
                </span>
                <div>
                  <div className="lbl2">社群</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    <span className="social-chip">
                      <Icon name="globe" />
                    </span>
                    <span className="social-chip">
                      <Icon name="camera" />
                    </span>
                    <span className="social-chip">
                      <Icon name="at-sign" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <form className="form" onSubmit={submit}>
              {sent ? (
                <div style={{ textAlign: "center", padding: "30px 10px" }}>
                  <div className="success-ic">
                    <Icon name="check" />
                  </div>
                  <h3 style={{ color: "var(--ink-head)", margin: "0 0 8px" }}>已收到您的訊息</h3>
                  <p style={{ color: "var(--ink-muted)", margin: 0 }}>
                    謝謝您與白露聯繫，我們會盡快回覆。
                  </p>
                </div>
              ) : (
                <>
                  <div className="field">
                    <label>
                      姓名 <span className="req">*</span>
                    </label>
                    <input
                      required
                      placeholder="請輸入您的姓名"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>
                      電子信箱 <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>我想詢問</label>
                    <select
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    >
                      {TOPICS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>訊息內容</label>
                    <textarea
                      placeholder="想對白露說的話…"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  {err && (
                    <div
                      role="alert"
                      style={{
                        background: "#FBEEEC",
                        border: "1px solid #EAC9C4",
                        color: "#C0564A",
                        padding: "10px 14px",
                        borderRadius: 12,
                        fontSize: 14,
                        marginBottom: 14,
                      }}
                    >
                      {err}
                    </div>
                  )}
                  <Button type="submit" disabled={busy}>
                    {busy ? "送出中…" : "送出訊息"}
                  </Button>
                </>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
