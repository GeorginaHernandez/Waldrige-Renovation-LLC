/**
 * i18n.js - Sistema de Internacionalización (Español / English)
 * Waldrige Renovation LLC
 */

export const TRANSLATIONS = {
  es: {
    // Encabezado y General
    companyName: 'Waldrige Renovation LLC',
    taglineAdmin: 'Panel de Administración & Control Total',
    taglineEmployee: 'Portal de Horas & Gastos del Empleado',
    taglineLogin: 'Control de Horas, Recibos & Nómina Semanal',
    logout: 'Salir',
    adminTitle: 'Administrador / Dueño',
    language: 'Idioma',
    loading: 'Cargando sistema de Waldrige Renovation LLC...',
    allRightsReserved: 'Todos los derechos reservados. Formato Oficial Lunes a Viernes (8:00 AM - 7:00 PM).',

    // Días y Calendario
    days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    daysShort: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    monthsFull: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    weekOf: 'Semana del {start} al {end} de {month}, {year}',
    weekOfCrossMonth: 'Semana del {start} de {startMonth} al {end} de {endMonth}, {year}',
    prevWeek: 'Anterior',
    nextWeek: 'Siguiente',
    currentWeek: 'Semana Actual',
    today: 'Hoy',
    officialScheduleNotice: 'Horario laboral oficial: Lunes a Viernes de 8:00 AM a 7:00 PM.',

    // Pestañas Administrador
    tabPayroll: 'Nómina Semanal (Lun - Vie)',
    tabReceipts: 'Gastos & Recibos',
    tabCards: 'Tarjetas & Membresías',
    tabEmployees: 'Gestión de Empleados',
    tabSettings: 'Configuración & Respaldo',

    // KPIs y Nómina
    totalWeeklyPayroll: 'Nómina Total de la Semana',
    totalHoursWorked: 'Horas Totales Trabajadas',
    workTeam: 'Equipo de Trabajo',
    activeEmployees: 'empleados activos',
    totalToPay: 'Monto total calculado',
    unlimitedEmployees: 'Sin límite de empleados',
    printPayrollPdf: 'Imprimir Nómina / PDF',
    exportCsv: 'Exportar CSV',
    newEmployeeBtn: '+ Nuevo Empleado',

    // Columnas de Tabla Nómina
    colEmployee: 'Empleado & Color',
    colRate: 'Tarifa',
    colTotalHours: 'Total Horas',
    colTotalPay: 'Total Ganado',
    colPaymentStatus: 'Estado de Pago',
    colBalanceDue: 'Saldo Pendiente',
    colActions: 'Acciones',
    weeklyTotals: 'TOTALES DE LA SEMANA',
    noEmployeesFound: 'No hay empleados registrados. Haz clic en "+ Nuevo Empleado".',

    // Estados de Pago
    statusPaid: 'Pagado Completo',
    statusPartial: 'Pago Parcial',
    statusPending: 'Pendiente de Pago',
    balanceDueText: 'Resta por pagar',
    paidAmount: 'Monto Pagado',
    balanceRemaining: 'Saldo Pendiente',
    registerPayment: 'Registrar Pago',
    updatePaymentStatus: 'Actualizar Estado de Pago',

    // Comprobante Individual (Pay Stub)
    payStubTitle: 'Comprobante de Nómina Individual',
    payStubSubtitle: 'Registro Oficial Semanal de Horas y Ganancias',
    printPayStub: 'Imprimir mi Nómina / Pay Stub',
    employeeInfo: 'Información del Empleado',
    periodDates: 'Período Laboral',
    breakdownHours: 'Desglose Diario de Horas',
    dayCol: 'Día',
    dateCol: 'Fecha',
    hoursCol: 'Horas',
    earningsCol: 'Monto',
    scheduleCol: 'Horario',
    totalEarned: 'Total Ganado',
    authorizedSignature: 'Firma de Conformidad / Autorizado',

    // Gastos y Recibos
    receiptsTitle: 'Control de Recibos y Compras',
    receiptsSubtitle: 'Comprobantes fotográficos de compras en tiendas y gastos de obra',
    uploadReceiptBtn: '+ Subir Recibo de Compra',
    printReceiptsPdf: 'Imprimir Reporte de Gastos / PDF',
    totalExpenses: 'Total Gastos Reportados',
    receiptsCount: 'Recibos Registrados',
    storeName: 'Tienda / Comercio',
    expenseDate: 'Fecha del Gasto',
    expenseAmount: 'Monto ($)',
    category: 'Categoría',
    paymentMethod: 'Tarjeta / Método de Pago',
    receiptPhoto: 'Foto del Recibo',
    takeOrUploadPhoto: 'Tomar foto o seleccionar imagen del recibo',
    noReceiptsYet: 'No hay recibos registrados aún.',
    viewReceiptPhoto: 'Ver Recibo',
    closePhoto: 'Cerrar Vista',
    approveReceipt: 'Aprobar',
    reimburseReceipt: 'Marcar Reembolsado',
    deleteReceipt: 'Eliminar Recibo',
    catMaterials: 'Materiales de Construcción',
    catTools: 'Herramientas / Equipos',
    catFuel: 'Gasolina / Transporte',
    catFood: 'Alimentos / Agua en Obra',
    catOther: 'Otro Gasto',
    paidWithCash: 'Efectivo / Bolsillo Propio (Por Reembolsar)',

    // Tarjetas y Membresías
    cardsTitle: 'Tarjetas Bancarias & Cuentas de Membresías',
    cardsSubtitle: 'Registra las tarjetas y membresías de la empresa (Home Depot Pro, Lowe\'s MVP, bancos) para que los empleados las seleccionen en sus compras.',
    addCardBtn: '+ Agregar Tarjeta o Membresía',
    cardName: 'Nombre de la Tarjeta o Membresía',
    cardType: 'Tipo',
    cardTypeCredit: 'Tarjeta de Crédito Corporativa',
    cardTypeDebit: 'Tarjeta de Débito Bancaria',
    cardTypeStore: 'Membresía de Tienda (Home Depot, Lowe\'s, etc.)',
    cardLast4: 'Últimos 4 dígitos o Núm. de Cuenta',
    cardHolder: 'Titular / Nombre en la Tarjeta',
    cardNotes: 'Instrucciones para caja (PIN, teléfono, etc.)',

    // Vista de Empleado
    myWeeklyHours: 'Mis Horas Trabajadas',
    myWeeklyEarnings: 'Ganancia Semanal Estimada',
    customizeMyPin: 'Personalizar mi Clave',
    myPaymentStatusTitle: 'Estatus del Pago de mi Nómina',
    reportPaymentReceived: 'Indicar Pago Recibido / Saldo',
    modifyDay: 'Modificar',
    registerDay: '+ Registrar',
    registerHoursModalTitle: 'Registrar Horas de Trabajo',
    byScheduleTab: 'Por Horario (8am - 7pm)',
    byDirectHoursTab: 'Horas Directas',
    startTimeLabel: 'Hora Entrada (desde 8:00 AM)',
    endTimeLabel: 'Hora Salida (hasta 7:00 PM)',
    lunchTimeLabel: 'Tiempo de Almuerzo / Descanso',
    noLunch: 'Sin descanso (0 min)',
    lunch30: '30 minutos',
    lunch60: '1 hora (60 minutos)',
    lunch90: '1 hora y media (90 minutos)',
    directHoursToday: 'Total de Horas Trabajadas Hoy',
    notesDescriptionLabel: 'Descripción de Trabajos / Proyecto (Opcional)',
    workAddressLabel: 'Dirección / Ubicación del Trabajo',
    workAddressPlaceholder: 'Ej. 1420 Elm Street, Charlotte, NC / Proyecto Cocina Smith',
    workDoneLabel: 'Trabajo Realizado / Tareas del Día',
    workDonePlaceholder: 'Ej. Instalación de drywall, pintura de sala, colocación de molduras...',
    workAddressShort: 'Ubicación',
    workDoneShort: 'Trabajo Realizado',
    masterKeySecurityNotice: '🔒 Por seguridad y privacidad, la clave maestra actual nunca se muestra en pantalla. Solo tú como dueño la conoces para suministrársela al administrador.',
    currentMasterKeyLabel: 'Clave Maestra Actual:',
    newMasterKeyLabel: 'Nueva Clave Maestra:',
    confirmMasterKeyLabel: 'Confirmar Nueva Clave:',
    enterCurrentMasterKeyPlaceholder: 'Ingresa la clave maestra actual',
    enterNewMasterKeyPlaceholder: 'Ingresa la nueva clave maestra',
    confirmNewMasterKeyPlaceholder: 'Repite la nueva clave maestra',
    masterKeyIncorrect: 'La clave maestra actual ingresada es incorrecta.',
    masterKeyMismatch: 'Las nuevas claves no coinciden.',
    masterKeyUpdated: 'Clave maestra actualizada exitosamente.',
    saveHoursBtn: 'Guardar Horas',
    deleteDayEntryBtn: 'Borrar Registro',
    cancelBtn: 'Cancelar',
    saveBtn: 'Guardar',

    // Login y Autenticación
    welcomeTitle: 'Bienvenido a Waldrige Renovation LLC',
    selectAccess: 'Selecciona tu tipo de acceso para continuar',
    iAmEmployee: 'Soy Empleado',
    iAmAdmin: 'Administrador / Dueño',
    logIn: 'Iniciar Sesión',
    registerAsNew: 'Registrarme como Nuevo',
    enterFullName: 'Ingresa tu Nombre Completo:',
    enterSecretPin: 'Ingresa tu Clave Secreta o PIN:',
    adminMasterKey: 'Clave Maestra de Administrador:',
    enterMasterKeyPlaceholder: 'Ingresa la clave maestra',
    enterAdminBtn: 'Entrar como Administrador',
    createNewAccountTitle: 'Registro de Nuevo Trabajador',
    yourRoleSpecialty: 'Puesto o Especialidad:',
    createSecretPin: 'Crea tu Clave Personal (mínimo 3 caracteres):',
    confirmPin: 'Confirmar Clave:',
    chooseColor: 'Elige tu Color Distintivo:',
    completeRegisterBtn: 'Completar Registro e Ingresar',

    // Notificaciones y confirmaciones
    savedSuccess: 'Guardado con éxito',
    errorRequired: 'Por favor completa los campos obligatorios',
    confirmDelete: '¿Estás seguro de que deseas eliminar este elemento?'
  },

  en: {
    // Header & General
    companyName: 'Waldrige Renovation LLC',
    taglineAdmin: 'Admin Dashboard & Total Control',
    taglineEmployee: 'Employee Hours & Expenses Portal',
    taglineLogin: 'Hours, Receipts & Weekly Payroll System',
    logout: 'Sign Out',
    adminTitle: 'Administrator / Owner',
    language: 'Language',
    loading: 'Loading Waldrige Renovation LLC system...',
    allRightsReserved: 'All rights reserved. Official Schedule Monday to Friday (8:00 AM - 7:00 PM).',

    // Days & Calendar
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    daysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    monthsFull: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekOf: 'Week of {month} {start} - {end}, {year}',
    weekOfCrossMonth: 'Week of {startMonth} {start} - {endMonth} {end}, {year}',
    prevWeek: 'Previous',
    nextWeek: 'Next',
    currentWeek: 'Current Week',
    today: 'Today',
    officialScheduleNotice: 'Official work schedule: Monday to Friday from 8:00 AM to 7:00 PM.',

    // Admin Tabs
    tabPayroll: 'Weekly Payroll (Mon - Fri)',
    tabReceipts: 'Expenses & Receipts',
    tabCards: 'Cards & Memberships',
    tabEmployees: 'Employee Management',
    tabSettings: 'Settings & Backup',

    // KPIs & Payroll
    totalWeeklyPayroll: 'Total Weekly Payroll',
    totalHoursWorked: 'Total Hours Worked',
    workTeam: 'Work Crew',
    activeEmployees: 'active employees',
    totalToPay: 'Total calculated amount',
    unlimitedEmployees: 'No employee limits',
    printPayrollPdf: 'Print Payroll / PDF',
    exportCsv: 'Export CSV',
    newEmployeeBtn: '+ New Employee',

    // Payroll Table Columns
    colEmployee: 'Employee & Color',
    colRate: 'Rate',
    colTotalHours: 'Total Hours',
    colTotalPay: 'Total Earned',
    colPaymentStatus: 'Payment Status',
    colBalanceDue: 'Balance Due',
    colActions: 'Actions',
    weeklyTotals: 'WEEKLY TOTALS',
    noEmployeesFound: 'No employees registered yet. Click on "+ New Employee".',

    // Payment Statuses
    statusPaid: 'Paid in Full',
    statusPartial: 'Partial Payment',
    statusPending: 'Pending Payment',
    balanceDueText: 'Balance Owed',
    paidAmount: 'Amount Paid',
    balanceRemaining: 'Balance Due',
    registerPayment: 'Record Payment',
    updatePaymentStatus: 'Update Payment Status',

    // Individual Pay Stub
    payStubTitle: 'Individual Employee Pay Stub',
    payStubSubtitle: 'Official Weekly Record of Hours and Earnings',
    printPayStub: 'Print My Pay Stub',
    employeeInfo: 'Employee Information',
    periodDates: 'Work Period',
    breakdownHours: 'Daily Hours Breakdown',
    dayCol: 'Day',
    dateCol: 'Date',
    hoursCol: 'Hours',
    earningsCol: 'Earnings',
    scheduleCol: 'Schedule',
    totalEarned: 'Total Earned',
    authorizedSignature: 'Authorized Signature / Employee Acceptance',

    // Expenses & Receipts
    receiptsTitle: 'Receipts & Expense Tracking',
    receiptsSubtitle: 'Photographic proof of store purchases and job site expenses',
    uploadReceiptBtn: '+ Upload Purchase Receipt',
    printReceiptsPdf: 'Print Expense Report / PDF',
    totalExpenses: 'Total Reported Expenses',
    receiptsCount: 'Registered Receipts',
    storeName: 'Store / Vendor Name',
    expenseDate: 'Expense Date',
    expenseAmount: 'Amount ($)',
    category: 'Category',
    paymentMethod: 'Card / Payment Method',
    receiptPhoto: 'Receipt Photo',
    takeOrUploadPhoto: 'Take photo or select receipt image',
    noReceiptsYet: 'No receipts uploaded yet.',
    viewReceiptPhoto: 'View Receipt',
    closePhoto: 'Close View',
    approveReceipt: 'Approve',
    reimburseReceipt: 'Mark Reimbursed',
    deleteReceipt: 'Delete Receipt',
    catMaterials: 'Building Materials',
    catTools: 'Tools & Equipment',
    catFuel: 'Fuel & Transportation',
    catFood: 'Meals / Water on Site',
    catOther: 'Other Expense',
    paidWithCash: 'Cash / Out of Pocket (To be reimbursed)',

    // Cards & Memberships
    cardsTitle: 'Bank Cards & Store Memberships',
    cardsSubtitle: 'Register company cards and accounts (Home Depot Pro, Lowe\'s MVP, banks) so workers can select them when buying.',
    addCardBtn: '+ Add Card or Membership',
    cardName: 'Card or Membership Name',
    cardType: 'Type',
    cardTypeCredit: 'Corporate Credit Card',
    cardTypeDebit: 'Bank Debit Card',
    cardTypeStore: 'Store Account (Home Depot, Lowe\'s, etc.)',
    cardLast4: 'Last 4 digits or Account Number',
    cardHolder: 'Cardholder / Account Name',
    cardNotes: 'Cashier notes (PIN, phone number, etc.)',

    // Employee View
    myWeeklyHours: 'My Hours Worked',
    myWeeklyEarnings: 'Estimated Weekly Earnings',
    customizeMyPin: 'Change My PIN',
    myPaymentStatusTitle: 'My Weekly Payroll Payment Status',
    reportPaymentReceived: 'Report Payment Received / Balance',
    modifyDay: 'Edit',
    registerDay: '+ Log Hours',
    registerHoursModalTitle: 'Log Work Hours',
    byScheduleTab: 'By Schedule (8am - 7pm)',
    byDirectHoursTab: 'Direct Hours',
    startTimeLabel: 'Start Time (from 8:00 AM)',
    endTimeLabel: 'End Time (until 7:00 PM)',
    lunchTimeLabel: 'Lunch / Break Duration',
    noLunch: 'No break (0 min)',
    lunch30: '30 minutes',
    lunch60: '1 hour (60 minutes)',
    lunch90: '1 hour 30 min (90 minutes)',
    directHoursToday: 'Total Hours Worked Today',
    notesDescriptionLabel: 'Job Description / Tasks (Optional)',
    workAddressLabel: 'Work Site Address / Location',
    workAddressPlaceholder: 'e.g. 1420 Elm Street, Charlotte, NC / Smith Kitchen Project',
    workDoneLabel: 'Work Performed / Daily Tasks',
    workDonePlaceholder: 'e.g. Drywall hanging, living room paint, trim installation...',
    workAddressShort: 'Location',
    workDoneShort: 'Work Performed',
    masterKeySecurityNotice: '🔒 For security and privacy, the master key is never displayed on screen. Only you as the owner know it to provide it to the admin.',
    currentMasterKeyLabel: 'Current Master Key:',
    newMasterKeyLabel: 'New Master Key:',
    confirmMasterKeyLabel: 'Confirm New Key:',
    enterCurrentMasterKeyPlaceholder: 'Enter current master key',
    enterNewMasterKeyPlaceholder: 'Enter new master key',
    confirmNewMasterKeyPlaceholder: 'Re-enter new master key',
    masterKeyIncorrect: 'The current master key entered is incorrect.',
    masterKeyMismatch: 'The new keys do not match.',
    masterKeyUpdated: 'Master key updated successfully.',
    saveHoursBtn: 'Save Hours',
    deleteDayEntryBtn: 'Delete Log',
    cancelBtn: 'Cancel',
    saveBtn: 'Save',

    // Login & Authentication
    welcomeTitle: 'Welcome to Waldrige Renovation LLC',
    selectAccess: 'Select your access mode to continue',
    iAmEmployee: 'I am an Employee',
    iAmAdmin: 'Administrator / Owner',
    logIn: 'Sign In',
    registerAsNew: 'Register as New',
    enterFullName: 'Enter your Full Name:',
    enterSecretPin: 'Enter your Secret PIN / Passcode:',
    adminMasterKey: 'Admin Master Passcode:',
    enterMasterKeyPlaceholder: 'Enter administrator master key',
    enterAdminBtn: 'Enter as Administrator',
    createNewAccountTitle: 'New Worker Registration',
    yourRoleSpecialty: 'Role or Specialty:',
    createSecretPin: 'Create your PIN (minimum 3 characters):',
    confirmPin: 'Confirm PIN:',
    chooseColor: 'Pick your Signature Color:',
    completeRegisterBtn: 'Complete Registration & Sign In',

    // Notifications & confirmations
    savedSuccess: 'Saved successfully',
    errorRequired: 'Please fill in all required fields',
    confirmDelete: 'Are you sure you want to delete this item?'
  }
};

class I18nService {
  constructor() {
    this.currentLanguage = localStorage.getItem('waldrige_lang') || 'es';
    this.subscribers = [];
  }

  getLanguage() {
    return this.currentLanguage;
  }

  setLanguage(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    this.currentLanguage = lang;
    localStorage.setItem('waldrige_lang', lang);
    document.documentElement.lang = lang;
    this.notify();
  }

  toggleLanguage() {
    this.setLanguage(this.currentLanguage === 'es' ? 'en' : 'es');
  }

  t(key, params = {}) {
    const dict = TRANSLATIONS[this.currentLanguage] || TRANSLATIONS.es;
    let text = dict[key] || TRANSLATIONS.es[key] || key;

    if (typeof text === 'string') {
      Object.keys(params).forEach(k => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
      });
    }

    return text;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.currentLanguage));
  }
}

export const i18n = new I18nService();
export const t = (key, params) => i18n.t(key, params);
