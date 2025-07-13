"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { History } from "./history";
import { SlashIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useLanguage } from './language-provider';

export function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const { data: session } = useSession();
  return (
    <nav className="sticky top-0 z-30 bg-background flex items-center h-14 px-4 border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <History user={session?.user} />
        <span className="text-sm font-light tracking-tight">{t('appTitle')}</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {['ENG', 'RO', 'RU'].map(code => (
          <button
            key={code}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${lang === code.toLowerCase() ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            onClick={() => setLang(code.toLowerCase() as any)}
            aria-label={t(code)}
          >
            {t(code)}
          </button>
        ))}
        {session?.user?.email && (
          <span className="ml-4 text-xs text-muted-foreground">{session.user.email}</span>
        )}
      </div>
    </nav>
  );
}
