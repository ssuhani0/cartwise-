import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
};

function ToastContent({ type, message }) {
  const Icon = icons[type] || icons.info;
  return (
    <div className={cn('flex items-center gap-3 px-2', colors[type])}>
      <Icon className={cn(
        'h-5 w-5 shrink-0',
        type === 'success' && 'text-green-500',
        type === 'error' && 'text-red-500',
        type === 'warning' && 'text-yellow-500',
        type === 'info' && 'text-blue-500',
      )} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function showToast(message, type = 'info') {
  toast.custom(
    (t) => (
      <div
        className={cn(
          'relative flex items-center rounded-xl border bg-card px-4 py-3 shadow-lg',
          'backdrop-blur-md animate-slide-up',
        )}
      >
        <ToastContent type={type} message={message} />
        <button
          onClick={() => toast.dismiss(t.id)}
          className="ml-3 rounded-lg p-1 hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    { duration: 3000 },
  );
}

export function success(message) {
  return showToast(message, 'success');
}

export function error(message) {
  return showToast(message, 'error');
}

export function warning(message) {
  return showToast(message, 'warning');
}

export function info(message) {
  return showToast(message, 'info');
}
