import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Enterprise-grade error boundary component
 * Catches JavaScript errors anywhere in the child component tree
 * Logs error details and displays a user-friendly fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // In production, you would send this to your error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container p-4">
          <Card 
            title="Something went wrong"
            className="max-w-screen-md mx-auto mt-8"
            pt={{
              header: { className: 'text-center' },
              content: { className: 'text-center' }
            }}
          >
            <Message 
              severity="error" 
              text="An unexpected error occurred while rendering this component." 
              className="mb-4"
            />
            
            <div className="mb-4">
              <p className="text-700 mb-3">
                We apologize for the inconvenience. This error has been logged and our team will investigate.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-4">
                  <summary className="cursor-pointer text-primary font-semibold mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-gray-100 p-3 border-round text-sm">
                    <strong>Error:</strong> {this.state.error.message}
                    <br />
                    <strong>Stack:</strong>
                    <pre className="mt-2 text-xs overflow-auto">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <>
                        <strong>Component Stack:</strong>
                        <pre className="mt-2 text-xs overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="flex gap-2 justify-content-center">
              <Button 
                label="Try Again" 
                icon="pi pi-refresh"
                onClick={this.handleReset}
                severity="secondary"
              />
              <Button 
                label="Reload Page" 
                icon="pi pi-replay"
                onClick={this.handleReload}
              />
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}