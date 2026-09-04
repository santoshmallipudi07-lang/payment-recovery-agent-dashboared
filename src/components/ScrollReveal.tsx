import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ScrollRevealProps extends HTMLMotionProps<'section'> {
  children: React.ReactNode;
  delay?: number;
  yOffset?: number;
  className?: string;
  margin?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  yOffset = 42,
  className = '',
  margin = '0px 0px -120px 0px',
  ...props
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ 
        once: true, 
        margin: margin,
        amount: 0.15 
      }}
      transition={{
        duration: 0.75,
        delay: delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
};
