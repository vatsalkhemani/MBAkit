import {
  Mail,
  UserPlus,
  Heart,
  FileText,
  MessageSquare,
  Coffee,
  type LucideIcon,
} from "lucide-react";

export interface Tool {
  name: string;
  shortName: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const tools: Tool[] = [
  {
    name: "Cold Email Generator",
    shortName: "Cold Email",
    description:
      "Write cold emails that actually get replies. Short, specific, and human.",
    href: "/cold-email",
    icon: Mail,
  },
  {
    name: "LinkedIn Outreach",
    shortName: "LinkedIn",
    description:
      "Connection notes that get accepted, InMails that get replies. Respects LinkedIn's character limits.",
    href: "/linkedin",
    icon: UserPlus,
  },
  {
    name: "Thank You Note Writer",
    shortName: "Thank You",
    description:
      "Send the perfect follow-up within 24 hours. Specific, warm, and memorable.",
    href: "/thank-you",
    icon: Heart,
  },
  {
    name: "Resume Bullet Sharpener",
    shortName: "Resume",
    description:
      "Turn vague bullets into quantified, impactful statements that land interviews.",
    href: "/resume",
    icon: FileText,
  },
  {
    name: "STAR Story Builder",
    shortName: "STAR Story",
    description:
      "Structure your experiences into compelling behavioral interview stories.",
    href: "/star",
    icon: MessageSquare,
  },
  {
    name: "Coffee Chat Prep",
    shortName: "Coffee Chat",
    description:
      "Smart questions that show you did your homework. Walk in confident, leave memorable.",
    href: "/coffee-chat",
    icon: Coffee,
  },
];
