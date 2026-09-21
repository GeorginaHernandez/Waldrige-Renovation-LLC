/**
 * auth.js - Control de autenticación y permisos (Empleado vs Administrador)
 */

import { store } from './store.js';

const SESSION_KEY = 'waldrige_current_session_v1';

class AuthService {
  constructor() {
    this.currentUser = null; // { role: 'ADMIN' | 'EMPLOYEE', employeeId?: string, name: string }
    this.listeners = [];
    this.init();
  }

  init() {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'ADMIN';
  }

  isEmployee() {
    return this.currentUser && this.currentUser.role === 'EMPLOYEE';
  }

  getEmployeeId() {
    return this.currentUser?.employeeId || null;
  }

  // Inicio de sesión para empleado con nombre y PIN / Clave personalizada
  loginEmployeeByNameAndPin(name, pin) {
    if (!name || !String(name).trim()) {
      return { success: false, message: 'Por favor ingresa tu nombre completo.' };
    }
    if (!pin || !String(pin).trim()) {
      return { success: false, message: 'Por favor ingresa tu clave personal.' };
    }

    const employee = store.findEmployeeByName(name);
    if (!employee) {
      return { 
        success: false, 
        message: `No se encontró ningún empleado registrado con el nombre "${name.trim()}". Verifica tu nombre o regístrate como nuevo empleado.` 
      };
    }

    if (!employee.active) {
      return { success: false, message: 'Este perfil se encuentra inactivo. Contacta al administrador.' };
    }

    // Comprobar PIN / Clave
    if (String(employee.pin).trim() !== String(pin).trim()) {
      return { success: false, message: 'Clave o PIN incorrecto para este nombre. Intenta de nuevo.' };
    }

    return this.setEmployeeSession(employee);
  }

  // Inicio de sesión para empleado con selección de perfil y PIN (retrocompatibilidad)
  loginEmployee(employeeId, pin) {
    const employee = store.getEmployeeById(employeeId);
    if (!employee) {
      return { success: false, message: 'Empleado no encontrado.' };
    }

    if (!employee.active) {
      return { success: false, message: 'Este perfil se encuentra inactivo. Contacta al administrador.' };
    }

    if (String(employee.pin).trim() !== String(pin).trim()) {
      return { success: false, message: 'PIN o clave incorrecta. Intenta nuevamente.' };
    }

    return this.setEmployeeSession(employee);
  }

  // Registro de nuevo empleado por parte del propio trabajador
  registerEmployee({ name, pin, color, role }) {
    if (!name || !String(name).trim()) {
      return { success: false, message: 'Ingresa tu nombre completo para registrarte.' };
    }
    if (!pin || String(pin).trim().length < 3) {
      return { success: false, message: 'Crea una clave o PIN de al menos 3 caracteres o dígitos.' };
    }

    const existing = store.findEmployeeByName(name);
    if (existing) {
      return { 
        success: false, 
        message: `Ya existe un empleado registrado como "${existing.name}". Si eres tú, ingresa en "Iniciar Sesión" con tu clave.` 
      };
    }

    const newEmp = store.addEmployee({
      name: name.trim(),
      role: role ? role.trim() : 'Operario de Obra',
      hourlyRate: 25.00, // Tarifa base inicial que el administrador puede ajustar
      color: color || '#3B82F6',
      pin: String(pin).trim()
    });

    return this.setEmployeeSession(newEmp);
  }

  // Actualizar la clave personalizada de un empleado
  updateEmployeePin(employeeId, currentPin, newPin) {
    const employee = store.getEmployeeById(employeeId);
    if (!employee) {
      return { success: false, message: 'Empleado no encontrado.' };
    }

    if (currentPin && String(employee.pin).trim() !== String(currentPin).trim()) {
      return { success: false, message: 'La clave actual no coincide.' };
    }

    if (!newPin || String(newPin).trim().length < 3) {
      return { success: false, message: 'La nueva clave debe tener al menos 3 dígitos o caracteres.' };
    }

    store.updateEmployee(employeeId, { pin: String(newPin).trim() });
    return { success: true, message: '¡Tu clave ha sido personalizada y guardada correctamente!' };
  }

  setEmployeeSession(employee) {
    this.currentUser = {
      role: 'EMPLOYEE',
      employeeId: employee.id,
      name: employee.name,
      color: employee.color,
      hourlyRate: employee.hourlyRate,
      roleDescription: employee.role
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return { success: true, user: this.currentUser };
  }

  // Inicio de sesión para Administrador con Clave Maestra
  loginAdmin(passwordOrPin) {
    const validKey = store.settings.adminPin || 'waldrige2026';
    
    if (String(passwordOrPin).trim() === String(validKey).trim()) {
      this.currentUser = {
        role: 'ADMIN',
        name: 'Administración (Waldrige Renovation)',
        canManageAll: true
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
      this.notify();
      return { success: true, user: this.currentUser };
    }

    return { success: false, message: 'Clave de Administrador incorrecta.' };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    this.notify();
  }

  // Validador de privacidad: Un usuario solo puede acceder a un empleado si es Admin o si es él mismo
  canAccessEmployee(employeeId) {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'ADMIN') return true;
    return this.currentUser.employeeId === employeeId;
  }
}

export const auth = new AuthService();
