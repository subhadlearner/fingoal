# FinGoal Revised Roadmap

## Product Direction

FinGoal should be built as a goal-based personal financial simulation platform for Indian users.

The system should combine:

- user profile and retirement horizon
- income growth projection
- expense growth projection
- current investments and future contributions
- goal mapping
- portfolio analysis
- retirement and goal feasibility simulation

This is stronger than a pure goal tracker because it answers not only "what do I own?" but also "what is likely to happen to my financial life over time?"

## Product Thesis

Every important financial decision sits on top of four moving parts:

1. income
2. expenses
3. investments
4. goals

FinGoal should model all four together and project the future year by year.

## Recommended Phase Structure

### Phase 1A: Foundational MVP

Build the first usable product with:

- email OTP login
- user profile and retirement settings
- one or more income streams
- one or more expense streams
- financial goal creation
- manual investment entry
- goal to investment mapping
- annual projection until retirement
- base dashboard with net worth, surplus, and goal status

### Phase 1B: Better Planning Engine

Add:

- multiple scenarios: conservative, base, optimistic
- planned future investments from annual surplus
- goal-level funding gap analysis
- goal-level asset allocation analysis
- retirement readiness view
- annual cashflow timeline

### Phase 1C: Assisted Data Capture

Add:

- mutual fund NAV enrichment
- optional statement imports
- better instrument master data
- improved equity category and allocation breakdown

### Phase 2

Add:

- assisted EPF and mutual fund ingestion where feasible
- deeper tax logic
- Monte Carlo simulation
- rebalancing suggestions
- what-if planning tools

## Recommended Tech Stack

### Frontend

- Web app: plain HTML, CSS, and JavaScript
- Android app: Capacitor wrapper around the same web app
- UI style: vanilla JS SPA with reusable modules
- Charting: Apache ECharts

### Backend

- API: .NET 8 Minimal APIs
- Runtime: AWS Lambda
- Auth: Amazon Cognito with email OTP
- Notifications: Amazon SES when needed
- Data store: DynamoDB

### Infrastructure

- IaC: AWS SAM
- CI/CD: GitHub Actions
- Web hosting: S3 + CloudFront
- Android delivery: Capacitor build pipeline and Play Store later

## Why This Stack Still Fits

- It stays frugal.
- It fits your AWS and .NET background.
- It avoids building two separate frontends too early.
- It keeps the system easy to deploy and iterate.

## Realistic Phase-1 Data Strategy

Phase 1 should assume that most financial data is user-provided.

Supported phase-1 data capture:

- manual income entry
- manual expense entry
- manual investment entry
- manual transaction entry
- optional benchmark or master-data enrichment

Supported phase-1.5 data assistance:

- AMFI mutual fund NAV refresh
- optional mutual fund statement import

Not realistic for phase 1:

- free official unified investment aggregation across EPF, NPS, PPF, SSY, mutual funds, stocks, banks, and FDs

## Core Capabilities

### User and Settings

The user should configure:

- date of birth
- retirement age
- current monthly expense
- expense inflation
- salary hike assumption
- risk profile
- tax regime

These should become simulation assumptions, not just profile fields.

### Income Planning

A user can have multiple income streams such as:

- salary
- bonus
- freelance income
- rent
- pension later

Each income stream should support:

- category
- frequency
- current amount
- start date
- optional end date
- annual growth rule
- taxability marker

### Expense Planning

A user can have multiple expense streams such as:

- household expenses
- rent
- EMI
- insurance premiums
- school fees
- vacations

Each expense stream should support:

- category
- frequency
- current amount
- start date
- optional end date
- annual growth rule
- essential vs discretionary marker

### Goal Planning

Goals should support:

- goal name
- target year
- current estimated cost
- inflation assumption
- inflation-adjusted future corpus
- importance level
- linked investments
- funding gap

### Investment Planning

Phase 1 investment support should include:

- mutual funds
- stocks
- ETF
- EPF
- NPS
- PPF
- SSY
- savings account
- fixed deposit
- gold

Each investment should support:

- instrument type
- asset type
- asset subtype
- current value
- start amount
- expected return
- future contribution plan
- actual transactions where available
- current allocation

## Key Product Screens

### 1. Sign In

- email entry
- OTP verification

### 2. Onboarding

- profile
- retirement settings
- salary growth
- expense inflation
- base income and expense setup

### 3. Dashboard

Show:

