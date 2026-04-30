const state = {
  currentStep: 0,
  activeScreen: "onboarding",
  casUploaded: false,
  mutualFundNames: ["HDFC Nifty 50 Index Fund", "Parag Parikh Flexi Cap Fund", "Axis Liquid Fund"],
  governmentSchemeNames: ["EPF", "NPS", "PPF", "SSY"],
  instrumentTypes: ["Mutual Fund", "Government Scheme", "ETF", "Stock Option", "Fixed Deposit", "Savings Account"],
  investments: [
    {
      name: "HDFC Nifty 50 Index",
      type: "Mutual Fund",
      corpus: "₹12.4L",
      contribution: "₹25,000 monthly",
      roi: "12%",
      allocation: "Equity India"
    },
    {
      name: "Employee Provident Fund",
      type: "Government Scheme",
      corpus: "₹32.6L",
      contribution: "Salary linked",
      roi: "8.5%",
      allocation: "Debt Government"
    },
    {
      name: "Fixed Deposit",
      type: "Fixed Deposit",
      corpus: "₹6.0L",
      contribution: "One-time corpus",
      roi: "7%",
      allocation: "Debt Fixed Deposit"
    }
  ],
  goals: [
    {
      name: "Retirement",
      target: "₹8.0Cr",
      current: "₹40.0L",
      progress: "5%",
      status: "Lagging"
    },
    {
      name: "Dream Home",
      target: "₹1.2Cr",
      current: "₹3.0L",
      progress: "2.5%",
      status: "Needs allocation"
    }
  ],
  projections: [
    { month: "May 2026", income: "₹3.50L", expense: "₹1.45L", investment: "₹55K", savings: "₹1.50L", source: "simulation" },
    { month: "Jun 2026", income: "₹3.50L", expense: "₹1.45L", investment: "₹55K", savings: "₹1.50L", source: "simulation" },
    { month: "Mar 2027", income: "₹8.28L", expense: "₹1.54L", investment: "₹60K", savings: "₹6.14L", source: "bonus month" },
    { month: "Dec 2047", income: "₹18.92L", expense: "₹5.12L", investment: "₹2.10L", savings: "₹11.70L", source: "retirement month" }
  ],
  yearlyAssumptions: [
    { year: "2026", salaryHike: "8%", expenseIncrease: "6%", monthlyIncome: "₹3.50L", monthlyExpense: "₹1.45L", annualIncome: "₹48.7L", annualExpense: "₹17.4L", annualInvestment: "₹6.6L", annualSavings: "₹24.7L" },
    { year: "2027", salaryHike: "8%", expenseIncrease: "6%", monthlyIncome: "₹3.78L", monthlyExpense: "₹1.54L", annualIncome: "₹52.6L", annualExpense: "₹18.5L", annualInvestment: "₹7.2L", annualSavings: "₹26.9L" },
    { year: "2028", salaryHike: "9%", expenseIncrease: "6.5%", monthlyIncome: "₹4.12L", monthlyExpense: "₹1.64L", annualIncome: "₹57.1L", annualExpense: "₹19.7L", annualInvestment: "₹7.8L", annualSavings: "₹29.6L" },
    { year: "2029", salaryHike: "8%", expenseIncrease: "6%", monthlyIncome: "₹4.45L", monthlyExpense: "₹1.74L", annualIncome: "₹61.6L", annualExpense: "₹20.9L", annualInvestment: "₹8.4L", annualSavings: "₹32.3L" }
  ],
  monthlyByYear: {
    "2026": [
      { month: "Jan", income: "₹3.50L", bonus: "₹0", expense: "₹1.45L", investment: "₹55K", savings: "₹1.50L", source: "simulation" },
      { month: "Feb", income: "₹3.50L", bonus: "₹0", expense: "₹1.45L", investment: "₹55K", savings: "₹1.50L", source: "simulation" },
      { month: "Mar", income: "₹8.28L", bonus: "₹4.78L", expense: "₹1.45L", investment: "₹55K", savings: "₹6.28L", source: "bonus month" },
      { month: "Apr", income: "₹3.50L", bonus: "₹0", expense: "₹1.45L", investment: "₹55K", savings: "₹1.50L", source: "simulation" }
    ],
    "2027": [
      { month: "Jan", income: "₹3.78L", bonus: "₹0", expense: "₹1.54L", investment: "₹60K", savings: "₹1.64L", source: "simulation" },
      { month: "Feb", income: "₹3.78L", bonus: "₹0", expense: "₹1.54L", investment: "₹60K", savings: "₹1.64L", source: "simulation" },
      { month: "Mar", income: "₹8.94L", bonus: "₹5.16L", expense: "₹1.54L", investment: "₹60K", savings: "₹6.80L", source: "bonus month" }
    ],
    "2028": [
      { month: "Jan", income: "₹4.12L", bonus: "₹0", expense: "₹1.64L", investment: "₹65K", savings: "₹1.83L", source: "simulation" },
      { month: "Mar", income: "₹9.74L", bonus: "₹5.62L", expense: "₹1.64L", investment: "₹65K", savings: "₹7.45L", source: "bonus month" }
    ],
    "2029": [
      { month: "Jan", income: "₹4.45L", bonus: "₹0", expense: "₹1.74L", investment: "₹70K", savings: "₹2.01L", source: "simulation" },
      { month: "Dec", income: "₹4.45L", bonus: "₹0", expense: "₹1.74L", investment: "₹70K", savings: "₹2.01L", source: "simulation" }
    ]
  },
  expandedYear: "2026",
  selectedMonth: { year: "2026", month: "Mar" },
  projectionWindow: "2026-2029 sample",
  goalMappings: [
    { investment: "HDFC Nifty 50 Index", goal: "Retirement", allocation: "60%", value: "₹7.44L", remaining: "40%" },
    { investment: "EPF", goal: "Retirement", allocation: "100%", value: "₹32.6L", remaining: "0%" },
    { investment: "Fixed Deposit", goal: "Dream Home", allocation: "50%", value: "₹3.0L", remaining: "50%" }
  ]
};

