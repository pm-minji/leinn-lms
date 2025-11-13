'use client';

import { Component, ReactNode } from 'react';
import { ErrorMessage } from './ErrorMessage';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <ErrorMessage
            title="컴포넌트 오류"
            message={
              this.state.error?.message ||
              '이 섹션을 표시하는 중 오류가 발생했습니다.'
            }
          />
          <div className="mt-4">
            <Button onClick={this.handleReset} variant="outline" size="sm">
              다시 시도
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
