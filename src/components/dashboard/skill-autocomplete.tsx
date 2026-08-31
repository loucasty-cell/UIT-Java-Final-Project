import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Check,
  X,
  Code2,
  Palette,
  Calculator,
  Languages,
  Briefcase,
  Sparkles,
  BookOpen,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useCatalogSkillsQuery, useSearchCatalogSkillsQuery } from "@/hooks/api/use-skills";
import { GlobalCatalogSkill } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Fallback seed skills in case the backend database is still booting
const FALLBACK_CATALOG_SKILLS: GlobalCatalogSkill[] = [
  { id: "sk-react", name: "React", category: "Programming", description: "Modern React with Hooks, Server Components, and State Management." },
  { id: "sk-typescript", name: "TypeScript", category: "Programming", description: "Static typing for JavaScript, generics, utility types." },
  { id: "sk-python", name: "Python", category: "Programming", description: "Data structures, algorithms, Flask, and pandas." },
  { id: "sk-java", name: "Java & Spring Boot", category: "Programming", description: "Enterprise backend development, Spring Data JPA, REST APIs." },
  { id: "sk-nextjs", name: "Next.js", category: "Programming", description: "React Framework for the Web with App Router and SSR." },
  { id: "sk-nodejs", name: "Node.js", category: "Programming", description: "Asynchronous event-driven JavaScript runtime and Express." },
  { id: "sk-sql", name: "PostgreSQL & SQL", category: "Programming", description: "Relational database design, queries, indexing, and joins." },
  { id: "sk-uiux", name: "UI/UX & Figma", category: "Design", description: "Wireframing, prototyping, design systems, and user testing." },
  { id: "sk-graphic-design", name: "Graphic Design", category: "Design", description: "Visual hierarchy, typography, branding, and layout design." },
  { id: "sk-algebra", name: "Linear Algebra", category: "Mathematics", description: "Vector spaces, eigenvalues, matrix transformations." },
  { id: "sk-calculus", name: "Calculus & Analysis", category: "Mathematics", description: "Derivatives, integrals, multivariable calculus." },
  { id: "sk-statistics", name: "Probability & Statistics", category: "Mathematics", description: "Hypothesis testing, distributions, regression analysis." },
  { id: "sk-writing", name: "Academic Essay Writing", category: "Language & Writing", description: "Thesis development, structuring, academic style." },
  { id: "sk-spanish", name: "Conversational Spanish", category: "Language & Writing", description: "Everyday vocabulary, grammar, and pronunciation." },
  { id: "sk-public-speaking", name: "Public Speaking", category: "Soft Skills", description: "Presentations, storytelling, and stage presence." },
  { id: "sk-interview-prep", name: "Technical Interview Prep", category: "Soft Skills", description: "Data structures, system design, and behavioral STAR method." },
];

export function getCategoryBadgeStyle(category: string) {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("program") || cat.includes("code") || cat.includes("tech") || cat.includes("dev")) {
    return {
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      icon: Code2,
    };
  }
  if (cat.includes("design") || cat.includes("ui") || cat.includes("art") || cat.includes("creative")) {
    return {
      bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      icon: Palette,
    };
  }
  if (cat.includes("math") || cat.includes("data") || cat.includes("stat") || cat.includes("science")) {
    return {
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      icon: Calculator,
    };
  }
  if (cat.includes("lang") || cat.includes("write") || cat.includes("english")) {
    return {
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      icon: Languages,
    };
  }
  if (cat.includes("soft") || cat.includes("business") || cat.includes("manage") || cat.includes("lead")) {
    return {
      bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      icon: Briefcase,
    };
  }
  return {
    bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    icon: Sparkles,
  };
}

export interface SkillAutocompleteProps {
  selectedSkill: GlobalCatalogSkill | null;
  onSelectSkill: (skill: GlobalCatalogSkill | null) => void;
  existingSkillIds?: string[];
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  error?: string | null;
}

