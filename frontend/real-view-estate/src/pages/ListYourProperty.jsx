import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { SUBSCRIPTION_PLANS } from "../constants/subscriptionPlans";

const TRIAL_PLAN = {
  key: "TRIAL",
  title: "Free Trial",
  price: "Free for 1 month",
  description: "Start listing immediately and test the platform before subscribing.",
  features: [
    "One month free access for new agents",
    "Post approved properties during trial",
    "Collect leads and buyer inquiries",
  ],
};

const PLANS = [TRIAL_PLAN, ...SUBSCRIPTION_PLANS];

export default function ListYourProperty() {
  return (
    <>
      <Seo
        title="List Your Property - RealViewEstate"
        description="List your property as an agent on Real View and choose a plan based on your listing goals."
        pathname="/list-your-property"
      />

      <section className="bg-[#f5f6f8] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8B6F2F]/70">
              Agent Property Listing
            </p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              List Your Property With Real View
            </h1>
            <p className="mt-4 text-gray-600">
              Choose a listing plan and start publishing properties with pricing from your existing subscription setup.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const isPopular = plan.highlight;
              return (
                <article
                  key={plan.key}
                  className={`rounded-2xl border bg-white shadow-sm ${
                    isPopular ? "border-[#2d6cdf] ring-2 ring-blue-200" : "border-gray-200"
                  }`}
                >
                  <div className="border-b border-gray-100 px-8 py-8">
                    <h2 className="text-3xl font-bold text-gray-900">{plan.title}</h2>
                    <p className="mt-3 text-3xl font-extrabold text-[#2d6cdf]">{plan.price}</p>
                    <p className="mt-3 text-gray-600">{plan.description}</p>
                  </div>

                  <div className="px-8 py-8">
                    <ul className="space-y-3 text-sm text-gray-700">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-3">
                          <span className="mt-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="px-8 pb-8">
                    <Link
                      to="/signup"
                      className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isPopular
                          ? "bg-[#2d6cdf] text-white hover:bg-[#2559b5]"
                          : "border border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      Start With {plan.title}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
