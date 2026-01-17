import React from "react";
import { MapPin, Phone, Mail, Globe } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="bg-gray-50 scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-[#8B6F2F]">Contact Us</h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Have questions, feedback, or partnership inquiries?  
            Fill out the form or reach us through the contact details below.
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="mt-2 w-full rounded-xl bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B6F2F]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="mt-2 w-full rounded-xl bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B6F2F]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  rows="5"
                  placeholder="Write your message..."
                  className="mt-2 w-full rounded-xl bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B6F2F]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#8B6F2F] py-3 text-sm font-semibold text-white transition hover:bg-[#745c27]"
              >
                Send Message
              </button>
            </form>
          </div>

        
        </div>
      </div>
    </section>
  );
}
