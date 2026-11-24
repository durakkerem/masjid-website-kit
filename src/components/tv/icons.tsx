import {
  BookOpen,
  CalendarDays,
  Globe,
  GraduationCap,
  HandHeart,
  Heart,
  HeartHandshake,
  Landmark,
  Mail,
  Mic,
  Phone,
  Presentation,
  Users,
  type LucideIcon,
} from 'lucide-react'

/** Icon keys used by Site Settings → Services / Contacts, mapped to line icons. */
export const TV_ICONS: Record<string, LucideIcon> = {
  mosque: Landmark,
  people: Users,
  book: BookOpen,
  microphone: Mic,
  heart: Heart,
  support: HeartHandshake,
  care: HandHeart,
  lecture: Presentation,
  education: GraduationCap,
  event: CalendarDays,
  email: Mail,
  phone: Phone,
  website: Globe,
}

export function TvIcon({ name, className }: { name: string; className?: string }) {
  const Icon = TV_ICONS[name] ?? Landmark
  return <Icon className={className} aria-hidden="true" strokeWidth={1.75} />
}
