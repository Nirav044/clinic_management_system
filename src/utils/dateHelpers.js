import { format, formatDistanceToNow, isToday, isYesterday, parseISO, differenceInYears } from 'date-fns';

export const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, 'dd MMM yyyy');
};

export const formatDateShort = (dateStr) => {
    if (!dateStr) return '-';
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'dd MMM');
};

export const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, 'hh:mm a');
};

export const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return formatDistanceToNow(date, { addSuffix: true });
};

export const getAge = (birthDateStr) => {
    if (!birthDateStr) return null;
    const date = typeof birthDateStr === 'string' ? parseISO(birthDateStr) : birthDateStr;
    return differenceInYears(new Date(), date);
};

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

export const getCurrentTimeStr = () => {
    return new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};
