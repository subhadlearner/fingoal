# FinGoal Phase-1 Schema Set

This folder contains the Phase-1 persistence schema pack aligned to the finalized UI wireframes.

The Phase-1 product flow is:

1. User registers with name, email, phone, and OTP.
2. User saves planning settings and salary assumptions.
3. Backend creates one salary income stream and one household expense stream from settings.
4. Backend generates month-wise income and expense projection records from those streams.
5. User uploads CAS file; backend parses it, deduplicates transactions, and auto-writes transaction records.
6. User adds investment instruments.
7. User creates goals.
8. User maps each investment instrument fully to one goal.
9. User runs simulation from the Simulation page.
10. Dashboard shows portfolio name, current corpus, goal health, CAGR/XIRR placeholders, and allocation.

## UI to Schema Mapping

### Registration

Schema:

- `user-schema.json`

Stores:

- `user_id`
- `email`
- `full_name`
- `phone_e164`
- `date_of_birth`
- India/INR defaults

### Settings

Schema:

- `user-settings-schema.json`

Stores the Settings page fields:

- country and currency
- retirement age and retirement month
- retirement year (derived from DOB + retirement age, stored on save)
- life expectancy age
- monthly expense baseline
- salary hike, expense YoY, and expected inflation
- income tax regime
- current base, HRA, and flexi bucket salary components
- NPS, EPF, and VPF percentages
- medical/insurance, gratuity, bonus percentage, bonus payout month, salary pay day

When settings are saved, the backend should generate or regenerate:

- `income-stream-schema.json`
- `expense-stream-schema.json`
- `cashflow-month-schema.json`

Phase-1 stream defaults:

- one income stream: `Salary`
- one expense stream: `Household Expenses`

The UI does not expose a separate Income/Expense stream manager in Phase-1. Settings remain the editable user-facing surface.

### CAS Upload
Schema:
- `cas-upload-schema.json`
Tracks the full lifecycle of each CAS file upload:
- `upload_status`: `pending` → `parsing` → `completed` or `failed`
- `parsed_fund_names`: list of mutual fund names extracted, used to populate the instrument name dropdown in the UI
- `parsed_transaction_count`: total transactions found in the CAS file before deduplication
- `inserted_transaction_count`: net new transactions written to DB
- `duplicate_transaction_count`: transactions skipped due to deduplication
- `failure_reason`: populated only on failure, for debugging and retry
Key design rules:
- Users can upload multiple CAS files over time.
- No user confirmation step; transactions are auto-written after parsing.
- Deduplication natural key: `investment_account_id + transaction_date + amount + units`.
- XIRR and CAGR are computed only for `instrument_type = mutual_fund` using these transaction records.
DynamoDB key:
```
PK = USER#<user_id>
SK = CASUPLOAD#<cas_upload_id>
```

### Income and Expense Streams

Schemas:

- `income-stream-schema.json`
- `expense-stream-schema.json`

Phase-1 uses these as generated planning records:

- `Salary` income stream is generated from salary components, bonus settings, salary hike, and retirement date.
- `Household Expenses` expense stream is generated from monthly expense baseline and expense YoY.

Cashflow months and simulation runs should read from these stream records rather than recalculating directly from `user-settings`.

### Investments

Schema:

- `investment-account-schema.json`

Phase-1 instrument types:

- `mutual_fund`
- `government_scheme`
- `etf`
- `stock_option`
- `fixed_deposit`
- `savings_account`

Mutual fund flow:

- UI requires CAS upload first.
- Backend parses fund names and stores them on the `cas_upload` record
- User saves one selected fund as an investment account.
- `source = cas_upload`
- `current_corpus_source = cas_upload` or `transaction_derived`

Government scheme flow:

- Instrument name is selected from EPF, NPS, PPF, SSY.
- `instrument_type = government_scheme`
- `government_scheme_type` stores the selected scheme.

Other instrument flows:

- Instrument name is free text.
- Current corpus and contribution details are entered manually.

Manual step-up schedule is embedded in the investment account as `manual_step_up_schedule` for Phase-1.

### Transactions

Schema:

- `transaction-schema.json`

Used for CAS-derived or imported investment transaction history.