- net worth
- annual surplus
- savings rate
- retirement target progress
- goal health summary
- asset allocation

### 4. Income and Expense Planner

Show:

- active income streams
- active expense streams
- future cashflow projection
- yearly surplus or deficit

### 5. Goals

Show:

- current target
- inflation-adjusted target
- mapped investments
- projected readiness

### 6. Investments

Show:

- holdings
- transactions
- asset mix
- goal mapping
- category exposure

### 7. Simulation

Show:

- year-by-year projection till retirement
- income
- expenses
- surplus invested
- projected portfolio
- goal status

## Planning Engine Design

The engine should calculate year by year:

1. forecasted income
2. forecasted expenses
3. annual surplus or deficit
4. investment contributions from surplus
5. investment growth
6. goal funding status
7. retirement corpus projection

The first release should use deterministic projections with three scenarios:

- conservative
- base
- optimistic

This is easier to explain and validate than jumping straight to Monte Carlo.

## Suggested Domain Model

Separate these layers:

1. persistence entities
2. API request and response contracts
3. UI form metadata
4. simulation and analytics models

## Recommended Core Entities

- user
- user_settings
- income_stream
- expense_stream
- goal
- investment_account
- transaction
- goal_allocation
- simulation_assumption
- simulation_run
- simulation_year_snapshot
- instrument_master
- fund_underlying_snapshot

## Important Modeling Rules

### Rule 1

Do not store only one income and one expense value at the user level.

Use income and expense streams so the model can handle:

- salary stopping at retirement
- rent ending after a house purchase
- EMI ending after loan closure
- school fees ending after a fixed year

### Rule 2

Do not attach each investment directly to only one goal.

Use a `goal_allocation` model so one investment can be split across multiple goals by percentage or value.

### Rule 3

Do not mix UI rendering metadata with persistence schemas.

### Rule 4

System-calculated values should not be required in create contracts.

## DynamoDB Starting Design

Suggested partition and sort keys:

- `PK=USER#<userId>`
- `SK=PROFILE#<userId>`
- `SK=SETTINGS#<userId>`
- `SK=INCOME#<incomeId>`
- `SK=EXPENSE#<expenseId>`
- `SK=GOAL#<goalId>`
- `SK=INVESTMENT#<investmentId>`
- `SK=TRANSACTION#<investmentId>#<date>#<txnId>`
- `SK=GOALMAP#<goalId>#<investmentId>`
- `SK=SIMRUN#<runId>`
- `SK=SIMYEAR#<runId>#<year>`

GSIs:

- `GSI1PK=GOAL#<goalId>` for mapped investments and analytics
- `GSI2PK=TYPE#<entityType>` for admin and reporting use cases if needed

## Analytics for Phase 1

### Goal Inflation

`future_goal_cost = present_cost * (1 + inflation_rate) ^ years`

### CAGR

Use start value, current value, and elapsed time.

### XIRR

Use dated investment cash flows and current value as terminal flow.

### Annual Surplus

`annual_surplus = total_income - total_expenses - planned_outflows`

### Retirement Projection

Project corpus to retirement using:

- opening balance
- annual contribution
- annual return
- yearly inflation assumptions for target expenses

### Goal Readiness Flag

Suggested early thresholds:

- green: projected funding >= 105%
- amber: projected funding between 85% and 105%
- red: projected funding < 85%

## Feedback on Current Schema Direction

Your schema work is good as business thinking, but it needs restructuring before implementation.

Main issues:

- it mixes database concerns and UI concerns
- goal and instrument relationship is too tightly coupled
- transaction creation is hard because key user-entered fields are marked `readOnly`
- some data types and sample enums are inconsistent
- there is no first-class income and expense model yet
- there is no simulation result model yet

## What We Should Do Next

Next we should work on the schema set in this order:

1. define the target entity list
2. redesign `user` into `user` plus `user_settings`
3. create `income-stream-schema`
4. create `expense-stream-schema`
5. redesign `goal-schema`
6. redesign `instrument-schema`
7. create `goal-allocation-schema`
8. create `simulation-run-schema`
9. create `simulation-year-snapshot-schema`
10. clean sample data and enum consistency

## First Coding Milestone

The best coding milestone after schema cleanup is:

- shared web shell
- Cognito email OTP sign-in
- onboarding for profile, income, and expense settings
- goal creation
- manual investment creation
- first deterministic retirement and goal simulation dashboard
