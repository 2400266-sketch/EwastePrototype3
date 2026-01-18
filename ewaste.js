
/* =====================================
   REGISTER DEVICE (RULE-BASED SYSTEM)
===================================== */
document.addEventListener("DOMContentLoaded", () => {

  const PARTS = [
    "Battery","Screen","Motherboard","Camera","Speaker","Microphone",
    "Casing","Connectors & Ports","SIM/SD Tray","Flex Cables","Vibration Motor"
  ];

  const deviceForm = document.getElementById("device-form");
  const partsListEl = document.getElementById("parts-list");
  const registeredList = document.getElementById("registered-list");
  const ownerInput = document.getElementById("owner");

  const qPower = document.getElementById("q_power");
  const qBattery = document.getElementById("q_battery");
  const qScreen = document.getElementById("q_screen");
  const qWater = document.getElementById("q_water");
  const qCorrosion = document.getElementById("q_corrosion");
  const qFire = document.getElementById("q_fire");
  const qSpeaker = document.getElementById("q_speaker");
  const qVibration = document.getElementById("q_vibration");
  const qPorts = document.getElementById("q_ports");
  const qCasing = document.getElementById("q_casing");

  const startCameraBtn = document.getElementById("start-camera");
  const capturePhotoBtn = document.getElementById("capture-photo");
  const cameraPreview = document.getElementById("camera-preview");
  const photoCanvas = document.getElementById("photo-canvas");

  let cameraStream = null;
  let capturedPhoto = null;
  let savedDevices = JSON.parse(localStorage.getItem("registeredPhones")) || [];

  // BLOCK ENTER KEY
  deviceForm.addEventListener("keydown", e => {
    if (e.key === "Enter") e.preventDefault();
  });

  function getAnswers() {
    return {
      power: qPower.value, battery: qBattery.value, screen: qScreen.value, water: qWater.value,
      corrosion: qCorrosion.value, fire: qFire.value, speaker: qSpeaker.value, vibration: qVibration.value,
      ports: qPorts.value, casing: qCasing.value
    };
  }

  function classifyParts(a) {
    return PARTS.map(part => {
      let status = "Recyclable";
      if (part === "Battery" && (a.battery === "yes" || a.fire === "yes")) status = "Disposable (Hazardous)";
      if (part === "Screen" && a.screen === "yes") status = "Disposable (Broken)";
      if (a.water === "yes" || a.corrosion === "yes") {
        if (["Motherboard","Camera","Microphone","Flex Cables"].includes(part))
          status = "Disposable (Contaminated)";
      }
      if (part === "Speaker" && a.speaker === "yes") status = "Disposable (Faulty)";
      if (part === "Vibration Motor" && a.vibration === "no") status = "Disposable (Non-functional)";
      if (part === "Connectors & Ports" && a.ports === "yes") status = "Disposable (Damaged)";
      if (part === "Casing" && a.casing === "yes") status = "Disposable (Contaminated)";
      if (part === "Motherboard" && a.power === "no" && status === "Recyclable")
        status = "Recyclable (but requires testing)";
      return { part, status };
    });
  }

  function renderPartsList(list) {
    partsListEl.innerHTML = "";
    list.forEach(item => {
      partsListEl.innerHTML += `
        <tr>
          <td>${item.part}</td>
          <td class="${item.status.includes("Recyclable") ? "recyclable" : "disposable"}">
            ${item.status}
          </td>
        </tr>`;
    });
  }

 function renderRegistered() {
  if (!registeredList) return;

  if (!savedDevices.length) {
    registeredList.innerHTML = "<p>No devices registered yet.</p>";
    return;
  }

  const latestDevices = savedDevices.slice(0, 5); // only show latest 5

  registeredList.innerHTML = latestDevices.map(device => {
    const partsHtml = device.parts.map(p => `<div><strong>${p.part}</strong>: ${p.status}</div>`).join("");
    const photoHtml = device.photo 
      ? `<img src="${device.photo}" alt="Device photo" class="device-photo">`
      : `<div class="no-photo">No photo</div>`;

    return `
      <div class="device-card">
        <div class="device-info">
          <div class="device-header">
            <strong>${device.owner || "No Owner"}</strong>
            <small>${new Date(device.timestamp).toLocaleString()}</small>
          </div>
          ${partsHtml}
        </div>
        <div class="device-image">${photoHtml}</div>
      </div>`;
  }).join("");
}


  // LIVE UPDATE PARTS
  [qPower,qBattery,qScreen,qWater,qCorrosion,qFire,qSpeaker,qVibration,qPorts,qCasing]
    .forEach(q => q.addEventListener("change", () => renderPartsList(classifyParts(getAnswers()))));

  // CAMERA
  startCameraBtn?.addEventListener("click", async () => {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraPreview.srcObject = cameraStream;
  });

  capturePhotoBtn?.addEventListener("click", () => {
    if (!cameraStream) return;
    photoCanvas.width = cameraPreview.videoWidth;
    photoCanvas.height = cameraPreview.videoHeight;
    photoCanvas.getContext("2d").drawImage(cameraPreview, 0, 0);
    capturedPhoto = photoCanvas.toDataURL("image/png");
    alert("Photo captured. It will be saved after registering.");

    capturePhotoBtn?.addEventListener("click", () => {
  if (!cameraStream) return;
  
  photoCanvas.width = cameraPreview.videoWidth;
  photoCanvas.height = cameraPreview.videoHeight;
  photoCanvas.getContext("2d").drawImage(cameraPreview, 0, 0);
  capturedPhoto = photoCanvas.toDataURL("image/png");

  // Hide camera and prevent it from blocking clicks
  cameraPreview.style.display = "none";
  cameraPreview.style.pointerEvents = "none";

  alert("Photo captured. It will be saved after registering.");
});

  });

  // CLEAR FORM
  document.getElementById("clear-form").addEventListener("click", () => {
    deviceForm.reset();
    capturedPhoto = null;
    renderPartsList(classifyParts(getAnswers()));
  });

  // SUBMIT
  deviceForm.addEventListener("submit", e => {
    e.preventDefault();
    const entry = {
      owner: ownerInput.value.trim(),
      parts: classifyParts(getAnswers()),
      photo: capturedPhoto,
      timestamp: new Date().toISOString()
    };
    savedDevices.unshift(entry);
    localStorage.setItem("registeredPhones", JSON.stringify(savedDevices));
    renderRegistered();
    alert("Device successfully registered!");
  });

  // INITIAL LOAD
  renderPartsList(classifyParts(getAnswers()));
  renderRegistered();

});
// assets/app.js
// Cleaned-up JS for multi-page prototype
// No IMEI scanning / image scanning code

