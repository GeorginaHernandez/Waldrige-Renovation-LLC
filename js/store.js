/**
 * store.js - Manejo de datos, estado y persistencia para Waldrige Renovation LLC
 * Incluye gestión de horas, nóminas, recibos con imágenes, tarjetas bancarias y saldos pendientes.
 */

const STORAGE_KEYS = {
  EMPLOYEES: 'waldrige_employees_v2',
  TIME_ENTRIES: 'waldrige_time_entries_v2',
  SETTINGS: 'waldrige_settings_v2',
  CURRENT_USER: 'waldrige_current_user_v2',
  RECEIPTS: 'waldrige_receipts_v2',
  PAYMENT_CARDS: 'waldrige_cards_v2',
  WEEKLY_PAYMENTS: 'waldrige_weekly_payments_v2'
};

// Configuración por defecto
const DEFAULT_SETTINGS = {
  companyName: 'Waldrige Renovation LLC',
  workStartHour: '08:00',
  workEndHour: '19:00',
  adminPin: 'waldrige2026', // Clave maestra para Administrador y Dueño
  currency: '$',
  overtimeThreshold: 40,
  language: 'es'
};

// Tarjetas y membresías por defecto iniciales de muestra
const DEFAULT_CARDS = [
  {
    id: 'card-hd-pro',
    name: 'The Home Depot Pro Xtra',
    type: 'store_membership', // store_membership | credit | debit
    last4: 'PRO-1048',
    holder: 'Waldrige Renovation LLC',
    notes: 'Dar número telefónico de la empresa en caja para aplicar descuentos de contratista.',
    active: true
  },
  {
    id: 'card-lowes-mvp',
    name: "Lowe's MVP Pro Rewards",
    type: 'store_membership',
    last4: 'MVP-9921',
    holder: 'Waldrige Renovation LLC',
    notes: 'Escanear código de membresía o indicar número de cuenta.',
    active: true
  },
  {
    id: 'card-biz-visa',
    name: 'Visa Business - Tarjeta Corporativa',
    type: 'credit',
    last4: '4892',
    holder: 'Waldrige Renovation LLC',
    notes: 'Uso exclusivo para compras autorizadas de materiales pesados.',
    active: true
  }
];

