/**
 * calendar.js - Lógica de calendario semanal (Lunes a Viernes) para Waldrige Renovation LLC
 */

import { i18n, t } from './i18n.js';

export class WeekCalendar {
  constructor() {
    this.currentDate = new Date();
    // Iniciar con la semana actual
    this.currentMonday = this.getMondayOfWeek(this.currentDate);
    this.subscribers = [];

    // Reaccionar a cambios de idioma
    i18n.subscribe(() => {
      this.notify();
    });
  }

  // Obtener el lunes de la semana para una fecha dada
  getMondayOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb
    // Semana de Lunes a Viernes (empieza en Lunes = 1)
    // Si es domingo (0), el lunes fue hace 6 días
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    const days = this.getWeekDays();
    this.subscribers.forEach(cb => cb(days, this.getWeekLabel()));
  }

  // Avanzar una semana
  nextWeek() {
    const next = new Date(this.currentMonday);
    next.setDate(this.currentMonday.getDate() + 7);
    this.currentMonday = next;
    this.notify();
  }

  // Retroceder una semana
  prevWeek() {
    const prev = new Date(this.currentMonday);
    prev.setDate(this.currentMonday.getDate() - 7);
    this.currentMonday = prev;
    this.notify();
  }

  // Ir a la semana actual de hoy
  goToToday() {
    this.currentMonday = this.getMondayOfWeek(new Date());
    this.notify();
  }

  // Ir a una fecha específica
  goToDate(dateStr) {
    if (!dateStr) return;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
      this.currentMonday = this.getMondayOfWeek(targetDate);
      this.notify();
    }
  }

  // Retorna los 5 días laborables oficiales: Lunes a Viernes (Lunes = 0 a Viernes = 4)
  getWeekDays() {
    const lang = i18n.getLanguage();
    const isEn = lang === 'en';

    const dayNames = isEn 
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      : ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      
    const shortNames = isEn
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

    const monthNames = isEn
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const fullMonths = isEn
      ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const days = [];
    const todayStr = this.formatDateISO(new Date());

    // Exactamente 5 días: Lunes a Viernes
    for (let i = 0; i < 5; i++) {
      const dayDate = new Date(this.currentMonday);
      dayDate.setDate(this.currentMonday.getDate() + i);

      const iso = this.formatDateISO(dayDate);
      const dayNum = dayDate.getDate();
      const monthStr = monthNames[dayDate.getMonth()];
      const fullMonth = fullMonths[dayDate.getMonth()];

      const fullDateFormatted = isEn
        ? `${dayNames[i]}, ${fullMonth} ${dayNum}`
        : `${dayNames[i]} ${dayNum} de ${fullMonth}`;

      days.push({
        index: i,
        dayName: dayNames[i],
        shortName: shortNames[i],
        dateFormatted: `${dayNum} ${monthStr}`,
        fullDateFormatted: fullDateFormatted,
        dateISO: iso,
        dateObj: dayDate,
        isToday: iso === todayStr
      });
    }

    return days;
  }

  // Etiqueta legible de la semana completa (Lunes a Viernes)
  getWeekLabel() {
    const days = this.getWeekDays();
    const start = days[0];
    const end = days[4]; // Viernes

    const isEn = i18n.getLanguage() === 'en';

    const monthsFull = isEn
      ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const startMonth = monthsFull[start.dateObj.getMonth()];
    const endMonth = monthsFull[end.dateObj.getMonth()];
    const year = end.dateObj.getFullYear();

    if (startMonth === endMonth) {
      return isEn
        ? `Week of ${startMonth} ${start.dateObj.getDate()} - ${end.dateObj.getDate()}, ${year}`
        : `Semana del ${start.dateObj.getDate()} al ${end.dateObj.getDate()} de ${startMonth}, ${year}`;
    } else {
      return isEn
        ? `Week of ${startMonth} ${start.dateObj.getDate()} - ${endMonth} ${end.dateObj.getDate()}, ${year}`
        : `Semana del ${start.dateObj.getDate()} de ${startMonth} al ${end.dateObj.getDate()} de ${endMonth}, ${year}`;
    }
  }

  formatDateISO(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export const calendar = new WeekCalendar();
