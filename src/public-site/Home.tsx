// Home — circular-embrace hero, service entries, about teaser, quote band, news preview, CTA.
import { Link } from "react-router-dom";
import { Blob, Button, Reveal, IconTile } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStore } from "../lib/store";
import { ENTRIES, newsStyle, fmtDate } from "../lib/data";
import type { NewsItem } from "../lib/types";

function Hero() {
  const { site } = useStore();
  const h = site.hero;
  return (
    <section className="hero hero-embrace">
      <Blob color="var(--peach-100)" w="220px" h="220px" style={{ top: "12%", left: "5%" }} />
      <Blob color="var(--butter-100)" w="150px" h="150px" style={{ bottom: "12%", right: "10%" }} />
      <Blob color="var(--sky-100)" w="180px" h="180px" style={{ top: "16%", right: "6%" }} />
      <div className="container hero-in">
        <div className="hero-copy">
          <div className="eyebrow">{h.eyebrow}</div>
          <h1>
            {h.titleA}
            <br />
            {h.titleB}
            <span className="hl">{h.titleHl}</span>
            {h.titleC}
          </h1>
          <p className="lead">{h.lead}</p>
          <div className="actions">
            <Link to="/services">
              <Button size="lg" icon="arrow-right">
                我想了解服務
              </Button>
            </Link>
            <Link to="/news">
              <Button variant="secondary" size="lg">
                加入會員
              </Button>
            </Link>
          </div>
        </div>
        <div className="embrace">
          <div className="embrace-ring r-outer float" />
          <div className="embrace-ring r-dash" />
          <div className="embrace-core" />
          <img src="/assets/logo-transparent.png" alt="白露協會" className="embrace-logo float" />
          <span className="orbit o1">
            <Icon name="droplet" />
          </span>
          <span className="orbit o2">
            <Icon name="leaf" />
          </span>
          <span className="orbit o3">
            <Icon name="heart" />
          </span>
          <span className="orbit o4">
            <Icon name="sparkles" />
          </span>
        </div>
      </div>
    </section>
  );
}

function Entries() {
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="sec-head">
            <div className="kick">How can we help</div>
            <h2>您想做什麼？</h2>
            <p>一進網站就能找到方向，我們陪您一步步往前走。</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="entries">
            {ENTRIES.map((e, i) => (
              <Link to={e.to} key={i} className="entry" style={{ display: "block" }}>
                <IconTile name={e.icon} bg={e.bg} color={e.color} />
                <h3>{e.label}</h3>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AboutTeaser() {
  const { site } = useStore();
  const a = site.about;
  return (
    <section className="section soft">
      <div className="container teaser-grid">
        <Reveal>
          <div className="embrace sm">
            <div
              className="embrace-core"
              style={{ background: "radial-gradient(circle at 40% 35%, #fff, var(--mint-100))" }}
            />
            <img src="/assets/logo-transparent.png" alt="" className="embrace-logo" />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div>
            <div className="kick teaser-kick">About 白露</div>
            <h2 className="teaser-h2">把重心，回到善待助人者本身</h2>
            <p className="teaser-lead">{a.origin1}</p>
            <p className="teaser-muted">{a.origin2}</p>
            <Link to="/about">
              <Button variant="ghost" icon="arrow-right">
                認識我們的故事
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function QuoteBand() {
  const { site } = useStore();
  return (
    <section className="qband">
      <div className="container qin">
        <p className="q">「{site.about.quote}」</p>
        <div className="by">— 白露・協會命名緣起</div>
      </div>
    </section>
  );
}

export function NewsCard({ n, onClick }: { n: NewsItem; onClick?: () => void }) {
  const st = newsStyle(n.category);
  const inner = (
    <div className="ncard" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className="ph" style={{ background: st.bg }}>
        <span className="icon-deco">
          <Icon name={n.icon} style={{ color: st.c }} />
        </span>
        <span className="ph-tag">{n.category}</span>
      </div>
      <div className="body">
        <div className="date">{fmtDate(n.date)}</div>
        <h3>{n.title}</h3>
        <p>{n.excerpt}</p>
      </div>
    </div>
  );
  return inner;
}

function NewsPreview() {
  const { news } = useStore();
  const top3 = news.filter((n) => n.published).slice(0, 3);
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="sec-head">
            <div className="kick">Latest news</div>
            <h2>最新消息</h2>
            <p>協會的近期動態、活動與招募資訊。</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="news-grid">
            {top3.map((n) => (
              <Link to="/news" key={n.id} style={{ display: "block" }}>
                <NewsCard n={n} />
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function CTABand() {
  return (
    <section className="cta-band">
      <div className="container cta-in">
        <Reveal>
          <h2>成為善的起點，一同向光而行</h2>
          <p>歡迎個人、團體與贊助會員加入</p>
          <Link to="/news">
            <Button size="lg" icon="heart">
              立即加入會員
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Entries />
      <AboutTeaser />
      <QuoteBand />
      <NewsPreview />
      <CTABand />
    </main>
  );
}
