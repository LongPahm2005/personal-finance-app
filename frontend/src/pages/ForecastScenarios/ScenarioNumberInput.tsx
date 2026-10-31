import { Input } from '../../components/ui/Input';

export type ScenarioNumber = number | '';
export const MAX_SCENARIO_AMOUNT = 9_999_999_999_999;

/** Text input avoids browser spinners, exponent notation and wheel increments. */
export function ScenarioNumberInput({ label, value, onChange, money = false, error, max = 600, helperText }: {
  label: string;
  value: ScenarioNumber;
  onChange: (value: ScenarioNumber) => void;
  money?: boolean;
  error?: string;
  max?: number;
  helperText?: string;
}) {
  const format = (digits: string) => money ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : digits;
  return <Input
    label={label}
    type="text"
    inputMode="numeric"
    autoComplete="off"
    value={value === '' ? '' : format(String(value))}
    error={error}
    helperText={helperText ?? (money ? 'Số nguyên VND, ví dụ: 1.000.000' : 'Nhập số tháng nguyên từ 1 đến 600')}
    onKeyDown={event => {
      if (!event.ctrlKey && !event.metaKey && ['-', '+', 'e', 'E', ',', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
    }}
    onPaste={event => {
      const text = event.clipboardData.getData('text').trim();
      // Reject signed/decimal/exponential values; dots are thousands separators.
      if (!(money ? /^(?:\d+|\d{1,3}(?:\.\d{3})+)$/ : /^\d+$/).test(text)) event.preventDefault();
    }}
    onChange={event => {
      const input = event.currentTarget;
      const text = input.value;
      if (!(money ? /^[\d.]*$/ : /^\d*$/).test(text)) return;
      const digits = text.replace(/\./g, '');
      if (!digits) { onChange(''); return; }
      const amount = Number(digits);
      if (!Number.isSafeInteger(amount) || amount > (money ? MAX_SCENARIO_AMOUNT : max)) return;
      const rightDigits = text.slice(input.selectionStart ?? text.length).replace(/\D/g, '').length;
      onChange(amount);
      // Keep the cursor next to the same digit when separators are inserted.
      const formatted = format(String(amount));
      requestAnimationFrame(() => {
        if (document.activeElement !== input) return;
        let caret = formatted.length;
        let remaining = rightDigits;
        while (caret > 0 && remaining > 0) {
          caret--;
          if (/\d/.test(formatted[caret])) remaining--;
        }
        input.setSelectionRange(caret, caret);
      });
    }}
  />;
}
