"use client";

import useAuth from "@/utils/useAuth";
import { Car, LogOut } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-violet-600 p-3 rounded-full mr-3">
              <Car className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">AmigoExpress</h1>
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Sign Out</h2>
          <p className="text-slate-600 mt-2">Thanks for using AmigoExpress!</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              Are you sure you want to sign out?
            </h3>
            <p className="text-slate-600 text-sm">
              You'll need to sign in again to access your account
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Yes, Sign Out
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 text-slate-700 py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}