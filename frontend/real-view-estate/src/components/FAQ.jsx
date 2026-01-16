import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How can I list my property on Real View?",
    a: "Create an account, go to your dashboard, and submit your property details for review before publishing.",
  },
  {
    q: "Do I need to pay to post a property?",
    a: "Basic listings are free. Premium listings with higher visibility are available at a small fee.",
  },
  {
    q: "Can I contact the property owner directly?",
    a: "Yes, once logged in, you can contact property owners through our secure messaging system.",
  },
  {
    q: "How do I reset my password?",
    a: "Click on “Forgot password” on the login page and follow the instructions sent to your email.",
  },
  {
    q: "Is Real View available outside Ghana?",
    a: "Currently we focus on Ghana, but international expansion is in progress.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="bg-[#fafafa] scroll-mt-24 py-24">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-semibold text-[#8B6F2F]">
            FAQ / Help Center
          </h2>
          <p className="mt-4 text-gray-500">
            Clear answers to common questions about using RealView.
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-10">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index}>
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-lg font-medium text-gray-900">
                    {item.q}
                  </span>
                  {isOpen ? (
                    <Minus className="h-5 w-5 text-[#8B6F2F]" />
                  ) : (
                    <Plus className="h-5 w-5 text-[#8B6F2F]" />
                  )}
                </button>

                {isOpen && (
                  <p className="mt-4 max-w-3xl text-gray-600 leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