document.addEventListener('DOMContentLoaded', () => {
  // --- Storage keys ---
  const ACC_KEY = 'ew_accounts_v1';
  const SESSION_KEY = 'ew_session_v1';
  const DEV_KEY = 'ewaste_devices_v2';
  const REQ_KEY = 'ewaste_requests_v2';

  // --- Helper DOM picks ---
  const toastEl = document.getElementById('toast');
  const openLoginBtn = document.getElementById('open-login');
  const btnClearLocal = document.getElementById('btn-clear-local') || document.getElementById('clearLocal');
  const navLinks = document.querySelectorAll('.nav-link');

  // --- Storage helpers ---
  const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch(e) { return []; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const session = () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  const setSession = (user) => {
    if(user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
    updateAuthUI();
  };

  // --- Toast ---
  function toast(msg = 'Done', ms = 1600) {
    if(!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    setTimeout(() => toastEl.style.display = 'none', ms);
  }

  // --- Update top-level auth UI ---
  function updateAuthUI(){
    const s = session();
    if(!openLoginBtn) return;
    if(s) {
      openLoginBtn.textContent = s.name || s.identifier || 'Account';
      openLoginBtn.classList.remove('ghost');
      openLoginBtn.classList.add('primary');
      openLoginBtn.onclick = () => {
        if(confirm('Sign out?')) {
          setSession(null);
          toast('Signed out');
        }
      };
    } else {
      openLoginBtn.textContent = 'Login';
      openLoginBtn.classList.remove('primary');
      openLoginBtn.classList.add('ghost');
      openLoginBtn.onclick = () => { window.location = 'login.html'; };
    }
  }
  updateAuthUI();

  // --- Navigation active link ---
  (function markActive(){
    const path = location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      if(href.split('/').pop() === path) a.classList.add('active');
      else a.classList.remove('active');
    });
  })();

  // --- Account pages: login/register ---
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if(loginForm || registerForm) {
    // Tab toggle
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const sel = t.dataset.tab;
      if(sel === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
      }
    }));

    // Register
    registerForm && registerForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const ident = document.getElementById('reg-identifier').value.trim();
      const pass = document.getElementById('reg-pass').value;
      if(!ident || !pass || !name) { toast('Please fill all fields'); return; }
      const a = load(ACC_KEY);
      if(a.some(x => x.identifier === ident)) { toast('Account exists'); return; }
      a.push({ name, identifier: ident, password: pass });
      save(ACC_KEY, a);
      toast('Account created');
      setTimeout(() => window.location = 'index.html', 700);
    });

    // Login
    loginForm && loginForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const ident = document.getElementById('login-identifier').value.trim();
      const pass = document.getElementById('login-pass').value;
      if(!ident || !pass) { toast('Please fill fields'); return; }
      const a = load(ACC_KEY);
      const user = a.find(x => x.identifier === ident && x.password === pass);
      if(!user) { toast('Invalid credentials'); return; }
      setSession({ name: user.name, identifier: user.identifier });
      toast('Signed in');
      setTimeout(() => window.location = 'index.html', 700);
    });
  }

  // --- Home page stats + clear demo ---
  const statDevices = document.getElementById('stat-devices');
  const statRequests = document.getElementById('stat-requests');

  function renderStats(){
    if(statDevices) statDevices.textContent = load(DEV_KEY).length;
    if(statRequests) statRequests.textContent = load(REQ_KEY).length;
  }

  renderStats();

  if(btnClearLocal){
    btnClearLocal.addEventListener('click', () => {
      if(!confirm('Clear all demo data from this browser?')) return;
      localStorage.removeItem(DEV_KEY);
      localStorage.removeItem(REQ_KEY);
      ensureSamples();
      renderStats();
      renderDevicesList();
      renderRequestsList();
      toast('Demo data reset');
    });
  }

  function ensureSamples(){
    if(load(DEV_KEY).length === 0) {
      save(DEV_KEY, [
        { owner:'Carlos Reyes', brand:'Samsung', model:'Galaxy S10', condition:'Broken', notes:'Screen shattered', imei:'', created:new Date().toISOString() },
        { owner:'Alyssa Tan', brand:'Generic', model:'PowerBank X', condition:'Battery damaged', notes:'Swollen battery', imei:'', created:new Date().toISOString() }
      ]);
    }
    if(load(REQ_KEY).length === 0) {
      save(REQ_KEY, [
        { name:'Carlos Reyes', contact:'0917-555-0123', device:'Galaxy S10', item:'Mobile phone', date:'2025-10-20', notes:'Screen shattered', status:'Pending', created:new Date().toISOString() }
      ]);
    }
  }
  ensureSamples();

  // --- Register page: devices ---
  const deviceForm = document.getElementById('device-form');
  const devicesListEl = document.getElementById('devices-list');

  // Guard: require login
  if(location.pathname.split('/').pop() === 'register.html' && !session()) {
    alert('Please sign in to register a device.');
    window.location = 'login.html';
    return;
  }

  function renderDevicesList(){
    if(!devicesListEl) return;
    const items = load(DEV_KEY);
    devicesListEl.innerHTML = '';
    if(!items.length) { devicesListEl.innerHTML = '<div class="muted">No devices registered yet.</div>'; return; }
    items.forEach((it, idx) => {
      const el = document.createElement('div');
      el.className = 'device-item';
      el.innerHTML = `
        <div>
          <strong>${it.brand} ${it.model}</strong>
          <div class="meta">${it.owner} • ${it.condition}</div>
          <div class="meta">${it.notes}</div>
          <div class="meta muted small">IMEI: ${it.imei || '—'}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
          <div class="meta small">${new Date(it.created).toLocaleString()}</div>
          <div>
            <button class="small-btn primary" data-action="use" data-index="${idx}">Use in request</button>
            <button class="small-btn" data-action="del-device" data-index="${idx}">Delete</button>
          </div>
        </div>`;
      devicesListEl.appendChild(el);
    });
    renderStats();
  }
  renderDevicesList();

  if(deviceForm){
    deviceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entry = {
        owner: deviceForm.d_owner.value.trim(),
        brand: deviceForm.d_brand.value.trim(),
        model: deviceForm.d_model.value.trim(),
        imei: deviceForm.d_imei.value.trim(),
        condition: deviceForm.d_condition.value,
        notes: deviceForm.d_notes.value.trim(),
        created: new Date().toISOString()
      };
      const items = load(DEV_KEY);
      items.unshift(entry);
      save(DEV_KEY, items.slice(0,200));
      deviceForm.reset();
      renderDevicesList();
      toast('Device registered');
    });

    const deviceClearBtn = document.getElementById('device-clear');
    deviceClearBtn && deviceClearBtn.addEventListener('click', () => {
      deviceForm.reset();
      toast('Form cleared');
    });
  }

  // --- Devices list actions ---
  devicesListEl && devicesListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.index);
    const items = load(DEV_KEY);
    if(action === 'del-device') {
      if(confirm('Delete this registered device?')) {
        items.splice(idx,1);
        save(DEV_KEY, items);
        renderDevicesList();
        renderRequestsList();
        toast('Device deleted');
      }
    }
  });

  // --- Request page ---
  const requestForm = document.getElementById('request-form');
  const requestsListEl = document.getElementById('requests-list');
  const rDeviceSelect = document.getElementById('r_device');

  function populateDeviceSelect(){
    if(!rDeviceSelect) return;
    const devs = load(DEV_KEY);
    rDeviceSelect.innerHTML = '<option value="">-- select a registered device --</option>';
    devs.forEach((d, idx) => {
      const o = document.createElement('option');
      o.value = idx;
      o.textContent = `${d.brand} ${d.model} — ${d.owner}`;
      rDeviceSelect.appendChild(o);
    });
  }
  populateDeviceSelect();

  function renderRequestsList(){
    if(!requestsListEl) return;
    const items = load(REQ_KEY);
    requestsListEl.innerHTML = '';
    if(!items.length) { requestsListEl.innerHTML = '<div class="muted">No pickup requests yet.</div>'; return; }
    items.forEach((it, idx) => {
      const el = document.createElement('div');
      el.className = 'request-item';
      el.innerHTML = `
        <div class="request-left">
          <h4>${it.name} <span class="muted">— ${it.item || it.device || 'No item'}</span></h4>
          <div class="meta">${it.contact} • Preferred: ${it.date || 'Any'}</div>
          <div class="meta">${it.notes || ''}</div>
        </div>
        <div class="request-actions">
          <div class="meta small">${new Date(it.created).toLocaleString()}</div>
          <div style="margin-top:8px;display:flex;flex-direction:column;gap:8px;align-items:flex-end">
            <button class="small-btn primary" data-action="toggle" data-index="${idx}">${it.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}</button>
            <button class="small-btn" data-action="del-req" data-index="${idx}">Delete</button>
          </div>
        </div>`;
      requestsListEl.appendChild(el);
    });
    renderStats();
  }
  renderRequestsList();

  if(requestForm){
    requestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const deviceIndex = requestForm.r_device.value;
      const devs = load(DEV_KEY);
      const deviceName = deviceIndex !== '' ? `${devs[Number(deviceIndex)].brand} ${devs[Number(deviceIndex)].model}` : '';
      const entry = {
        name: requestForm.r_name.value.trim(),
        contact: requestForm.r_contact.value.trim(),
        device: deviceName,
        item: requestForm.r_item.value.trim(),
        date: requestForm.r_date.value,
        notes: requestForm.r_notes.value.trim(),
        status: 'Pending',
        created: new Date().toISOString()
      };
      const items = load(REQ_KEY);
      items.unshift(entry);
      save(REQ_KEY, items.slice(0,200));
      requestForm.reset();
      populateDeviceSelect();
      renderRequestsList();
      toast('Pickup request submitted');
    });

    const requestClearBtn = document.getElementById('request-clear');
    requestClearBtn && requestClearBtn.addEventListener('click', () => {
      requestForm.reset();
      toast('Form cleared');
    });
  }

  // --- Requests list actions ---
  requestsListEl && requestsListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.index);
    const items = load(REQ_KEY);
    if(action === 'del-req') {
      if(confirm('Delete this request?')) {
        items.splice(idx,1);
        save(REQ_KEY, items);
        renderRequestsList();
        toast('Request deleted');
      }
    } else if(action === 'toggle') {
      items[idx].status = items[idx].status === 'Completed' ? 'Pending' : 'Completed';
      save(REQ_KEY, items);
      renderRequestsList();
      toast('Status updated');
    }
  });

  // --- Centers page ---
  const CENTERS = [
    { name: 'SM City Batangas – SM Cares E-Waste Collection', address: '2nd Floor Cyberzone, SM City Batangas, Pallocan West, Batangas City', hours: 'Mon–Sun 10:00–21:00' },
    { name: 'Globe E-Waste Zero Bin – SM City Batangas', address: 'Ground Floor, SM City Batangas, Pallocan West, Batangas City', hours: 'Mon–Sun 10:00–21:00' },
    { name: 'Batangas City ENRO – Environmental Office', address: 'Batangas City Hall Compound, Poblacion, Batangas City', hours: 'Mon–Fri 8:00–17:00' }
  ];

  const centersListEl = document.getElementById('centers-list');
  const useLocBtn = document.getElementById('use-location');
  const locStatus = document.getElementById('location-status');

  if(centersListEl){
    centersListEl.innerHTML = CENTERS.map(c => {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name + ' ' + c.address)}`;
      return `<li>
        <strong>${c.name}</strong>
        <div class="muted">${c.address} • ${c.hours}</div>
        <div style="margin-top:8px">
          <a class="btn small" href="${mapsUrl}" target="_blank" rel="noopener">Navigate</a>
        </div>
      </li>`;
    }).join('');

    useLocBtn && useLocBtn.addEventListener('click', () => {
      if (!navigator.geolocation) { locStatus.textContent = 'Geolocation not supported.'; return; }
      locStatus.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          locStatus.textContent = `Lat ${latitude.toFixed(4)} Lon ${longitude.toFixed(4)}`;
          centersListEl.innerHTML = CENTERS.map(c => {
            const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encodeURIComponent(c.name + ' ' + c.address)}`;
            return `<li>
              <strong>${c.name}</strong>
              <div class="muted">${c.address} • ${c.hours}</div>
              <div style="margin-top:8px">
                <a class="btn small" href="${url}" target="_blank" rel="noopener">Navigate from here</a>
              </div>
            </li>`;
          }).join('');
        },
        err => { locStatus.textContent = 'Location permission denied or unavailable.'; },
        { timeout: 10000 }
      );
    });
  }

  // --- Final render calls ---
  renderDevicesList();
  populateDeviceSelect();
  renderRequestsList();
  renderStats();
});

