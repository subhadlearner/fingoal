# FinGoal Phase-1 Project Context

Last updated: 2026-05-07

This artifact captures the current Phase-1 decisions for FinGoal so future work can continue without rediscovering product, UI, schema, and DynamoDB context.

## Product Direction

FinGoal Phase-1 is a goal-based personal financial simulation product for Indian users.

The MVP should help a user:

- register with email OTP
- configure financial settings and salary assumptions
- add investments
- create goals
- map full investment instruments to goals
- run income, expense, investment, and savings simulation
- view a portfolio dashboard

Phase-1 is intentionally not a full expense tracker, portfolio aggregation platform, tax engine, or Monte Carlo simulator.

## Finalized Phase-1 UI

The clickable static wireframe lives in:

- `ui/index.html`
- `ui/styles.css`
- `ui/app.js`
- `ui/README.md`

Open `ui/index.html` directly in a browser.

### Registration

First-time registration captures:

- full name
- email
- phone number
- OTP

Returning users should land on Dashboard after login.

### Settings

Settings is the main user-editable surface for Phase-1 assumptions.

Fields:

- country: India
- currency: INR
- date of birth
- retirement age
- retirement month
- life expectancy age
- monthly expense baseline
- salary hike YoY
- expense increase YoY
- expected inflation
- income tax regime: Old/New
- risk profile
- current base salary component
- current HRA salary component
- current flexi bucket salary component
- NPS percentage of basic: 0-14
- EPF percentage of basic: hardcoded 12
- VPF percentage of basic
- company medical and insurance amount
- gratuity
- bonus percentage of gross salary
- bonus payout month
- salary pay day

Settings save should update settings, upsert default streams, and regenerate stored monthly cashflow.

### Income and Expense Streams

Phase-1 now uses streams internally:

- one income stream: `Salary`
- one expense stream: `Household Expenses`

The UI does not yet expose a separate income/expense stream manager.

The backend creates or updates these streams from Settings:

- `Salary` from salary components, salary hike, bonus month, bonus percentage, retirement date
- `Household Expenses` from monthly expense baseline and expense YoY

Cashflow and simulation should read stream records, not raw settings directly.

### Investments

Instrument type options:

- Mutual Fund
- Government Scheme
- ETF
- Stock Option
- Fixed Deposit
- Savings Account

Mutual Fund flow:

- user must upload CAS first
- backend parses mutual fund names
- instrument name becomes a dropdown
- user saves one selected mutual fund as an investment

Government Scheme flow:

- instrument name dropdown contains EPF, NPS, PPF, SSY

Other types:

- instrument name is free text

Investment detail fields:

- instrument status: Active, Paused, Stopped
- fund category for mutual funds only: LargeCap, MidCap, SmallCap, FlexiCap, Liquid, LargeCap Index, Large and Mid cap
- contribution frequency: Monthly, Annually
- asset type: Equity, Debt, Gold
- start date
- end date
- expected ROI
- current corpus
- investment start amount
- step-up type: SalaryLinked, Manual, AutomaticYoY, Not Applicable
- manual step-up schedule: schedule name, date, amount
- step-up percentage only for AutomaticYoY

Saved investments appear as tiles with an `X` remove action.

### Goals

Goal creation captures:

- goal name
- target date
- target corpus
- expected equity allocation
- expected debt allocation
- expected gold allocation

Goal creation does not show progress because no investments are mapped yet.

Saved goals appear as tiles with an `X` remove action.

### Mapping

Mapping rule:

- one investment maps to one goal at 100% corpus
- partial allocation is not supported in Phase-1

Mapping editor has:

- investment dropdown
- goal dropdown
- map investment button

Saved mappings appear as removable tiles with `X`.

### Simulation

Simulation is not part of the wizard.

Users open the Simulation menu item to run simulation.

Simulation uses:

- saved settings
- generated salary stream
- generated household expense stream
- investments
- goals
- mappings
- stored monthly cashflow

Simulation page shows:

- projection preview graph
- year rows
- salary hike override textbox per year
- expense YoY override textbox per year
- annual income
- annual expense
- annual investment
- annual savings
- expandable month rows

Month rows are display-only in Phase-1. There is no month-wise edit action.

