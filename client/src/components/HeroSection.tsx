import { motion } from "framer-motion";
import { TrendingUp, Clock, BarChart3 } from "lucide-react";

interface HeroSectionProps {
  title: string;
  role: string;
  timeline: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  salaryIndia: string;
  salaryUS: string;
  description: string;
}

const difficultyColors = {
  Beginner: "from-emerald-50 to-emerald-100/50 border-emerald-200",
  Intermediate: "from-blue-50 to-blue-100/50 border-blue-200",
  Advanced: "from-purple-50 to-purple-100/50 border-purple-200",
};

const difficultyBadgeColors = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-purple-100 text-purple-700",
};

export function HeroSection({
  title,
  role,
  timeline,
  difficulty,
  salaryIndia,
  salaryUS,
  description,
}: HeroSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${difficultyColors[difficulty]} border rounded-xl p-8 md:p-12 mb-8`}
    >
      <div className="max-w-4xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`inline-block px-4 py-2 rounded-full font-medium text-sm mb-4 ${difficultyBadgeColors[difficulty]}`}
        >
          {difficulty} Level
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-foreground mb-2"
        >
          {title}
        </motion.h1>

        {/* Role */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-lg text-muted-foreground mb-6"
        >
          {role}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-base text-foreground mb-8 max-w-2xl"
        >
          {description}
        </motion.p>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Timeline */}
          <div className="flex items-start gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Timeline
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">
                {timeline}
              </p>
            </div>
          </div>

          {/* Salary India */}
          <div className="flex items-start gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Salary (India)
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">
                {salaryIndia}
              </p>
            </div>
          </div>

          {/* Salary US */}
          <div className="flex items-start gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Salary (US)
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">
                {salaryUS}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
