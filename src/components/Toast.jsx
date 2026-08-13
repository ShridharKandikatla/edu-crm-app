import { useToast } from '../context/ToastContext';
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineX,
} from 'react-icons/hi';

const typeConfig = {
  success: { bg: 'bg-emerald-50 dark:bg-emerald-900/70', border: 'border-emerald-500', text: 'text-emerald-800 dark:text-emerald-300', Icon: HiOutlineCheckCircle },
  error: { bg: 'bg-red-50 dark:bg-red-900/70', border: 'border-red-500', text: 'text-red-800 dark:text-red-300', Icon: HiOutlineExclamationCircle },
  warning: { bg: 'bg-amber-50 dark:bg-amber-900/70', border: 'border-amber-500', text: 'text-amber-800 dark:text-amber-300', Icon: HiOutlineExclamationCircle },
  info: { bg: 'bg-blue-50 dark:bg-blue-900/70', border: 'border-blue-500', text: 'text-blue-800 dark:text-blue-300', Icon: HiOutlineInformationCircle },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-[80px] right-6 z-[9999] flex flex-col gap-2 max-w-[400px]" role="alert" aria-live="polite">
      {toasts.map(t => {
        const cfg = typeConfig[t.type] || typeConfig.info;
        const Icon = cfg.Icon;
        return (
          <div
            key={t.id}
            role="status"
            className={`flex items-center gap-2.5 px-4 py-3 ${cfg.bg} border ${cfg.border} rounded-[10px] shadow-md animate-[slideInRight_0.3s_ease-out] ${cfg.text} text-[0.8125rem] font-medium`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Close"
              className={`bg-transparent border-none cursor-pointer p-0.5 flex ${cfg.text} opacity-70`}
            >
              <HiOutlineX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
