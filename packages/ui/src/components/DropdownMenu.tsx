'use client';

import type { ComponentProps } from 'react';
import { DropdownMenu as MenuPrimitive } from 'radix-ui';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';

/**
 * A menu of actions behind a button, on Radix DropdownMenu: Enter, Space or ArrowDown opens it, arrows move, typing
 * jumps to an item, Escape closes it and focus returns to the trigger.
 *
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild><Button variant="ghost" aria-label="Więcej">…</Button></DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem icon={Pencil} onSelect={edit}>Edytuj</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem danger icon={Trash2} onSelect={remove}>Usuń</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */
export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export const DropdownMenuGroup = MenuPrimitive.Group;

/** The menu panel, in a portal; it opens below the trigger, aligned to its end, and flips to stay on screen. */
export function DropdownMenuContent({
  className,
  sideOffset = 4,
  align = 'end',
  ...props
}: ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        collisionPadding={8}
        className={cn(
          'z-110 min-w-44 max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg border border-border bg-surface p-1',
          'text-foreground shadow-lg motion-safe:animate-fade-in',
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
}

export interface DropdownMenuItemProps extends ComponentProps<typeof MenuPrimitive.Item> {
  /** A destructive action (delete, cancel): red text, red highlight. */
  danger?: boolean;
  icon?: LucideIcon;
}

/** One action; use `onSelect` (it closes the menu) rather than `onClick`. */
export function DropdownMenuItem({ danger = false, icon: Icon, className, children, ...props }: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      className={cn(
        'flex h-8 cursor-default select-none items-center gap-2 rounded-md px-2 text-sm outline-none',
        'transition-colors duration-150 data-disabled:pointer-events-none data-disabled:opacity-50',
        danger ? 'text-danger data-highlighted:bg-danger-soft' : 'text-foreground data-highlighted:bg-muted',
        className,
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn('size-4 shrink-0', danger ? 'text-danger' : 'text-muted-foreground')}
          strokeWidth={1.75}
          aria-hidden
        />
      )}
      {children}
    </MenuPrimitive.Item>
  );
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof MenuPrimitive.Separator>) {
  return <MenuPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />;
}

/** A heading inside the menu (the signed-in user, a group name); not focusable. */
export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof MenuPrimitive.Label>) {
  return <MenuPrimitive.Label className={cn('px-2 py-1.5 text-xs text-faint', className)} {...props} />;
}