Transactions remain linked to an investment account:

- `investment_account_id`

For mutual fund instruments, an `opening_balance` transaction is auto-generated from `current_corpus` and `start_date` on investment save. This ensures XIRR has a starting data point even before CAS transactions are available.

XIRR and CAGR are computed only for `instrument_type = mutual_fund`. Other instrument types (EPF, FD, Savings Account) do not require transaction history for Phase-1 analytics.

### Goals

Schema:

- `goal-schema.json`

Stores:

- goal name
- category
- target date
- target corpus
- expected equity allocation
- expected debt allocation
- expected gold allocation

Progress is not stored on goal creation. It is derived after mappings and simulation.

### Goal Mapping

Schema:

- `goal-allocation-schema.json`

Phase-1 rule:

- one investment account maps to one goal at 100% corpus allocation
- no partial allocation

`allocation_percentage` is therefore fixed to `100`.

Enforcement rule: before writing any `GOALMAP` record, the backend must query `begins_with(SK, GOALMAP#<investment_id>#)` and reject if an active mapping already exists. Use `is_active = false` for soft-delete of removed mappings rather than hard delete.

### Portfolio Dashboard

Schema:

- `portfolio-schema.json`

Stores the portfolio name and current allocation/corpus values shown on the dashboard.

Dashboard derived metrics such as CAGR, XIRR, goal health, and progress can be calculated read models later.

### Simulation

Schemas:

- `simulation-run-schema.json`
- `simulation-year-snapshot-schema.json`
- `cashflow-month-schema.json`

The Simulation page reads saved settings and stored monthly cashflow records. Users can override salary hike and expense YoY at the year level, then click Simulate.

Each click of the Simulate button creates a new `simulation_run` record. All simulation runs are retained.

The backend should:

1. Create a new `simulation_run` with `status = queued`.
2. Run the projection engine.
2. create or update yearly rows in `simulation-year-snapshot-schema.json`
3. Write yearly rows to `simulation-year-snapshot-schema.json`.
3. create or update month-wise records in `cashflow-month-schema.json`
4. Write or update month-wise records in `cashflow-month-schema.json`.
5. Update the `simulation_run` record with computed output fields and `status = completed`.

Output fields on `simulation_run` (`projected_retirement_corpus`, `required_retirement_corpus`, `goal_funding_ratio`, `retirement_readiness_flag`, `opening_net_worth`) are nullable until the run completes. `status = completed` is the signal that these fields are populated.

Month-level records are shown as drill-down rows but are not edited directly in Phase-1.

Cashflow rows span the full retirement horizon on first settings save. Future phases may extend this to the user's full life expectancy horizon.

## DynamoDB Single Table Design

Recommended table:

- `fingoal-main`

Primary key:

- `PK`
- `SK`

All user-owned records should keep `user_id` as the partition root unless the access pattern is naturally grouped by a simulation run.

### User Root Records

Use:

- `PK = USER#<user_id>`

Sort keys:

- `SK = PROFILE#<user_id>`
- `SK = SETTINGS#<settings_id>`
- `SK = INCOME#<income_stream_id>`
- `SK = EXPENSE#<expense_stream_id>`
- `SK = PORTFOLIO#<portfolio_id>`
- `SK = INVESTMENT#<investment_account_id>`
- `SK = TRANSACTION#<investment_account_id>#<transaction_date>#<transaction_id>`
- `SK = GOAL#<goal_id>`
- `SK = GOALMAP#<investment_account_id>#<goal_id>`
- `SK = CASHFLOW#<year>#<month>`
- `SK = SIMRUN#<simulation_run_id>`
- `SK = CASUPLOAD#<cas_upload_id>`

This supports the main dashboard load with one query:

- query `PK = USER#<user_id>`

### Simulation Year Snapshots

Year snapshots are grouped by simulation run:

- `PK = SIMRUN#<simulation_run_id>`
- `SK = YEAR#<year>`

This supports the Simulation screen:

- get latest `SIMRUN` from the user root
- query all `YEAR#` rows under that simulation run

### Optional GSIs

Add these only when needed:

#### GSI1: Investment Transactions

