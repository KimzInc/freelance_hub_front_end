import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { PayPalButtons } from "@paypal/react-paypal-js";
import Portal from "../common/Portal";

import {
  createPayPalOrderCustomRequest,
  capturePayPalOrder,
} from "../services/projects";

export default function CustomRequestPurchaseModal({ request, onClose }) {
  const [terms, setTerms] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const remaining = request.total_price - request.paid_amount;

  return (
    <Portal className="modal-container">
      <div
        className="modal-backdrop"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-content">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500"
          >
            ×
          </button>

          <h2 className="text-xl font-bold mb-4">Custom Request</h2>
          <p className="text-gray-600 mb-2">
            Description: {request.description}
          </p>
          <p className="text-gray-600 mb-2">
            Total Price: ${request.total_price}
          </p>
          <p className="text-gray-600 mb-4">
            Already Paid: ${request.paid_amount} <br />
            Remaining: ${remaining}
          </p>

          <label className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
            <span className="ml-2 text-sm">
              I accept the terms and conditions for this custom request.
            </span>
          </label>

          {terms && (
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={async () => {
                try {
                  const { id } = await createPayPalOrderCustomRequest(
                    request.id
                  );
                  return id;
                } catch (err) {
                  toast.error("Failed to create PayPal order");
                  console.error(err);
                }
              }}
              onApprove={async (data) => {
                try {
                  await capturePayPalOrder(data.orderID);
                  toast.success("Deposit paid successful!");
                  onClose();
                  window.location.href = `/request/${request.id}`;
                } catch (err) {
                  toast.error("Payment capture failed");
                  console.error(err);
                }
              }}
            />
          )}

          <button onClick={onClose} className="w-full btn-secondary mt-4">
            Close
          </button>
        </div>
      </div>
    </Portal>
  );
}
