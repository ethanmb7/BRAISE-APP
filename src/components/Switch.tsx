type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  'aria-label'?: string;
};

export function Switch({ checked, onChange, 'aria-label': ariaLabel }: Props) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
      />
      <span className="slider" />
    </label>
  );
}
