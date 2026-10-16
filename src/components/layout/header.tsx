"use client";

import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  className?: string;
  userName?: string | null;
  userEmail?: string | null;
}

export function Header({
  title,
  onMenuClick,
  className,
  userName,
  userEmail,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "flex h-14 items-center gap-4 border-b border-border bg-background px-4 sm:px-6",
        className
      )}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-2 text-foreground-muted hover:bg-background-muted hover:text-foreground lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {title && (
        <h1 className="truncate text-lg font-semibold text-foreground">
          {title}
        </h1>
      )}

      <div className="ml-auto flex items-center gap-3">
        {(userName || userEmail) && (
          <div className="hidden text-right sm:block">
            {userName && (
              <p className="text-sm font-medium text-foreground">{userName}</p>
            )}
            {userEmail && (
              <p className="text-xs text-foreground-muted">{userEmail}</p>
            )}
          </div>
        )}
        <SignOutButton />
      </div>
    </header>
  );
}
