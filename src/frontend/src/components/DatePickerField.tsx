import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface DatePickerFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  ocid?: string;
}

export function DatePickerField({
  label,
  id,
  value,
  onChange,
  disabled = false,
  ocid,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  // Parse current value to Date for the calendar
  const parsedDate = value
    ? (() => {
        const formats = [
          "d MMMM, yyyy",
          "MMMM d, yyyy",
          "dd MMMM, yyyy",
          "d MMM yyyy",
          "MMMM dd, yyyy",
        ];
        for (const fmt of formats) {
          const d = parse(value, fmt, new Date());
          if (isValid(d)) return d;
        }
        return undefined;
      })()
    : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "d MMMM, yyyy"));
    }
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        {label}
      </Label>
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            data-ocid={ocid}
            className={cn(
              "w-full justify-start text-left font-normal bg-input/50 border-input text-foreground hover:bg-input/70",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {value || "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parsedDate}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
