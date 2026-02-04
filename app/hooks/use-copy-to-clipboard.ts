import { useState, useCallback } from "react";
import { toast } from "./use-toast";

interface UseCopyToClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
  timeout?: number;
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const {
    successMessage = "Copied to clipboard!",
    errorMessage = "Failed to copy",
    timeout = 2000,
  } = options;

  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (!navigator?.clipboard) {
        toast({
          title: "Error",
          description: "Clipboard not supported",
          variant: "destructive",
        });
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast({
          title: "Success",
          description: successMessage,
          variant: "success",
        });
        setTimeout(() => setCopied(false), timeout);
        return true;
      } catch (error) {
        setCopied(false);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    },
    [successMessage, errorMessage, timeout]
  );

  return { copy, copied };
}
