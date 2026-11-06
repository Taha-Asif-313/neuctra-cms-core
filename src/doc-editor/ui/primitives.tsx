import {
  useCallback,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import {
  Divider,
  Dropdown,
  IconButton as NeuctraIconButton,
  Modal as NeuctraModal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  Select,
  type DropdownItem,
} from "@neuctra/ui";
import type { LucideIcon } from "lucide-react";

/** Clicking a control must never pull the caret out of the document. */
export const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();

export type EditorTheme = "light" | "dark";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

export const IconButton = ({
  icon: Icon,
  label,
  active,
  className = "",
  ...rest
}: IconButtonProps) => (
  <NeuctraIconButton
    type="button"
    icon={<Icon size={16} />}
    variant={active ? "soft" : "ghost"}
    size="sm"
    title={label}
    aria-label={label}
    aria-pressed={active}
    data-active={active || undefined}
    className={`ndoc-btn ${className}`}
    onMouseDown={keepFocus}
    {...rest}
  />
);

export const Separator = () => (
  <Divider orientation="vertical" spacing="none" className="ndoc-sep" />
);

/* =========================================
   TOOLBAR SELECT
========================================= */

interface ToolSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string; icon?: ReactNode }[];
  width: number;
  panelWidth?: number;
  searchable?: boolean;
  onPick: (value: string) => void;
}

export const ToolSelect = ({
  label,
  value,
  options,
  width,
  panelWidth,
  searchable,
  onPick,
}: ToolSelectProps) => (
  <div
    className="ndoc-tool-select"
    role="group"
    aria-label={label}
    title={label}
    style={{ width }}
    onMouseDown={(e) => {
      if (!(e.target as HTMLElement).matches("input")) keepFocus(e);
    }}
  >
    <Select
      size="sm"
      value={value}
      options={options}
      searchable={searchable}
      searchPlaceholder={`Search ${label.toLowerCase()}`}
      showCheckIcon={false}
      maxDropdownHeight={320}
      dropdownClassName="ndoc-select-panel"
      dropdownStyle={panelWidth ? { width: panelWidth } : undefined}
      onValueChange={(next) => onPick(String(next))}
    />
  </div>
);

/* =========================================
   TOOLBAR MENU (actions)
========================================= */

interface ToolMenuProps {
  label: string;
  trigger: ReactNode;
  items: DropdownItem[];
  theme: EditorTheme;
  active?: boolean;
  width?: number;
}

/** Dropdown portals to body, so the theme has to travel with the menu. */
export const ToolMenu = ({
  label,
  trigger,
  items,
  theme,
  active,
  width = 200,
}: ToolMenuProps) => (
  <Dropdown
    align="left"
    width={width}
    items={items}
    menuClassName={`ndoc-scope ndoc-tool-menu ndoc-theme-${theme}`}
    itemClassName="ndoc-tool-menu-item"
    trigger={
      <button
        type="button"
        title={label}
        aria-label={label}
        data-active={active || undefined}
        className="ndoc-btn ndoc-btn-wide"
        onMouseDown={keepFocus}
      >
        {trigger}
      </button>
    }
  />
);

/* =========================================
   TOOLBAR POPOVER (custom panels)
========================================= */

interface ToolPopoverProps {
  label: string;
  trigger: ReactNode;
  active?: boolean;
  children: (close: () => void) => ReactNode;
}

export const ToolPopover = ({
  label,
  trigger,
  active,
  children,
}: ToolPopoverProps) => {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      position="bottom"
      align="start"
      contentClassName="ndoc-popover"
      trigger={
        <span
          className="ndoc-btn"
          title={label}
          data-active={active || open || undefined}
          onMouseDown={keepFocus}
        >
          <span className="ndoc-sr-only">{label}</span>
          {trigger}
        </span>
      }
    >
      <div
        onMouseDown={(e) => {
          if (!(e.target as HTMLElement).matches("input")) keepFocus(e);
        }}
      >
        {children(close)}
      </div>
    </Popover>
  );
};

/* =========================================
   COLOR PANEL
========================================= */

interface ColorPanelProps {
  colors: string[];
  current?: string;
  resetLabel: string;
  onPick: (color: string | null) => void;
}

export const ColorPanel = ({
  colors,
  current,
  resetLabel,
  onPick,
}: ColorPanelProps) => (
  <div className="ndoc-colors">
    <button
      type="button"
      className="ndoc-item ndoc-colors-reset"
      onClick={() => onPick(null)}
    >
      {resetLabel}
    </button>
    <div className="ndoc-color-grid">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          title={color}
          aria-label={color}
          className="ndoc-swatch"
          data-active={current?.toLowerCase() === color || undefined}
          style={{ background: color }}
          onClick={() => onPick(color)}
        />
      ))}
    </div>
    <label className="ndoc-color-custom">
      Custom
      <input
        type="color"
        value={current && /^#[0-9a-f]{6}$/i.test(current) ? current : "#000000"}
        onChange={(e) => onPick(e.target.value)}
      />
    </label>
  </div>
);

/* =========================================
   MODAL
========================================= */

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal = ({ title, onClose, children, footer }: ModalProps) => (
  <NeuctraModal isOpen onClose={onClose} ariaLabel={title}>
    <ModalContent className="ndoc-modal">
      <ModalHeader title={title} onClose={onClose} />
      <ModalBody>{children}</ModalBody>
      {footer && <ModalFooter>{footer}</ModalFooter>}
    </ModalContent>
  </NeuctraModal>
);
