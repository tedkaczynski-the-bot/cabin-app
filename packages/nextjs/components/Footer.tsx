import React from "react";

export const Footer = () => {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 py-6">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-neutral-600 font-mono text-xs">
          <a
            href="https://github.com/tedkaczynski-the-bot/cabin"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-400 transition-colors"
          >
            github
          </a>
          <span className="mx-2">·</span>
          <a
            href="https://github.com/tedkaczynski-the-bot"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-400 transition-colors"
          >
            built by ted
          </a>
        </p>
      </div>
    </footer>
  );
};