- `GSI1PK = INVESTMENT#<investment_account_id>`
- `GSI1SK = TRANSACTION#<transaction_date>#<transaction_id>`

Useful when transaction volume becomes large.

#### GSI2: Goal Mappings

- `GSI2PK = GOAL#<goal_id>`
- `GSI2SK = INVESTMENT#<investment_account_id>`

Useful for direct goal detail pages.

#### GSI3: Latest Simulation

- `GSI3PK = USER#<user_id>#SIMRUN`
- `GSI3SK = GENERATED_AT#<generated_at>`

Useful for loading the latest completed simulation quickly. Use `ScanIndexForward=false` and `Limit=1`.

## Entity Type Attribute

Every persisted item should include an `entity_type` attribute in DynamoDB even if it is not present in every JSON schema yet.

Suggested values:

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
- `CAS_UPLOAD`

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
- `cas-upload-schema.json`

Schemas prefixed with `NA_` are retained for later phases and are not active in Phase-1:

- `NA_simulation-assumption-schema.json`
- `NA_instrument-master-schema.json`
- `NA_fund-underlying-snapshot-schema.json`

## Phase-1 Access Patterns

### First Login After Registration

Write:

- `PROFILE`
- `SETTINGS`
- default `INCOME#` salary stream
- default `EXPENSE#` household expense stream
- default `PORTFOLIO`
- generated `CASHFLOW#<year>#<month>` records

### Returning User Dashboard

Read:

- `PROFILE`
- `SETTINGS`
- `INCOME#`
- `EXPENSE#`
- `PORTFOLIO`
- `GOAL#`
- `INVESTMENT#`
- `GOALMAP#`
- latest `SIMRUN#`

### Investment Screen

### CAS Upload

Write on upload:

```
PutItem PK=USER#<user_id>, SK=CASUPLOAD#<cas_upload_id>
upload_status = pending
```

Update after parse:

```
UpdateItem upload_status = completed | failed
parsed_fund_names = [...]
parsed_transaction_count, inserted_transaction_count, duplicate_transaction_count
parsed_at = <timestamp>
```

List all uploads for a user:
```
Query PK=USER#<user_id>
begins_with(SK, CASUPLOAD#)
```

Read:

- `INVESTMENT#`

Write:

- `INVESTMENT#`
- optional `TRANSACTION#` rows for CAS/imported transactions

### Goal Screen

Read/write:

- `GOAL#`

### Mapping Screen

Read:

- `INVESTMENT#`
- `GOAL#`
- `GOALMAP#`

Write:

- `GOALMAP#<investment_account_id>#<goal_id>`

The application should enforce one active mapping per investment account in Phase-1.

### Simulation Screen

Read:

- `SETTINGS`
- `INCOME#`
- `EXPENSE#`
- `CASHFLOW#`
- `INVESTMENT#`
- `GOAL#`
- `GOALMAP#`

Write:

- `SIMRUN#`
- `PK = SIMRUN#<simulation_run_id>, SK = YEAR#<year>`
- updated/generated `CASHFLOW#<year>#<month>`

## Sample Single-Table Data Model

The following sample shows how one user's Phase-1 data hangs together inside DynamoDB.

