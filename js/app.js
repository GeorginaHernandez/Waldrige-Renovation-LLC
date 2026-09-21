/**
 * app.js - Enrutador y orquestador principal de Waldrige Renovation LLC
 */

import { store } from './store.js';
import { auth } from './auth.js';
import { calendar } from './calendar.js';
import { EmployeeView } from './employee-view.js';
import { AdminView } from './admin-view.js';
import { t, i18n } from './i18n.js';

class App {
  constructor() {
    this.employeeView = new EmployeeView('app-view-container');
    this.adminView = new AdminView('app-view-container');
  }

  init() {
    this.renderHeader();
    this.setupAuthListeners();
    this.setupI18nListeners();
    this.renderCurrentState();

    // Suscribir a cambios en el store para refrescar vistas automáticamente
    store.subscribe((changeType) => {
      const user = auth.getCurrentUser();
      if (!user) return;
      if (user.role === 'ADMIN') {
        this.adminView.render();
      } else if (user.role === 'EMPLOYEE') {
        this.employeeView.render(user.employeeId);
      }
    });
  }

  setupI18nListeners() {
    i18n.subscribe(() => {
      this.renderHeader();
      this.renderCurrentState();
    });
  }

  renderHeader() {
    const user = auth.getCurrentUser();
    const headerEl = document.getElementById('main-header');
    if (!headerEl) return;

    const currentLang = i18n.getLanguage();
    const isEn = currentLang === 'en';

    const langToggleBtn = `
      <button class="btn btn-sm btn-outline lang-toggle-pill" id="btn-global-lang-toggle" title="Cambiar idioma / Change language">
        <span class="lang-flag">${isEn ? '🇺🇸' : '🇪🇸'}</span>
        <strong>${isEn ? 'EN' : 'ES'}</strong>
        <span class="lang-alt-label">${isEn ? '→ Español' : '→ English'}</span>
      </button>
    `;

    if (!user) {
      headerEl.innerHTML = `
        <div class="header-content">
          <div class="header-logo-block">
            <div class="logo-symbol">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <div class="logo-texts">
              <span class="logo-company">Waldrige Renovation LLC</span>
              <span class="logo-tagline">${t('taglineLogin')}</span>
            </div>
          </div>

          <div class="header-user-status">
            ${langToggleBtn}
          </div>
        </div>
      `;
      document.getElementById('btn-global-lang-toggle')?.addEventListener('click', () => {
        i18n.toggleLanguage();
      });
      return;
    }

    const isAdm = user.role === 'ADMIN';
    headerEl.innerHTML = `
      <div class="header-content">
        <div class="header-logo-block">
          <div class="logo-symbol">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div class="logo-texts">
            <span class="logo-company">Waldrige Renovation LLC</span>
            <span class="logo-tagline">${isAdm ? t('taglineAdmin') : t('taglineEmployee')}</span>
          </div>
        </div>

        <div class="header-user-status">
          ${langToggleBtn}

          <div class="user-pill ${isAdm ? 'pill-admin' : 'pill-employee'}">
            ${isAdm ? `
              <span class="user-pill-dot" style="background-color: #38BDF8;"></span>
              <span class="user-pill-name">${t('adminTitle')}</span>
            ` : `
              <span class="user-pill-dot" style="background-color: ${user.color || '#3B82F6'};"></span>
              <span class="user-pill-name">${escapeHtml(user.name)}</span>
            `}
          </div>

          <button class="btn btn-outline btn-sm" id="btn-global-logout" title="${t('logout')}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            ${t('logout')}
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-global-lang-toggle')?.addEventListener('click', () => {
      i18n.toggleLanguage();
    });

    document.getElementById('btn-global-logout')?.addEventListener('click', () => {
      auth.logout();
    });
  }

  setupAuthListeners() {
    auth.subscribe(() => {
      this.renderHeader();
      this.renderCurrentState();
    });
  }

  renderCurrentState() {
    const user = auth.getCurrentUser();
    const container = document.getElementById('app-view-container');
    if (!container) return;

    if (!user) {
      this.renderLoginScreen(container);
    } else if (user.role === 'ADMIN') {
      this.adminView.render();
    } else if (user.role === 'EMPLOYEE') {
      this.employeeView.render(user.employeeId);
    }
  }

  renderLoginScreen(container) {
    const employees = store.getEmployees(false);

    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo-badge">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <h2>${t('welcomeTitle')}</h2>
            <p>${t('selectAccess')}</p>
          </div>

          <div class="auth-role-tabs">
            <button type="button" class="role-tab active" id="tab-auth-employee">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              ${t('iAmEmployee')}
            </button>
            <button type="button" class="role-tab" id="tab-auth-admin">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              ${t('iAmAdmin')}
            </button>
          </div>

          <!-- Formulario de Empleado -->
          <div id="employee-auth-container">
            <div class="emp-auth-modes">
              <button type="button" class="emp-mode-tab ${employees.length > 0 ? 'active' : ''}" id="btn-mode-login">${t('logIn')}</button>
              <button type="button" class="emp-mode-tab ${employees.length === 0 ? 'active' : ''}" id="btn-mode-register">${t('registerAsNew')}</button>
            </div>

            <!-- Iniciar Sesión con Nombre y Clave -->
            <form id="form-login-employee" class="auth-form-body" style="${employees.length === 0 ? 'display: none;' : ''}">
              <div class="form-group">
                <label for="login-emp-name">${t('enterFullName')}</label>
                <div class="name-input-wrapper">
                  <input type="text" id="login-emp-name" list="employee-names-list" placeholder="Ej. Roberto Sánchez" class="input-text" autocomplete="name" required>
                  <datalist id="employee-names-list">
                    ${employees.map(e => `<option value="${escapeHtml(e.name)}">${escapeHtml(e.role || 'Operario')}</option>`).join('')}
                  </datalist>
                </div>
                <small class="form-tip">Escribe tu nombre o elígelo de las sugerencias.</small>
              </div>

              <!-- Vista previa si el nombre coincide -->
              <div id="login-emp-preview" class="emp-login-preview" style="display: none;">
                <div class="preview-avatar" id="login-avatar-preview">WM</div>
                <div>
                  <strong id="login-name-preview">Empleado</strong>
                  <span class="text-muted block text-sm" id="login-role-preview">Especialidad</span>
                </div>
              </div>

              <div class="form-group">
                <div class="label-with-action">
                  <label for="login-emp-pin">${t('enterSecretPin')}</label>
                </div>
                <input type="password" id="login-emp-pin" class="input-text pin-input" maxlength="12" placeholder="&bull;&bull;&bull;&bull;" autocomplete="current-password" required>
                <small class="form-tip">Solo tú podrás ver tus horas trabajadas y ganancias.</small>
              </div>

              <div id="login-emp-error" class="alert-error" style="display: none;"></div>

              <button type="submit" class="btn btn-primary btn-block btn-lg">
                ${t('logIn')}
              </button>

              ${employees.length > 0 ? `
                <div class="quick-test-pins">
                  <span>${t('activeEmployees')}:</span>
                  <div class="pins-pills">
                    ${employees.map(e => `
                      <span class="pin-pill" style="border-left: 3px solid ${e.color};" title="Clic para seleccionar" data-name="${escapeHtml(e.name)}" data-pin="${e.pin}">
                        ${escapeHtml(e.name)}
                      </span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </form>

            <!-- Registro de Nuevo Empleado -->
            <form id="form-register-employee" class="auth-form-body" style="${employees.length === 0 ? 'display: flex;' : 'display: none;'}">
              <div class="form-group">
                <label for="reg-emp-name">${t('enterFullName')} *</label>
                <input type="text" id="reg-emp-name" placeholder="Ej. Roberto Sánchez" class="input-text" required>
              </div>

              <div class="form-group">
                <label for="reg-emp-role">${t('yourRoleSpecialty')}</label>
                <input type="text" id="reg-emp-role" placeholder="Ej. Pintor, Carpintero, Drywall..." class="input-text">
              </div>

              <div class="form-group">
                <label>${t('chooseColor')}</label>
                <div class="color-picker-container">
                  <div class="color-palette-presets" id="reg-palette-presets">
                    <button type="button" class="preset-color-btn active" style="background-color: #2563EB;" data-color="#2563EB"></button>
                    <button type="button" class="preset-color-btn" style="background-color: #059669;" data-color="#059669"></button>
                    <button type="button" class="preset-color-btn" style="background-color: #D97706;" data-color="#D97706"></button>
                    <button type="button" class="preset-color-btn" style="background-color: #7C3AED;" data-color="#7C3AED"></button>
                    <button type="button" class="preset-color-btn" style="background-color: #DC2626;" data-color="#DC2626"></button>
                    <button type="button" class="preset-color-btn" style="background-color: #0891B2;" data-color="#0891B2"></button>
                  </div>
                  <input type="hidden" id="reg-emp-color" value="#2563EB">
                </div>
              </div>

              <div class="form-group">
                <label for="reg-emp-pin">${t('createSecretPin')} *</label>
                <input type="password" id="reg-emp-pin" class="input-text" maxlength="12" placeholder="Tu clave personal" required>
              </div>

              <div id="reg-emp-error" class="alert-error" style="display: none;"></div>

              <button type="submit" class="btn btn-primary btn-block btn-lg">
                ${t('completeRegisterBtn')}
              </button>
            </form>
          </div>

          <!-- Formulario de Administrador -->
          <form id="form-login-admin" class="auth-form-body" style="display: none;">
            <div class="form-group">
              <label for="login-admin-pin">${t('adminMasterKey')}</label>
              <input type="password" id="login-admin-pin" class="input-text" placeholder="${t('enterMasterKeyPlaceholder')}" required>
              <small class="form-tip">Acceso completo a todos los empleados, recibos, nómina y configuración.</small>
            </div>

            <div id="login-admin-error" class="alert-error" style="display: none;"></div>

            <button type="submit" class="btn btn-primary btn-block btn-lg">
              ${t('enterAdminBtn')}
            </button>
          </form>
        </div>
      </div>
    `;

    this.bindLoginEvents();
  }

  bindLoginEvents() {
    const tabEmp = document.getElementById('tab-auth-employee');
    const tabAdm = document.getElementById('tab-auth-admin');
    const authEmpContainer = document.getElementById('employee-auth-container');
    const formAdm = document.getElementById('form-login-admin');

    tabEmp?.addEventListener('click', () => {
      tabEmp.classList.add('active');
      tabAdm.classList.remove('active');
      if (authEmpContainer) authEmpContainer.style.display = 'block';
      if (formAdm) formAdm.style.display = 'none';
    });

    tabAdm?.addEventListener('click', () => {
      tabAdm.classList.add('active');
      tabEmp.classList.remove('active');
      if (authEmpContainer) authEmpContainer.style.display = 'none';
      if (formAdm) formAdm.style.display = 'block';
    });

    const btnModeLogin = document.getElementById('btn-mode-login');
    const btnModeRegister = document.getElementById('btn-mode-register');
    const formLoginEmp = document.getElementById('form-login-employee');
    const formRegisterEmp = document.getElementById('form-register-employee');

    btnModeLogin?.addEventListener('click', () => {
      btnModeLogin.classList.add('active');
      btnModeRegister?.classList.remove('active');
      if (formLoginEmp) formLoginEmp.style.display = 'flex';
      if (formRegisterEmp) formRegisterEmp.style.display = 'none';
    });

    btnModeRegister?.addEventListener('click', () => {
      btnModeRegister.classList.add('active');
      btnModeLogin?.classList.remove('active');
      if (formLoginEmp) formLoginEmp.style.display = 'none';
      if (formRegisterEmp) formRegisterEmp.style.display = 'flex';
    });

    const nameInput = document.getElementById('login-emp-name');
    const previewBox = document.getElementById('login-emp-preview');
    const avatarPreview = document.getElementById('login-avatar-preview');
    const namePreview = document.getElementById('login-name-preview');
    const rolePreview = document.getElementById('login-role-preview');

    const updatePreviewFromName = (nameVal) => {
      if (!nameVal || !nameVal.trim()) {
        if (previewBox) previewBox.style.display = 'none';
        return;
      }
      const emp = store.findEmployeeByName(nameVal.trim());
      if (emp && previewBox) {
        previewBox.style.display = 'flex';
        previewBox.style.borderLeft = `4px solid ${emp.color}`;
        if (avatarPreview) {
          avatarPreview.style.backgroundColor = emp.color;
          avatarPreview.textContent = this.getInitials(emp.name);
        }
        if (namePreview) namePreview.textContent = emp.name;
        if (rolePreview) rolePreview.textContent = emp.role || 'Operario de Obra';
      } else {
        if (previewBox) previewBox.style.display = 'none';
      }
    };

    nameInput?.addEventListener('input', (e) => updatePreviewFromName(e.target.value));
    nameInput?.addEventListener('change', (e) => updatePreviewFromName(e.target.value));

    document.querySelectorAll('.pin-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const name = e.currentTarget.getAttribute('data-name');
        const pin = e.currentTarget.getAttribute('data-pin');
        if (nameInput) {
          nameInput.value = name;
          updatePreviewFromName(name);
        }
        const pinInput = document.getElementById('login-emp-pin');
        if (pinInput) pinInput.value = pin;
      });
    });

