import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronRight, type LucideIcon } from "lucide-react";

import { keepFocus } from "./primitives";

export interface MenuEntry {
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  children?: (MenuEntry | null)[];
}

export interface Menu {
  label: string;
  items: (MenuEntry | null)[];
}

const MenuList = ({
  items,
  close,
}: {
  items: (MenuEntry | null)[];
  close: () => void;
}) => (
  <div className="ndoc-panel ndoc-menu-panel" role="menu">
    {items.map((item, i) => {
      if (!item) return <hr key={i} className="ndoc-divider" />;
      const Icon = item.active ? Check : item.icon;

      return (
        <div key={item.label} className="ndoc-menu-row">
          <button
            type="button"
            role="menuitem"
            className="ndoc-item"
            disabled={item.disabled}
            aria-haspopup={item.children ? "menu" : undefined}
            onClick={() => {
              if (item.children) return;
              close();
              item.onSelect?.();
            }}
          >
            <span className="ndoc-item-icon">{Icon && <Icon size={15} />}</span>
            <span className="ndoc-item-label">{item.label}</span>
            {item.shortcut && <kbd className="ndoc-item-kbd">{item.shortcut}</kbd>}
            {item.children && <ChevronRight size={14} />}
          </button>
          {item.children && (
            <div className="ndoc-submenu">
              <MenuList items={item.children} close={close} />
            </div>
          )}
        </div>
      );
    })}
  </div>
);

/** Items are rebuilt when a menu opens, so checkmarks reflect the caret. */
export const MenuBar = ({ build }: { build: () => Menu[] }) => {
  const [open, setOpen] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (open === null) return;
    const onPointer = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const menus = build();

  return (
    <nav className="ndoc-menubar" ref={root} aria-label="Document menu">
      {menus.map((menu, i) => (
        <div key={menu.label} className="ndoc-dropdown">
          <button
            type="button"
            className="ndoc-menu-trigger"
            aria-expanded={open === i}
            data-active={open === i || undefined}
            onMouseDown={keepFocus}
            onClick={() => setOpen((v) => (v === i ? null : i))}
            onMouseEnter={() => open !== null && setOpen(i)}
          >
            {menu.label}
          </button>
          {open === i && (
            <div onMouseDown={keepFocus}>
              <MenuList items={menu.items} close={close} />
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};
