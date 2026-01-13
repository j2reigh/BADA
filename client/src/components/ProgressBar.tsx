import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
        <span>Question {current} of {total}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
