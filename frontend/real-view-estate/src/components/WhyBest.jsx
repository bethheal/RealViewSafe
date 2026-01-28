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
    title: "Why We Are the Best",
    description:
      "We prioritize excellence, transparency, and affordability in every project, delivering expert guidance and quality workmanship from start to finish.",
  },
  {
    icon: Wrench,
    title: "Our Expertise",
    description:
      "Years of construction and real estate experience help us deliver tailored solutions across residential and commercial projects.",
  },
  {
    icon: Headphones,
    title: "Our Professional Services",
    description:
      "House rentals, sales, land acquisitions, commercial leasing, plus end-to-end construction planning and execution.",
  },
  {
    icon: Settings,
    title: "Get Support",
    description:
      "Reach our dedicated support team by phone, email, or live chat for help with listings, purchases, or consultations.",
  },
  {
    icon: Star,
    title: "Technical Skills",
    description:
      "We use modern construction methods, sustainable practices, and digital marketing to boost accuracy and efficiency.",
  },
  {
    icon: ThumbsUp,
    title: "Highly Recommended",
    description:
      "Clients recommend us for professionalism, attention to detail, and unwavering dedication to their projects.",
    // highlight: true,
  },
  {
    icon: ThumbsUp,
    title: "Positive Reviews",
    description:
      "Consistent praise for transparent communication, quality results, and affordability.",
  },
];

export default function WhyBest() {
  return (
    <section id="services" className="bg-gray-50 scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Why we are the best
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Real View Estate and Construction is built on trust, results, and a
            client-first mindset.
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
                // highlight={highlight}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}
