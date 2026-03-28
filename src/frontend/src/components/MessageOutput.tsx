import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface MessageOutputProps {
  message: string;
  ocidScope?: string;
}

export function MessageOutput({
  message,
  ocidScope = "msg",
}: MessageOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!message) return null;

  return (
    <div className="mt-4" data-ocid={`${ocidScope}.panel`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Generated Message
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {message.length} chars
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            data-ocid={`${ocidScope}.copy_button`}
            className="h-7 px-3 text-xs gap-1.5"
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
      <pre className="font-mono text-sm bg-muted/40 border border-border rounded-lg p-4 whitespace-pre-wrap break-words text-foreground leading-relaxed">
        {message}
      </pre>
    </div>
  );
}
