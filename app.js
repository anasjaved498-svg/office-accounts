import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

let supabase = null;

const configured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('YOUR-PROJECT') &&
  !SUPABASE_ANON_KEY.includes('YOUR_ANON')
);

const DEVICE_COLORS = [
  ['blue', 'Blue', '#2563eb'],
  ['charcoal', 'Charcoal', '#475569'],
  ['sky', 'Sky Blue', '#0ea5e9'],
  ['green', 'Green', '#16a34a'],
  ['orange', 'Orange', '#ea580c'],
  ['purple', 'Purple', '#7c3aed']
];

const MANAGER_COLORS = [
  '#2563eb',
  '#0ea5e9',
  '#475569',
  '#7c3aed',
  '#16a34a',
  '#ea580c',
  '#db2777'
];

const demo = {
  managers: [
    {
      id: 'm1',
      name: 'Umm-e-Hania',
      role: 'Account Manager',
      active: true,
      color: '#2563eb',
      custom_fields: {}
    },
    {
      id: 'm2',
      name: 'Fiza',
      role: 'Account Manager',
      active: true,
      color: '#0ea5e9',
      custom_fields: {}
    },
    {
      id: 'm3',
      name: 'Humaira',
      role: 'Account Manager',
      active: true,
      color: '#475569',
      custom_fields: {}
    }
  ],

  devices: [
    {
      id: 'd1',
      name: 'Black',
      identifier: 'Device #1',
      color: 'blue',
      status: 'Active',
      notes: '',
      custom_fields: {}
    },
    {
      id: 'd2',
      name: 'White',
      identifier: 'Device #2',
      color: 'charcoal',
      status: 'Active',
      notes: '',
      custom_fields: {}
    },
    {
      id: 'd3',
      name: 'Sky Blue',
      identifier: 'Device #3',
      color: 'sky',
      status: 'Active',
      notes: '',
      custom_fields: {}
    }
  ],

  accounts: [
    ['d1', 'Mr pow', 'm1'],
    ['d1', 'cleancrazi1', 'm1'],
    ['d1', 'cleaningasmr000', 'm1'],
    ['d1', 'tungtung homies', 'm1'],
    ['d1', 'rugcleaningasmr001', 'm1'],
    ['d1', 'animalaignmenthub', 'm1'],

    ['d2', 'junktojackpotshoes', 'm2'],
    ['d2', 'thegeekvaultcleaning', 'm2'],
    ['d2', 'junktojackpot', 'm2'],
    ['d2', 'treasurehunt051', 'm2'],

    ['d3', 'vendingmachinebusiness2', 'm3'],
    ['d3', 'humankindness3', 'm3'],
    ['d3', 'cats4care', 'm3'],
    ['d3', 'shaguntoodielies', 'm3'],
    ['d3', 'bitamiskitchen', 'm3'],
    ['d3', 'growyourbrand', 'm3']
  ].map((r, i) => ({
    id: `a${i + 1}`,
    device_id: r[0],
    username: r[1],
    gmail: '',
    content_name: '',
    manager_id: r[2],
    status: 'Active',
    notes: '',
    custom_fields: {}
  }))
};

const state = {
  route: parseRoute(),
  data: {
    devices: [],
    accounts: [],
    managers: []
  },
  loading: true,
  search: '',
  modal: null,
  session: null,
  dbError: '',
  mobileOpen: false,
  workflowOrder: []
};

const $ = (s, root = document) =>
  root.querySelector(s);

const $$ = (s, root = document) =>
  [...root.querySelectorAll(s)];

const esc = (v = '') =>
  String(v).replace(
    /[&<>'"]/g,
    c =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      })[c]
  );

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(x => x[0])
    .join('')
    .toUpperCase();

const navigate = r => {
  window.location.hash = r;
};