const steps = [
  "Register with email OTP",
  "Set personal assumptions",
  "Capture investments",
  "Create financial goals",
  "Map goals to investments",
  "Simulate income and expenses",
  "Review dashboard"
];

const screenTitles = {
  onboarding: "First-time setup",
  dashboard: "Dashboard",
  investments: "Investments",
  goals: "Goals",
  simulation: "Income and expense simulation",
  settings: "Settings"
};

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function setStep(step) {
  state.currentStep = Math.max(0, Math.min(steps.length - 1, step));

  qsa(".wizard-step").forEach((panel) => {
    panel.classList.toggle("active", Number(panel.dataset.stepPanel) === state.currentStep);
  });

  qsa(".step-pill").forEach((pill) => {
    pill.classList.toggle("active", Number(pill.dataset.step) === state.currentStep);
  });

  qs("#step-eyebrow").textContent = `Step ${state.currentStep + 1} of ${steps.length}`;
  qs("#step-title").textContent = steps[state.currentStep];
  qs("#mobile-step-current").textContent = state.currentStep + 1;
  qs("#mobile-step-total").textContent = steps.length;
}

function setScreen(screen) {
  state.activeScreen = screen;

  qsa(".screen").forEach((panel) => panel.classList.toggle("active", panel.id === screen));
  qsa(".nav-item").forEach((item) => item.classList.toggle("active", screen !== "onboarding" && item.dataset.target === screen));

  qs("#screen-title").textContent = screenTitles[screen] || "FinGoal";
  if (screen !== "onboarding") {
    renderAppScreens();
  }
}

function renderInvestments(target = qs("#investment-list")) {
  if (!target) return;
  target.innerHTML = state.investments
    .map(
      (item, index) => `
        <article class="data-card investment-tile">
          <button class="tile-remove" type="button" data-action="remove-investment" data-investment-index="${index}" aria-label="Remove ${item.name}">X</button>
          <strong>${item.corpus}</strong>
          <span>${item.name}</span>
          <div class="chip-list">
            <span class="chip">${item.type}</span>
            <span class="chip">${item.contribution}</span>
            <span class="chip">ROI ${item.roi}</span>
          </div>
        </article>
      `
    )
    .join("");
  renderAvailableInvestmentTypes();
}

