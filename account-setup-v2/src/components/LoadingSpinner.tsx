import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
  message?: string;
}

/**
 * Enterprise-grade loading spinner component
 * Provides consistent loading states across the application
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  overlay = false,
  message = 'Loading...'
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'small': return '24px';
      case 'large': return '64px';
      default: return '48px';
    }
  };

  const spinner = (
    <div className="flex flex-column align-items-center justify-content-center gap-3">
      <ProgressSpinner 
        style={{ width: getSpinnerSize(), height: getSpinnerSize() }}
        strokeWidth="4"
        animationDuration="1s"
      />
      {message && (
        <span className="text-600 text-sm font-medium">{message}</span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div 
        className="loading-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(2px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className="loading-container p-4">
      {spinner}
    </div>
  );
};

/**
 * Form skeleton for loading states
 */
export const FormSkeleton: React.FC = () => {
  return (
    <div className="form-skeleton p-4">
      <Skeleton width="100%" height="2rem" className="mb-3" />
      <div className="grid">
        <div className="col-12 md:col-6">
          <Skeleton width="80px" height="1rem" className="mb-2" />
          <Skeleton width="100%" height="2.5rem" className="mb-3" />
        </div>
        <div className="col-12 md:col-6">
          <Skeleton width="80px" height="1rem" className="mb-2" />
          <Skeleton width="100%" height="2.5rem" className="mb-3" />
        </div>
        <div className="col-12">
          <Skeleton width="100px" height="1rem" className="mb-2" />
          <Skeleton width="100%" height="2.5rem" className="mb-3" />
        </div>
        <div className="col-12 md:col-4">
          <Skeleton width="60px" height="1rem" className="mb-2" />
          <Skeleton width="100%" height="2.5rem" className="mb-3" />
        </div>
        <div className="col-12 md:col-4">
          <Skeleton width="90px" height="1rem" className="mb-2" />
          <Skeleton width="100%" height="2.5rem" className="mb-3" />
        </div>
        <div className="col-12 md:col-4">
          <Skeleton width="70px" height="1rem" className="mb-2" />
          <Skeleton width="100%" height="2.5rem" className="mb-3" />
        </div>
      </div>
      <div className="flex justify-content-end mt-4">
        <Skeleton width="100px" height="2.5rem" />
      </div>
    </div>
  );
};

/**
 * Table skeleton for data loading
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="table-skeleton">
      <div className="flex mb-3">
        <Skeleton width="150px" height="2rem" className="mr-2" />
        <Skeleton width="120px" height="2rem" className="mr-2" />
        <Skeleton width="100px" height="2rem" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex mb-2">
          <Skeleton width="150px" height="1.5rem" className="mr-2" />
          <Skeleton width="120px" height="1.5rem" className="mr-2" />
          <Skeleton width="100px" height="1.5rem" />
        </div>
      ))}
    </div>
  );
};

/**
 * Card skeleton for content loading
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div className="card-skeleton p-4 border-1 border-200 border-round">
      <Skeleton width="200px" height="1.5rem" className="mb-3" />
      <Skeleton width="100%" height="1rem" className="mb-2" />
      <Skeleton width="80%" height="1rem" className="mb-2" />
      <Skeleton width="60%" height="1rem" className="mb-3" />
      <div className="flex justify-content-between">
        <Skeleton width="80px" height="2rem" />
        <Skeleton width="100px" height="2rem" />
      </div>
    </div>
  );
};