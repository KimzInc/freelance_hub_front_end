import { Component } from "react";
import ErrorFallback from "./ErrorFallback";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Log to error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      showDetails: false,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.FallbackComponent) {
        return this.props.FallbackComponent({
          error: this.state.error,
          resetErrorBoundary: this.resetErrorBoundary,
          showDetails: this.state.showDetails,
          onToggleDetails: this.toggleDetails,
        });
      }

      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
          showDetails={this.state.showDetails}
          onToggleDetails={this.toggleDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Add default props
ErrorBoundary.defaultProps = {
  onError: (error, errorInfo) => {
    console.error("Application error:", error, errorInfo);
  },
  onReset: () => {
    // Default reset behavior
  },
};

export default ErrorBoundary;