function renderGoals(target = qs("#goal-list")) {
  if (!target) return;
  target.innerHTML = state.goals
    .map(
      (goal) => `
        <article class="data-card">
          <strong>${goal.progress}</strong>
          <span>${goal.name} progress</span>
          <div class="chip-list">
            <span class="chip">Target ${goal.target}</span>
            <span class="chip">Current ${goal.current}</span>
            <span class="status ${goal.status === "Lagging" ? "warn" : "good"}">${goal.status}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderProjectionBars() {
  const rows = [
    ["Income", 92, "₹3.50L", ""],
    ["Expense", 38, "₹1.45L", "expense"],
    ["Investment", 16, "₹55K", "savings"],
    ["Savings", 40, "₹1.50L", "savings"]
  ];

  qs("#projection-bars").innerHTML = rows
    .map(
      ([label, width, value, className]) => `
        <div class="bar-row">
          <span>${label}</span>
          <div class="bar-track"><div class="bar-fill ${className}" style="width:${width}%"></div></div>
          <span>${value}</span>
        </div>
      `
    )
    .join("");
}

function renderWizardSimulationTables() {
  const yearlyTarget = qs("#wizard-yearly-assumptions");
  const monthlyTarget = qs("#wizard-monthly-approximations");
  if (yearlyTarget) yearlyTarget.innerHTML = yearlyAssumptionCards();
  if (monthlyTarget) monthlyTarget.innerHTML = projectionTimelineMarkup("compact");
}

function dashboardMarkup() {
  return `
    <div class="content-stack">
      <div class="section-head">
        <div>
          <p class="eyebrow">Current position</p>
          <h2>Financial plan snapshot</h2>
        </div>
        <div class="action-row">
          <button class="secondary" type="button" data-target="onboarding" data-step-jump="4">Manage mappings</button>
          <button class="secondary" type="button" data-target="simulation">Review monthly approximation</button>
        </div>
      </div>

      <div class="metric-grid">
        <article class="metric-card"><strong>₹51.0L</strong><span>Current corpus</span></article>
        <article class="metric-card"><strong>11.8%</strong><span>CAGR placeholder</span></article>
        <article class="metric-card"><strong>13.2%</strong><span>XIRR placeholder</span></article>
      </div>

      <div class="dashboard-grid">
        <section class="panel">
          <h3>Goal health</h3>
          <div class="card-grid">${state.goals
            .map(
              (goal) => `
                <article class="data-card">
                  <strong>${goal.progress}</strong>
                  <span>${goal.name}</span>
                  <div class="chip-list">
                    <span class="chip">${goal.current} funded</span>
                    <span class="chip">${goal.target} target</span>
                    <span class="status ${goal.status === "Lagging" ? "warn" : "good"}">${goal.status}</span>
                  </div>
                </article>
              `
            )
            .join("")}</div>
        </section>

        <section class="panel">
          <h3>Asset allocation</h3>
          <div class="allocation-chart">
            ${allocationRow("Equity", 58, "₹29.6L")}
            ${allocationRow("Debt", 34, "₹17.3L")}
            ${allocationRow("Gold", 5, "₹2.5L")}
            ${allocationRow("Cash", 3, "₹1.6L")}
          </div>
        </section>
      </div>

      <section class="panel">
        <h3>Projection timeline until retirement</h3>
        ${projectionTable()}
      </section>
    </div>
  `;
}

function allocationRow(label, percent, value) {
  return `
    <div class="allocation-row">
      <span>${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${percent}%"></div></div>
      <span>${percent}% · ${value}</span>
    </div>
  `;
}

function projectionTable() {
  return projectionTimelineMarkup("full");
}

function monthRows(year) {
  return (state.monthlyByYear[year] || [])
    .map(
      (row) => `
        <div class="month-row">
          <span>${row.month}<small>${row.source || "simulation"}</small></span>
          <span>${row.income}</span>
          <span>${row.bonus}</span>
          <span>${row.expense}</span>
          <span>${row.investment}</span>
          <span>${row.savings}</span>
          <button class="ghost small" type="button" data-action="select-month" data-year="${year}" data-month="${row.month}">Edit</button>
        </div>
      `
    )
    .join("");
}

function selectedMonthDetails() {
  const months = state.monthlyByYear[state.selectedMonth.year] || [];
  return months.find((row) => row.month === state.selectedMonth.month) || months[0] || state.monthlyByYear["2026"][0];
}

function monthEditorMarkup() {
  const month = selectedMonthDetails();
  return `
    <aside class="month-editor">
      <h3>${state.selectedMonth.month} ${state.selectedMonth.year}</h3>
      <p>Edit one month without scrolling through hundreds of generated rows.</p>
      <label>Income approximation
        <input value="${month.income}" />
      </label>
      <label>Bonus
        <input value="${month.bonus}" />
      </label>
      <label>Expense approximation
        <input value="${month.expense}" />
      </label>
      <label>Investment
        <input value="${month.investment}" />
      </label>
      <button class="primary" type="button">Save month override</button>
      <p class="helper">Future simulation changes can overwrite future-month overrides. Past months stay unchanged.</p>
    </aside>
  `;
}

function projectionTimelineMarkup(mode = "full") {
  return `
    <div class="projection-tools">
      <div class="chip-list">
        <span class="chip">Window: ${state.projectionWindow}</span>
        <span class="chip">Expandable years</span>
        <span class="chip">Hundreds of months hidden by default</span>
      </div>
      <label>Jump to year
        <select data-action="jump-year">
          ${state.yearlyAssumptions.map((row) => `<option ${row.year === state.expandedYear ? "selected" : ""}>${row.year}</option>`).join("")}
        </select>
      </label>
    </div>

    <div class="projection-workspace ${mode === "compact" ? "compact" : ""}">
      <div class="year-timeline">
        <div class="year-summary year-head">
          <span>Year</span><span>Salary hike</span><span>Expense YoY</span><span>Income</span><span>Expense</span><span>Investment</span><span>Savings</span>
        </div>
        ${state.yearlyAssumptions
          .map(
            (row) => `
              <section class="year-group ${row.year === state.expandedYear ? "expanded" : ""}">
                <div class="year-summary">
                  <button class="ghost small" type="button" data-action="toggle-year" data-year="${row.year}">${row.year}</button>
                  <label>Salary hike <input value="${row.salaryHike}" /></label>
                  <label>Expense YoY <input value="${row.expenseIncrease}" /></label>
                  <strong>${row.annualIncome}</strong>
                  <strong>${row.annualExpense}</strong>
                  <strong>${row.annualInvestment}</strong>
                  <strong>${row.annualSavings}</strong>
                </div>
                <div class="month-table">
                  <div class="month-row month-head">
                    <span>Month</span><span>Income</span><span>Bonus</span><span>Expense</span><span>Investment</span><span>Savings</span><span>Action</span>
                  </div>
                  ${monthRows(row.year)}
                </div>
              </section>
            `
          )
          .join("")}
      </div>
      ${monthEditorMarkup()}
    </div>
  `;
}

function yearlyAssumptionCards() {
  return state.yearlyAssumptions
    .map(
      (row) => `
        <article class="assumption-card">
          <strong>${row.year}</strong>
          <label>Salary hike <input value="${row.salaryHike}" /></label>
          <label>Expense YoY <input value="${row.expenseIncrease}" /></label>
          <span>Base monthly income ${row.monthlyIncome}</span>
          <span>Base monthly expense ${row.monthlyExpense}</span>
        </article>
      `
    )
    .join("");
}

function mappingBoardMarkup() {
  return `
    <div class="mapping-board">
      <section class="mapping-column">
        <h4>Investment instruments</h4>
        ${state.investments.map((item, index) => `<button class="mapping-token ${index === 0 ? "selected" : ""}" type="button">${item.name} · ${item.corpus}</button>`).join("")}
      </section>
      <section class="mapping-column mapping-editor">
        <h4>Map selected instrument</h4>
        <label>Goal
          <select><option>Retirement</option><option>Dream Home</option><option>Child Education</option></select>
        </label>
        <label>Allocation percentage
          <input value="60%" />
        </label>
        <div class="allocation-meter"><span style="width: 60%"></span></div>
        <button class="secondary" type="button">Save mapping</button>
      </section>
      <section class="mapping-column">
        <h4>Saved mappings</h4>
        <div class="mini-table">
          <div><strong>Mapping</strong><strong>Value</strong></div>
          ${state.goalMappings.map((row) => `<div><span>${row.investment} → ${row.goal}</span><span>${row.allocation} · ${row.value}</span></div>`).join("")}
        </div>
      </section>
    </div>
  `;
}

function investmentsMarkup() {
  return `
    <div class="content-stack">
      <div class="section-head">
        <div>
          <p class="eyebrow">Holdings</p>
          <h2>Investment instruments</h2>
        </div>
        <button class="secondary" type="button" data-target="onboarding" data-step-jump="2">Add another investment</button>
      </div>
      <div class="card-grid">
        ${state.investments
          .map(
            (item) => `
              <article class="data-card">
                <strong>${item.corpus}</strong>
                <span>${item.name}</span>
                <div class="chip-list">
                  <span class="chip">${item.type}</span>
                  <span class="chip">${item.allocation}</span>
                  <span class="chip">${item.contribution}</span>
                  <span class="chip">ROI ${item.roi}</span>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function goalsMarkup() {
  return `
    <div class="content-stack">
      <div class="section-head">
        <div>
          <p class="eyebrow">Planning</p>
          <h2>Goals and progress</h2>
        </div>
        <div class="action-row">
          <button class="secondary" type="button" data-target="onboarding" data-step-jump="3">Create goal</button>
          <button class="secondary" type="button" data-target="onboarding" data-step-jump="4">Manage mappings</button>
        </div>
      </div>
      <div class="card-grid">
        ${state.goals
          .map(
            (goal) => `
              <article class="data-card">
                <strong>${goal.progress}</strong>
                <span>${goal.name}</span>
                <div class="chip-list">
                  <span class="chip">Target ${goal.target}</span>
                  <span class="chip">Current ${goal.current}</span>
                  <span class="status ${goal.status === "Lagging" ? "warn" : "good"}">${goal.status}</span>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <section class="panel">
        <h3>Goal to investment mapping</h3>
        ${mappingBoardMarkup()}
      </section>
    </div>
  `;
}

function simulationMarkup() {
  return `
    <div class="content-stack">
      <div class="section-head">
        <div>
          <p class="eyebrow">Cashflow</p>
          <h2>Income, expense, investment, and savings projection</h2>
        </div>
        <button class="primary" type="button" data-target="onboarding" data-step-jump="5">Run simulation</button>
      </div>
      <section class="panel">
        <div class="dashboard-grid">
          <div>
            <h3>Assumptions</h3>
            <div class="chip-list">
              <span class="chip">Salary hike 8%</span>
              <span class="chip">Bonus March · 12% annual gross</span>
              <span class="chip">Expense increase 6%</span>
              <span class="chip">Retirement Dec 2047</span>
            </div>
          </div>
          <div class="bar-chart">
            ${["Income", "Expense", "Investment", "Savings"]
              .map((label, index) => {
                const widths = [92, 38, 16, 40];
                const values = ["₹3.50L", "₹1.45L", "₹55K", "₹1.50L"];
                const classes = ["", "expense", "savings", "savings"];
                return `<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill ${classes[index]}" style="width:${widths[index]}%"></div></div><span>${values[index]}</span></div>`;
              })
              .join("")}
          </div>
        </div>
      </section>
      <section class="panel">
        <h3>Editable yearly hike and expense assumptions</h3>
        <div class="assumption-grid">${yearlyAssumptionCards()}</div>
      </section>
      <section class="panel">
        <h3>Year-summary projection with monthly drill-down</h3>
        ${projectionTable()}
      </section>
    </div>
  `;
}

function settingsMarkup() {
  return `
    <div class="content-stack">
      <div class="section-head">
        <div>
          <p class="eyebrow">Editable later</p>
          <h2>User settings</h2>
        </div>
        <button class="primary" type="button">Save settings</button>
      </div>
      <section class="panel">
        <div class="settings-sections">
          <section class="settings-group">
            <h3>Planning profile</h3>
            <div class="form-grid compact">
              <label>Country <select><option selected>India</option></select></label>
              <label>Currency <select><option selected>INR</option></select></label>
              <label>Date of birth <input type="date" value="1987-08-14" /></label>
              <label>Retirement age <input type="number" value="60" /></label>
              <label>Life expectancy age <input value="85" /></label>
              <label>Retirement month <select><option selected>December</option><option>March</option></select></label>
              <label>Monthly expense baseline <input value="₹1,45,000" /></label>
              <label>Salary hike YoY <input value="8%" /></label>
              <label>Expense increase YoY <input value="6%" /></label>
              <label>Expected inflation <input value="6%" /></label>
              <label>Income tax regime <select><option>Old</option><option selected>New</option></select></label>
              <label>Risk profile <select><option selected>Moderate</option><option>Conservative</option><option>Aggressive</option></select></label>
            </div>
          </section>

          <section class="settings-group">
            <h3>Salary components</h3>
            <div class="form-grid compact">
              <label>Current base salary component <input value="₹1,75,000" /></label>
              <label>Current HRA salary component <input value="₹70,000" /></label>
              <label>Current flexi bucket salary component <input value="₹1,05,000" /></label>
              <label>Percentage of basic opted for NPS
                <select>
                  <option>0</option><option>1</option><option>2</option><option>3</option><option>4</option>
                  <option>5</option><option>6</option><option>7</option><option>8</option><option>9</option>
                  <option selected>10</option><option>11</option><option>12</option><option>13</option><option>14</option>
                </select>
              </label>
              <div class="readonly-field">
                <span>Percentage of basic opted for EPF</span>
                <strong>12</strong>
              </div>
              <label>Percentage of basic opted for VPF <input value="0" /></label>
              <label>Company paying for medical and insurance <input value="₹18,000" /></label>
              <label>Gratuity <input value="₹8,400" /></label>
              <label>Percentage of gross salary given as bonus <input value="12%" /></label>
              <label>Bonus payout month
                <select>
                  <option>January</option><option>February</option><option selected>March</option><option>April</option>
                  <option>May</option><option>June</option><option>July</option><option>August</option>
                  <option>September</option><option>October</option><option>November</option><option>December</option>
                </select>
              </label>
              <label>Salary pay day
                <select>
                  <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                  <option>6</option><option>7</option><option>8</option><option>9</option><option>10</option>
                  <option>11</option><option>12</option><option>13</option><option>14</option><option>15</option>
                  <option>16</option><option>17</option><option>18</option><option>19</option><option>20</option>
                  <option>21</option><option>22</option><option>23</option><option>24</option><option selected>25</option>
                  <option>26</option><option>27</option><option>28</option><option>29</option><option>30</option><option>31</option>
                </select>
              </label>
            </div>
          </section>
        </div>
      </section>
    </div>
  `;
}

function renderAppScreens() {
  qs("#dashboard").innerHTML = dashboardMarkup();
  qs("#investments").innerHTML = investmentsMarkup();
  qs("#goals").innerHTML = goalsMarkup();
  qs("#simulation").innerHTML = simulationMarkup();
  qs("#settings").innerHTML = settingsMarkup();
}

function addSampleInvestment() {
  const remaining = getRemainingInstrumentTypes();
  if (remaining[0]) selectInvestmentType(remaining[0]);
}

function getCurrentInvestmentDraft() {
  const type = qs("#instrument-type")?.value || "Mutual Fund";
  const name = qs("#instrument-name-select-label")?.classList.contains("hidden")
    ? qs("#instrument-name-text")?.value || type
    : qs("#instrument-name-select")?.value || type;
  const corpus = qs("#investment-current-corpus")?.value || "₹0";
  const roi = qs("#investment-expected-roi")?.value || "0%";
  const contribution = qs("#investment-contribution-frequency")?.value || "Monthly";
  const assetType = qs("#investment-asset-type")?.value || "Equity";

  return {
    name,
    type,
    corpus,
    contribution: contribution.toLowerCase(),
    roi,
    allocation: assetType
  };
}

function saveInvestment() {
  state.investments.push(getCurrentInvestmentDraft());
  renderInvestments();
  syncInvestmentForm();
}

function removeInvestment(index) {
  state.investments.splice(index, 1);
  renderInvestments();
  syncInvestmentForm();
}

function selectInvestmentType(type) {
  const typeSelect = qs("#instrument-type");
  if (!typeSelect) return;
  typeSelect.value = type;
  if (type !== "Mutual Fund") state.casUploaded = false;
  syncInvestmentForm();
}

function addSampleGoal() {
  state.goals.push({
    name: "Child Education",
    target: "₹75.0L",
    current: "₹0",
    progress: "0%",
    status: "Needs allocation"
  });
  renderGoals();
}

function setElementVisible(selector, visible) {
  const element = qs(selector);
  if (element) element.classList.toggle("hidden", !visible);
}

function setInstrumentNameOptions(names) {
  const select = qs("#instrument-name-select");
  if (!select) return;
  select.innerHTML = names.map((name) => `<option>${name}</option>`).join("");
}

function getCreatedInstrumentTypes() {
  return new Set(state.investments.map((item) => item.type));
}

function getRemainingInstrumentTypes() {
  const createdTypes = getCreatedInstrumentTypes();
  return state.instrumentTypes.filter((type) => !createdTypes.has(type));
}

function renderAvailableInvestmentTypes() {
  const target = qs("#available-investment-types");
  if (!target) return;
  const remaining = getRemainingInstrumentTypes();
  target.innerHTML = `
    <div>
      <h3>Instrument types not created yet</h3>
      <p>Add another investment starts from one of these remaining types.</p>
    </div>
    <div class="type-chip-row">
      ${
        remaining.length
          ? remaining.map((type) => `<button class="type-chip" type="button" data-action="select-investment-type" data-investment-type="${type}">${type}</button>`).join("")
          : `<span class="chip">All instrument types have at least one saved instrument</span>`
      }
    </div>
  `;
}

function syncInvestmentForm() {
  const type = qs("#instrument-type")?.value || "Mutual Fund";
  const stepUpType = qs("#step-up-type")?.value || "Manual";
  const isMutualFund = type === "Mutual Fund";
  const isGovernmentScheme = type === "Government Scheme";
  const useNameSelect = isMutualFund || isGovernmentScheme;
  const showDetailForm = !isMutualFund || state.casUploaded;

  setElementVisible("#cas-card", isMutualFund);
  setElementVisible("#investment-detail-form", showDetailForm);
  setElementVisible("#instrument-name-select-label", useNameSelect);
  setElementVisible("#instrument-name-text-label", !useNameSelect);
  setElementVisible("#fund-category-label", isMutualFund);
  setElementVisible("#manual-step-up-panel", showDetailForm && stepUpType === "Manual");
  setElementVisible("#step-up-percentage-label", showDetailForm && stepUpType === "AutomaticYoY");
  setElementVisible("#investment-form-actions", showDetailForm);

  if (useNameSelect) setInstrumentNameOptions(isMutualFund ? state.mutualFundNames : state.governmentSchemeNames);

  const dropZone = qs("#cas-drop-zone");
  if (dropZone) {
    dropZone.classList.toggle("uploaded", state.casUploaded);
    dropZone.querySelector("strong").textContent = state.casUploaded ? "CAS uploaded" : "Upload CAS first";
    dropZone.querySelector("span").textContent = state.casUploaded
      ? "Backend parsed fund names are now available below"
      : "Mutual fund instrument names unlock after upload";
  }
  renderAvailableInvestmentTypes();
}

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  const navButton = event.target.closest("[data-target]");
  const stepButton = event.target.closest("[data-step]");

  if (stepButton) {
    setStep(Number(stepButton.dataset.step));
  }

  if (navButton && !navButton.dataset.action) {
    setScreen(navButton.dataset.target);
    if (navButton.dataset.stepJump) {
      setStep(Number(navButton.dataset.stepJump));
    }
  }

  if (!actionButton) return;

  const action = actionButton.dataset.action;
  if (action === "next" || action === "verify-otp") setStep(state.currentStep + 1);
  if (action === "send-otp") actionButton.textContent = "OTP sent";
  if (action === "returning-user") setScreen("dashboard");
  if (action === "back") setStep(state.currentStep - 1);
  if (action === "add-investment") addSampleInvestment();
  if (action === "save-investment") saveInvestment();
  if (action === "remove-investment") removeInvestment(Number(actionButton.dataset.investmentIndex));
  if (action === "select-investment-type") selectInvestmentType(actionButton.dataset.investmentType);
  if (action === "create-goal") addSampleGoal();
  if (action === "map-investments") setStep(5);
  if (action === "run-simulation") setStep(6);
  if (action === "open-dashboard") setScreen("dashboard");
  if (action === "toggle-nav") qs(".sidebar").classList.toggle("open");
  if (action === "toggle-year") {
    state.expandedYear = actionButton.dataset.year;
    renderWizardSimulationTables();
    renderAppScreens();
  }
  if (action === "select-month") {
    state.selectedMonth = { year: actionButton.dataset.year, month: actionButton.dataset.month };
    renderAppScreens();
  }
  if (action === "mock-cas-upload") {
    state.casUploaded = true;
    syncInvestmentForm();
  }
});

document.addEventListener("change", (event) => {
  const control = event.target.closest("[data-action='jump-year']");
  if (!control) return;
  state.expandedYear = control.value;
  renderWizardSimulationTables();
  renderAppScreens();
});

qs("#instrument-type").addEventListener("change", (event) => {
  if (event.target.value !== "Mutual Fund") state.casUploaded = false;
  syncInvestmentForm();
});

qs("#step-up-type").addEventListener("change", syncInvestmentForm);

renderInvestments();
renderGoals();
renderProjectionBars();
renderWizardSimulationTables();
renderAppScreens();
syncInvestmentForm();
setScreen("onboarding");
setStep(0);
