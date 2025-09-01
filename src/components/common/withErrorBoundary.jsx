import { Component } from "react";
import ErrorBoundary from "./ErrorBoundary";

const withErrorBoundary = (WrappedComponent, boundaryProps = {}) => {
  return class extends Component {
    render() {
      return (
        <ErrorBoundary {...boundaryProps}>
          <WrappedComponent {...this.props} />
        </ErrorBoundary>
      );
    }
  };
};

export default withErrorBoundary;