```json
[
  {
    "PK": "USER#user_001",
    "SK": "PROFILE#user_001",
    "entity_type": "USER",
    "user_id": "user_001",
    "email": "subhadeep@example.com",
    "full_name": "Subhadeep Majumder",
    "phone_e164": "+919876543210",
    "date_of_birth": "1987-08-14",
    "country_code": "IN",
    "base_currency": "INR"
  },
  {
    "PK": "USER#user_001",
    "SK": "SETTINGS#settings_001",
    "entity_type": "USER_SETTINGS",
    "settings_id": "settings_001",
    "user_id": "user_001",
    "country": "India",
    "currency": "INR",
    "retirement_age": 60,
    "retirement_month": 12,
    "life_expectancy_age": 85,
    "monthly_expense_baseline": 145000,
    "salary_growth_rate": 0.08,
    "expense_inflation_rate": 0.06,
    "expected_inflation_rate": 0.06,
    "income_tax_regime": "new",
    "current_base_salary_component": 175000,
    "current_hra_salary_component": 70000,
    "current_flexi_bucket_salary_component": 105000,
    "nps_basic_percentage": 10,
    "epf_basic_percentage": 12,
    "vpf_basic_percentage": 0,
    "bonus_percentage_of_gross_salary": 12,
    "bonus_payout_month": 3,
    "salary_pay_day": 25
  },
  {
    "PK": "USER#user_001",
    "SK": "INCOME#income_salary_001",
    "entity_type": "INCOME_STREAM",
    "income_stream_id": "income_salary_001",
    "user_id": "user_001",
    "settings_id": "settings_001",
    "stream_name": "Salary",
    "income_type": "salary",
    "calculation_mode": "detailed",
    "frequency": "monthly",
    "amount": 350000,
    "gross_amount": 350000,
    "net_amount": null,
    "annual_growth_rate": 0.08,
    "bonus_percentage_of_gross_salary": 12,
    "bonus_payout_month": 3,
    "growth_model": "fixed_rate",
    "start_date": "2026-05-01",
    "end_date": "2047-12-31",
    "taxable": true,
    "linked_retirement_date_mode": "stop_at_retirement",
    "is_active": true,
    "source": "settings_generated"
  },
  {
    "PK": "USER#user_001",
    "SK": "EXPENSE#expense_household_001",
    "entity_type": "EXPENSE_STREAM",
    "expense_stream_id": "expense_household_001",
    "user_id": "user_001",
    "settings_id": "settings_001",
    "stream_name": "Household Expenses",
    "expense_type": "living",
    "frequency": "monthly",
    "amount": 145000,
    "annual_growth_rate": 0.06,
    "growth_model": "fixed_rate",
    "start_date": "2026-05-01",
    "end_date": "2047-12-31",
    "essentiality": "essential",
    "linked_retirement_date_mode": "none",
    "is_active": true,
    "source": "settings_generated"
  },
  {
    "PK": "USER#user_001",
    "SK": "PORTFOLIO#portfolio_001",
    "entity_type": "PORTFOLIO",
    "portfolio_id": "portfolio_001",
    "user_id": "user_001",
    "portfolio_name": "My Growth Portfolio",
    "current_corpus": 5100000,
    "current_equity_allocation_percentage": 58,
    "current_debt_allocation_percentage": 34,
    "current_gold_allocation_percentage": 8
  },
  {
    "PK": "USER#user_001",
    "SK": "INVESTMENT#investment_mf_001",
    "entity_type": "INVESTMENT_ACCOUNT",
    "investment_account_id": "investment_mf_001",
    "user_id": "user_001",
    "portfolio_id": "portfolio_001",
    "instrument_name": "HDFC Nifty 50 Index Fund",
    "instrument_type": "mutual_fund",
    "instrument_status": "active",
    "fund_category": "large_cap_index",
    "contribution_frequency": "monthly",
    "asset_type": "equity",
    "start_date": "2026-05-01",
    "end_date": "2047-12-31",
    "expected_roi": 0.12,
    "current_corpus": 1240000,
    "current_corpus_source": "cas_upload",
    "investment_start_amount": 25000,
    "step_up_type": "manual",
    "manual_step_up_schedule": [
      {
        "schedule_id": "schedule_001",
        "schedule_name": "Annual SIP step-up",
        "schedule_date": "2027-04-01",
        "amount": 30000
      }
    ],
    "source": "cas_upload",
    "GSI4PK": "PORTFOLIO#portfolio_001",
    "GSI4SK": "INVESTMENT#investment_mf_001"
  },
  {
    "PK": "USER#user_001",
    "SK": "INVESTMENT#investment_epf_001",
    "entity_type": "INVESTMENT_ACCOUNT",
    "investment_account_id": "investment_epf_001",
    "user_id": "user_001",
    "portfolio_id": "portfolio_001",
    "instrument_name": "EPF",
    "instrument_type": "government_scheme",
    "government_scheme_type": "epf",
    "instrument_status": "active",
    "contribution_frequency": "monthly",
    "asset_type": "debt",
    "expected_roi": 0.085,
    "current_corpus": 3260000,
    "current_corpus_source": "manual",
    "investment_start_amount": 0,
    "step_up_type": "salary_linked",
    "source": "manual",
    "GSI4PK": "PORTFOLIO#portfolio_001",
    "GSI4SK": "INVESTMENT#investment_epf_001"
  },
  {
    "PK": "USER#user_001",
    "SK": "TRANSACTION#investment_mf_001#2026-05-01#txn_001",
    "entity_type": "TRANSACTION",
    "transaction_id": "txn_001",
    "user_id": "user_001",
    "investment_account_id": "investment_mf_001",
    "transaction_type": "buy",
    "transaction_date": "2026-05-01",
    "amount": 25000,
    "units": 165.45,
    "price_per_unit": 151.05,
    "source": "imported",
    "GSI1PK": "INVESTMENT#investment_mf_001",
    "GSI1SK": "TRANSACTION#2026-05-01#txn_001"
  },
  {
    "PK": "USER#user_001",
    "SK": "GOAL#goal_retirement_001",
    "entity_type": "GOAL",
    "goal_id": "goal_retirement_001",
    "user_id": "user_001",
    "goal_name": "Retirement",
    "goal_category": "retirement",
    "target_date": "2047-12-31",
    "target_corpus": 80000000,
    "expected_equity_allocation_percentage": 60,
    "expected_debt_allocation_percentage": 30,
    "expected_gold_allocation_percentage": 10,
    "status": "active"
  },
  {
    "PK": "USER#user_001",
    "SK": "GOALMAP#investment_mf_001#goal_retirement_001",
    "entity_type": "GOAL_ALLOCATION",
    "goal_allocation_id": "goalmap_001",
    "user_id": "user_001",
    "goal_id": "goal_retirement_001",
    "investment_account_id": "investment_mf_001",
    "allocation_percentage": 100,
    "allocated_current_value": 1240000,
    "is_active": true,
    "GSI2PK": "GOAL#goal_retirement_001",
    "GSI2SK": "INVESTMENT#investment_mf_001"
  },
  {
    "PK": "USER#user_001",
    "SK": "CASHFLOW#2026#05",
    "entity_type": "CASHFLOW_MONTH",
    "cashflow_month_id": "cashflow_2026_05",
    "user_id": "user_001",
    "year": 2026,
    "month": 5,
    "month_key": "2026-05",
    "income_amount": 350000,
    "bonus_amount": 0,
    "expense_amount": 145000,
    "investment_amount": 55000,
    "savings_amount": 150000,
    "source": "settings_generated"
  },
  {
    "PK": "USER#user_001",
    "SK": "SIMRUN#simrun_001",
    "entity_type": "SIMULATION_RUN",
    "simulation_run_id": "simrun_001",
    "user_id": "user_001",
    "run_name": "Base projection - May 2026",
    "run_type": "full_plan_projection",
    "scenario_type": "base",
    "projection_start_year": 2026,
    "projection_end_year": 2047,
    "status": "completed",
    "generated_at": "2026-05-07T17:00:00Z",
    "GSI3PK": "USER#user_001#SIMRUN",
    "GSI3SK": "GENERATED_AT#2026-05-07T17:00:00Z"
  },
  {
    "PK": "SIMRUN#simrun_001",
    "SK": "YEAR#2026",
    "entity_type": "SIMULATION_YEAR_SNAPSHOT",
    "simulation_year_snapshot_id": "simyear_2026",
    "simulation_run_id": "simrun_001",
    "user_id": "user_001",
    "year": 2026,
    "salary_hike_override_rate": null,
    "expense_yoy_override_rate": null,
    "applied_salary_hike_rate": 0.08,
    "applied_expense_yoy_rate": 0.06,
    "total_income": 4870000,
    "total_expenses": 1740000,
    "planned_investment_contribution": 660000,
    "annual_savings": 2470000,
    "opening_portfolio_value": 5100000,
    "closing_portfolio_value": 6420000
  }
]
```

