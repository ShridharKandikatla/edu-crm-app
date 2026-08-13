export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f0b2e] px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[120px]" />
      </div>
      <div className="relative z-10 text-center" style={{ animation: 'fadeInUp 0.5s ease' }}>
        <div className="mb-6 text-8xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">404</div>
        <h1 className="mb-2 text-xl font-bold text-white">Page Not Found</h1>
        <p className="mb-8 text-indigo-200/50 dark:text-indigo-300/60">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
