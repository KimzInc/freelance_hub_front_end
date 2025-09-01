import { Link } from "react-router-dom";
import { useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Subscription logic would go here
    alert(`Thank you for subscribing with: ${email}`);
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand / About */}
        <div className="lg:col-span-1">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold text-white">Freelance Hub</h2>
            <span className="ml-2 text-yellow-400">★</span>
          </div>
          <p className="text-sm leading-6 mb-4">
            A platform to discover and purchase high-quality projects, or
            request custom solutions tailored to your needs.
          </p>
          <div className="flex items-center mt-2">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <span className="text-xs">24/7 Support Available</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-yellow-500">
            Explore
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                to="/"
                className="text-sm hover:text-white transition-colors duration-200 flex items-center group"
              >
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/projects"
                className="text-sm hover:text-white transition-colors duration-200 flex items-center group"
              >
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                Projects
              </Link>
            </li>
            <li>
              <Link
                to="/custom-request"
                className="text-sm hover:text-white transition-colors duration-200 flex items-center group"
              >
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                Custom Request
              </Link>
            </li>
            <li>
              <Link
                to="/how-it-works"
                className="text-sm hover:text-white transition-colors duration-200 flex items-center group"
              >
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                How It Works
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-yellow-500">
            Resources
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="text-sm hover:text-white transition-colors duration-200 flex items-center group"
              >
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                Help Center
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm hover:text-white transition-colors duration-200 flex items-center group"
              >
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                Blog
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm hover:text-white transition-colors duration-200 flex items-center group"
              >
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                Community
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm hover:text-white transition-colors duration-200 flex items-center group"
              >
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                Success Stories
              </a>
            </li>
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-yellow-500">
            Stay Updated
          </h3>
          <p className="text-sm mb-4">
            Subscribe to our newsletter for the latest updates and offers.
          </p>

          <form onSubmit={handleSubscribe} className="mb-6">
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 w-full text-gray-900 text-sm rounded-l focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium py-2 px-4 rounded-r transition-colors duration-200"
              >
                Join
              </button>
            </div>
          </form>

          <div>
            <p className="text-sm mb-2">Need help? Reach us at:</p>
            <p className="text-sm mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              support@freelancehub.com
            </p>

            <div className="flex space-x-4 mt-4">
              <a
                href="https://facebook.com"
                className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-500 transition-colors duration-200 group"
                aria-label="Facebook"
              >
                <svg
                  className="h-4 w-4 text-gray-300 group-hover:text-gray-900"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://x.com/kimzaf"
                className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-500 transition-colors duration-200 group"
                aria-label="Twitter"
              >
                <svg
                  className="h-4 w-4 text-gray-300 group-hover:text-gray-900"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-500 transition-colors duration-200 group"
                aria-label="YouTube"
              >
                <svg
                  className="h-4 w-4 text-gray-300 group-hover:text-gray-900"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-yellow-500 transition-colors duration-200 group"
                aria-label="LinkedIn"
              >
                <svg
                  className="h-4 w-4 text-gray-300 group-hover:text-gray-900"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 mt-8 pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © {currentYear} Freelance Hub. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
