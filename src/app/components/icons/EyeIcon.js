// src/app/components/icons/EyeIcon.js
export default function EyeIcon({ className = "h-6 w-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.18l3.75-5.25a1.65 1.65 0 0 1 2.816-.025l.875.933c.15.16.344.25.544.25h.01c.2 0 .393-.09.544-.25l.875-.933a1.65 1.65 0 0 1 2.817.025l3.75 5.25a1.651 1.651 0 0 1 0 1.18l-3.75 5.25a1.65 1.65 0 0 1-2.816.025l-.875-.933a.656.656 0 0 0-1.088 0l-.875.933a1.65 1.65 0 0 1-2.817-.025L.664 10.59Z" clipRule="evenodd" />
    </svg>
  );
}