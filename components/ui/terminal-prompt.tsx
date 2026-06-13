type TerminalPromptProps = {
  command: string;
  cwd?: string;
  className?: string;
};

export function TerminalPrompt({
  command,
  cwd = "~",
  className = "",
}: TerminalPromptProps) {
  return (
    <p className={`terminal-log text-sm ${className}`}>
      <span className="text-prompt-user">nyrokume</span>
      <span className="text-prompt-host">@arch</span>
      <span className="text-foreground">:</span>
      <span className="text-prompt-path">{cwd}</span>
      <span className="text-foreground">$ </span>
      <span className="text-foreground">{command}</span>
    </p>
  );
}
