"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  ClipboardCheck,
  PlusCircle,
  BarChart3,
  BookOpen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/",
    labelKey: "home",
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: "/checkin",
    labelKey: "checkin",
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  {
    href: "/log",
    labelKey: "log",
    icon: <PlusCircle className="h-6 w-6" />,
  },
  {
    href: "/insights",
    labelKey: "insights",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    href: "/learn",
    labelKey: "learn",
    icon: <BookOpen className="h-5 w-5" />,
  },
];

/**
 * BottomNav - Responsive navigation
 * Bottom nav on mobile, sidebar on desktop (lg+)
 */
export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <>
      {/* Mobile: Bottom Navigation */}
      <nav
        data-testid="bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.1)]"
      >
        <div className="flex items-center justify-around h-16 w-full px-2 sm:px-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const isLogButton = item.href === "/log";

            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.labelKey.toLowerCase()}`}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-all duration-200",
                  isLogButton && "relative -mt-3",
                  isActive
                    ? "text-purple-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                )}
              >
                {isLogButton ? (
                  <div
                    className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 border-2 border-purple-700",
                      isActive
                        ? "bg-purple-600 text-white"
                        : "bg-purple-500 text-white hover:shadow-xl hover:bg-purple-600",
                    )}
                  >
                    {item.icon}
                  </div>
                ) : (
                  <>
                    <span
                      className={cn(
                        "transition-transform duration-200",
                        isActive && "scale-110",
                      )}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] mt-1 font-medium transition-opacity duration-200 whitespace-nowrap",
                        isActive ? "opacity-100" : "opacity-70",
                      )}
                    >
                      {t(item.labelKey)}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: Sidebar Navigation */}
      <nav
        data-testid="sidebar-nav"
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg"
      >
        {/* Logo / App Title */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Home className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("appName")}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("tagline")}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const isLogButton = item.href === "/log";

            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`sidebar-nav-${item.labelKey.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isLogButton
                    ? cn(
                        "my-2 bg-purple-500 text-white hover:bg-purple-600 shadow-md",
                        isActive && "bg-purple-600 ring-2 ring-purple-300",
                      )
                    : cn(
                        isActive
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                      ),
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    isLogButton
                      ? "bg-white/20"
                      : isActive
                        ? "bg-purple-100 dark:bg-purple-800/30"
                        : "bg-gray-100 dark:bg-gray-800",
                  )}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{t(item.labelKey)}</span>
                {isActive && !isLogButton && (
                  <div className="ml-auto w-1.5 h-6 rounded-full bg-purple-500" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Settings at bottom */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
          <Link
            href="/settings"
            data-testid="sidebar-nav-settings"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              pathname === "/settings"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg",
                pathname === "/settings"
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "bg-gray-100 dark:bg-gray-800",
              )}
            >
              <Settings className="h-5 w-5" />
            </span>
            <span className="font-medium">{t("settings")}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

/**
 * BottomNavSpacer - Responsive spacing for navigation
 * Adds bottom padding on mobile, left margin on desktop
 */
export function BottomNavSpacer() {
  return <div className="h-16 pb-safe lg:h-0 lg:pb-0" />;
}

/**
 * MainContentWrapper - Wrapper for main content that adjusts for sidebar
 * Use this in layout.tsx to properly position content
 */
export function MainContentWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("lg:ml-64 transition-all duration-300", className)}>
      {children}
    </div>
  );
}
