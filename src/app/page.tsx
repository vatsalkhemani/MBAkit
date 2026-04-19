import Link from "next/link";
import { Mail, Heart, FileText, MessageSquare, Coffee } from "lucide-react";

const tools = [
  {
    name: "Cold Email Generator",
    description: "Write cold emails that actually get replies. Short, specific, and human.",
    href: "/cold-email",
    icon: Mail,
  },
  {
    name: "Thank You Note Writer",
    description: "Send the perfect follow-up within 24 hours. Specific, warm, and memorable.",
    href: "/thank-you",
    icon: Heart,
  },
  {
    name: "Resume Bullet Sharpener",
    description: "Turn vague bullets into quantified, impactful statements that land interviews.",
    href: "/resume",
    icon: FileText,
  },
  {
    name: "STAR Story Builder",
    description: "Structure your experiences into compelling behavioral interview stories.",
    href: "/star",
    icon: MessageSquare,
  },
  {
    name: "Coffee Chat Prep",
    description: "Smart questions that show you did your homework. Walk in confident, leave memorable.",
    href: "/coffee-chat",
    icon: Coffee,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">The MBA Toolkit</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Sharp tools for the repetitive stuff. So you can focus on what matters.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          No sign-up. No paywall. Just use it.
        </p>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-lg"
          >
            <div className="flex items-start gap-3.5">
              <div className="rounded-lg bg-primary/10 p-2">
                <tool.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold group-hover:text-primary transition-colors">
                  {tool.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
                <span className="mt-2.5 inline-block text-sm font-medium text-primary">
                  Use it &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
