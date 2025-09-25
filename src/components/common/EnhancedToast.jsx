import { toast } from "react-toastify";

export const showSuccessToast = (message) => {
  toast.success(message, {
    className: "success-animation",
    progressClassName: "progress-bar",
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    className: "error-animation",
  });
};

export const showActionToast = (message, actionText, onAction) => {
  toast.info(
    <div className="flex items-center justify-between">
      <span>{message}</span>
      <button
        onClick={onAction}
        className="ml-4 px-3 py-1 bg-white text-blue-600 rounded text-sm font-medium hover:bg-gray-50"
      >
        {actionText}
      </button>
    </div>,
    {
      autoClose: false,
      closeOnClick: false,
    }
  );
};
