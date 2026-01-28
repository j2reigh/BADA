import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export default function TypewriterText({
  phrases,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2000,
  className = "",
}: TypewriterTextProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (displayedText.length < currentPhrase.length) {
            setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
          } else {
            // Finished typing, pause then delete
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          // Deleting
          if (displayedText.length > 0) {
            setDisplayedText(displayedText.slice(0, -1));
          } else {
            // Finished deleting, move to next phrase
            setIsDeleting(false);
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        className="inline-block w-[3px] h-[1em] bg-current ml-1 align-middle"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      />
    </span>
  );
}
