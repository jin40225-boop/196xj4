// 最新消息（含會員招募）
import { useState } from "react";
import { Link } from "react-router-dom";
import { Reveal, Button } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStore } from "../lib/store";
import { TIERS, newsStyle, fmtDate } from "../lib/data";
import { PageHead } from "./About";
import { NewsCard } from "./Home";
import type { NewsItem } from "../lib/types";

export default function News() {
  const { site, news } = useStore();
  const published = news.filter((n) => n.published);
  const [open, setOpen] = useState<NewsItem | null>(null);

  return (
    <main>
      <PageHead
        kick="News & membership"
        title="最新消息：會員招募"
        sub="台灣白露社會福利服務協會誠摯邀請您加入！歡迎個人、團體與贊助會員入會，共創美好未來。"
      />

      <section className="section" style={{ paddingTop: 56 }}>
        <div className="container">
          <Reveal>
            <div className="news-grid">
              {published.map((n) => (
                <NewsCard key={n.id} n={n} onClick={() => setOpen(n)} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <Reveal>
            <div className="sec-head">
              <div className="kick">Membership</div>
              <h2>歡迎加入我們的大家庭</h2>
              <p>{site.membershipNote}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="mtiers">
              {TIERS.map((t, i) => (
                <div className={`tier ${t.feat ? "feat" : ""}`} key={i}>
                  {t.feat && <div className="badge">最受歡迎</div>}
                  <h3>{t.name}</h3>
                  <p className="sub">{t.sub}</p>
                  <div className="price">
                    {t.join === "—" ? (
                      "隨喜"
                    ) : (
                      <>
                        NT${t.year}
                        <small> / 年費</small>
                      </>
                    )}
                  </div>
                  {t.join !== "—" && <div className="joinfee">入會費 NT${t.join}</div>}
                  <ul>
                    {t.perks.map((p, j) => (
                      <li key={j}>
                        <Icon name="check" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact" style={{ display: "block" }}>
                    <Button variant={t.feat ? "primary" : "secondary"}>填寫入會表單</Button>
                  </Link>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div className="mfoot">
              有意願加入的夥伴，歡迎透過{" "}
              <Link to="/contact">下方表單</Link>{" "}
              與我們聯繫，或來信{" "}
              <a href={"mailto:" + site.contact.email}>{site.contact.email}</a>
            </div>
          </Reveal>
        </div>
      </section>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setOpen(null)} aria-label="關閉">
              <Icon name="x" />
            </button>
            <div className="modal-tag" style={{ background: newsStyle(open.category).bg }}>
              {open.category}
            </div>
            <div className="modal-date">{fmtDate(open.date)}</div>
            <h2 className="modal-title">{open.title}</h2>
            <p className="modal-body" style={{ whiteSpace: "pre-wrap" }}>
              {open.body || open.excerpt}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