Relationship summary:

- `USER` owns one `USER_SETTINGS` record.
- `USER_SETTINGS` generates one default `INCOME_STREAM` named `Salary`.
- `USER_SETTINGS` generates one default `EXPENSE_STREAM` named `Household Expenses`.
- `USER` owns one default Phase-1 `PORTFOLIO`.
- `PORTFOLIO` groups many `INVESTMENT_ACCOUNT` records.
- `INVESTMENT_ACCOUNT` can have many `TRANSACTION` rows.
- `USER` owns many `GOAL` records.
- `GOAL_ALLOCATION` links one `INVESTMENT_ACCOUNT` to one `GOAL` at `100%`.
- `INCOME_STREAM` and `EXPENSE_STREAM` drive generated `CASHFLOW_MONTH` rows.
- `SIMULATION_RUN` summarizes one simulation execution.
- `SIMULATION_YEAR_SNAPSHOT` rows live under `PK = SIMRUN#<simulation_run_id>`.

## Detailed UI Access Patterns

The table below lists the reads and writes needed to populate every finalized Phase-1 UI page.

| UI / Use Case | Data Needed | Query / Write Pattern | GSI Needed |
| --- | --- | --- | --- |
| Registration submit | User profile | `PutItem PK=USER#<user_id>, SK=PROFILE#<user_id>` | No |
| Registration OTP lookup by email | User by email | `GSI_EMAIL_PK=EMAIL#<normalized_email>, GSI_EMAIL_SK=USER#<user_id>` | Yes, if Cognito does not own lookup |
| First-time settings save | Settings + default streams | `PutItem SETTINGS#`; upsert `INCOME#income_salary...`; upsert `EXPENSE#expense_household...` | No |
| Settings save projection regeneration | Streams + monthly cashflow | Update `INCOME#` and `EXPENSE#`; batch write `PK=USER#<user_id>, SK=CASHFLOW#<year>#<month>` | No |
| Returning dashboard load | Profile, settings, streams, portfolio, goals, investments, mappings, latest simrun | Query `PK=USER#<user_id>` and group by `entity_type`; latest simrun can be prefix filtered or from GSI3 | GSI3 recommended |
| Dashboard portfolio card | Portfolio | Query user root and select `entity_type=PORTFOLIO`, or `GetItem PK=USER#<user_id>, SK=PORTFOLIO#<portfolio_id>` | No |
| Dashboard goal health | Goals + mappings + investments | Query `PK=USER#<user_id>` for `GOAL#`, `GOALMAP#`, `INVESTMENT#` | No |
| Dashboard asset allocation | Portfolio + investments | Query `PK=USER#<user_id>` for `PORTFOLIO#` and `INVESTMENT#` | No |
| Investment list page | All saved investment tiles | Query `PK=USER#<user_id>` with `begins_with(SK, INVESTMENT#)` | No |
| Add mutual fund after CAS | Investment + optional transactions | `PutItem INVESTMENT#...`; batch write `TRANSACTION#investment_id#date#txn_id` | GSI1 optional |
| Add manual investment | Investment | `PutItem PK=USER#<user_id>, SK=INVESTMENT#<investment_account_id>` | No |
| Remove investment tile | Investment and mapping cleanup | Soft delete investment with `instrument_status=stopped` or delete `INVESTMENT#`; delete/disable related `GOALMAP#investment_id#...` | No |
| Fetch one investment detail | Investment + transactions | `GetItem INVESTMENT#id`; query `begins_with(SK, TRANSACTION#id#)` | GSI1 optional |
| Transaction history for XIRR | All transactions for investment | Query user root with `begins_with(SK, TRANSACTION#investment_id#)` | GSI1 recommended at scale |
| Goal list page | Goal tiles | Query `PK=USER#<user_id>` with `begins_with(SK, GOAL#)` | No |
| Create goal | Goal | `PutItem PK=USER#<user_id>, SK=GOAL#<goal_id>` | No |
| Remove goal tile | Goal and mapping cleanup | Soft delete goal with `status=cancelled` or delete `GOAL#`; delete/disable related mappings | GSI2 helpful if deleting by goal |
| Mapping page load | Investments, goals, existing mappings | Query `PK=USER#<user_id>` for `INVESTMENT#`, `GOAL#`, `GOALMAP#` | No |
| Create mapping | 100% investment-to-goal mapping | `PutItem PK=USER#<user_id>, SK=GOALMAP#<investment_id>#<goal_id>` | GSI2 optional |
| Enforce one mapping per investment | Existing mapping for instrument | Query `PK=USER#<user_id>` with `begins_with(SK, GOALMAP#<investment_id>#)` before write | No |
| Remove mapping tile | Mapping | Delete or set `is_active=false` for `GOALMAP#<investment_id>#<goal_id>` | No |
| Income stream load | Phase-1 salary stream | Query `PK=USER#<user_id>` with `begins_with(SK, INCOME#)` | No |
| Expense stream load | Phase-1 household expense stream | Query `PK=USER#<user_id>` with `begins_with(SK, EXPENSE#)` | No |
| Simulation page initial load | Settings, streams, investments, goals, mappings, stored cashflow, latest run | Query `PK=USER#<user_id>` for user-owned records; use GSI3 for latest run; query year snapshots by run | GSI3 recommended |
| Simulation yearly rows | Year snapshots | Query `PK=SIMRUN#<simulation_run_id>`, `begins_with(SK, YEAR#)` | No |
| Simulation monthly drilldown | Month-wise rows | Query `PK=USER#<user_id>`, `SK BETWEEN CASHFLOW#<year>#01 AND CASHFLOW#<year>#12` | No |
| Simulate button | New simulation run and snapshots | Read `INCOME#`/`EXPENSE#`; put `SIMRUN#`; batch write `PK=SIMRUN#run_id, SK=YEAR#year`; update `CASHFLOW#year#month` | GSI3 recommended |
| Year override save | Simulation input override | Write override into new `SIMULATION_YEAR_SNAPSHOT` rows or create a new simulation run with overrides applied | No |
| Settings page load | Current settings | Query user root for `SETTINGS#` or `GetItem` if settings id is known | No |
| Save settings | Settings + streams + regenerated cashflow | Update `SETTINGS#`; upsert `INCOME#`/`EXPENSE#`; batch write `CASHFLOW#year#month` | No |

