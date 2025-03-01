import React from "react";
import { Info, HelpCircle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type HelpType = "info" | "help" | "warning";

interface HelpTooltipProps {
  content: React.ReactNode;
  type?: HelpType;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
  iconClassName?: string;
  interactive?: boolean;
  iconSize?: number;
}

/**
 * Composant InfoBulle contextuelle qui affiche une icône avec une bulle d'aide au survol
 */
export function HelpTooltip({
  content,
  type = "info",
  side = "top",
  align = "center",
  className = "",
  iconClassName = "",
  interactive = false,
  iconSize = 18,
}: HelpTooltipProps) {
  const icons = {
    info: <Info size={iconSize} className={cn("text-blue-500", iconClassName)} />,
    help: <HelpCircle size={iconSize} className={cn("text-primary", iconClassName)} />,
    warning: <AlertCircle size={iconSize} className={cn("text-amber-500", iconClassName)} />,
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild className="cursor-help">
          <span className={cn("inline-flex items-center", className)}>
            {icons[type]}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "max-w-sm p-2 text-sm font-normal",
            interactive && "cursor-auto select-text"
          )}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Composant ContextualHelp qui place une InfoBulle à côté du contenu
 */
interface ContextualHelpProps extends HelpTooltipProps {
  children: React.ReactNode;
  position?: "before" | "after";
  gap?: number;
}

export function ContextualHelp({
  children,
  position = "after",
  gap = 2,
  ...tooltipProps
}: ContextualHelpProps) {
  return (
    <span className="inline-flex items-center">
      {position === "before" && (
        <>
          <HelpTooltip {...tooltipProps} />
          <span style={{ display: "inline-block", width: gap }} />
        </>
      )}
      {children}
      {position === "after" && (
        <>
          <span style={{ display: "inline-block", width: gap }} />
          <HelpTooltip {...tooltipProps} />
        </>
      )}
    </span>
  );
}