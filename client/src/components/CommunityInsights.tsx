import { motion } from "framer-motion";
import { MessageCircle, Users } from "lucide-react";

interface CommunityInsightsProps {
  insights: string[];
  mustMasterFactors: string[];
}

export function CommunityInsights({
  insights,
  mustMasterFactors,
}: CommunityInsightsProps) {
  return (
    <div className="space-y-8">
      {/* Community Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="card-elevated p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            What the Community Says
          </h2>
        </div>

        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="border-l-4 border-primary pl-4 py-2"
            >
              <p className="text-foreground italic">"{insight}"</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Must-Master Factors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
        className="card-elevated p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-accent-foreground" />
          <h2 className="text-2xl font-bold text-foreground">
            Must-Master Factors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mustMasterFactors.map((factor, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="flex items-start gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-foreground text-accent flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <p className="text-foreground text-sm">{factor}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
