import React from 'react'
import SearchCard from "./SearchCard";

export default function Hero() {
  return (
    <section id="home"
      className="relative scroll-mt-24 flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80)",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-6xl px-6">
        <h2 className="mb-10 text-center text-4xl font-bold tracking-tight text-white md:text-5xl">
          Real View <span className="text-orange-400">Estate</span>
        </h2>

        <SearchCard />
      </div>
    </section>
  );
}
