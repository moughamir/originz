"use client";

import { useEffect, useRef, useState } from "react";
import { ContentSections } from "./content-sections";
import { TableOfContents } from "./table-of-contents";

const sections = [
  { id: "section1", title: "How the Tax System Works" },
  { id: "section2", title: "The People's Rebellion" },
  { id: "section3", title: "The King's Plan" },
];

const Content1 = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  useEffect(() => {
    const sections = Object.keys(sectionRefs.current);

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    let observer: IntersectionObserver | null = new IntersectionObserver(
      observerCallback,
      {
        root: null,
        rootMargin: "0px",
        threshold: 1,
      }
    );

    sections.forEach((sectionId) => {
      const element = sectionRefs.current[sectionId];
      if (element) {
        observer?.observe(element);
      }
    });

    return () => {
      observer?.disconnect();
      observer = null;
    };
  }, []);

  const addSectionRef = (id: string, ref: HTMLElement | null) => {
    if (ref) {
      sectionRefs.current[id] = ref;
    }
  };

  return (
    <section className="py-32">
      <div className="container max-w-7xl">
        <div className="relative grid-cols-3 gap-20 lg:grid">
          <div className="lg:col-span-2">
            <ContentSections addSectionRef={addSectionRef} />
          </div>
          <TableOfContents sections={sections} activeSection={activeSection} />

        </div>
      </div>
    </section>
  );
};

export { Content1 };
