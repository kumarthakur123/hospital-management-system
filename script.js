// 1. Initialize State from LocalStorage (or empty arrays if first run)
const state = {
  patients: JSON.parse(localStorage.getItem('hms_patients')) || [],
  appointments: JSON.parse(localStorage.getItem('hms_appointments')) || []
};

// Helper function to persist state
function saveToStorage() {
  localStorage.setItem('hms_patients', JSON.stringify(state.patients));
  localStorage.setItem('hms_appointments', JSON.stringify(state.appointments));
}

// 2. DOM References
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const formPatient = document.getElementById('form-patient');
const formAppointment = document.getElementById('form-appointment');
const patientDropdown = document.getElementById('app-patient');
const queueBody = document.getElementById('queue-body');

// 3. Tab Navigation Routing
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(tab => tab.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// 4. Patient Registration Handler
formPatient.addEventListener('submit', (e) => {
  e.preventDefault();

  const newPatient = {
    id: `P-${Date.now().toString().slice(-4)}`,
    name: document.getElementById('p-name').value.trim(),
    age: document.getElementById('p-age').value,
    gender: document.getElementById('p-gender').value,
    contact: document.getElementById('p-contact').value.trim(),
    history: document.getElementById('p-history').value.trim()
  };

  state.patients.push(newPatient);
  saveToStorage();
  
  updatePatientDropdown();
  updateMetrics();
  formPatient.reset();
  alert(`Patient ${newPatient.name} registered successfully with ID: ${newPatient.id}`);
});

function updatePatientDropdown() {
  patientDropdown.innerHTML = '<option value="">-- Choose Patient --</option>';
  state.patients.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.id})`;
    patientDropdown.appendChild(opt);
  });
}

// 5. Appointment Booking Handler
formAppointment.addEventListener('submit', (e) => {
  e.preventDefault();

  const patientId = patientDropdown.value;
  const patient = state.patients.find(p => p.id === patientId);

  if (!patient) {
    alert('Please select a valid registered patient.');
    return;
  }

  const newAppointment = {
    id: `APT-${Date.now().toString().slice(-4)}`,
    patientId: patient.id,
    patientName: patient.name,
    department: document.getElementById('app-dept').value,
    doctor: document.getElementById('app-doctor').value.trim(),
    datetime: document.getElementById('app-datetime').value,
    status: 'Pending'
  };

  state.appointments.push(newAppointment);
  saveToStorage();

  renderAppointments();
  updateMetrics();
  formAppointment.reset();
  alert('Appointment successfully booked.');
});

// 6. Render Table & Status Operations
function renderAppointments() {
  queueBody.innerHTML = '';

  if (state.appointments.length === 0) {
    queueBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No appointments booked yet.</td></tr>`;
    return;
  }

  state.appointments.forEach(apt => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${apt.id}</td>
      <td>${apt.patientName}</td>
      <td>${apt.department}</td>
      <td>${apt.doctor}</td>
      <td>${new Date(apt.datetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
      <td>
        <span class="badge ${apt.status === 'Completed' ? 'badge-completed' : 'badge-pending'}">
          ${apt.status}
        </span>
      </td>
      <td>
        ${apt.status === 'Pending' 
          ? `<button class="btn btn-primary btn-sm" onclick="completeVisit('${apt.id}')">Complete</button>`
          : '—'
        }
      </td>
    `;
    queueBody.appendChild(tr);
  });
}

window.completeVisit = function(id) {
  const apt = state.appointments.find(a => a.id === id);
  if (apt) {
    apt.status = 'Completed';
    saveToStorage();
    renderAppointments();
    updateMetrics();
  }
};

// 7. Aggregate Dashboard Metrics
function updateMetrics() {
  document.getElementById('metric-patients').textContent = state.patients.length;
  document.getElementById('metric-appointments').textContent = state.appointments.length;
  
  const pendingCount = state.appointments.filter(a => a.status === 'Pending').length;
  document.getElementById('metric-pending').textContent = pendingCount;
}

// 8. Initial Load
updatePatientDropdown();
renderAppointments();
updateMetrics();

window.navigateToTab = function(tabId) {
  navButtons.forEach(b => b.classList.remove('active'));
  tabContents.forEach(tab => tab.classList.remove('active'));

  const targetBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  const targetContent = document.getElementById(tabId);

  if (targetBtn && targetContent) {
    targetBtn.classList.add('active');
    targetContent.classList.add('active');
  }
};




