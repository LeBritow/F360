import { format, subDays, isWeekend } from 'date-fns';

export function obterUltimaDataValida(data = new Date()) {
    while (isWeekend(data)) {
        data = subDays(data, 1);
    }
    return format(data, 'yyyy-MM-dd');
}