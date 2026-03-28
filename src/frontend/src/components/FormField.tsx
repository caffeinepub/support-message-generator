import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  multiline?: boolean;
  ocid?: string;
}

export function FormField({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  multiline = false,
  ocid,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        {label}
      </Label>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          data-ocid={ocid}
          className="text-sm bg-input/50 resize-none min-h-[80px]"
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          data-ocid={ocid}
          className="text-sm bg-input/50"
        />
      )}
    </div>
  );
}
