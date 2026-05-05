import { format, parseISO, isWithinInterval, addMinutes } from 'date-fns';

export const isOverlapping = (start1, end1, start2, end2) => {
    return (start1 < end2 && start2 < end1);
};

export const isWithinWorkingHours = (time, openingHours) => {
    const day = format(time, 'eee').toLowerCase(); // mon, tue, etc.
    const dayHours = openingHours[day];

    if (!dayHours || !dayHours.open || !dayHours.close) return false;

    const [openH, openM] = dayHours.open.split(':').map(Number);
    const [closeH, closeM] = dayHours.close.split(':').map(Number);

    const openTime = new Date(time);
    openTime.setHours(openH, openM, 0, 0);

    const closeTime = new Date(time);
    closeTime.setHours(closeH, closeM, 0, 0);

    return time >= openTime && time < closeTime;
};
