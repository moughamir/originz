import { motion } from "framer-motion";
import { CountUp } from "@/components/common/count-up";

interface SocialProofItemProps {
  end: number;
  suffix?: string;
  decimals?: number;
  label: string;
}

export function SocialProofItem({ end, suffix, decimals, label }: SocialProofItemProps) {
  return (
    <motion.li
      className="text-center"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <motion.div
        className="text-2xl font-semibold"
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        }}
      >
        <CountUp end={end} suffix={suffix} decimals={decimals} />
      </motion.div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.li>
  );
}
