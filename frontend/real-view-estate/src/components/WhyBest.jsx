import React from "react";
import {
  UserCog,
  Wrench,
  Headphones,
  Settings,
  Star,
  ThumbsUp,
} from "lucide-react";
import FeatureCard from "./FeaturedCard";

const FEATURES = [
  {
    icon: UserCog,
    title: "Expert Technicians",
    description:
      "Usage of the Internet is becoming more common due to rapid advancement of technology and power.",
  },
  {
    icon: Wrench,
    title: "Professional Service",
    description:
      "Usage of the Internet is becoming more common due to rapid advancement of technology and power.",
  },
  {
    icon: Headphones,
    title: "Great Support",
    description:
      "Usage of the Internet is becoming more common due to rapid advancement of technology and power.",
  },
  {
    icon: Settings,
    title: "Technical Skills",
    description:
      "Usage of the Internet is becoming more common due to rapid advancement of technology and power.",
  },
  {
    icon: Star,
    title: "Highly Recommended",
    description:
      "Usage of the Internet is becoming more common due to rapid advancement of technology and power.",
    highlight: true,
  },
  {
    icon: ThumbsUp,
    title: "Positive Reviews",
    description:
      "Usage of the Internet is becoming more common due to rapid advancement of technology and power.",
  },
];

export default function WhyBest() {
  return (
    <section id='services' className="bg-gray-50 scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Why we are the best
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Who are in extremely love with eco friendly system.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(
            ({ icon: Icon, title, description, highlight }, index) => (
              <FeatureCard
                key={index}
                icon={<Icon size={30} />}
                title={title}
                description={description}
                highlight={highlight}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}
