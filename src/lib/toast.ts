import { toast } from 'sonner';

export const toastSuccess = (message: string, description?: string) =>
  toast.success(message, { description, duration: 4000 });

export const toastError = (message: string, description?: string) =>
  toast.error(message, { description, duration: 5000 });

export const toastInfo = (message: string, description?: string) =>
  toast.info(message, { description, duration: 3000 });

export const toastWarning = (message: string, description?: string) =>
  toast.warning(message, { description, duration: 4000 });

// Specific app-level toasts
export const toastShareSuccess = () =>
  toastSuccess('Chia sẻ thành công!', 'Tài liệu đã được mở khóa');

export const toastShareError = () =>
  toastError('Chia sẻ thất bại', 'Vui lòng thử lại');

export const toastCopied = () =>
  toastSuccess('Đã sao chép link!');
