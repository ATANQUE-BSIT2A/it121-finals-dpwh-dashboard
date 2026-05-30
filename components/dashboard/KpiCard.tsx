'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { LucideIcon } from 'lucide-react';

function useCountUp(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentCount = Math.floor(progress * target);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, isInView]);

  return { count, ref };
}

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: string;
  delay: number;
}

export default function KpiCard({
  icon: Icon,
  label,
  value,
  prefix = '',
  suffix = '',
  color,
  delay,
}: KpiCardProps) {
  const { count, ref } = useCountUp(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card p-6 hover:border-white/15 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-text-muted mb-1">{label}</p>
          <p className="text-3xl font-heading font-bold text-white">
            {prefix}
            {count.toLocaleString()}
            {suffix}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