    const regColorInput = document.getElementById('reg-emp-color');
    document.querySelectorAll('#reg-palette-presets .preset-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        if (regColorInput) regColorInput.value = color;
        document.querySelectorAll('#reg-palette-presets .preset-color-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    formLoginEmp?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput?.value;
      const pin = document.getElementById('login-emp-pin')?.value;
      const errorDiv = document.getElementById('login-emp-error');

      const result = auth.loginEmployeeByNameAndPin(name, pin);
      if (!result.success) {
        if (errorDiv) {
          errorDiv.textContent = result.message;
          errorDiv.style.display = 'block';
        }
      } else {
        if (errorDiv) errorDiv.style.display = 'none';
      }
    });

    formRegisterEmp?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-emp-name')?.value;
      const role = document.getElementById('reg-emp-role')?.value;
      const color = document.getElementById('reg-emp-color')?.value;
      const pin = document.getElementById('reg-emp-pin')?.value;
      const errorDiv = document.getElementById('reg-emp-error');

      const result = auth.registerEmployee({ name, pin, color, role });
      if (!result.success) {
        if (errorDiv) {
          errorDiv.textContent = result.message;
          errorDiv.style.display = 'block';
        }
      } else {
        if (errorDiv) errorDiv.style.display = 'none';
      }
    });

    formAdm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const masterKey = document.getElementById('login-admin-pin')?.value;
      const errorDiv = document.getElementById('login-admin-error');

      const result = auth.loginAdmin(masterKey);
      if (!result.success) {
        if (errorDiv) {
          errorDiv.textContent = result.message;
          errorDiv.style.display = 'block';
        }
      } else {
        if (errorDiv) errorDiv.style.display = 'none';
      }
    });
  }

  getInitials(name) {
    if (!name) return 'W';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
