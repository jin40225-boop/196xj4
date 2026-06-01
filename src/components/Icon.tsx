// Lightweight Icon wrapper around lucide-react.
// Keeps the prototype's <Icon name="hand-heart" /> API while using named
// imports so unused icons get tree-shaken from the production bundle.
import {
  ArrowRight,
  AtSign,
  BadgeCheck,
  Building2,
  CalendarHeart,
  Camera,
  Check,
  CheckCircle,
  Clock,
  Droplet,
  ExternalLink,
  Eye,
  FilePen,
  FolderHeart,
  Globe,
  GraduationCap,
  HandHeart,
  Heart,
  HeartHandshake,
  Info,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  Pencil,
  Plus,
  RotateCcw,
  Settings,
  Share2,
  Sparkles,
  Sprout,
  Trash2,
  UserRound,
  UsersRound,
  Wind,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

const REGISTRY: Record<string, LucideIcon> = {
  "arrow-right": ArrowRight,
  "at-sign": AtSign,
  "badge-check": BadgeCheck,
  "building-2": Building2,
  "calendar-heart": CalendarHeart,
  camera: Camera,
  check: Check,
  "check-circle": CheckCircle,
  clock: Clock,
  droplet: Droplet,
  "external-link": ExternalLink,
  eye: Eye,
  "file-pen": FilePen,
  "folder-heart": FolderHeart,
  globe: Globe,
  "graduation-cap": GraduationCap,
  "hand-heart": HandHeart,
  heart: Heart,
  "heart-handshake": HeartHandshake,
  info: Info,
  "layout-dashboard": LayoutDashboard,
  leaf: Leaf,
  "log-out": LogOut,
  mail: Mail,
  "map-pin": MapPin,
  megaphone: Megaphone,
  menu: Menu,
  "message-circle": MessageCircle,
  pencil: Pencil,
  plus: Plus,
  "rotate-ccw": RotateCcw,
  settings: Settings,
  "share-2": Share2,
  sparkles: Sparkles,
  sprout: Sprout,
  "trash-2": Trash2,
  "user-round": UserRound,
  "users-round": UsersRound,
  wind: Wind,
  x: X,
};

export interface IconProps {
  name: string;
  size?: number | string;
  style?: CSSProperties;
  className?: string;
  strokeWidth?: number;
  "aria-label"?: string;
}

export function Icon({ name, size, style, className, strokeWidth = 1.75, ...rest }: IconProps) {
  const Cmp = REGISTRY[name];
  if (!Cmp) {
    if (import.meta.env.DEV) console.warn(`[Icon] unknown icon: ${name}`);
    return null;
  }
  return <Cmp size={size} style={style} className={className} strokeWidth={strokeWidth} {...rest} />;
}
