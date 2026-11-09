"use client";

import {
  ArrowDownLeft,
  ArrowsLeftRight,
  ArrowUpRight,
  Bank,
  Briefcase,
  Buildings,
  Car,
  ChartBar,
  ChatCircle,
  ClockCountdown,
  Coffee,
  Cpu,
  CreditCard,
  DeviceMobile,
  ForkKnife,
  House,
  Lightning,
  ListBullets,
  Money,
  PaintBrush,
  PiggyBank,
  Repeat,
  ShoppingBag,
  Wallet,
  WifiHigh,
  type Icon as PhosphorIcon,
  type IconWeight,
} from "@phosphor-icons/react";

const MAP: Record<string, PhosphorIcon> = {
  home: House,
  activity: ListBullets,
  dues: ClockCountdown,
  reports: ChartBar,
  cash: Money,
  bank: Bank,
  wallet: DeviceMobile,
  card: CreditCard,
  savings: PiggyBank,
  other: Wallet,
  briefcase: Briefcase,
  cpu: Cpu,
  swap: ArrowsLeftRight,
  chat: ChatCircle,
  lightning: Lightning,
  in: ArrowDownLeft,
  out: ArrowUpRight,
  repeat: Repeat,
  food: ForkKnife,
  car: Car,
  coffee: Coffee,
  shopping: ShoppingBag,
  rent: Buildings,
  design: PaintBrush,
  wifi: WifiHigh,
};

export function Glyph({
  name,
  size = 18,
  weight = "regular",
  className,
}: {
  name: string;
  size?: number;
  weight?: IconWeight;
  className?: string;
}) {
  const I = MAP[name] ?? Wallet;
  return <I size={size} weight={weight} className={className} />;
}
