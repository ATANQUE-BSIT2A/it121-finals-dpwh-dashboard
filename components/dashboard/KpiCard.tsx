'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { LucideIcon } from 'lucide-react';

function useCountUp(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, [target, duration]);

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

  // Extract RGB from color name
  const getRgb = (name: string) => {
    switch (name) {
      case 'bg-accent-blue': return '59, 130, 246';
      case 'bg-accent-gold': return '245, 158, 11';
      case 'bg-status-completed': return '34, 197, 94';
      case 'bg-status-ongoing': return '59, 130, 246';
      case 'bg-purple-600': return '139, 92, 246';
      default: return '59, 130, 246';
    }
  };
  const iconColorRgb = getRgb(color);

  return (
    <motion.div
      ref={ref}
      className="glass-card p-5 cursor-default"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: `rgba(${iconColorRgb}, 0.18)`,
            border: `1px solid rgba(${iconColorRgb}, 0.30)`
          }}
        >
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
          <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            {prefix}
            {count.toLocaleString()}
            {suffix}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