export function SkillAutocomplete({
  selectedSkill,
  onSelectSkill,
  existingSkillIds = [],
  placeholder = "Search skills (e.g. React, Python, UI/UX, Calculus)...",
  autoFocus = false,
  className,
  error,
}: SkillAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Queries
  const { data: catalogData, isLoading: isCatalogLoading } = useCatalogSkillsQuery();
  const { data: searchResults, isLoading: isSearching } = useSearchCatalogSkillsQuery(query.trim());

  // Merge full catalog items
  const allSkills = useMemo(() => {
    const rawCatalog = Array.isArray(catalogData)
      ? catalogData
      : (catalogData as any)?.content || [];

    const merged = [...rawCatalog];
    // Add any missing fallbacks to ensure rich experience
    for (const fb of FALLBACK_CATALOG_SKILLS) {
      if (!merged.some((m) => m.name.toLowerCase() === fb.name.toLowerCase())) {
        merged.push(fb);
      }
    }
    return merged;
  }, [catalogData]);

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    allSkills.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [allSkills]);

  // Filter skills based on query & category
  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allSkills;

    // Apply API search results if available
    const apiResults = Array.isArray(searchResults)
      ? searchResults
      : (searchResults as any)?.content || [];
    if (apiResults.length > 0 && q.length > 0) {
      const combined = [...apiResults];
      for (const item of allSkills) {
        if (!combined.some((c) => c.id === item.id || c.name.toLowerCase() === item.name.toLowerCase())) {
          if (item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)) {
            combined.push(item);
          }
        }
      }
      list = combined;
    } else if (q.length > 0) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q))
      );
    }

    // Apply category pill filter
    if (selectedCategoryFilter !== "ALL") {
      list = list.filter((s) => s.category.toLowerCase() === selectedCategoryFilter.toLowerCase());
    }

    return list;
  }, [allSkills, searchResults, query, selectedCategoryFilter]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlight index on filter change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredSkills]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("li");
      const target = items[highlightedIndex];
      if (target) {
        target.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (skill: GlobalCatalogSkill) => {
    onSelectSkill(skill);
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClearSelection = () => {
    onSelectSkill(null);
    setQuery("");
    setTimeout(() => {
      inputRef.current?.focus();
      setIsOpen(true);
    }, 50);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSkills.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSkills.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSkills[highlightedIndex]) {
          handleSelect(filteredSkills[highlightedIndex]);
        } else if (filteredSkills.length === 1) {
          handleSelect(filteredSkills[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  // Highlight matching text helper
  const renderHighlightedName = (name: string, highlight: string) => {
    if (!highlight.trim()) return name;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = name.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="font-semibold text-primary underline decoration-primary/40">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  // If a skill is already selected, display selected preview with Change button
  if (selectedSkill) {
    const { bg, icon: CatIcon } = getCategoryBadgeStyle(selectedSkill.category);
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3.5 transition-all">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CatIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground text-sm">
                  {selectedSkill.name}
                </span>
                <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium", bg)}>
                  {selectedSkill.category}
                </span>
              </div>
              {selectedSkill.description && (
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {selectedSkill.description}
                </p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Change skill"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative w-full space-y-2", className)}>
      {/* Input container */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
          {isSearching || isCatalogLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="skill-autocomplete-list"
          aria-activedescendant={
            highlightedIndex >= 0 ? `skill-option-${highlightedIndex}` : undefined
          }
          className={cn(
            "flex h-10 w-full rounded-xl border bg-background px-3 py-2 pl-9 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-destructive focus-visible:ring-destructive" : "border-input",
          )}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown suggestions list */}
      {isOpen && (
        <div
          id="skill-autocomplete-list"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          {/* Category Filter Pills inside dropdown */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/60 bg-muted/40 p-2 text-xs scrollbar-none">
            <span className="shrink-0 text-[11px] font-medium text-muted-foreground px-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={cn(
                  "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
                  selectedCategoryFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                )}
              >
                {cat === "ALL" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* List Content */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-56 overflow-y-auto p-1 text-sm divide-y divide-border/20"
          >
            {filteredSkills.length === 0 ? (
              <li className="p-4 text-center text-xs text-muted-foreground">
                <BookOpen className="mx-auto mb-1.5 h-5 w-5 opacity-40" />
                <p className="font-medium text-foreground">No matching skills found</p>
                <p className="mt-0.5 text-muted-foreground">
                  Try searching for another keyword or select &apos;All&apos; category.
                </p>
              </li>
            ) : (
              filteredSkills.map((skill, index) => {
                const { bg, icon: CatIcon } = getCategoryBadgeStyle(skill.category);
                const isAlreadyAdded = existingSkillIds.includes(skill.id);
                const isHighlighted = highlightedIndex === index;

                return (
                  <li
                    key={skill.id || skill.name}
                    id={`skill-option-${index}`}
                    role="option"
                    aria-selected={isHighlighted}
                    onClick={() => handleSelect(skill)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      isHighlighted
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50 text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md border", bg)}>
                        <CatIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-sm">
                            {renderHighlightedName(skill.name, query)}
                          </p>
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center rounded px-1.5 py-0.2 text-[10px] font-medium border",
                              bg
                            )}
                          >
                            {skill.category}
                          </span>
                        </div>
                        {skill.description && (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {skill.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isAlreadyAdded && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          In Portfolio
                        </span>
                      )}
                      {isHighlighted && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          {/* Quick info footer */}
          <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
            <span>
              {filteredSkills.length} {filteredSkills.length === 1 ? "skill" : "skills"} available
            </span>
            <span className="text-[10px] text-muted-foreground/80">
              Press <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[9px]">↑</kbd> <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[9px]">↓</kbd> to navigate, <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[9px]">↵</kbd> to select
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
