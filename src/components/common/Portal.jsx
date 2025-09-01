import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children, className = "" }) {
  const [portalElement, setPortalElement] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Create a div for the portal
    const element = document.createElement("div");
    element.id = "portal-root";
    element.className = className;
    document.body.appendChild(element);
    setPortalElement(element);
    setMounted(true);

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    // Cleanup
    return () => {
      document.body.removeChild(element);
      document.body.style.overflow = "unset";
    };
  }, [className]);

  useEffect(() => {
    if (portalElement && mounted) {
      portalElement.className = `portal-container ${className}`;
    }
  }, [className, portalElement, mounted]);

  if (!portalElement) return null;

  return createPortal(children, portalElement);
}
