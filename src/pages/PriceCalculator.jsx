import { useState, useEffect } from "react";
import { getPriceQuote } from "../components/services/requests";

export default function PriceCalculator() {
  const [projectType, setProjectType] = useState("non-tech");
  const [pages, setPages] = useState(1);
  const [timeframe, setTimeframe] = useState(24); // default to normal (>12h)
  const [price, setPrice] = useState(0);
  const [pricePerPage, setPricePerPage] = useState(0);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const data = await getPriceQuote(projectType, pages, timeframe);
        setPricePerPage(parseFloat(data.price_per_page));
        setPrice(parseFloat(data.total_price));
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };

    fetchPrice();
  }, [projectType, pages, timeframe]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Project Price Calculator
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="space-y-6">
          {/* Project Type */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Project Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  projectType === "non-tech"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setProjectType("non-tech")}
              >
                <div className="text-3xl mb-2">📝</div>
                <h4 className="font-medium">Non-Technical</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Essays, Research, Writing
                </p>
              </div>
              <div
                className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  projectType === "tech"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setProjectType("tech")}
              >
                <div className="text-3xl mb-2">💻</div>
                <h4 className="font-medium">Technical</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Coding, Excel, Data Analysis
                </p>
              </div>
            </div>
          </div>

          {/* Pages & Timeframe */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="pages"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Number of Pages
              </label>
              <input
                type="number"
                id="pages"
                min="1"
                value={pages}
                onChange={(e) => setPages(parseInt(e.target.value) || 1)}
                className="input-field"
              />
            </div>

            <div>
              <label
                htmlFor="timeframe"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Delivery Timeframe
              </label>
              <select
                id="timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(parseInt(e.target.value))}
                className="input-field"
              >
                <option value="12">Urgent (≤ 12 hours)</option>
                <option value="24">Normal (12 hours + )</option>
              </select>
            </div>
          </div>
        </div>

        {/* Result Display */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg p-6 flex flex-col justify-center">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Your Project Estimate
          </h3>

          <div className="text-center mb-6">
            <div className="text-4xl font-bold">${price.toFixed(2)}</div>
            <p className="text-blue-100 mt-2">Total Project Cost</p>
          </div>

          <div className="bg-blue-500 bg-opacity-30 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span>Project Type:</span>
              <span className="font-medium">
                {projectType === "tech" ? "Technical" : "Non-Technical"}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Pages:</span>
              <span className="font-medium">{pages}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Price per page:</span>
              <span className="font-medium">${pricePerPage.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-400 border-opacity-50 font-semibold">
              <span>Total:</span>
              <span>${price.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-blue-200 mb-4">Ready to request this project?</p>
            <a
              href="/custom-request"
              className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Request Project
            </a>
          </div>
        </div>
      </div>

      {/* Project Examples */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Project Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-600 mb-2">
              Non-Technical Projects
            </h4>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Essay</li>
              <li>Research Paper</li>
              <li>Dissertation</li>
              <li>Term paper</li>
              <li>Thesis</li>
              <li>Capstone Project</li>
              <li>Creative Writing</li>
              <li>Content Writing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-600 mb-2">
              Technical Projects
            </h4>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Programming / Code</li>
              <li>Excel Assignment</li>
              <li>Data Analysis</li>
              <li>Finance & Accounting</li>
              <li>Math Solving</li>
              <li>Database Design</li>
              <li>Statistical Analysis</li>
              <li>Simulation Projects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
