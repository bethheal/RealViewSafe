import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // TODO: Send to Sentry or error tracking service
    // Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="max-w-md bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-600 text-sm mb-4">
              We're sorry for the inconvenience. Please try refreshing the page or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#8B6F2F] text-white font-semibold py-2 rounded-lg hover:bg-[#7a6128]"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