Clicking Simulate should create a new simulation run and update yearly/monthly projection data as applicable.

### Dashboard

Dashboard shows:

- portfolio name, currently shown as `My Growth Portfolio`
- current corpus
- CAGR placeholder
- XIRR placeholder
- goal health
- asset allocation percentage and INR equivalent

Dashboard does not show the projection timeline.

## Active Phase-1 Schemas

Finalized schema folder:

- `src/schema/db/new_29042026`

Active Phase-1 schemas:

- `user-schema.json`
- `user-settings-schema.json`
- `income-stream-schema.json`
- `expense-stream-schema.json`
- `portfolio-schema.json`
- `investment-account-schema.json`
- `transaction-schema.json`
- `goal-schema.json`
- `goal-allocation-schema.json`
- `cashflow-month-schema.json`
- `simulation-run-schema.json`
- `simulation-year-snapshot-schema.json`

Schemas prefixed with `NA_` are retained for later phases and are not active in Phase-1:

- `NA_simulation-assumption-schema.json`
- `NA_instrument-master-schema.json`
- `NA_fund-underlying-snapshot-schema.json`

All schema files currently parse as valid JSON.

## Entity Relationships

```text
USER
 |- USER_SETTINGS
 |   |- generated INCOME_STREAM: Salary
 |   |- generated EXPENSE_STREAM: Household Expenses
 |   |- generated CASHFLOW_MONTH rows
 |
 |- PORTFOLIO
 |   |- INVESTMENT_ACCOUNT
 |       |- TRANSACTION
 |
 |- GOAL
 |- GOAL_ALLOCATION
 |   |- links INVESTMENT_ACCOUNT to GOAL at 100%
 |
 |- SIMULATION_RUN

SIMULATION_RUN
 |- SIMULATION_YEAR_SNAPSHOT
```

Important modeling decisions:

- Settings are the user-editable assumptions surface.
- Streams are generated from settings and become the planning inputs.
- Cashflow months are generated from streams.
- Goal progress is derived after goal mappings exist.
- Goal allocation is always 100% in Phase-1.
- Simulation assumptions are derived from settings/streams in Phase-1; separate assumption sets are later-phase.

## DynamoDB Single-Table Design

Recommended table:

- `fingoal-main`

Primary key:

- `PK`
- `SK`

Use the user as partition root for user-owned entities:

```text
PK = USER#<user_id>
```

Sort keys:

```text
PROFILE#<user_id>
SETTINGS#<settings_id>
INCOME#<income_stream_id>
EXPENSE#<expense_stream_id>
PORTFOLIO#<portfolio_id>
INVESTMENT#<investment_account_id>
TRANSACTION#<investment_account_id>#<transaction_date>#<transaction_id>
GOAL#<goal_id>
GOALMAP#<investment_account_id>#<goal_id>
CASHFLOW#<year>#<month>
SIMRUN#<simulation_run_id>
```

Simulation year snapshots are grouped by simulation run:

```text
PK = SIMRUN#<simulation_run_id>
SK = YEAR#<year>
```

Every DynamoDB item should include:

```text
entity_type
```

Useful values:

- `USER`
- `USER_SETTINGS`
- `INCOME_STREAM`
- `EXPENSE_STREAM`
- `PORTFOLIO`
- `INVESTMENT_ACCOUNT`
- `TRANSACTION`
- `GOAL`
- `GOAL_ALLOCATION`
- `CASHFLOW_MONTH`
- `SIMULATION_RUN`
- `SIMULATION_YEAR_SNAPSHOT`

## Access Patterns

### Registration

Write:

- `PK=USER#<user_id>, SK=PROFILE#<user_id>`

If not relying fully on Cognito for email lookup, add:

- `GSI_EMAIL_PK = EMAIL#<normalized_email>`
- `GSI_EMAIL_SK = USER#<user_id>`

### First-Time Settings Save

Write:

- `SETTINGS#<settings_id>`
- `INCOME#income_salary...`
- `EXPENSE#expense_household...`
- default `PORTFOLIO#<portfolio_id>`
- generated `CASHFLOW#<year>#<month>` rows

No GSI required.

### Returning Dashboard Load

Read:

