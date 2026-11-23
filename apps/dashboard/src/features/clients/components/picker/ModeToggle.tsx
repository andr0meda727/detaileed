import { SegmentedControl } from '@detaileed/ui';

export type PickerMode = 'existing' | 'new';

interface ModeToggleProps {
  value: PickerMode;
  onChange: (mode: PickerMode) => void;
  labels: Record<PickerMode, string>;
  /** Accessible name of the switch. */
  label: string;
}

/** Two-segment switch between picking an existing record and creating a new one. */
export function ModeToggle({ value, onChange, labels, label }: ModeToggleProps) {
  return (
    <SegmentedControl
      size="sm"
      aria-label={label}
      value={value}
      onValueChange={onChange}
      options={[
        { value: 'existing', label: labels.existing },
        { value: 'new', label: labels.new },
      ]}
    />
  );
}
