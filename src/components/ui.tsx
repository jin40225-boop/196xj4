// Shared UI primitives: Button, Blob, Reveal, IconTile.
import { useEffect, useRef, type CSSProperties, type ReactNode, type MouseEvent } from "react";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";
type Size = "sm" | "lg" | undefined;

export interface ButtonProps {
  variant?: Variant;
  size?: Size;
  icon?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
  className?: string;
}

export function Button({
  variant = "primary",
  size,
  icon,
  type = "button",
  disabled,
  children,
  onClick,
  style,
  className,
}: ButtonProps) {
  const cls = ["btn", `btn-${variant}`, size ? `btn-${size}` : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} style={style}>
      {children}
      {icon && <Icon name={icon} />}
    </button>
  );
}

export function Blob({
  color,
  w,
  h,
  style,
}: {
  color: string;
  w: string;
  h: string;
  style?: CSSProperties;
}) {
  return <div className="blob" style={{ background: color, width: w, height: h, ...style }} />;
}

/* reveal-on-scroll wrapper */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => el.classList.add("in"), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

export function IconTile({
  name,
  bg,
  color,
  radius = "999px",
  size = 60,
}: {
  name: string;
  bg: string;
  color: string;
  radius?: string;
  size?: number;
}) {
  return (
    <div
      className="ic"
      style={{
        background: bg,
        width: size,
        height: size,
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={name} style={{ color }} />
    </div>
  );
}