// JS for managing stored data
document.addEventListener("DOMContentLoaded", () => {

  const ACC_KEY = 'ew_accounts_v1';
  const DEV_KEY = 'ewaste_devices_v2';
  const REQ_KEY = 'ewaste_requests_v2';
  const SESSION_KEY = 'ew_session_v1';

  const dataListEl = document.getElementById('data-list');
  const deleteAllBtn = document.getElementById('delete-all');

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } 
    catch(e) { return []; }
  }

  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Render all stored data
  function renderDataList() {
    if(!dataListEl) return;

    const accounts = load(ACC_KEY);
    const devices = load(DEV_KEY);
    const requests = load(REQ_KEY);
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');

    let html = '';

    if(session) {
      html += `<div class="data-item">
        <strong>Current Session:</strong> ${session.name} (${session.identifier})
        <button class="delete-btn" data-type="session">Delete</button>
      </div>`;
    }

    accounts.forEach((acc, idx) => {
      html += `<div class="data-item">
        <strong>Account:</strong> ${acc.name} (${acc.identifier})
        <button class="delete-btn" data-type="account" data-index="${idx}">Delete</button>
      </div>`;
    });

    devices.forEach((dev, idx) => {
      html += `<div class="data-item">
        <strong>Device:</strong> ${dev.brand} ${dev.model} (${dev.owner})
        <button class="delete-btn" data-type="device" data-index="${idx}">Delete</button>
      </div>`;
    });

    requests.forEach((req, idx) => {
      html += `<div class="data-item">
        <strong>Request:</strong> ${req.item || req.device} for ${req.name}
        <button class="delete-btn" data-type="request" data-index="${idx}">Delete</button>
      </div>`;
    });

    if(!html) html = '<p class="muted">No stored data found.</p>';

    dataListEl.innerHTML = html;

    // Attach delete handlers
    dataListEl.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const idx = btn.dataset.index;

        if(type === 'session') {
          localStorage.removeItem(SESSION_KEY);
        } else if(type === 'account') {
          const arr = load(ACC_KEY);
          arr.splice(idx,1);
          save(ACC_KEY, arr);
        } else if(type === 'device') {
          const arr = load(DEV_KEY);
          arr.splice(idx,1);
          save(DEV_KEY, arr);
        } else if(type === 'request') {
          const arr = load(REQ_KEY);
          arr.splice(idx,1);
          save(REQ_KEY, arr);
        }

        renderDataList(); // Refresh list
      });
    });
  }

  // Delete all data button
  deleteAllBtn?.addEventListener('click', () => {
    if(!confirm('Are you sure you want to delete all your data?')) return;
    localStorage.removeItem(ACC_KEY);
    localStorage.removeItem(DEV_KEY);
    localStorage.removeItem(REQ_KEY);
    localStorage.removeItem(SESSION_KEY);
    renderDataList();
  });

  // Initial render
  renderDataList();
});
