import {
  Award,
  BadgeCheck,
  Bell,
  Bookmark,
  Compass,
  FolderHeart,
  House,
  LayoutGrid,
  MessageCircle,
  Radio,
  Settings,
  WalletCards,
} from "lucide-react";
import ResponsiveNav from "@/components/consumer/ResponsiveNav";

export const consumerNavigation = [
  { href: "/home", label: "Home", icon: House },
  { href: "/feed", label: "Feed", icon: LayoutGrid },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/subscriptions", label: "Subscriptions", icon: BadgeCheck },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/collections", label: "Collections", icon: FolderHeart },
  { href: "/wallet", label: "Wallet", icon: WalletCards },
  { href: "/rewards", label: "Rewards", icon: Award },
  { href: "/saved", label: "Saved Posts", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function ConsumerWorkspaceNav(props) {
  return <ResponsiveNav {...props} items={consumerNavigation} />;
}
