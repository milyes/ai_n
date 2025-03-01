
import React from "react";
import { useTheme } from "@/lib/context";
import { Toggle } from "@/components/ui/toggle";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();
  
  return (
    <Toggle 
      pressed={mode === 'dark'} 
      onPressedChange={toggleTheme}
      aria-label="Toggle theme"
      className="p-2"
    >
      {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Toggle>
  );
}
