# Waldrige Renovation LLC - Sistema de Control de Horas, Recibos y Nóminas Semanales

Aplicación web profesional diseñada a medida para **Waldrige Renovation LLC**, con el objetivo de gestionar las horas laboradas de **Lunes a Viernes (8:00 AM - 7:00 PM)**, los comprobantes fotográficos de recibos/gastos con exportación a PDF, la gestión de tarjetas y cuentas de membresías (Home Depot Pro, Lowe's MVP, etc.), la impresión de comprobantes de nómina individuales (Pay Stubs), el control de saldos pendientes adeudados por el jefe, y soporte bilingüe en **Español e Inglés**.

---

## 🚀 Características Principales

### 1. 📅 Horario Oficial: Lunes a Viernes (8:00 AM - 7:00 PM)
- Calendario semanal estructurado exclusivamente de **Lunes a Viernes** (5 días laborales).
- Horario estándar de 8:00 AM a 7:00 PM (hasta 11 horas diarias).
- Registro por entrada/salida y almuerzo (30m, 60m, 90m) o por horas directas.

### 2. 📸 Subida de Recibos de Gastos con Foto y Reporte en PDF
- **Para el empleado:** Pestaña *"Mis Recibos y Gastos"* para subir fotos de comprobantes de compra directamente desde la cámara o galería del teléfono.
  - Indica la tienda (The Home Depot, Lowe's, gasolinera, etc.).
  - Monto del gasto ($).
  - Categoría (Materiales, Herramientas, Combustible, Comida, Otro).
  - Tarjeta o membresía del negocio utilizada, o efectivo de su bolsillo (para reembolso).
  - Compresión automática en el navegador para resguardar fotos nítidas sin saturar memoria.
- **Para el administrador:** Pestaña *"Gastos & Recibos"* con:
  - Galería visual y visor ampliado con zoom (Lightbox).
  - Filtro por empleado o semana.
  - Botón **"Imprimir Reporte de Gastos / PDF"** con diseño contable que incluye detalles y las fotos de cada recibo para deducir impuestos.
  - Opciones para aprobar o marcar como reembolsado.

### 3. 💳 Tarjetas de Banco y Cuentas de Membresías
- El administrador puede registrar las tarjetas y cuentas de membresía corporativas:
  - **The Home Depot Pro Xtra** (con notas e instrucciones para caja).
  - **Lowe's MVP Pro Rewards** (código de cuenta para descuentos).
  - **Tarjetas de crédito o débito corporativas** (con últimos 4 dígitos).
- Al subir un recibo, los operarios pueden seleccionar qué tarjeta de la empresa usaron o si pagaron de su propio bolsillo.

### 4. 📄 Impresión de Nóminas Individuales (Pay Stubs)
- Tanto el **empleado** desde su panel como el **administrador** desde la tabla de nómina pueden generar e imprimir el **Comprobante de Nómina Individual (Pay Stub)**:
  - Logotipo oficial de Waldrige Renovation LLC.
  - Desglose diario de Lunes a Viernes con horas, descansos y montos ganados.
  - Estado de pago oficial y saldo pendiente.
  - Líneas de firma autorizada de la empresa y conformidad del trabajador.
  - Formato listo para imprimir o guardar como archivo PDF.

### 5. 💰 Estatus de Pago Semanal y Control de Saldo Pendiente
- Permite saber en todo momento si la semana está liquidada o si el jefe debe pagar una diferencia:
  - **Pagado Completo** (Verde).
  - **Pago Parcial** (Amarillo / Naranja): Registra cuánto se abonó y calcula automáticamente el **Saldo Restante Pendiente**.
  - **Pendiente de Pago** (Rojo): Semana aún sin pagar.
- Tanto el empleado como el administrador pueden registrar pagos y dejar notas para mantener total transparencia.

### 6. 🌐 Sistema Bilingüe: Español & English
- Selector de idioma rápido en el encabezado global (🇪🇸 ES | 🇺🇸 EN).
- Traduce al instante días, meses, tablas, formularios, modales y comprobantes de nómina.

### 7. 📍 Dirección de Obra y Trabajo Realizado Diario
- **Para el empleado:** Al registrar o editar las horas de cada día, puede registrar:
  - **Dirección / Ubicación del lugar donde trabajó** (ej. *1420 Elm Street, Charlotte, NC* o *Proyecto Cocina Smith*).
  - **Trabajo Realizado / Tareas del Día** (ej. *Instalación de drywall, pintura de sala, molduras...*).
- Se muestra en las tarjetas de la semana, en el desglose oficial del comprobante de nómina (**Pay Stub**) y en la tabla de supervisión del administrador.

### 8. 🔒 Privacidad y Control de Acceso (Clave Maestra Segura)
- **Empleado:** Ingresa con su nombre y su clave secreta personal (PIN). Solo ve sus propias horas, recibos y ganancias.
- **Administrador / Dueño:** Ingresa con la clave maestra privada.
  - **Importante:** Por máxima seguridad y privacidad del dueño, la clave maestra **no se muestra en pantalla** en ningún formulario de inicio de sesión ni en el panel de administración. Solo tú como dueño la conoces y se la suministras en privado al administrador.
  - Para cambiarla en "Configuración & Respaldo", se requiere ingresar la clave actual con campos de contraseña protegidos (`●●●●`).

---

## 🔑 Credenciales de Acceso

### 1. Administrador / Dueño (Acceso Total)
- **Modo:** Pestaña *"Administrador / Dueño"*
- **Clave Maestra Inicial:** `waldrige2026` *(privada, no visible en la interfaz; puedes cambiarla en Configuración ingresando la actual)*

### 2. Empleados
- **Auto-registro:** Pestaña *"Registrarme como Nuevo"*, el empleado escribe su nombre completo, cargo o especialidad, elige su color distintivo y crea su PIN secreto personal.
- **Desde el Administrador:** Botón *"+ Nuevo Empleado"* para dar de alta trabajadores directamente con su tarifa por hora ($/hr).

---

## 💻 Ejecución Local en tu Computadora

1. Abre PowerShell o terminal en la carpeta del proyecto.
2. Inicia el servidor local:
   ```bash
   python -m http.server 8000
   ```
3. Abre tu navegador web en:
   ```
   http://localhost:8000
   ```

---

## ☁️ Publicación en Internet con Vercel (Para Celulares)

Para que tus empleados registren sus horas, indiquen la dirección de la obra y suban recibos desde sus teléfonos móviles:

### En Vercel:
1. Tu proyecto está desplegado en tu cuenta de **Vercel** ([https://vercel.com](https://vercel.com)).
2. El enlace público que te da Vercel (por ejemplo: `https://tu-proyecto.vercel.app` o el dominio que tengas configurado) **es el link que le das a tus empleados**.
3. Al abrirlo, tus empleados entrarán a la versión en vivo y podrán auto-registrarse desde sus celulares.

---

## 📁 Estructura del Código

```
Waldrige Renovation LLC/
├── index.html              # Estructura principal y meta tags
├── README.md               # Documentación completa y credenciales
├── css/
│   ├── main.css            # Estilos, temas, modales, tarjetas y @media print
│   └── responsive.css      # Adaptabilidad táctil para teléfonos y tabletas
└── js/
    ├── app.js              # Enrutador principal y selector de idioma
    ├── i18n.js             # Diccionario y traducciones (Español / English)
    ├── store.js            # Persistencia de horas, recibos, tarjetas y saldos
    ├── calendar.js         # Calendario semanal de Lunes a Viernes
    ├── auth.js             # Control de sesiones y PINs privados
    ├── paystub.js          # Generador de Comprobantes Individuales (Pay Stubs)
    ├── receipts-manager.js # Compresión de fotos, visor y reporte PDF de gastos
    ├── employee-view.js    # Vista del operario (Lunes a Viernes, saldo y recibos)
    └── admin-view.js       # Panel administrativo (nómina, gastos, tarjetas y backup)
```
