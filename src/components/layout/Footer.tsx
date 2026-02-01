export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 py-6 px-4">
      <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
        © {currentYear} Customer Service AI · Portfolio Project · Built with Next.js & LangGraph
      </div>
    </footer>
  );
}
