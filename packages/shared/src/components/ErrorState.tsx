interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center">
      <p className="text-rose-600 text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-xs text-rose-600 underline hover:text-rose-700 cursor-pointer"
        >
          Try again
        </button>
      )}
    </div>
  );
}
