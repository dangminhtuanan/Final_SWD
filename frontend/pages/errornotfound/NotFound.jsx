import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 overflow-hidden relative">
      {/* Subtle red glow blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[350px] h-[350px] bg-red-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] bg-red-50 rounded-full blur-3xl opacity-80 pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* 404 number */}
        <div className="relative inline-block">
          <h1 className="text-[9rem] sm:text-[12rem] font-black text-red-600 leading-none select-none drop-shadow-[0_4px_32px_rgba(220,38,38,0.25)]">
            404
          </h1>
          {/* Shadow layer */}
          <span className="absolute inset-0 text-[9rem] sm:text-[12rem] font-black text-red-200 blur-sm leading-none select-none -z-10">
            404
          </span>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 my-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300" />
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-wide">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-10">
          The page you're looking for has been removed,<br className="hidden sm:block" />
          renamed, or never existed.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-8 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-md transition-all duration-200 hover:scale-105"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl border border-gray-300 transition-all duration-200 hover:scale-105"
          >
            ← Go Back
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-12 text-gray-400 text-sm">
          Error code: <span className="font-mono text-gray-500">HTTP 404 Not Found</span>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
