"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";
import { useAppTheme } from "@/app/context/ThemeContext";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useAppTheme();
  const sonnerTheme: ToasterProps["theme"] = theme === "light" ? "light" : "dark";

  return (
    <Sonner
      theme={sonnerTheme}
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-border/70 bg-card/90 text-card-foreground backdrop-blur-lg shadow-[0_16px_44px_-24px_var(--glow-strong)]",
          title: "font-medium",
          description: "text-sm text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-secondary text-secondary-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