- query `PK=USER#<user_id>`
- group by `entity_type`
- optionally use latest simulation GSI

Needed records:

- profile
- settings
- streams
- portfolio
- goals
- investments
- mappings
- latest simulation run

Recommended GSI:

- `GSI3_LATEST_SIMULATION`

### Investment Screen

List investments:

```text
Query PK=USER#<user_id>
begins_with(SK, INVESTMENT#)
```

Transactions for one investment:

```text
Query PK=USER#<user_id>
begins_with(SK, TRANSACTION#<investment_account_id>#)
```

Optional at scale:

- `GSI1_INVESTMENT_TRANSACTIONS`

### Goal Screen

List goals:

```text
Query PK=USER#<user_id>
begins_with(SK, GOAL#)
```

Create goal:

```text
PutItem PK=USER#<user_id>, SK=GOAL#<goal_id>
```

Remove goal:

- prefer soft delete with `status=cancelled`
- remove or deactivate related mappings

Optional:

- `GSI2_GOAL_MAPPINGS`

### Mapping Screen

Load mapping screen:

```text
Query PK=USER#<user_id>
```

Use records:

- `INVESTMENT#`
- `GOAL#`
- `GOALMAP#`

Create mapping:

```text
PutItem PK=USER#<user_id>
SK=GOALMAP#<investment_account_id>#<goal_id>
allocation_percentage=100
```

Enforce one active mapping per investment:

```text
Query PK=USER#<user_id>
begins_with(SK, GOALMAP#<investment_account_id>#)
```

### Simulation Screen

Initial load:

- settings
- income stream
- expense stream
- investments
- goals
- mappings
- cashflow months
- latest simulation run
- year snapshots for latest run

Year snapshots:

```text
Query PK=SIMRUN#<simulation_run_id>
begins_with(SK, YEAR#)
```

Monthly drilldown:

```text
Query PK=USER#<user_id>
SK BETWEEN CASHFLOW#<year>#01 AND CASHFLOW#<year>#12
```

Simulate button:

- read `INCOME#` and `EXPENSE#`
- read investment/goal/mapping records
- create `SIMRUN#`
- write `PK=SIMRUN#<simulation_run_id>, SK=YEAR#<year>`
- update/generated `CASHFLOW#<year>#<month>`

Recommended:

- `GSI3_LATEST_SIMULATION`

## Recommended GSIs

### GSI_EMAIL

Only required if Cognito does not own email lookup.

```text
GSI_EMAIL_PK = EMAIL#<normalized_email>
GSI_EMAIL_SK = USER#<user_id>
```

### GSI3_LATEST_SIMULATION

Recommended for dashboard and simulation landing.

```text
GSI3PK = USER#<user_id>#SIMRUN
GSI3SK = GENERATED_AT#<generated_at>
```

Use descending sort and `Limit=1`.

### GSI1_INVESTMENT_TRANSACTIONS

Optional at transaction scale.

```text
GSI1PK = INVESTMENT#<investment_account_id>
GSI1SK = TRANSACTION#<transaction_date>#<transaction_id>
```

### GSI2_GOAL_MAPPINGS

Optional but useful for goal detail, goal deletion cleanup, and analytics.

```text
GSI2PK = GOAL#<goal_id>
GSI2SK = INVESTMENT#<investment_account_id>
```

### GSI4_PORTFOLIO_INVESTMENTS

Not required while Phase-1 has one portfolio per user. Useful later for multiple portfolios.

```text
GSI4PK = PORTFOLIO#<portfolio_id>
GSI4SK = INVESTMENT#<investment_account_id>
```

## Current Artifacts

Primary references:

- `docs/phase-1-project-context.md`
- `docs/phase-1-roadmap.md`
- `src/schema/db/new_29042026/README.md`
- `ui/index.html`
- `ui/README.md`

## Suggested Next Implementation Milestones

1. Scaffold backend API project.
2. Create DynamoDB item models and key builders.
3. Implement registration/settings save flow.
4. Generate default salary and household expense streams.
5. Generate cashflow months from streams.
6. Implement investment CRUD and CAS placeholder ingestion contract.
7. Implement goal CRUD and 100% mapping.
8. Implement simulation run creation and year snapshot persistence.
9. Implement dashboard read model.

