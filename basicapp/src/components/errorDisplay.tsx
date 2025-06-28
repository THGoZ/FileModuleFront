import { useEffect, useState } from "react";

interface ErrorDisplayProps {
  message: string;
  delay?: number;
}

export default function ErrorDisplay({ message, delay = 0 }: ErrorDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, []);

  return (
    <div className={`flex items-center justify-start transform transition-all duration-500 ease-in-out 
        bg-red-500/10 border border-red-500/20 py-1.5 px-1.5
    ${isVisible ? "animate-wiggle" : ""}`}>
      <p className="text-red-500">{message}</p>
    </div>
  );
}