function parseRoute() {
  const raw =
    location.hash.replace(/^#\/?/, '') ||
    'dashboard';

  const [page, id] = raw.split('/');

  return {
    page,
    id: id || null
  };
}

function deviceColor(d) {
  const key =
    String(d?.identifier || '').toLowerCase();

  if (key.includes('device #1')) {
    return '#2563eb';
  }

  if (key.includes('device #2')) {
    return '#c47a1b';
  }

  if (key.includes('device #3')) {
    return '#4f9b68';
  }

  return (
    DEVICE_COLORS.find(
      x => x[0] === d?.color
    )?.[2] ||
    d?.color ||
    '#2563eb'
  );
}

function deviceName(id) {
  return (
    state.data.devices.find(
      d => d.id === id
    )?.name ||
    'Unknown device'
  );
}

function manager(id) {
  return state.data.managers.find(
    m => m.id === id
  );
}

function managerName(id) {
  return (
    manager(id)?.name ||
    'Unassigned'
  );
}

function managerColor(id) {
  return (
    manager(id)?.color ||
    '#64748b'
  );
}

function customEntries(obj) {
  return Object.entries(obj || {});
}

function countDevice(id) {
  return state.data.accounts.filter(
    a => a.device_id === id
  ).length;
}

function countManager(id) {
  return state.data.accounts.filter(
    a => a.manager_id === id
  ).length;
}


/* =========================================================
   WORKFLOW ORDER
========================================================= */

const WORKFLOW_ORDER_KEY =
  'tiktokOfficeWorkflowDeviceOrder';

function ensureWorkflowOrder() {
  const ids =
    state.data.devices.map(
      d => d.id
    );

  let saved = [];

  try {
    saved = JSON.parse(
      localStorage.getItem(
        WORKFLOW_ORDER_KEY
      ) || '[]'
    );
  } catch (_) {}

  if (!Array.isArray(saved)) {
    saved = [];
  }

  state.workflowOrder = [
    ...saved.filter(
      id => ids.includes(id)
    ),
    ...ids.filter(
      id => !saved.includes(id)
    )
  ];

  try {
    localStorage.setItem(
      WORKFLOW_ORDER_KEY,
      JSON.stringify(
        state.workflowOrder
      )
    );
  } catch (_) {}
}

function orderedDevices() {
  ensureWorkflowOrder();

  const byId = new Map(
    state.data.devices.map(
      d => [d.id, d]
    )
  );

  return state.workflowOrder
    .map(id => byId.get(id))
    .filter(Boolean);
}

function moveWorkflowDevice(
  id,
  direction
) {
  ensureWorkflowOrder();

  const arr = [
    ...state.workflowOrder
  ];

  const i =
    arr.indexOf(id);

  if (i < 0) {
    return;
  }

  const j =
    direction === 'up'
      ? i - 1
      : i + 1;

  if (
    j < 0 ||
    j >= arr.length
  ) {
    return;
  }

  [
    arr[i],
    arr[j]
  ] = [
    arr[j],
    arr[i]
  ];

  state.workflowOrder =
    arr;

  try {
    localStorage.setItem(
      WORKFLOW_ORDER_KEY,
      JSON.stringify(arr)
    );
  } catch (_) {}

  render();
}


/* =========================================================
   SUPABASE
========================================================= */

async function load() {
  state.loading = true;

  render();

  if (!configured) {
    state.data =
      JSON.parse(
        JSON.stringify(demo)
      );

    ensureWorkflowOrder();

    state.dbError = '';
    state.session = true;
    state.loading = false;

    render();

    return;
  }

  if (!supabase) {
    state.loading = false;
    render();
    return;
  }

  try {
    const [
      m,
      d,
      a
    ] = await Promise.all([
      supabase
        .from('team_members')
        .select('*')
        .order('name'),

      supabase
        .from('devices')
        .select('*')
        .order('created_at'),

      supabase
        .from('tiktok_accounts')
        .select('*')
        .order('created_at')
    ]);

    if (m.error) {
      throw m.error;
    }

    if (d.error) {
      throw d.error;
    }

    if (a.error) {
      throw a.error;
    }

    state.data = {
      managers:
        m.data || [],

      devices:
        d.data || [],

      accounts:
        a.data || []
    };

    ensureWorkflowOrder();

    state.dbError = '';
  } catch (e) {
    state.dbError =
      e.message ||
      'Could not load Supabase data.';
  }

  state.loading = false;

  render();
}

async function save(
  table,
  payload,
  id = null
) {
  if (!configured) {
    const key =
      table === 'team_members'
        ? 'managers'
        : table === 'devices'
          ? 'devices'
          : 'accounts';

    if (id) {
      state.data[key] =
        state.data[key].map(
          x =>
            x.id === id
              ? {
                  ...x,
                  ...payload
                }
              : x
        );
    } else {
      state.data[key].push({
        ...payload,
        id:
          `${key[0]}${Date.now()}`
      });
    }

    return;
  }

  const q = id
    ? supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select()
        .single()
    : supabase
        .from(table)
        .insert(payload)
        .select()
        .single();

  const {
    error
  } = await q;

  if (error) {
    throw error;
  }

  await load();
}

async function remove(
  table,
  id
) {
  if (!configured) {
    if (
      table === 'devices'
    ) {
      state.data.devices =
        state.data.devices.filter(
          x => x.id !== id
        );

      state.data.accounts =
        state.data.accounts.filter(
          x =>
            x.device_id !== id
        );
    } else if (
      table === 'team_members'
    ) {
      state.data.managers =
        state.data.managers.filter(
          x => x.id !== id
        );

      state.data.accounts =
        state.data.accounts.map(
          a =>
            a.manager_id === id
              ? {
                  ...a,
                  manager_id: null
                }
              : a
        );
    } else {
      state.data.accounts =
        state.data.accounts.filter(
          x => x.id !== id
        );
    }

    return;
  }

  const {
    error
  } =
    await supabase
      .from(table)
      .delete()
      .eq('id', id);

  if (error) {
    throw error;
  }

  await load();
}

async function act(
  fn,
  msg
) {
  try {
    await fn();

    if (configured) {
      await load();
    } else {
      render();
    }

    toast(msg);
  } catch (e) {
    toast(
      e.message ||
        'Action failed',
      'error'
    );
  }
}


/* =========================================================
   BOOT
========================================================= */

async function boot() {
  bindStatic();

  if (configured) {
    try {
      const mod =
        await import(
          'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
        );

      if (
        !mod?.createClient
      ) {
        throw new Error(
          'Supabase client library did not load.'
        );
      }

      supabase =
        mod.createClient(
          SUPABASE_URL,
          SUPABASE_ANON_KEY
        );

      const {
        data,
        error
      } =
        await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      state.session =
        data.session;

      $('#signOutBtn')
        .classList
        .remove('hidden');

      supabase.auth.onAuthStateChange(
        (_, s) => {
          state.session = s;
          render();
        }
      );
    } catch (e) {
      state.session = true;

      state.dbError =
        `Supabase could not be initialized: ${
          e.message || e
        }`;

      state.loading = false;

      render();

      return;
    }
  } else {
    state.session = true;
  }

  await load();
}


/* =========================================================
   STATIC EVENTS
========================================================= */

function bindStatic() {
  window.addEventListener(
    'hashchange',
    () => {
      state.route =
        parseRoute();

      state.mobileOpen =
        false;

      render();
    }
  );

  $('#globalSearch')
    .addEventListener(
      'input',
      e => {
        state.search =
          e.target.value;

        render();
      }
    );

  $('#refreshBtn')
    .addEventListener(
      'click',
      () =>
        act(
          load,
          'Data refreshed'
        )
    );

  $('#topAddBtn')
    .addEventListener(
      'click',
      () =>
        openModal('account')
    );

  $('#sideAddAccount')
    .addEventListener(
      'click',
      () => {
        closeSide();
        openModal('account');
      }
    );

  $('#openSide')
    .addEventListener(
      'click',
      () =>
        openSide()
    );

  $('#closeSide')
    .addEventListener(
      'click',
      () =>
        closeSide()
    );

  $('#sideOverlay')
    .addEventListener(
      'click',
      () =>
        closeSide()
    );

  $('#signOutBtn')
    .addEventListener(
      'click',
      async () => {
        if (configured) {
          await supabase.auth.signOut();
        }
      }
    );

  $$('#nav [data-route]')
    .forEach(
      b =>
        b.addEventListener(
          'click',
          () =>
            navigate(
              b.dataset.route
            )
        )
    );
}

function openSide() {
  state.mobileOpen =
    true;

  $('#sidebar')
    .classList
    .add('open');

  $('#sideOverlay')
    .classList
    .add('show');
}

function closeSide() {
  state.mobileOpen =
    false;

  $('#sidebar')
    .classList
    .remove('open');

  $('#sideOverlay')
    .classList
    .remove('show');
}


/* =========================================================
   RENDER
========================================================= */

function render() {
  $('#bootStatus')
    ?.classList
    .add('hidden');

  $('#app')
    .classList
    .remove('hidden');

  if (
    configured &&
    !state.session
  ) {
    $('#app')
      .classList
      .add('hidden');

    renderAuth();

    return;
  }

  $('#auth')
    .classList
    .add('hidden');

  updateSide();
  updateTop();
  renderAlerts();

  if (state.loading) {
    $('#view').innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <span>
          Loading office data…
        </span>
      </div>
    `;

    return;
  }

  $('#view').innerHTML =
    routeView();

  bindView();
}

function renderAuth() {
  $('#auth')
    .classList
    .remove('hidden');

  $('#auth').innerHTML = `
    <div class="auth-card">

      <div class="brand-icon big">
        TH
      </div>

      <span class="eyebrow">
        TIKTOK HUB ACCESS
      </span>

      <h2>
        TikTok Hub
      </h2>

      <p>
        Sign in with the Supabase
        office user you created.
      </p>

      <form
        id="loginForm"
        class="form-stack"
      >

        <label>
          Email

          <input
            id="loginEmail"
            type="email"
            required
            placeholder="office@example.com"
          >
        </label>

        <label>
          Password

          <input
            id="loginPassword"
            type="password"
            required
            placeholder="••••••••"
          >
        </label>

        <div
          id="loginError"
          class="form-error hidden"
        ></div>

        <button
          class="btn primary full"
          type="submit"
        >
          Sign in
        </button>

      </form>

      <div class="auth-tip">
        Use the Supabase Dashboard →
        Authentication → Users account.
        Do not use the service-role key.
      </div>

    </div>
  `;

  $('#loginForm')
    .addEventListener(
      'submit',
      async e => {
        e.preventDefault();

        $('#loginError')
          .classList
          .add('hidden');

        const email =
          $('#loginEmail')
            .value
            .trim();

        const password =
          $('#loginPassword')
            .value;

        const {
          error
        } =
          await supabase.auth
            .signInWithPassword({
              email,
              password
            });

        if (error) {
          $('#loginError')
            .textContent =
            error.message;

          $('#loginError')
            .classList
            .remove('hidden');
        }
      }
    );
}

function updateSide() {
  $('#deviceCount')
    .textContent =
    state.data.devices.length;

  $('#accountCount')
    .textContent =
    state.data.accounts.length;

  $('#managerCount')
    .textContent =
    state.data.managers.length;

  $('#deviceShortcuts')
    .innerHTML =
    state.data.devices
      .map(
        d =>
          `
          <button
            class="device-shortcut"
            data-open-device="${d.id}"
          >

            <i
              class="device-dot"
              style="
                background:${deviceColor(d)}
              "
            ></i>

            <span>
              ${esc(d.name)}
            </span>

            <em>
              ${countDevice(d.id)}
            </em>

          </button>
          `
      )
      .join('');

  $$('.device-shortcut')
    .forEach(
      b =>
        b.onclick = () =>
          navigate(
            `device/${b.dataset.openDevice}`
          )
    );

  $$('#nav .nav-item')
    .forEach(
      b =>
        b.classList.toggle(
          'active',
          b.dataset.route ===
            state.route.page
        )
    );

  $('#connectionState')
    .textContent =
    configured
      ? (
          state.dbError
            ? 'Database error'
            : 'Connected to Supabase'
        )
      : 'Demo mode';
}

function updateTop() {
  const labels = {
    dashboard: 'Dashboard',
    workflow: 'All Workflow',
    devices: 'Devices',
    device: 'Device',
    accounts: 'Accounts',
    account: 'Account',
    managers: 'Team Members',
    manager: 'Team Member'
  };

  $('#crumbs')
    .textContent =
    `Office / ${
      labels[state.route.page] ||
      'Dashboard'
    }${
      state.route.id
        ? ' / Details'
        : ''
    }`;

  let title =
    'TikTok Hub';

  if (
    state.route.page ===
    'workflow'
  ) {
    title =
      'All Workflow';
  } else if (
    state.route.page ===
    'devices'
  ) {
    title =
      'Mobile Devices';
  } else if (
    state.route.page ===
    'accounts'
  ) {
    title =
      'TikTok Accounts';
  } else if (
    state.route.page ===
    'managers'
  ) {
    title =
      'Team Members';
  } else if (
    state.route.page ===
    'device'
  ) {
    title =
      state.data.devices.find(
        d =>
          d.id ===
          state.route.id
      )?.name ||
      'Device';
  } else if (
    state.route.page ===
    'account'
  ) {
    title =
      '@' +
      (
        state.data.accounts.find(
          a =>
            a.id ===
            state.route.id
        )?.username ||
        'Account'
      );
  } else if (
    state.route.page ===
    'manager'
  ) {
    title =
      state.data.managers.find(
        m =>
          m.id ===
          state.route.id
      )?.name ||
      'Team Member';
  }

  $('#pageTitle')
    .textContent =
    title;
}

function renderAlerts() {
  const bits = [];

  if (!configured) {
    bits.push(`
      <div class="alert demo">

        <b>
          Demo mode
        </b>

        <span>
          Connect Supabase in
          <code>config.js</code>
          to make data persistent
          across devices.
        </span>

      </div>
    `);
  }

  if (state.dbError) {
    bits.push(`
      <div class="alert error">

        <b>
          Supabase error
        </b>

        <span>
          ${esc(
            state.dbError
          )}
        </span>

      </div>
    `);
  }

  $('#alerts')
    .innerHTML =
    bits.join('');
}


/* =========================================================
   ROUTES
========================================================= */

function routeView() {
  switch (
    state.route.page
  ) {
    case 'workflow':
      return workflowPage();

    case 'devices':
      return devicesPage();

    case 'device':
      return devicePage();

    case 'accounts':
      return accountsPage();

    case 'account':
      return accountPage();

    case 'managers':
      return managersPage();

    case 'manager':
      return managerPage();

    default:
      return dashboardPage();
  }
}


/* =========================================================
   DASHBOARD
========================================================= */

function dashboardPage() {
  const active =
    state.data.accounts.filter(
      a => a.status === 'Active'
    ).length;

  const unassigned =
    state.data.accounts.filter(
      a => !a.manager_id
    ).length;

  return `
    <div class="stack">

      <section class="hero">

        <div>

          <span class="eyebrow">
            OFFICE OPERATIONS
          </span>

          <h2>
            Everything connected
            in one place.
          </h2>

          <p>
            Track mobile devices,
            TikTok accounts, Gmail
            details, content categories
            and the team member
            responsible for each account.
          </p>

          <div class="hero-actions">

            <button
              class="btn primary"
              data-nav="workflow"
            >
              Open full workflow →
            </button>

            <button
              class="btn ghost"
              data-add-device
            >
              ＋ Add device
            </button>

          </div>

        </div>

        <div class="live-box">

          <span>
            LIVE
          </span>

          <b>
            ${active}
          </b>

          <small>
            active accounts
          </small>

        </div>

      </section>


      <section class="stats">

        <button
          class="stat"
          data-nav="devices"
        >

          <span class="stat-icon">
            ▣
          </span>

          <span>
            Devices
          </span>

          <b>
            ${state.data.devices.length}
          </b>

          <small>
            mobile devices
          </small>

        </button>

        <button
          class="stat"
          data-nav="accounts"
        >

          <span class="stat-icon">
            @
          </span>

          <span>
            Accounts
          </span>

          <b>
            ${state.data.accounts.length}
          </b>

          <small>
            TikTok accounts
          </small>

        </button>

        <button
          class="stat"
          data-nav="managers"
        >

          <span class="stat-icon">
            ◎
          </span>

          <span>
            Team
          </span>

          <b>
            ${state.data.managers.length}
          </b>

          <small>
            account managers
          </small>

        </button>

        <div class="stat">

          <span class="stat-icon">
            ✓
          </span>

          <span>
            Active
          </span>

          <b>
            ${active}
          </b>

          <small>
            accounts active
          </small>

        </div>

      </section>


      <div class="two-panels">

        <section class="panel">

          <div class="panel-head">

            <div>

              <span class="eyebrow">
                DEVICE OVERVIEW
              </span>

              <h3>
                Mobile devices
              </h3>

            </div>

            <button
              class="link-btn"
              data-nav="devices"
            >
              View all →
            </button>

          </div>

          <div class="rows">

            ${
              state.data.devices
                .map(
                  d =>
                    deviceRow(d)
                )
                .join('') ||
              emptyBlock(
                'No devices',
                'Add a device to begin.'
              )
            }

          </div>

        </section>


        <section class="panel">

          <div class="panel-head">

            <div>

              <span class="eyebrow">
                TEAM
              </span>

              <h3>
                Managers
              </h3>

            </div>

            <button
              class="link-btn"
              data-nav="managers"
            >
              View all →
            </button>

          </div>

          <div class="rows">

            ${
              state.data.managers
                .map(
                  m =>
                    managerRow(m)
                )
                .join('') ||
              emptyBlock(
                'No team members',
                'Add a team member.'
              )
            }

          </div>

        </section>

      </div>


      <section class="panel">

        <div class="panel-head">

          <div>

            <span class="eyebrow">
              QUICK CHOICE
            </span>

            <h3>
              Open any workspace
            </h3>

            <p>
              Each choice opens a separate
              page. Changes stay synced
              through Supabase.
            </p>

          </div>

        </div>

        <div class="choices">

          <button
            data-nav="workflow"
          >

            <b>
              ⌁
            </b>

            <span>

              <strong>
                Full workflow
              </strong>

              <small>
                Device → Account → Team
              </small>

            </span>

            →
          </button>

          <button
            data-nav="devices"
          >

            <b>
              ▣
            </b>

            <span>

              <strong>
                Device
              </strong>

              <small>
                Open a mobile workspace
              </small>

            </span>

            →
          </button>

          <button
            data-nav="accounts"
          >

            <b>
              @
            </b>

            <span>

              <strong>
                Account
              </strong>

              <small>
                Open account + Gmail
              </small>

            </span>

            →
          </button>

          <button
            data-nav="managers"
          >

            <b>
              ◎
            </b>

            <span>

              <strong>
                Team member
              </strong>

              <small>
                Open her manager page
              </small>

            </span>

            →
          </button>

        </div>

      </section>


      ${
        unassigned
          ? `
            <div class="alert warning">

              <b>
                ${unassigned}
                account${
                  unassigned === 1
                    ? ''
                    : 's'
                }
                unassigned
              </b>

              <span>
                Open Accounts and choose
                the responsible team member.
              </span>

            </div>
          `
          : ''
      }

    </div>
  `;
}

function deviceRow(d) {
  return `
    <button
      class="table-row"
      data-nav="device/${d.id}"
    >

      <i
        class="device-dot big"
        style="
          background:${deviceColor(d)}
        "
      ></i>

      <span>

        <strong>
          ${esc(d.name)}
        </strong>

        <small>
          ${esc(
            d.identifier ||
            'No identifier'
          )}
        </small>

      </span>

      <em>
        ${countDevice(d.id)}
        accounts
      </em>

      <b>
        ›
      </b>

    </button>
  `;
}

function managerRow(m) {
  return `
    <button
      class="table-row"
      data-nav="manager/${m.id}"
    >

      <i
        class="avatar"
        style="
          background:${m.color}18;
          color:${m.color}
        "
      >
        ${esc(
          initials(m.name)
        )}
      </i>

      <span>

        <strong>
          ${esc(m.name)}
        </strong>

        <small>
          ${esc(
            m.role ||
            'Account Manager'
          )}
        </small>

      </span>

      <em>
        ${countManager(m.id)}
        accounts
      </em>

      <b>
        ›
      </b>

    </button>
  `;
}


/* =========================================================
   DEVICES
========================================================= */

function devicesPage() {
  return `
    <div class="stack">

      <section class="page-head">

        <div>

          <span class="eyebrow">
            DEVICES
          </span>

          <h2>
            Mobile devices
          </h2>

          <p>
            Add, edit or remove phones
            and open each complete workflow.
          </p>

        </div>

        <button
          class="btn primary"
          data-add-device
        >
          ＋ Add device
        </button>

      </section>

      <div class="card-grid">

        ${
          state.data.devices
            .map(
              d =>
                deviceCard(d)
            )
            .join('') ||
          emptyBlock(
            'No devices',
            'Add your first device.'
          )
        }

      </div>

    </div>
  `;
}

function deviceCard(d) {
  return `
    <article class="entity-card">

      <i
        class="entity-line"
        style="
          background:${deviceColor(d)}
        "
      ></i>

      <div class="entity-top">

        <i
          class="device-dot big"
          style="
            background:${deviceColor(d)}
          "
        ></i>

        <span
          class="status-chip green"
        >
          ${esc(
            d.status ||
            'Active'
          )}
        </span>

        <button
          class="icon-btn"
          data-edit-device="${d.id}"
        >
          ⋯
        </button>

      </div>

      <button
        class="entity-name"
        data-nav="device/${d.id}"
      >

        <strong>
          ${esc(d.name)}
        </strong>

        <small>
          ${esc(
            d.identifier ||
            'No identifier'
          )}
        </small>

      </button>

      <div class="meta-line">

        <span>
          ${countDevice(d.id)}
          accounts
        </span>

        <span>
          ${esc(
            d.notes
              ? 'Has notes'
              : 'No notes'
          )}
        </span>

      </div>

      <button
        class="btn secondary full"
        data-nav="device/${d.id}"
      >
        Open device →
      </button>

    </article>
  `;
}


/* =========================================================
   DEVICE DETAIL
========================================================= */

function devicePage() {
  const d =
    state.data.devices.find(
      x =>
        x.id ===
        state.route.id
    );

  if (!d) {
    return notFound(
      'Device',
      'devices'
    );
  }

  const ac =
    state.data.accounts.filter(
      a =>
        a.device_id ===
        d.id
    );

  return `
    <div class="stack">

      <div class="detail-head">

        <button
          class="back"
          data-nav="devices"
        >
          ← Back
        </button>

        <div class="detail-title">

          <i
            style="
              background:${deviceColor(d)}
            "
          ></i>

          <div>

            <span class="eyebrow">
              DEVICE WORKSPACE
            </span>

            <h2>
              ${esc(d.name)}
            </h2>

            <p>
              ${esc(
                d.identifier ||
                'No identifier'
              )}
              · ${ac.length}
              accounts
            </p>

          </div>

        </div>

        <div class="detail-actions">

          <button
            class="btn secondary"
            data-edit-device="${d.id}"
          >
            ✎ Edit
          </button>

          <button
            class="btn primary"
            data-add-account-device="${d.id}"
          >
            ＋ Add account
          </button>

        </div>

      </div>


      <div class="two-panels detail">

        <section class="panel">

          <div class="panel-head">

            <div>

              <span class="eyebrow">
                WORKFLOW
              </span>

              <h3>
                Device → Accounts → Team
              </h3>

              <p>
                Every account on this phone
                is shown with Gmail and
                responsible manager.
              </p>

            </div>

          </div>

          <div class="workflow-list">

            <div class="workflow-source">

              <i
                class="device-dot big"
                style="
                  background:${deviceColor(d)}
                "
              ></i>

              <div>

                <b>
                  ${esc(d.name)}
                </b>

                <small>
                  ${esc(
                    d.identifier ||
                    'No identifier'
                  )}
                </small>

              </div>

            </div>

            <div
              class="wf-connector"
              style="
                background:${deviceColor(d)}
              "
            ></div>

            ${
              ac
                .map(
                  a =>
                    accountFlow(
                      a,
                      d
                    )
                )
                .join('') ||
              emptyBlock(
                'No accounts yet',
                'Add the first TikTok account to this device.'
              )
            }

          </div>

        </section>


        <section class="panel">

          <div class="panel-head">

            <div>

              <span class="eyebrow">
                DETAILS
              </span>

              <h3>
                Device information
              </h3>

            </div>

          </div>

          <div class="facts">

            ${fact(
              'Identifier',
              d.identifier ||
                '—'
            )}

            ${fact(
              'Status',
              d.status ||
                'Active'
            )}

            ${fact(
              'Notes',
              d.notes ||
                'No notes'
            )}

            ${customFacts(
              d.custom_fields
            )}

          </div>

        </section>

      </div>


      <div class="danger">

        <div>

          <b>
            Remove this device
          </b>

          <small>
            Linked accounts are also removed
            because the database uses device cascade.
          </small>

        </div>

        <button
          class="btn danger"
          data-delete-device="${d.id}"
        >
          Delete device
        </button>

      </div>

    </div>
  `;
}

function accountFlow(a, d) {
  const m =
    manager(a.manager_id);

  return `
    <button
      class="account-flow"
      data-nav="account/${a.id}"
    >

      <i
        style="
          background:${deviceColor(d)}
        "
      ></i>

      <div>

        <b>
          @${esc(a.username)}
        </b>

        <small>
          ${esc(
            a.gmail ||
            'Gmail not added'
          )}
        </small>

      </div>

      <span>
        ${esc(
          a.content_name ||
          'Content not set'
        )}
      </span>

      <div
        class="manager-mini"
      >

        <i
          class="avatar tiny"
          style="
            background:${
              m?.color ||
              '#64748b'
            }18;

            color:${
              m?.color ||
              '#64748b'
            }
          "
        >
          ${esc(
            initials(
              m?.name ||
              'U'
            )
          )}
        </i>

        ${esc(
          m?.name ||
          'Unassigned'
        )}

      </div>

      ›

    </button>
  `;
}


/* =========================================================
   ACCOUNTS
========================================================= */

function accountsPage() {
  const q =
    state.search
      .trim()
      .toLowerCase();

  const list =
    state.data.accounts.filter(
      a =>
        !q ||
        [
          a.username,
          a.gmail,
          a.content_name,
          a.status,
          a.notes,
          deviceName(
            a.device_id
          ),
          managerName(
            a.manager_id
          ),
          JSON.stringify(
            a.custom_fields
          )
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
    );

  return `
    <div class="stack">

      <section class="page-head">

        <div>

          <span class="eyebrow">
            ACCOUNTS
          </span>

          <h2>
            All TikTok accounts
          </h2>

          <p>
            Click an account to open its
            own page and edit device,
            Gmail, content or manager.
          </p>

        </div>

        <button
          class="btn primary"
          data-add-account
        >
          ＋ Add account
        </button>

      </section>


      <section class="panel">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  ACCOUNT
                </th>

                <th>
                  DEVICE
                </th>

                <th>
                  GMAIL
                </th>

                <th>
                  CONTENT
                </th>

                <th>
                  MANAGER
                </th>

                <th>
                  STATUS
                </th>

                <th></th>

              </tr>

            </thead>

            <tbody>

              ${
                list
                  .map(
                    a =>
                      accountTableRow(
                        a
                      )
                  )
                  .join('') ||
                `
                  <tr>
                    <td colspan="7">

                      ${emptyBlock(
                        'No accounts found',
                        'Try another search or add an account.'
                      )}

                    </td>
                  </tr>
                `
              }

            </tbody>

          </table>

        </div>

      </section>

    </div>
  `;
}

function accountTableRow(a) {
  const d =
    state.data.devices.find(
      x =>
        x.id ===
        a.device_id
    );

  return `
    <tr>

      <td>

        <button
          class="table-link"
          data-nav="account/${a.id}"
        >
          @${esc(a.username)}
        </button>

        <small>
          ${esc(
            a.notes ||
            'No notes'
          )}
        </small>

      </td>

      <td>

        <span
          class="device-chip"
        >

          <i
            class="device-dot"
            style="
              background:${deviceColor(d)}
            "
          ></i>

          ${esc(
            d?.name ||
            'Unknown'
          )}

        </span>

      </td>

      <td>
        ${esc(
          a.gmail ||
          '—'
        )}
      </td>

      <td>
        ${esc(
          a.content_name ||
          '—'
        )}
      </td>

      <td>
        ${esc(
          managerName(
            a.manager_id
          )
        )}
      </td>

      <td>

        <span
          class="
            status-chip
            ${
              a.status ===
              'Active'
                ? 'green'
                : a.status ===
                    'Paused'
                  ? 'gray'
                  : 'orange'
            }
          "
        >
          ${esc(
            a.status ||
            'Active'
          )}
        </span>

      </td>

      <td>

        <button
          class="icon-btn"
          data-edit-account="${a.id}"
        >
          ✎
        </button>

      </td>

    </tr>
  `;
}


/* =========================================================
   ACCOUNT DETAIL
========================================================= */

function accountPage() {
  const a =
    state.data.accounts.find(
      x =>
        x.id ===
        state.route.id
    );

  if (!a) {
    return notFound(
      'Account',
      'accounts'
    );
  }

  const d =
    state.data.devices.find(
      x =>
        x.id ===
        a.device_id
    );

  const m =
    manager(a.manager_id);

  return `
    <div class="stack">

      <div class="detail-head">

        <button
          class="back"
          data-nav="accounts"
        >
          ← Back
        </button>

        <div class="detail-title">

          <i
            style="
              background:${deviceColor(d)}
            "
          ></i>

          <div>

            <span class="eyebrow">
              ACCOUNT WORKSPACE
            </span>

            <h2>
              @${esc(
                a.username
              )}
            </h2>

            <p>
              Account details,
              connected phone and
              responsible manager
            </p>

          </div>

        </div>

        <div class="detail-actions">

          <button
            class="btn secondary"
            data-edit-account="${a.id}"
          >
            ✎ Edit account
          </button>

          <button
            class="btn primary"
            data-nav="workflow"
          >
            ⌁ View workflow
          </button>

        </div>

      </div>


      <div class="three-panels">

        <section class="panel">

          <div class="panel-head">

            <div>

              <span class="eyebrow">
                ACCOUNT
              </span>

              <h3>
                TikTok details
              </h3>

            </div>

          </div>

          <div class="profile">

            <div
              class="profile-icon"
            >
              @
            </div>

            <div>

              <b>
                @${esc(
                  a.username
                )}
              </b>

              <span
                class="
                  status-chip
                  ${
                    a.status ===
                    'Active'
                      ? 'green'
                      : a.status ===
                          'Paused'
                        ? 'gray'
                        : 'orange'
                  }
                "
              >
                ${esc(
                  a.status ||
                  'Active'
                )}
              </span>

            </div>

          </div>

          <div class="facts">

            ${fact(
              'Gmail',
              a.gmail ||
                'Not added'
            )}

            ${fact(
              'Content / category',
              a.content_name ||
                'Not set'
            )}

            ${fact(
              'Notes',
              a.notes ||
                'No notes'
            )}

            ${customFacts(
              a.custom_fields
            )}

          </div>

        </section>


        <section class="panel">

          <div class="panel-head">

            <div>

              <span class="eyebrow">
                CONNECTED DEVICE
              </span>

              <h3>
                Mobile
              </h3>

            </div>

          </div>

          <button
            class="linked"
            data-nav="device/${
              d?.id ||
              ''
            }"
          >

            <i
              class="device-dot big"
              style="
                background:${deviceColor(d)}
              "
            ></i>

            <span>

              <b>
                ${esc(
                  d?.name ||
                  'Unassigned'
                )}
              </b>

              <small>
                ${esc(
                  d?.identifier ||
                  'No device'
                )}
              </small>

            </span>

            →

          </button>

          <div
            class="vertical-link"
            style="
              background:${deviceColor(d)}
            "
          ></div>

        </section>


        <section class="panel">

          <div class="panel-head">

            <div>

              <span class="eyebrow">
                RESPONSIBLE TEAM MEMBER
              </span>

              <h3>
                Manager
              </h3>

            </div>

          </div>

          <button
            class="linked"
            data-nav="manager/${
              m?.id ||
              ''
            }"
          >

            <i
              class="avatar large"
              style="
                background:${
                  m?.color ||
                  '#64748b'
                }18;

                color:${
                  m?.color ||
                  '#64748b'
                }
              "
            >
              ${esc(
                initials(
                  m?.name ||
                  'Unassigned'
                )
              )}
            </i>

            <span>

              <b>
                ${esc(
                  m?.name ||
                  'Unassigned'
                )}
              </b>

              <small>
                ${esc(
                  m?.role ||
                  'No manager assigned'
                )}
              </small>

            </span>

            →

          </button>

          <div
            class="vertical-link"
            style="
              background:${
                m?.color ||
                '#64748b'
              }
            "
          ></div>

        </section>

      </div>


      <div class="danger">

        <div>

          <b>
            Remove this account
          </b>

          <small>
            Only this account record
            will be deleted.
          </small>

        </div>

        <button
          class="btn danger"
          data-delete-account="${a.id}"
        >
          Delete account
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   TEAM
========================================================= */

function managersPage() {
  return `
    <div class="stack">

      <section class="page-head">

        <div>

          <span class="eyebrow">
            TEAM
          </span>

          <h2>
            Team members
          </h2>

          <p>
            Click a female team member
            to open her own account
            management workspace.
          </p>

        </div>

        <button
          class="btn primary"
          data-add-manager
        >
          ＋ Add member
        </button>

      </section>

      <div class="card-grid">

        ${
          state.data.managers
            .map(
              m =>
                managerCard(m)
            )
            .join('') ||
          emptyBlock(
            'No team members',
            'Add the person managing TikTok accounts.'
          )
        }

      </div>

    </div>
  `;
}

function managerCard(m) {
  return `
    <article class="manager-card">

      <div class="entity-top">

        <i
          class="avatar large"
          style="
            background:${m.color}18;
            color:${m.color}
          "
        >
          ${esc(
            initials(m.name)
          )}
        </i>

        <button
          class="icon-btn"
          data-edit-manager="${m.id}"
        >
          ⋯
        </button>

      </div>

      <button
        class="entity-name"
        data-nav="manager/${m.id}"
      >

        <strong>
          ${esc(m.name)}
        </strong>

        <small>
          ${esc(
            m.role ||
            'Account Manager'
          )}
        </small>

      </button>

      <div
        class="manager-metrics"
      >

        <span>
          <b>
            ${countManager(m.id)}
          </b>
          accounts
        </span>

        <span>
          <b>
            ${
              new Set(
                state.data.accounts
                  .filter(
                    a =>
                      a.manager_id ===
                      m.id
                  )
                  .map(
                    a =>
                      a.device_id
                  )
              ).size
            }
          </b>
          devices
        </span>

      </div>

      <button
        class="btn secondary full"
        data-nav="manager/${m.id}"
      >
        Open workspace →
      </button>

    </article>
  `;
}

function managerPage() {
  const m =
    state.data.managers.find(
      x =>
        x.id ===
        state.route.id
    );

  if (!m) {
    return notFound(
      'Team member',
      'managers'
    );
  }

  const ac =
    state.data.accounts.filter(
      a =>
        a.manager_id ===
        m.id
    );

  return `
    <div class="stack">

      <div class="detail-head">

        <button
          class="back"
          data-nav="managers"
        >
          ← Back
        </button>

        <div class="detail-title">

          <i
            style="
              background:${m.color}
            "
          ></i>

          <div>

            <span class="eyebrow">
              TEAM MEMBER WORKSPACE
            </span>

            <h2>
              ${esc(m.name)}
            </h2>

            <p>
              ${esc(
                m.role ||
                'Account Manager'
              )}
              · ${ac.length}
              assigned accounts
            </p>

          </div>

        </div>

        <div class="detail-actions">

          <button
            class="btn secondary"
            data-edit-manager="${m.id}"
          >
            ✎ Edit member
          </button>

        </div>

      </div>


      <section class="panel">

        <div class="panel-head">

          <div>

            <span class="eyebrow">
              ASSIGNED WORKFLOW
            </span>

            <h3>
              Manager → Device → Account
            </h3>

            <p>
              The manager line is
              ${m.color}
              so the responsible person
              is easy to identify.
            </p>

          </div>

        </div>

        <div class="manager-workflow">

          ${
            ac
              .map(
                a =>
                  managerFlow(
                    a,
                    m
                  )
              )
              .join('') ||
            emptyBlock(
              'No assigned accounts',
              'Edit an account and choose this team member.'
            )
          }

        </div>

      </section>


      <div class="three-panels">

        <section class="panel">

          <div class="panel-head">

            <div>

              <span class="eyebrow">
                PROFILE
              </span>

              <h3>
                Team member
              </h3>

            </div>

          </div>

          <div
            class="
              profile
              center
            "
          >

            <i
              class="avatar huge"
              style="
                background:${m.color}18;
                color:${m.color}
              "
            >
              ${esc(
                initials(
                  m.name
                )
              )}
            </i>

            <b>
              ${esc(m.name)}
            </b>

            <span>
              ${esc(
                m.role ||
                'Account Manager'
              )}
            </span>

            <span
              class="
                status-chip
                ${
                  m.active === false
                    ? 'gray'
                    : 'green'
                }
              "
            >
              ${
                m.active === false
                  ? 'Inactive'
                  : 'Active'
              }
            </span>

          </div>

        </section>


        <section class="panel">

          <div class="panel-head">

            <div>

              <span class="eyebrow">
                DEVICES
              </span>

              <h3>
                Assigned devices
              </h3>

            </div>

          </div>

          <div class="mini-list">

            ${
              [
                ...new Set(
                  ac.map(
                    a =>
                      a.device_id
                  )
                )
              ]
                .map(
                  id => {
                    const d =
                      state.data.devices.find(
                        x =>
                          x.id ===
                          id
                      );

                    return `
                      <button
                        data-nav="device/${id}"
                      >

                        <i
                          class="device-dot"
                          style="
                            background:${deviceColor(d)}
                          "
                        ></i>

                        ${esc(
                          d?.name ||
                          'Unknown'
                        )}

                        <span>
                          ${countDevice(
                            id
                          )}
                          accounts
                        </span>

                        →

                      </button>
                    `;
                  }
                )
                .join('') ||
              '<div class="muted">No devices assigned.</div>'
            }

          </div>

        </section>


        <section class="panel">

          <div class="panel-head">

            <div>

              <span class="eyebrow">
                EXTRA
              </span>

              <h3>
                Custom fields
              </h3>

            </div>

          </div>

          <div class="facts">

            ${customFacts(
              m.custom_fields,
              'No custom fields added.'
            )}

          </div>

        </section>

      </div>


      <div class="danger">

        <div>

          <b>
            Remove this team member
          </b>

          <small>
            Accounts become unassigned;
            the account records remain.
          </small>

        </div>

        <button
          class="btn danger"
          data-delete-manager="${m.id}"
        >
          Delete member
        </button>

      </div>

    </div>
  `;
}

function managerFlow(a, m) {
  const d =
    state.data.devices.find(
      x =>
        x.id ===
        a.device_id
    );

  return `
    <button
      class="manager-flow"
      data-nav="account/${a.id}"
    >

      <i
        class="flow-person"
        style="
          background:${m.color}
        "
      ></i>

      <i
        class="avatar"
        style="
          background:${m.color}18;
          color:${m.color}
        "
      >
        ${esc(
          initials(m.name)
        )}
      </i>

      <span class="arrow">
        →
      </span>

      <i
        class="device-dot"
        style="
          background:${deviceColor(d)}
        "
      ></i>

      <span>

        <b>
          ${esc(
            d?.name ||
            'No device'
          )}
        </b>

        <small>
          ${esc(
            d?.identifier ||
            ''
          )}
        </small>

      </span>

      <span class="arrow">
        →
      </span>

      <span>

        <b>
          @${esc(
            a.username
          )}
        </b>

        <small>
          ${esc(
            a.gmail ||
            'Gmail not added'
          )}
        </small>

      </span>

      ›

    </button>
  `;
}


/* =========================================================
   MAIN WORKFLOW
========================================================= */

function workflowPage() {
  const managers =
    state.data.managers ||
    [];

  return `
    <div class="stack">

      <section class="page-head">

        <div>

          <span class="eyebrow">
            MAIN WORKFLOW
          </span>

          <h2>
            Complete device → account → manager workflow
          </h2>

          <p>
            Every account is connected
            to its phone and responsible
            team member. Use ↑ / ↓ to
            move a device workflow
            up or down.
          </p>

        </div>


        <div class="workflow-tools">

          <div
            class="workflow-legend"
          >

            ${
              orderedDevices()
                .map(
                  d =>
                    `
                    <span>

                      <i
                        style="
                          background:${deviceColor(d)}
                        "
                      ></i>

                      ${esc(
                        d.identifier ||
                        d.name
                      )}

                    </span>
                    `
                )
                .join('')
            }

            ${
              managers
                .map(
                  m =>
                    `
                    <span>

                      <i
                        style="
                          background:${
                            m.color ||
                            '#64748b'
                          }
                        "
                      ></i>

                      ${esc(
                        m.name
                      )}

                    </span>
                    `
                )
                .join('')
            }

          </div>

          <button
            class="
              btn
              secondary
              wf-reset-btn
            "
            data-wf-reset
          >
            ↕ Reset order
          </button>

        </div>

      </section>


      <section
        class="
          panel
          workflow-panel
          workflow-professional
        "
      >

        <div
          class="workflow-head"
        >
          <span>
            DEVICE
          </span>

          <span>
            TIKTOK ACCOUNT
          </span>

          <span>
            TEAM MEMBER
          </span>
        </div>

        <div
          class="
            workflow-board
            workflow-board-v2
          "
        >

          ${
            orderedDevices()
              .map(
                (d, i) =>
                  workflowGroupV2(
                    d,
                    i,
                    orderedDevices().length
                  )
              )
              .join('') ||
            emptyBlock(
              'No workflow data',
              'Add a device and account.'
            )
          }

        </div>

      </section>

    </div>


    <style>

      .workflow-professional {
        overflow: hidden;
      }

      .workflow-tools {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        flex-wrap: wrap;
        padding: 0 14px 12px;
        background: #fff;
        border-bottom: 1px solid #edf0f3;
      }

      .workflow-legend {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-right: auto;
      }

      .workflow-legend span {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 8px;
        border: 1px solid #e7ebef;
        border-radius: 999px;
        background: #fff;
        color: #647080;
        font-size: 9px;
      }

      .workflow-legend i {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        display: block;
      }

      .wf-reset-btn {
        font-size: 9px;
        padding: 7px 10px;
      }

      .workflow-board-v2 {
        padding: 0 0 8px;
        background: #fff;
      }

      .workflow-group-v2 {
        border-top: 1px solid #edf0f3;
      }

      .workflow-group-v2:first-child {
        border-top: 0;
      }

      .wf-group-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 16px;
        background: #fafbfd;
        border-bottom: 1px solid #edf0f3;
      }

      .wf-device-title {
        display: flex;
        align-items: center;
        gap: 9px;
        border: 0;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }

      .wf-device-title .node {
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        color: #fff;
        font-weight: 900;
        font-size: 10px;
        box-shadow:
          0 2px 8px
          rgba(
            15,
            39,
            66,
            .08
          );
      }

      .wf-device-title b {
        display: block;
        color: #34445a;
        font-size: 10px;
      }

      .wf-device-title small {
        display: block;
        color: #8e98a3;
        font-size: 8.5px;
        margin-top: 3px;
      }

      .wf-group-count {
        color: #8b949f;
        font-size: 8.5px;
        white-space: nowrap;
      }

      .wf-group-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .wf-move-btn {
        width: 27px;
        height: 27px;
        border: 1px solid #dfe5eb;
        border-radius: 7px;
        background: #fff;
        color: #566373;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        transition: .15s;
      }

      .wf-move-btn:hover:not(:disabled) {
        background: #f4f7fa;
        border-color: #c7d1dc;
        transform: translateY(-1px);
      }

      .wf-move-btn:disabled {
        opacity: .3;
        cursor: not-allowed;
      }

      .wf-canvas {
        position: relative;
        display: grid;
        grid-template-columns:
          minmax(170px,.8fr)
          minmax(300px,1.5fr)
          minmax(190px,.9fr);
        min-height: 70px;
      }

      .wf-lines {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
        overflow: visible;
      }

      .wf-flow-path {
        stroke-dasharray: 5 8;
        animation:
          wfFlow
          2.6s
          linear
          infinite;
      }

      .wf-flow-path.slow {
        animation-duration: 3.1s;
      }

      .wf-flow-arrow {
        opacity: .95;
      }

      .wf-flow-arrow.small {
        filter: none;
      }

      @keyframes wfFlow {
        to {
          stroke-dashoffset: -26;
        }
      }

      .wf-column {
        position: relative;
        z-index: 1;
      }

      .wf-device-column {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px;
      }

      .wf-device-node {
        width: min(170px, 90%);
        border: 1px solid #e4e9ef;
        background: #fff;
        border-radius: 10px;
        padding: 10px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow:
          0 4px 14px
          rgba(
            15,
            39,
            66,
            .04
          );
        cursor: pointer;
        text-align: left;
      }

      .wf-device-node i {
        width: 7px;
        height: 38px;
        border-radius: 8px;
        flex: none;
      }

      .wf-device-node b {
        display: block;
        color: #304057;
        font-size: 10px;
      }

      .wf-device-node small {
        display: block;
        color: #919aa5;
        font-size: 8.5px;
        margin-top: 3px;
      }

      .wf-account-row,
      .wf-manager-row {
        height: 64px;
        display: flex;
        align-items: center;
        padding: 6px 12px;
      }

      .wf-account-node {
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
        gap: 9px;
        border: 1px solid #e2e8ee;
        background: #fff;
        border-radius: 9px;
        padding: 0 11px;
        cursor: pointer;
        text-align: left;
        transition: .15s;
      }

      .wf-account-node:hover,
      .wf-manager-node:hover {
        transform:
          translateY(-1px);

        box-shadow:
          0 5px 16px
          rgba(
            15,
            39,
            66,
            .08
          );
      }

      .wf-account-node
      .account-icon {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border: 1px solid;
        border-radius: 7px;
        font-size: 12px;
        font-style: normal;
      }

      .wf-account-node b,
      .wf-manager-node b {
        display: block;
        color: #33445a;
        font-size: 9.5px;
      }

      .wf-account-node small,
      .wf-manager-node small {
        display: block;
        color: #929ca7;
        font-size: 8.5px;
        margin-top: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wf-manager-node {
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid #e2e8ee;
        background: #fff;
        border-radius: 9px;
        padding: 0 10px;
        cursor: pointer;
        text-align: left;
        transition: .15s;
      }

      .wf-manager-node
      .manager-bar {
        width: 4px;
        height: 30px;
        border-radius: 6px;
        flex: none;
      }

      .wf-manager-node
      .manager-avatar {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        font-size: 9px;
        font-weight: 900;
        flex: none;
      }

      .wf-account-meta {
        min-width: 0;
        flex: 1;
      }

      @media(max-width:780px) {

        .wf-canvas {
          grid-template-columns: 1fr;
        }

        .wf-lines {
          display: none;
        }

        .wf-device-column {
          justify-content: flex-start;
          padding: 12px;
        }

        .wf-account-row,
        .wf-manager-row {
          height: auto;
          padding: 6px 12px;
        }

        .wf-manager-row {
          padding-top: 0;
        }

        .wf-device-node {
          width: 100%;
        }

      }

    </style>
  `;
}

function workflowGroupV2(
  d,
  index,
  total
) {
  const ac =
    state.data.accounts.filter(
      a =>
        a.device_id ===
        d.id
    );

  const dc =
    deviceColor(d);

  const rows =
    Math.max(
      ac.length,
      1
    );

  const rowH = 64;

  const height =
    rows * rowH;

  const deviceY =
    height / 2;

  const svgLines =
    ac
      .map(
        (a, i) => {

          const y =
            (i + .5) *
            rowH;

          const m =
            manager(
              a.manager_id
            );

          const mc =
            m?.color ||
            '#64748b';

          const p1 =
            `M 26 ${deviceY}
             C 29 ${deviceY},
               31 ${y},
               34 ${y}`;

          const p2 =
            `M 66 ${y}
             C 69 ${y},
               71 ${y},
               74 ${y}`;

          const flowId1 =
            `flow-device-${d.id}-${i}`
              .replace(
                /[^a-zA-Z0-9_-]/g,
                ''
              );

          const flowId2 =
            `flow-manager-${d.id}-${i}`
              .replace(
                /[^a-zA-Z0-9_-]/g,
                ''
              );

          return `
            <path
              id="${flowId1}"
              class="wf-flow-path"
              d="${p1}"
              fill="none"
              stroke="${dc}"
              stroke-width="1.4"
              stroke-linecap="round"
            />

            <path
              id="${flowId2}"
              class="
                wf-flow-path
                slow
              "
              d="${p2}"
              fill="none"
              stroke="${mc}"
              stroke-width="1.4"
              stroke-linecap="round"
            />

            <polygon
              class="
                wf-flow-arrow
                small
              "
              points="0,-2.2 4.5,0 0,2.2"
              fill="${dc}"
            >
              <animateMotion
                dur="2.4s"
                repeatCount="indefinite"
                rotate="auto"
                path="${p1}"
              />
            </polygon>

            <polygon
              class="
                wf-flow-arrow
                small
              "
              points="0,-2.2 4.5,0 0,2.2"
              fill="${dc}"
            >
              <animateMotion
                dur="2.4s"
                begin="-1.2s"
                repeatCount="indefinite"
                rotate="auto"
                path="${p1}"
              />
            </polygon>

            <polygon
              class="
                wf-flow-arrow
                small
              "
              points="0,-2.2 4.5,0 0,2.2"
              fill="${mc}"
            >
              <animateMotion
                dur="2.8s"
                repeatCount="indefinite"
                rotate="auto"
                path="${p2}"
              />
            </polygon>

            <polygon
              class="
                wf-flow-arrow
                small
              "
              points="0,-2.2 4.5,0 0,2.2"
              fill="${mc}"
            >
              <animateMotion
                dur="2.8s"
                begin="-1.4s"
                repeatCount="indefinite"
                rotate="auto"
                path="${p2}"
              />
            </polygon>
          `;
        }
      )
      .join('');

  return `
    <div
      class="workflow-group-v2"
    >

      <div
        class="wf-group-title"
      >

        <button
          class="wf-device-title"
          data-nav="device/${d.id}"
        >

          <span
            class="node"
            style="
              background:${dc}
            "
          >
            D
          </span>

          <span>

            <b>
              ${esc(
                d.identifier ||
                d.name
              )}
              ·
              ${esc(d.name)}
            </b>

            <small>
              ${ac.length}
              account${
                ac.length === 1
                  ? ''
                  : 's'
              }
              connected
            </small>

          </span>

        </button>


        <div
          class="wf-group-actions"
        >

          <button
            class="wf-move-btn"
            data-wf-up="${d.id}"
            ${
              index === 0
                ? 'disabled'
                : ''
            }
            title="Move workflow up"
          >
            ↑
          </button>

          <button
            class="wf-move-btn"
            data-wf-down="${d.id}"
            ${
              index ===
              total - 1
                ? 'disabled'
                : ''
            }
            title="Move workflow down"
          >
            ↓
          </button>

          <button
            class="icon-btn"
            data-edit-device="${d.id}"
            title="Edit device"
          >
            ✎
          </button>

        </div>

      </div>


      ${
        ac.length
          ? `
            <div
              class="wf-canvas"
              style="
                height:${height}px
              "
            >

              <svg
                class="wf-lines"
                viewBox="
                  0 0 100 ${height}
                "
                preserveAspectRatio="none"
                aria-hidden="true"
              >

                ${svgLines}

              </svg>


              <div
                class="
                  wf-column
                  wf-device-column
                "
              >

                <button
                  class="wf-device-node"
                  data-nav="device/${d.id}"
                >

                  <i
                    style="
                      background:${dc}
                    "
                  ></i>

                  <span>

                    <b>
                      ${esc(d.name)}
                    </b>

                    <small>
                      ${esc(
                        d.identifier ||
                        ''
                      )}
                    </small>

                  </span>

                </button>

              </div>


              <div
                class="wf-column"
              >

                ${
                  ac
                    .map(
                      a => {
                        const m =
                          manager(
                            a.manager_id
                          );

                        const mc =
                          m?.color ||
                          '#64748b';

                        return `
                          <div
                            class="
                              wf-account-row
                            "
                          >

                            <button
                              class="
                                wf-account-node
                              "
                              data-nav="account/${a.id}"
                            >

                              <i
                                class="
                                  account-icon
                                "
                                style="
                                  border-color:${dc};
                                  color:${dc}
                                "
                              >
                                @
                              </i>

                              <span
                                class="
                                  wf-account-meta
                                "
                              >

                                <b>
                                  @${esc(
                                    a.username
                                  )}
                                </b>

                                <small>
                                  ${esc(
                                    a.gmail ||
                                    'Gmail not added'
                                  )}
                                  ${
                                    a.content_name
                                      ? ' · ' +
                                        esc(
                                          a.content_name
                                        )
                                      : ''
                                  }
                                </small>

                              </span>

                            </button>

                          </div>
                        `;
                      }
                    )
                    .join('')
                }

              </div>


              <div
                class="wf-column"
              >

                ${
                  ac
                    .map(
                      a => {

                        const m =
                          manager(
                            a.manager_id
                          );

                        const mc =
                          m?.color ||
                          '#64748b';

                        return `
                          <div
                            class="
                              wf-manager-row
                            "
                          >

                            <button
                              class="
                                wf-manager-node
                              "
                              data-nav="manager/${
                                m?.id ||
                                ''
                              }"
                            >

                              <i
                                class="
                                  manager-bar
                                "
                                style="
                                  background:${mc}
                                "
                              ></i>

                              <span
                                class="
                                  manager-avatar
                                "
                                style="
                                  background:${mc}18;
                                  color:${mc}
                                "
                              >
                                ${esc(
                                  initials(
                                    m?.name ||
                                    'U'
                                  )
                                )}
                              </span>

                              <span
                                class="
                                  wf-account-meta
                                "
                              >

                                <b>
                                  ${esc(
                                    m?.name ||
                                    'Unassigned'
                                  )}
                                </b>

                                <small>
                                  ${esc(
                                    m?.role ||
                                    'Needs assignment'
                                  )}
                                </small>

                              </span>

                            </button>

                          </div>
                        `;
                      }
                    )
                    .join('')
                }

              </div>

            </div>
          `
          : `
            <div
              class="empty-row"
            >
              No accounts on this device.
            </div>
          `
      }

    </div>
  `;
}


/* =========================================================
   SMALL HELPERS
========================================================= */

function fact(
  label,
  value
) {
  return `
    <div class="fact">

      <span>
        ${esc(label)}
      </span>

      <b>
        ${esc(value)}
      </b>

    </div>
  `;
}

function customFacts(
  fields,
  emptyText =
    'No extra fields'
) {
  const x =
    customEntries(fields);

  return x.length
    ? x
        .map(
          ([k, v]) =>
            fact(
              k,
              v || '—'
            )
        )
        .join('')
    : fact(
        'Custom fields',
        emptyText
      );
}

function emptyBlock(
  title,
  text
) {
  return `
    <div class="empty">

      <b>
        ${esc(title)}
      </b>

      <span>
        ${esc(text)}
      </span>

    </div>
  `;
}

function notFound(
  label,
  back
) {
  return `
    <section
      class="panel empty-page"
    >

      <h2>
        ${esc(label)}
        not found
      </h2>

      <p>
        The record may have
        been removed.
      </p>

      <button
        class="btn secondary"
        data-nav="${back}"
      >
        ← Go back
      </button>

    </section>
  `;
}


/* =========================================================
   VIEW EVENTS
========================================================= */

function bindView() {

  $$('[data-nav]')
    .forEach(
      b =>
        b.onclick = () =>
          navigate(
            b.dataset.nav
          )
    );

  $$('[data-add-device]')
    .forEach(
      b =>
        b.onclick = () =>
          openModal('device')
    );

  $$('[data-add-account]')
    .forEach(
      b =>
        b.onclick = () =>
          openModal('account')
    );

  $$('[data-add-account-device]')
    .forEach(
      b =>
        b.onclick = () =>
          openModal(
            'account',
            null,
            {
              device_id:
                b.dataset
                  .addAccountDevice
            }
          )
    );

  $$('[data-add-manager]')
    .forEach(
      b =>
        b.onclick = () =>
          openModal(
            'manager'
          )
    );

  $$('[data-edit-device]')
    .forEach(
      b =>
        b.onclick = () =>
          openModal(
            'device',
            b.dataset.editDevice
          )
    );

  $$('[data-edit-account]')
    .forEach(
      b =>
        b.onclick = () =>
          openModal(
            'account',
            b.dataset.editAccount
          )
    );

  $$('[data-edit-manager]')
    .forEach(
      b =>
        b.onclick = () =>
          openModal(
            'manager',
            b.dataset.editManager
          )
    );

  $$('[data-delete-device]')
    .forEach(
      b =>
        b.onclick = () =>
          confirmDelete(
            'devices',
            b.dataset
              .deleteDevice,
            'Delete this device?',
            'All accounts on this device will also be deleted.'
          )
    );

  $$('[data-delete-account]')
    .forEach(
      b =>
        b.onclick = () =>
          confirmDelete(
            'tiktok_accounts',
            b.dataset
              .deleteAccount,
            'Delete this account?',
            'Only this account will be deleted.'
          )
    );

  $$('[data-delete-manager]')
    .forEach(
      b =>
        b.onclick = () =>
          confirmDelete(
            'team_members',
            b.dataset
              .deleteManager,
            'Delete this team member?',
            'Their accounts will remain but become unassigned.'
          )
    );

  $$('[data-wf-up]')
    .forEach(
      b =>
        b.onclick = e => {
          e.stopPropagation();

          moveWorkflowDevice(
            b.dataset.wfUp,
            'up'
          );
        }
    );

  $$('[data-wf-down]')
    .forEach(
      b =>
        b.onclick = e => {
          e.stopPropagation();

          moveWorkflowDevice(
            b.dataset.wfDown,
            'down'
          );
        }
    );

  $$('[data-wf-reset]')
    .forEach(
      b =>
        b.onclick = () => {

          state.workflowOrder =
            state.data.devices.map(
              d => d.id
            );

          try {
            localStorage.setItem(
              WORKFLOW_ORDER_KEY,
              JSON.stringify(
                state.workflowOrder
              )
            );
          } catch (_) {}

          render();

          toast(
            'Workflow order reset'
          );
        }
    );
}


/* =========================================================
   MODALS
========================================================= */

function openModal(
  type,
  id = null,
  prefill = {}
) {
  state.modal = {
    type,
    id,
    prefill
  };

  const source =
    type === 'device'
      ? state.data.devices.find(
          x => x.id === id
        )
      : type === 'account'
        ? state.data.accounts.find(
            x => x.id === id
          )
        : state.data.managers.find(
            x => x.id === id
          );

  let form = {};

  if (source) {
    form = {
      ...source,
      custom_fields: {
        ...(source.custom_fields || {})
      }
    };
  } else if (
    type === 'device'
  ) {
    form = {
      name: '',
      identifier: '',
      color: 'blue',
      status: 'Active',
      notes: '',
      custom_fields: {}
    };
  } else if (
    type === 'account'
  ) {
    form = {
      username: '',
      gmail: '',
      device_id:
        prefill.device_id ||
        state.data.devices[0]?.id ||
        '',
      content_name: '',
      manager_id:
        state.data.managers[0]?.id ||
        '',
      status: 'Active',
      notes: '',
      custom_fields: {}
    };
  } else {
    form = {
      name: '',
      role: 'Account Manager',
      active: true,
      color:
        MANAGER_COLORS[
          state.data.managers.length %
            MANAGER_COLORS.length
        ],
      custom_fields: {}
    };
  }

  state.modal.form =
    form;

  state.modal.custom =
    Object.entries(
      form.custom_fields ||
        {}
    );

  renderModal();
}

function renderModal() {
  const {
    type,
    id
  } = state.modal;

  const f =
    state.modal.form;

  const editing =
    Boolean(id);

  const title =
    `${
      editing
        ? 'Edit'
        : 'Add'
    } ${
      type === 'device'
        ? 'mobile device'
        : type === 'account'
          ? 'TikTok account'
          : 'team member'
    }`;

  const fields =
    type === 'device'
      ? `
        <label>
          Device name

          <input
            data-field="name"
            value="${esc(
              f.name || ''
            )}"
            required
            placeholder="Black"
          >
        </label>

        <div class="two-col">

          <label>
            Identifier

            <input
              data-field="identifier"
              value="${esc(
                f.identifier ||
                ''
              )}"
              placeholder="Device #1"
            >
          </label>

          <label>
            Status

            <select
              data-field="status"
            >

              <option
                ${
                  f.status ===
                  'Active'
                    ? 'selected'
                    : ''
                }
              >
                Active
              </option>

              <option
                ${
                  f.status ===
                  'Inactive'
                    ? 'selected'
                    : ''
                }
              >
                Inactive
              </option>

              <option
                ${
                  f.status ===
                  'Needs attention'
                    ? 'selected'
                    : ''
                }
              >
                Needs attention
              </option>

            </select>

          </label>

        </div>

        <label>

          Device line color

          <div
            class="color-options"
          >

            ${
              DEVICE_COLORS
                .map(
                  c =>
                    `
                    <button
                      type="button"
                      class="
                        color-choice
                        ${
                          f.color ===
                          c[0]
                            ? 'selected'
                            : ''
                        }
                      "
                      data-color-device="${c[0]}"
                    >

                      <i
                        style="
                          background:${c[2]}
                        "
                      ></i>

                      ${c[1]}

                    </button>
                    `
                )
                .join('')
            }

          </div>

        </label>

        <label>

          Notes

          <textarea
            data-field="notes"
          >${esc(
            f.notes || ''
          )}</textarea>

        </label>
      `
      : type === 'account'
        ? `
          <label>

            TikTok account name / username

            <input
              data-field="username"
              value="${esc(
                f.username || ''
              )}"
              required
              placeholder="exampleaccount"
            >

          </label>

          <div class="two-col">

            <label>

              Gmail

              <input
                type="email"
                data-field="gmail"
                value="${esc(
                  f.gmail || ''
                )}"
                placeholder="account@gmail.com"
              >

            </label>

            <label>

              Status

              <select
                data-field="status"
              >

                <option
                  ${
                    f.status ===
                    'Active'
                      ? 'selected'
                      : ''
                  }
                >
                  Active
                </option>

                <option
                  ${
                    f.status ===
                    'Paused'
                      ? 'selected'
                      : ''
                  }
                >
                  Paused
                </option>

                <option
                  ${
                    f.status ===
                    'Needs attention'
                      ? 'selected'
                      : ''
                  }
                >
                  Needs attention
                </option>

              </select>

            </label>

          </div>

          <div class="two-col">

            <label>

              Mobile device

              <select
                data-field="device_id"
              >

                ${
                  state.data.devices
                    .map(
                      d =>
                        `
                        <option
                          value="${d.id}"
                          ${
                            f.device_id ===
                            d.id
                              ? 'selected'
                              : ''
                          }
                        >
                          ${esc(
                            d.name
                          )}
                          ·
                          ${esc(
                            d.identifier ||
                            d.id
                          )}
                        </option>
                        `
                    )
                    .join('')
                }

              </select>

            </label>

            <label>

              Manager

              <select
                data-field="manager_id"
              >

                <option value="">
                  Unassigned
                </option>

                ${
                  state.data.managers
                    .map(
                      m =>
                        `
                        <option
                          value="${m.id}"
                          ${
                            f.manager_id ===
                            m.id
                              ? 'selected'
                              : ''
                          }
                        >
                          ${esc(
                            m.name
                          )}
                        </option>
                        `
                    )
                    .join('')
                }

              </select>

            </label>

          </div>

          <label>

            Content / category

            <input
              data-field="content_name"
              value="${esc(
                f.content_name ||
                ''
              )}"
              placeholder="Cleaning, business, food…"
            >

          </label>

          <label>

            Notes

            <textarea
              data-field="notes"
            >${esc(
              f.notes || ''
            )}</textarea>

          </label>
        `
        : `
          <label>

            Full name

            <input
              data-field="name"
              value="${esc(
                f.name || ''
              )}"
              required
              placeholder="Umm-e-Hania"
            >

          </label>

          <div class="two-col">

            <label>

              Role

              <input
                data-field="role"
                value="${esc(
                  f.role ||
                  'Account Manager'
                )}"
              >

            </label>

            <label>

              Status

              <select
                data-field="active"
              >

                <option
                  value="true"
                  ${
                    f.active !== false
                      ? 'selected'
                      : ''
                  }
                >
                  Active
                </option>

                <option
                  value="false"
                  ${
                    f.active === false
                      ? 'selected'
                      : ''
                  }
                >
                  Inactive
                </option>

              </select>

            </label>

          </div>

          <label>

            Manager line color

            <div
              class="manager-colors"
            >

              ${
                MANAGER_COLORS
                  .map(
                    c =>
                      `
                      <button
                        type="button"
                        class="
                          manager-color
                          ${
                            f.color ===
                            c
                              ? 'selected'
                              : ''
                          }
                        "
                        style="
                          background:${c}
                        "
                        data-manager-color="${c}"
                      ></button>
                      `
                  )
                  .join('')
              }

            </div>

          </label>
        `;

  const custom =
    state.modal.custom
      .map(
        (r, i) =>
          `
          <div
            class="custom-row"
          >

            <input
              data-custom-key="${i}"
              value="${esc(
                r[0]
              )}"
              placeholder="Field name"
            >

            <input
              data-custom-val="${i}"
              value="${esc(
                r[1]
              )}"
              placeholder="Value"
            >

            <button
              type="button"
              class="icon-btn"
              data-custom-remove="${i}"
            >
              ×
            </button>

          </div>
          `
      )
      .join('');

  $('#modalRoot')
    .innerHTML = `
      <div
        class="modal-backdrop"
        id="modalBackdrop"
      >

        <div class="modal">

          <div class="modal-head">

            <div>

              <span class="eyebrow">
                EDITABLE RECORD
              </span>

              <h3>
                ${title}
              </h3>

              <p>
                Save once and every
                connected page will
                use the updated data.
              </p>

            </div>

            <button
              class="icon-btn"
              id="modalClose"
            >
              ×
            </button>

          </div>


          <form
            id="dataForm"
            class="form-stack"
          >

            ${fields}

            <div
              class="custom-section"
            >

              <div>

                <b>
                  Custom fields
                </b>

                <small>
                  Add extra information
                  without changing
                  the SQL table.
                </small>

              </div>

              <button
                type="button"
                class="
                  btn
                  secondary
                "
                id="addCustom"
              >
                ＋ Add field
              </button>

            </div>

            ${custom}

            <div
              class="modal-footer"
            >

              <button
                type="button"
                class="
                  btn
                  secondary
                "
                id="cancelModal"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="
                  btn
                  primary
                "
              >
                ✓ Save details
              </button>

            </div>

          </form>

        </div>

      </div>
    `;

  $('#modalClose')
    .onclick =
    closeModal;

  $('#cancelModal')
    .onclick =
    closeModal;

  $('#modalBackdrop')
    .addEventListener(
      'mousedown',
      e => {
        if (
          e.target.id ===
          'modalBackdrop'
        ) {
          closeModal();
        }
      }
    );

  $('#addCustom')
    .onclick = () => {
      state.modal.custom.push([
        '',
        ''
      ]);

      renderModal();
    };

  $$('#dataForm [data-field]')
    .forEach(
      el =>
        el.addEventListener(
          'input',
          () => {
            state.modal.form[
              el.dataset.field
            ] = el.value;
          }
        )
    );

  $$('[data-color-device]')
    .forEach(
      b =>
        b.onclick = () => {
          state.modal.form.color =
            b.dataset
              .colorDevice;

          renderModal();
        }
    );

  $$('[data-manager-color]')
    .forEach(
      b =>
        b.onclick = () => {
          state.modal.form.color =
            b.dataset
              .managerColor;

          renderModal();
        }
    );

  $$('[data-custom-remove]')
    .forEach(
      b =>
        b.onclick = () => {

          state.modal.custom
            .splice(
              Number(
                b.dataset
                  .customRemove
              ),
              1
            );

          renderModal();
        }
    );

  $('#dataForm')
    .onsubmit =
    saveModal;
}

function closeModal() {
  state.modal = null;

  $('#modalRoot')
    .innerHTML =
    '';
}

async function saveModal(e) {
  e.preventDefault();

  const s =
    state.modal;

  const type =
    s.type;

  const f = {
    ...s.form
  };

  $$('#dataForm [data-field]')
    .forEach(
      el => {
        if (
          el.dataset.field
        ) {
          f[
            el.dataset.field
          ] = el.value;
        }
      }
    );

  if (
    type === 'manager'
  ) {
    f.active =
      f.active !==
      'false';
  }

  if (
    !f.name &&
    type !== 'account'
  ) {
    return toast(
      'Enter a name.',
      'error'
    );
  }

  if (
    !f.username &&
    type === 'account'
  ) {
    return toast(
      'Enter an account name.',
      'error'
    );
  }

  const custom = {};

  s.custom.forEach(
    ([k, v], i) => {

      const key =
        $(
          `[data-custom-key="${i}"]`
        )
          ?.value
          .trim();

      const val =
        $(
          `[data-custom-val="${i}"]`
        )
          ?.value
          .trim();

      if (key) {
        custom[key] =
          val || '';
      }

    }
  );

  f.custom_fields =
    custom;

  const table =
    type === 'device'
      ? 'devices'
      : type === 'account'
        ? 'tiktok_accounts'
        : 'team_members';

  const payload =
    type === 'device'
      ? {
          name:
            f.name.trim(),

          identifier:
            f.identifier
              ?.trim() ||
            null,

          color:
            f.color ||
            'blue',

          status:
            f.status ||
            'Active',

          notes:
            f.notes
              ?.trim() ||
            null,

          custom_fields:
            f.custom_fields
        }
      : type === 'account'
        ? {
            username:
              f.username.trim(),

            gmail:
              f.gmail
                ?.trim() ||
              null,

            device_id:
              f.device_id ||
              null,

            content_name:
              f.content_name
                ?.trim() ||
              null,

            manager_id:
              f.manager_id ||
              null,

            status:
              f.status ||
              'Active',

            notes:
              f.notes
                ?.trim() ||
              null,

            custom_fields:
              f.custom_fields
          }
        : {
            name:
              f.name.trim(),

            role:
              f.role
                ?.trim() ||
              'Account Manager',

            active:
              Boolean(
                f.active
              ),

            color:
              f.color ||
              MANAGER_COLORS[0],

            custom_fields:
              f.custom_fields
          };

  try {

    await save(
      table,
      payload,
      s.id
    );

    closeModal();

    render();

    toast(
      s.id
        ? 'Details updated everywhere'
        : `${
            type === 'device'
              ? 'Device'
              : type === 'account'
                ? 'Account'
                : 'Team member'
          } added`
    );

  } catch (err) {

    toast(
      err.message ||
        'Could not save.',
      'error'
    );

  }
}


/* =========================================================
   DELETE
========================================================= */

function confirmDelete(
  table,
  id,
  title,
  text
) {

  $('#modalRoot')
    .innerHTML = `
      <div
        class="modal-backdrop"
      >

        <div class="confirm">

          <div
            class="modal-head"
          >

            <div>

              <span class="eyebrow">
                CONFIRM
              </span>

              <h3>
                ${esc(title)}
              </h3>

              <p>
                ${esc(text)}
              </p>

            </div>

            <button
              class="icon-btn"
              id="confirmClose"
            >
              ×
            </button>

          </div>

          <div
            class="modal-footer"
          >

            <button
              class="
                btn
                secondary
              "
              id="confirmCancel"
            >
              Cancel
            </button>

            <button
              class="
                btn
                danger
              "
              id="confirmOk"
            >
              Delete
            </button>

          </div>

        </div>

      </div>
    `;

  $('#confirmClose')
    .onclick = () =>
      (
        $('#modalRoot')
          .innerHTML = ''
      );

  $('#confirmCancel')
    .onclick = () =>
      (
        $('#modalRoot')
          .innerHTML = ''
      );

  $('#confirmOk')
    .onclick =
    async () => {

      await act(
        () =>
          remove(
            table,
            id
          ),
        'Deleted'
      );

      $('#modalRoot')
        .innerHTML =
        '';

      navigate(
        table === 'devices'
          ? 'devices'
          : table ===
              'tiktok_accounts'
            ? 'accounts'
            : 'managers'
      );
    };
}


/* =========================================================
   TOAST
========================================================= */

function toast(
  msg,
  type = 'success'
) {

  const r =
    $('#toastRoot');

  if (!r) {
    return;
  }

  const x =
    document.createElement(
      'div'
    );

  x.className =
    `toast ${type}`;

  x.textContent =
    msg;

  r.appendChild(x);

  setTimeout(
    () =>
      x.remove(),
    2600
  );
}


/* =========================================================
   START
========================================================= */

boot();
