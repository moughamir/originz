"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { AlignLeft } from "lucide-react";

interface Section {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
  activeSection: string | null;
}

export function TableOfContents({ sections, activeSection }: TableOfContentsProps) {
  return (
    <div className="sticky top-8 hidden h-fit lg:block">
      <span className="flex items-center gap-2 text-sm">
        <AlignLeft className="h-4 w-4" />
        On this page
      </span>
      <nav className="mt-2 text-sm">
        <ul>
          {sections.map((section) => (
            <li key={section.id}>
              <Link
                href={`#${section.id}`}
                className={cn(
                  "block py-1 transition-colors duration-200",
                  activeSection === section.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {section.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
