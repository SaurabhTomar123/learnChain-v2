import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";

interface CourseCardProps {
  courseName: string;
  platform: string;
  instructor: string;
  rating: number;
  reviews: string;
  students: string;
  duration: string;
  price: string;
  cheapestPrice: string;
  link: string;
  certificate: string;
  whyBest: string;
  bestFor: string;
  communityReview: string;
}

export function CourseCard({
  courseName,
  platform,
  instructor,
  rating,
  reviews,
  students,
  duration,
  price,
  cheapestPrice,
  link,
  certificate,
  whyBest,
  bestFor,
  communityReview,
}: CourseCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="card-base p-6 border-l-4 border-l-primary"
    >
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-foreground text-base mb-1">
              {courseName}
            </h4>
            <p className="text-sm text-muted-foreground">
              {instructor} • {platform}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 my-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-foreground">{rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Duration:</span>
          <span className="font-medium text-foreground">{duration}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price:</span>
          <div className="text-right">
            <p className="font-medium text-foreground">{price}</p>
            <p className="text-xs text-accent-foreground">Cheapest: {cheapestPrice}</p>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Certificate:</span>
          <span className="font-medium text-foreground">{certificate}</span>
        </div>
      </div>

      {/* Why Best */}
      <div className="mb-4 p-3 bg-secondary rounded">
        <p className="text-sm text-foreground">
          <span className="font-semibold">Why best:</span> {whyBest}
        </p>
      </div>

      {/* Best For */}
      <p className="text-xs text-muted-foreground mb-3">
        <span className="font-semibold">Best for:</span> {bestFor}
      </p>

      {/* Community Review */}
      <p className="text-sm text-foreground italic mb-4 p-3 bg-secondary/50 rounded border-l-2 border-l-primary">
        "{communityReview}"
      </p>

      {/* CTA Button */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
      >
        View Course
        <ExternalLink className="w-4 h-4" />
      </a>
    </motion.div>
  );
}
