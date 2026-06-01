// Linkify: turn URLs and email addresses inside a plain string into
// clickable <a> tags. Used for news body text and any user-typed content
// that may contain links.
import { Fragment, type ReactNode } from "react";

// Matches:
//   group 1 — http(s):// URLs (stops at whitespace or closing bracket)
//   group 2 — bare email addresses
const PATTERN = /(https?:\/\/[^\s<>()"]+[^\s<>()"　.,;:!?])|([\w.+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9.-]+)/g;

export function linkify(text: string): ReactNode[] {
  if (!text) return [];
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  // Reset regex state for repeated calls.
  PATTERN.lastIndex = 0;
  while ((m = PATTERN.exec(text)) !== null) {
    const [whole, urlPart, emailPart] = m;
    const start = m.index;
    if (start > last) out.push(<Fragment key={`t${last}`}>{text.slice(last, start)}</Fragment>);
    if (urlPart) {
      out.push(
        <a
          key={`l${start}`}
          href={urlPart}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--color-primary-ink)", textDecoration: "underline", textUnderlineOffset: "3px" }}
        >
          {urlPart}
        </a>
      );
    } else if (emailPart) {
      out.push(
        <a
          key={`l${start}`}
          href={`mailto:${emailPart}`}
          style={{ color: "var(--color-primary-ink)", textDecoration: "underline", textUnderlineOffset: "3px" }}
        >
          {emailPart}
        </a>
      );
    }
    last = start + whole.length;
  }
  if (last < text.length) out.push(<Fragment key={`t${last}`}>{text.slice(last)}</Fragment>);
  return out;
}

// Convenience component:  <Linkify text={...} />
export function Linkify({ text }: { text: string }) {
  return <>{linkify(text)}</>;
}
