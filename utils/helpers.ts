import { toast, ToastOptions } from 'react-toastify';

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const downloadCSV = (data: any[], filename: string = 'export.csv') => {
    if (data.length === 0) {
        toastError("Tidak ada data untuk diekspor.");
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(fieldName => 
                JSON.stringify(row[fieldName], (key, value) => value === null ? '' : value)
            ).join(',')
        )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// --- Toast Notification Service ---

const defaultToastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
};

export const toastSuccess = (message: string) => {
    toast.success(message, defaultToastOptions);
};

export const toastError = (message: string) => {
    toast.error(message, defaultToastOptions);
};

export const toastInfo = (message: string) => {
    toast.info(message, defaultToastOptions);
};
