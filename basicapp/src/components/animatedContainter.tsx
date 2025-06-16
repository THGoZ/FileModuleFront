import React, { useEffect, useState } from "react";

interface AnimatedContainerProps {
  children: React.ReactNode;
  delay?: number;
}

export default function AnimatedContainer({
  children,
  delay = 0,
}: AnimatedContainerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    
    setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, []);

  return (
    <div
      className={`flex justify-center transform transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