export function formatDateISO(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateHoursWorked(startTime, endTime, lunchMinutes = 0) {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  if (endTotalMinutes <= startTotalMinutes) return 0;

  const workedMinutes = Math.max(0, endTotalMinutes - startTotalMinutes - (Number(lunchMinutes) || 0));
  const hours = workedMinutes / 60;
  return Math.round(hours * 100) / 100;
}

class DataStore {
  constructor() {
    this.employees = [];
    this.timeEntries = {};
    this.settings = { ...DEFAULT_SETTINGS };
    this.receipts = [];
    this.paymentCards = [];
    this.weeklyPayments = {};
    this.listeners = [];
    this.init();
  }

  init() {
    // 1. Cargar empleados
    const savedEmployees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (savedEmployees) {
      try {
        this.employees = JSON.parse(savedEmployees);
      } catch (e) {
        console.error('Error cargando empleados:', e);
        this.employees = [];
      }
    } else {
      this.employees = [];
      this.saveEmployees();
    }

    // 2. Cargar configuraciones
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      try {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      } catch (e) {
        console.error('Error cargando configuración:', e);
      }
    } else {
      this.saveSettings();
    }

    // 3. Cargar registros de horas
    const savedEntries = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES);
    if (savedEntries) {
      try {
        this.timeEntries = JSON.parse(savedEntries);
      } catch (e) {
        console.error('Error cargando registros de tiempo:', e);
        this.timeEntries = {};
        this.saveTimeEntries();
      }
    } else {
      this.timeEntries = {};
      this.saveTimeEntries();
    }

    // 4. Cargar recibos y gastos
    const savedReceipts = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    if (savedReceipts) {
      try {
        this.receipts = JSON.parse(savedReceipts);
      } catch (e) {
        console.error('Error cargando recibos:', e);
        this.receipts = [];
      }
    } else {
      this.receipts = [];
      this.saveReceipts();
    }

    // 5. Cargar tarjetas bancarias y membresías
    const savedCards = localStorage.getItem(STORAGE_KEYS.PAYMENT_CARDS);
    if (savedCards) {
      try {
        this.paymentCards = JSON.parse(savedCards);
      } catch (e) {
        console.error('Error cargando tarjetas:', e);
        this.paymentCards = [...DEFAULT_CARDS];
      }
    } else {
      this.paymentCards = [...DEFAULT_CARDS];
      this.saveCards();
    }

    // 6. Cargar estados de pagos semanales y saldos
    const savedPayments = localStorage.getItem(STORAGE_KEYS.WEEKLY_PAYMENTS);
    if (savedPayments) {
      try {
        this.weeklyPayments = JSON.parse(savedPayments);
      } catch (e) {
        console.error('Error cargando pagos semanales:', e);
        this.weeklyPayments = {};
      }
    } else {
      this.weeklyPayments = {};
      this.saveWeeklyPayments();
    }
  }

  // Suscriptores para reactividad
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(changeType, payload) {
    this.listeners.forEach(cb => cb(changeType, payload));
  }

  // ==========================================
  // --- Manejo de Empleados ---
  // ==========================================
  saveEmployees() {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(this.employees));
    this.notify('EMPLOYEES_UPDATED', this.employees);
  }

  getEmployees(includeInactive = false) {
    if (includeInactive) return [...this.employees];
    return this.employees.filter(e => e.active);
  }

  getEmployeeById(id) {
    return this.employees.find(e => e.id === id);
  }

  findEmployeeByName(name) {
    if (!name) return null;
    const clean = name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return this.employees.find(e => {
      const empClean = e.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return empClean === clean;
    }) || null;
  }

  addEmployee(employeeData) {
    const newEmp = {
      id: 'emp-' + Date.now(),
      name: employeeData.name.trim(),
      role: employeeData.role ? employeeData.role.trim() : 'Operario de Obra',
      hourlyRate: parseFloat(employeeData.hourlyRate) || 25.00,
      color: employeeData.color || '#3B82F6',
      pin: employeeData.pin ? String(employeeData.pin).trim() : '1234',
      active: true,
      createdAt: formatDateISO(new Date())
    };
    this.employees.push(newEmp);
    this.saveEmployees();
    return newEmp;
  }

  updateEmployee(id, updates) {
    const index = this.employees.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    this.employees[index] = {
      ...this.employees[index],
      ...updates
    };
    this.saveEmployees();
    return this.employees[index];
  }

  deleteEmployee(id) {
    this.employees = this.employees.filter(e => e.id !== id);
    this.saveEmployees();
  }

  // ==========================================
  // --- Manejo de Registros de Horas ---
  // ==========================================
  saveTimeEntries() {
    localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(this.timeEntries));
    this.notify('ENTRIES_UPDATED', this.timeEntries);
  }

  getTimeEntry(employeeId, dateISO) {
    const key = `${employeeId}_${dateISO}`;
    return this.timeEntries[key] || null;
  }

  saveOrUpdateTimeEntry(entryData) {
    const { employeeId, date, startTime, endTime, lunchMinutes, notes, quickHours, address, workDone } = entryData;
    const key = `${employeeId}_${date}`;

    let totalHours = 0;
    if (quickHours !== undefined && quickHours !== null && quickHours !== '') {
      totalHours = Math.round(parseFloat(quickHours) * 100) / 100;
    } else {
      totalHours = calculateHoursWorked(startTime, endTime, lunchMinutes);
    }

    const cleanAddress = address ? address.trim() : (entryData.address || '');
    const cleanWorkDone = workDone ? workDone.trim() : (notes ? notes.trim() : '');

    const entry = {
      id: key,
      employeeId,
      date,
      startTime: startTime || '',
      endTime: endTime || '',
      lunchMinutes: Number(lunchMinutes) || 0,
      totalHours: isNaN(totalHours) ? 0 : totalHours,
      notes: cleanWorkDone,
      address: cleanAddress,
      workDone: cleanWorkDone
    };

    this.timeEntries[key] = entry;
    this.saveTimeEntries();
    return entry;
  }

  deleteTimeEntry(employeeId, dateISO) {
    const key = `${employeeId}_${dateISO}`;
    if (this.timeEntries[key]) {
      delete this.timeEntries[key];
      this.saveTimeEntries();
    }
  }

  // ==========================================
  // --- Resúmenes Semanales (Lun a Vie) ---
  // ==========================================
  getWeeklySummaryForEmployee(employeeId, weekDays) {
    const employee = this.getEmployeeById(employeeId);
    if (!employee) return null;

    let totalHours = 0;
    const daysData = [];

    weekDays.forEach(day => {
      const entry = this.getTimeEntry(employeeId, day.dateISO);
      const hours = entry ? entry.totalHours : 0;
      totalHours += hours;

      daysData.push({
        dayName: day.dayName,
        dateFormatted: day.dateFormatted,
        fullDateFormatted: day.fullDateFormatted,
        dateISO: day.dateISO,
        entry: entry,
        hours: hours,
        earnings: Math.round(hours * employee.hourlyRate * 100) / 100
      });
    });

    totalHours = Math.round(totalHours * 100) / 100;
    const totalEarnings = Math.round(totalHours * employee.hourlyRate * 100) / 100;

    // Obtener información de pago para la semana actual (usamos la fecha del lunes)
    const mondayISO = weekDays[0]?.dateISO || '';
    const payment = this.getWeeklyPayment(employeeId, mondayISO, totalEarnings);

    return {
      employee,
      weekDays: daysData,
      totalHours,
      totalEarnings,
      hourlyRate: employee.hourlyRate,
      mondayISO,
      payment
    };
  }

  getAllEmployeesWeeklySummary(weekDays) {
    const activeEmployees = this.getEmployees(false);
    return activeEmployees.map(emp => this.getWeeklySummaryForEmployee(emp.id, weekDays)).filter(Boolean);
  }

  // ==========================================
  // --- Estado de Pagos Semanales & Saldo ---
  // ==========================================
  saveWeeklyPayments() {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_PAYMENTS, JSON.stringify(this.weeklyPayments));
    this.notify('PAYMENTS_UPDATED', this.weeklyPayments);
  }

  getWeeklyPayment(employeeId, mondayISO, calculatedEarnings = 0) {
    const key = `${employeeId}_${mondayISO}`;
    const record = this.weeklyPayments[key];

    if (!record) {
      return {
        key,
        employeeId,
        mondayISO,
        totalEarnings: calculatedEarnings,
        amountPaid: 0,
        balanceDue: calculatedEarnings,
        status: calculatedEarnings > 0 ? 'pending' : 'paid',
        notes: '',
        paidDate: '',
        recordedBy: ''
      };
    }

    // Asegurar coherencia si los ingresos cambiaron
    const earnings = calculatedEarnings !== undefined ? calculatedEarnings : record.totalEarnings;
    const amountPaid = parseFloat(record.amountPaid) || 0;
    const balanceDue = Math.max(0, Math.round((earnings - amountPaid) * 100) / 100);
    
    let status = record.status;
    if (amountPaid >= earnings && earnings > 0) {
      status = 'paid';
    } else if (amountPaid > 0 && balanceDue > 0) {
      status = 'partial';
    } else if (amountPaid === 0 && earnings > 0) {
      status = 'pending';
    }

    return {
      ...record,
      totalEarnings: earnings,
      amountPaid,
      balanceDue,
      status
    };
  }

  saveWeeklyPayment(employeeId, mondayISO, paymentData) {
    const key = `${employeeId}_${mondayISO}`;
    const totalEarnings = parseFloat(paymentData.totalEarnings) || 0;
    const amountPaid = parseFloat(paymentData.amountPaid) || 0;
    const balanceDue = Math.max(0, Math.round((totalEarnings - amountPaid) * 100) / 100);

    let status = 'pending';
    if (amountPaid >= totalEarnings && totalEarnings > 0) {
      status = 'paid';
    } else if (amountPaid > 0 && balanceDue > 0) {
      status = 'partial';
    }

    const paymentRecord = {
      key,
      employeeId,
      mondayISO,
      totalEarnings,
      amountPaid,
      balanceDue,
      status: paymentData.status || status,
      notes: paymentData.notes ? paymentData.notes.trim() : '',
      paidDate: paymentData.paidDate || formatDateISO(new Date()),
      recordedBy: paymentData.recordedBy || 'ADMIN',
      updatedAt: new Date().toISOString()
    };

    this.weeklyPayments[key] = paymentRecord;
    this.saveWeeklyPayments();
    return paymentRecord;
  }

  // ==========================================
  // --- Manejo de Recibos y Gastos ---
  // ==========================================
  saveReceipts() {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(this.receipts));
    this.notify('RECEIPTS_UPDATED', this.receipts);
  }

  getReceipts(filters = {}) {
    let result = [...this.receipts];

    if (filters.employeeId) {
      result = result.filter(r => r.employeeId === filters.employeeId);
    }
    if (filters.startDate && filters.endDate) {
      result = result.filter(r => r.date >= filters.startDate && r.date <= filters.endDate);
    }
    if (filters.category) {
      result = result.filter(r => r.category === filters.category);
    }

    // Ordenar más recientes primero
    return result.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }

  getReceiptById(id) {
    return this.receipts.find(r => r.id === id);
  }

  addReceipt(receiptData) {
    const employee = this.getEmployeeById(receiptData.employeeId);
    const newReceipt = {
      id: 'rcp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      employeeId: receiptData.employeeId,
      employeeName: employee ? employee.name : (receiptData.employeeName || 'Empleado'),
      employeeColor: employee ? employee.color : '#3B82F6',
      date: receiptData.date || formatDateISO(new Date()),
      storeName: receiptData.storeName ? receiptData.storeName.trim() : 'Comercio General',
      amount: parseFloat(receiptData.amount) || 0,
      category: receiptData.category || 'catMaterials',
      paymentCardId: receiptData.paymentCardId || 'cash',
      paymentCardName: receiptData.paymentCardName || 'Efectivo / Propio',
      notes: receiptData.notes ? receiptData.notes.trim() : '',
      imageBase64: receiptData.imageBase64 || '',
      status: receiptData.status || 'pending', // pending | approved | reimbursed
      createdAt: new Date().toISOString()
    };

    this.receipts.push(newReceipt);
    this.saveReceipts();
    return newReceipt;
  }

  updateReceipt(id, updates) {
    const index = this.receipts.findIndex(r => r.id === id);
    if (index === -1) return null;

    this.receipts[index] = {
      ...this.receipts[index],
      ...updates
    };
    this.saveReceipts();
    return this.receipts[index];
  }

  deleteReceipt(id) {
    this.receipts = this.receipts.filter(r => r.id !== id);
    this.saveReceipts();
  }

  // ==========================================
  // --- Manejo de Tarjetas y Membresías ---
  // ==========================================
  saveCards() {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_CARDS, JSON.stringify(this.paymentCards));
    this.notify('CARDS_UPDATED', this.paymentCards);
  }

  getCards(includeInactive = false) {
    if (includeInactive) return [...this.paymentCards];
    return this.paymentCards.filter(c => c.active !== false);
  }

  getCardById(id) {
    return this.paymentCards.find(c => c.id === id);
  }

  addCard(cardData) {
    const newCard = {
      id: 'card-' + Date.now(),
      name: cardData.name.trim(),
      type: cardData.type || 'store_membership',
      last4: cardData.last4 ? cardData.last4.trim() : '',
      holder: cardData.holder ? cardData.holder.trim() : 'Waldrige Renovation LLC',
      notes: cardData.notes ? cardData.notes.trim() : '',
      active: true,
      createdAt: formatDateISO(new Date())
    };

    this.paymentCards.push(newCard);
    this.saveCards();
    return newCard;
  }

  updateCard(id, updates) {
    const index = this.paymentCards.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.paymentCards[index] = {
      ...this.paymentCards[index],
      ...updates
    };
    this.saveCards();
    return this.paymentCards[index];
  }

  deleteCard(id) {
    this.paymentCards = this.paymentCards.filter(c => c.id !== id);
    this.saveCards();
  }

  // ==========================================
  // --- Configuraciones & Copia de Seguridad ---
  // ==========================================
  saveSettings() {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    this.notify('SETTINGS_UPDATED', this.settings);
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  exportAllDataAsJSON() {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      company: this.settings.companyName,
      settings: this.settings,
      employees: this.employees,
      timeEntries: this.timeEntries,
      receipts: this.receipts,
      paymentCards: this.paymentCards,
      weeklyPayments: this.weeklyPayments
    };
    return JSON.stringify(backup, null, 2);
  }

  importDataFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.employees || !Array.isArray(data.employees)) {
        throw new Error('Formato de datos no válido');
      }
      this.employees = data.employees;
      this.timeEntries = data.timeEntries || {};
      if (data.settings) {
        this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
      }
      if (data.receipts && Array.isArray(data.receipts)) {
        this.receipts = data.receipts;
      }
      if (data.paymentCards && Array.isArray(data.paymentCards)) {
        this.paymentCards = data.paymentCards;
      }
      if (data.weeklyPayments && typeof data.weeklyPayments === 'object') {
        this.weeklyPayments = data.weeklyPayments;
      }

      this.saveEmployees();
      this.saveTimeEntries();
      this.saveReceipts();
      this.saveCards();
      this.saveWeeklyPayments();
      this.saveSettings();
      return true;
    } catch (err) {
      console.error('Error importando datos:', err);
      return false;
    }
  }

  resetToDefaultDemo() {
    this.employees = [];
    this.timeEntries = {};
    this.receipts = [];
    this.paymentCards = [...DEFAULT_CARDS];
    this.weeklyPayments = {};
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveEmployees();
    this.saveTimeEntries();
    this.saveReceipts();
    this.saveCards();
    this.saveWeeklyPayments();
    this.saveSettings();
  }
}

export const store = new DataStore();
