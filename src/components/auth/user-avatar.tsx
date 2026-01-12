/**
 * UserAvatar Component
 *
 * Display user profile image or initials fallback.
 * Pure presentational component with accessibility features.
 */

"use client";

import { User } from "@/domains/auth/entities/user.entity";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export interface UserAvatarProps {
  /**
   * User entity from domain layer
   */
  user: User;

  /**
   * Avatar size
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Additional CSS classes to apply to the avatar
   */
  className?: string;

  /**
   * Whether to show a border around the avatar
   * @default false
   */
  showBorder?: boolean;
}

/**
 * Size mapping for avatar dimensions
 */
const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

/**
 * UserAvatar Component
 *
 * Displays user's profile picture if available, otherwise shows initials.
 * Falls back gracefully if image fails to load.
 *
 * @example
 * ```tsx
 * <UserAvatar user={user} size="md" />
 * <UserAvatar user={user} size="lg" showBorder />
 * ```
 */
export function UserAvatar({
  user,
  size = "md",
  className,
  showBorder = false,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Determine if we should show image or initials
  const shouldShowImage = user.image && !imageError;

  // Get user initials for fallback
  const initials = user.getInitials();

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
        sizeClasses[size],
        showBorder && "ring-2 ring-border ring-offset-2 ring-offset-background",
        className,
      )}
      data-testid="user-avatar"
      aria-label={`${user.getDisplayName()}'s avatar`}
    >
      {shouldShowImage ? (
        <Image
          src={user.image!}
          alt={`${user.getDisplayName()}'s profile picture`}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          sizes={size === "sm" ? "32px" : size === "md" ? "40px" : "48px"}
          priority={false}
        />
      ) : (
        <span
          className="font-medium text-muted-foreground"
          aria-label={`${user.getDisplayName()}'s initials`}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
