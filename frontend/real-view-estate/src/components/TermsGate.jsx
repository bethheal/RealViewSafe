import React, { useEffect, useState } from "react";
import Button from "./ui/Button";
import { termsService } from "../services/terms.service";

const STORAGE_KEY = "rv_terms_accepted_v1";

export default function TermsGate({ children }) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY) === "true";
    setOpen(!accepted);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, ready]);

  const accept = async () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    try {
      await termsService.accept();
    } catch {}
  };

  return (
    <>
      {children}
      {ready && open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="border-b px-6 py-5">
              <p className="text-xs font-extrabold tracking-widest text-gray-500">
                REAL VIEW ESTATE & CONSTRUCTION AGENCY
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
                Terms of Use & Disclaimer
              </h2>
              <p className="mt-2 text-sm font-semibold text-gray-600">
                You must agree to continue using this platform.
              </p>
            </div>

            <div className="space-y-4 px-6 py-5 text-sm text-gray-800">
              <div>
                <p className="font-extrabold">1. Independent Decisions</p>
                <p className="mt-1">
                  Real View provides property listings, marketing, and construction services only.
                  All inspections, payments, and agreements with agents, owners, or third parties
                  are made at the user’s own discretion and responsibility.
                </p>
              </div>

              <div>
                <p className="font-extrabold">2. Stay Alert & Vigilant</p>
                <p className="mt-1">Users are advised to:</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Verify all property details</li>
                  <li>Inspect properties before making payments</li>
                  <li>Avoid rushed financial decisions</li>
                  <li>Keep proper documentation</li>
                </ul>
                <p className="mt-2">
                  Real View is not responsible for losses due to negligence or failure to verify information.
                </p>
              </div>

              <div>
                <p className="font-extrabold">3. Fraud Prevention Notice</p>
                <p className="mt-1">If you suspect:</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Fake listings</li>
                  <li>False representation</li>
                  <li>Impersonation of Real View staff</li>
                  <li>Any fraudulent activity</li>
                </ul>
                <p className="mt-2">Report immediately to the police and notify Real View management.</p>
              </div>

              <div>
                <p className="font-extrabold">4. Verification of Representatives</p>
                <p className="mt-1">
                  Always verify anyone claiming to represent Real View via official office contacts.
                  Do not rely solely on calls, social media, or WhatsApp.
                </p>
              </div>

              <div>
                <p className="font-extrabold">5. Process Updates</p>
                <p className="mt-1">Platform processes and features may change as Real View grows.</p>
              </div>

              <div>
                <p className="font-extrabold">6. Third-Party Limitation</p>
                <p className="mt-1">
                  Real View is not liable for independent agreements made outside official procedures.
                </p>
              </div>

              <div>
                <p className="font-extrabold">7. Agreement</p>
                <p className="mt-1">
                  By using this platform, you acknowledge the risks and agree to act responsibly.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-gray-600">
                By clicking “I Agree”, you confirm you understand these terms.
              </p>
              <Button onClick={accept} className="w-full sm:w-auto">
                I Agree
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
