import React from "react";

const PLATFORM_POINTS = [
  "Affordable access to property listings across Ghana.",
  "Rent or purchase houses and land with ease.",
  "Agents can list unlimited properties through a subscription model.",
  "A construction portfolio section will showcase completed and ongoing projects.",
];

const SERVICE_AREAS = [
  "Houses for rent or sale",
  "Lands and plots",
  "Office spaces and commercial units",
  "Billboards and advertising spaces",
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-white scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8B6F2F]/70">
            Real View Estate and Construction Agency
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            About Us
          </h2>
          <p className="mt-4 mx-auto max-w-3xl text-gray-600">
            Real View helps you discover your new home or property across Ghana
            while connecting you with trusted construction experts. Building on
            trust, we deliver a seamless experience from first consultation to
            final handover.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              We publicize and advertise houses for rent or sale, lands, office
              spaces, billboards, and more across the country. Our team includes
              experienced professionals in construction, project management, and
              property marketing, so every client gets guidance that is practical
              and transparent.
            </p>
            <p>
              The Real View Estate and Construction platform is designed as an
              all-in-one solution for property discovery, purchase, and building.
              It streamlines the process of finding a new home, improves
              transparency, and connects clients with reliable construction
              services.
            </p>

            <div className="rounded-2xl border border-[#8B6F2F]/20 bg-[#faf7ef] p-6">
              <p className="text-sm font-semibold text-[#8B6F2F]">
                Platform Focus
              </p>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                {PLATFORM_POINTS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#8B6F2F]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                Service Coverage
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
                {SERVICE_AREAS.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm italic text-gray-500">
              "Building on Trust, Elevating Your Future."
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Mission</h3>
              <p className="mt-2 text-gray-600">
                Provide solutions to all needs concerning houses and
                construction, giving clients peace of mind and saving them time
                in the search for a new home.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Vision</h3>
              <p className="mt-2 text-gray-600">
                Satisfy 99.9% of our clients, make living easier and happier,
                and become the people’s favorite in housing solutions.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Ethics</h3>
              <p className="mt-2 text-gray-600">
                We prioritize customer satisfaction, go the extra mile, and
                deliver stress-free experiences through attention to detail and
                commitment to excellence.
              </p>
            </div>

            <div className="rounded-2xl bg-[#8B6F2F] p-6 text-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                Leadership
              </p>
              <p className="mt-2 text-lg font-semibold">
                Ibrahim Amadu, CEO/MD
              </p>
              <p className="mt-2 text-sm text-white/80">
                Dedicated to delivering trusted property solutions and quality
                construction across Ghana.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