## Recommended Indexes

### Required for Production Login Lookup if Not Delegated to Cognito

`GSI_EMAIL`

- `GSI_EMAIL_PK = EMAIL#<normalized_email>`
- `GSI_EMAIL_SK = USER#<user_id>`

Use this only if the application table must look up users by email. If Cognito owns identity lookup and gives the app `user_id`, this GSI is not required for Phase-1.

### Recommended

`GSI3_LATEST_SIMULATION`

- `GSI3PK = USER#<user_id>#SIMRUN`
- `GSI3SK = GENERATED_AT#<generated_at>`

Use `ScanIndexForward=false` and `Limit=1` to load the latest completed simulation run for dashboard and simulation landing.

### Optional for Scale

`GSI1_INVESTMENT_TRANSACTIONS`

- `GSI1PK = INVESTMENT#<investment_account_id>`
- `GSI1SK = TRANSACTION#<transaction_date>#<transaction_id>`

The base table can serve transaction queries through `PK=USER#user_id` and `begins_with(SK, TRANSACTION#investment_id#)`. Add this GSI only when transaction volume makes user-root queries too large.

`GSI2_GOAL_MAPPINGS`

- `GSI2PK = GOAL#<goal_id>`
- `GSI2SK = INVESTMENT#<investment_account_id>`

Useful for goal-detail pages, deleting a goal with all mappings, and future analytics. Not mandatory for the current UI because mappings can be loaded from the user root.

`GSI4_PORTFOLIO_INVESTMENTS`

- `GSI4PK = PORTFOLIO#<portfolio_id>`
- `GSI4SK = INVESTMENT#<investment_account_id>`

Not required while Phase-1 has one portfolio per user. Useful later if a user can own multiple portfolios or shared portfolios.

## Notes

- `cas-upload-schema.json` is active in Phase-1.
- `income-stream-schema.json` and `expense-stream-schema.json` are active in Phase-1, with one generated salary stream and one generated household expense stream.
- Files prefixed with `NA_` are intentionally not active in Phase-1.
- `NA_simulation-assumption-schema.json` is retained for later scenario support. Phase-1 derives assumptions from `user-settings`, salary stream, and household expense stream.
- `NA_instrument-master-schema.json` and `NA_fund-underlying-snapshot-schema.json` are retained for future enrichment and reference data.
