# FinGoal New Schema Set

This folder contains the new persistence-oriented schema pack for FinGoal.

The goal of this schema set is to model the product as a full financial planning and simulation platform, not just an investment tracker.

These schemas are meant to answer four big questions together:

1. Who is the user and what are their planning assumptions?
2. What income and expenses shape the user's cashflow over time?
3. What investments does the user hold and how are they mapped to goals?
4. What does the user's financial future look like year by year?

## Why This Schema Set Exists

The older schema set did a good job of capturing business intent, but it mixed too many concerns:

- persistence data
- API contracts
- UI rendering hints
- calculated output fields

This new folder focuses only on domain and persistence shape.

That gives us a cleaner foundation for:

- DynamoDB storage
- .NET API contracts later
- simulation engine design
- frontend form design without coupling UI metadata into the database

## The Big Picture

FinGoal should work like this:

1. A user signs in and creates their profile.
2. The user configures planning assumptions such as retirement age, expense inflation, and salary growth.
3. The user adds income streams and expense streams.
4. The user adds investment accounts and optional transactions.
5. The user creates goals.
6. The user maps investments to goals.
7. The simulation engine projects income, expenses, surplus, investments, and goal readiness year by year.

So the schemas are grouped into five logical layers:

- identity and defaults
- cashflow planning
- investment planning
- goal mapping
- simulation output

## Schema Overview

### 1. `user-schema.json`

Purpose:

- stores core identity and profile information for a user
- represents the person, not their planning assumptions

What it should contain:

- name
- email
- phone
- PAN
- date of birth
- country and base currency

Why it exists:

- the user record should stay clean and stable
- planning assumptions may change often, but identity should not

Primary link:

- `user_id` is the parent key used by almost every other schema

### 2. `user-settings-schema.json`

Purpose:

- stores planning assumptions and simulation defaults for the user

What it should contain:

- retirement age
- salary growth assumption
- expense inflation
- general inflation
- expected return assumptions
- risk profile
- tax regime
- default scenario

Why it exists:

- assumptions change more often than identity
- simulation should not depend on profile fields being overloaded

Primary link:

- belongs to one `user`

### 3. `income-stream-schema.json`

Purpose:

- stores each income source the user expects over time

Examples:

- salary
- bonus
- freelance income
- rent
- pension

What it should contain:

- stream name
- income type
- frequency
- amount
- optional gross and net values
- growth rate
- start and end dates
- whether it should stop at retirement

Why it exists:

- real users do not have just one income number forever
- salary can stop at retirement while pension may start later

Primary link:

- belongs to one `user`

Important modeling note:

- `calculation_mode` allows simple mode and detailed mode
- this helps onboarding stay easy while allowing more detailed users later

### 4. `expense-stream-schema.json`

Purpose:

- stores each planned expense stream over time

Examples:

- household living cost
- EMI
- rent
- insurance premium
- school fees
- vacation budget

What it should contain:

- expense type
- frequency
- amount
- growth rate
- start and end dates
- essential vs discretionary
- whether the expense stops or starts at retirement

Why it exists:

- users do not have one flat expense number forever
- many expenses naturally end or begin at a specific stage of life

Primary link:

- belongs to one `user`

### 5. `goal-schema.json`

Purpose:

- stores each financial goal the user wants to achieve

Examples:

- retirement
- emergency fund
- child education
- home purchase
- wealth creation

What it should contain:

- goal name
- category
- priority
- target year
- current estimated cost
- goal inflation
- future target amount
- current funded amount
- target asset allocation

Why it exists:

- goals are the business outcome the user cares about
- the simulation should show whether goals are reachable

Primary link:

- belongs to one `user`

Important modeling note:

- goals do not directly own investments
- mapping is handled by `goal-allocation-schema.json`

### 6. `investment-account-schema.json`

Purpose:

- stores each investment holding or account the user wants to track

Examples:

- mutual fund folio
- stock holding
- EPF balance
- NPS account
- PPF
- savings account
- fixed deposit

What it should contain:

- account name
- instrument type
- asset type and subtype
- current value
- expected return
- contribution setup
- provider or folio reference
- optional link to salary stream for EPF or NPS

Why it exists:

- an investment account is the unit we project, value, and map to goals

Primary link:

- belongs to one `user`

Important modeling note:

- this schema represents the holding/account summary
- detailed cashflows live in `transaction-schema.json`

### 7. `transaction-schema.json`

Purpose:

- stores dated money movements against an investment account

Examples:

- mutual fund SIP buy
- stock purchase
- EPF contribution
- NPS contribution
- withdrawal
- interest credit

What it should contain:

- transaction type
- date
- amount
- units and price where relevant
- fees
- tax
- source such as manual or imported

Why it exists:

- transaction history is required for XIRR and better valuation logic

Primary links:

- belongs to one `user`
- belongs to one `investment_account`

### 8. `goal-allocation-schema.json`

Purpose:

- maps all or part of an investment account to a goal

What it should contain:

- goal id
- investment account id
- allocation method
- percentage or amount
- effective dates

Why it exists:

- one investment may support more than one goal
- one goal may be funded by many investments

Primary links:

- belongs to one `user`
- links one `goal`
- links one `investment_account`

This schema is critical because it turns the system into true goal-based planning instead of one-to-one tagging.

### 9. `simulation-assumption-schema.json`

Purpose:

- stores named assumption sets used to run simulations

Examples:

- conservative
- base
- optimistic
- custom what-if case

What it should contain:

- salary growth
- inflation
- equity return
- debt return
- gold return
- cash return

Why it exists:

- a simulation run should record exactly what assumptions were used
- this avoids ambiguity when comparing scenarios later

Primary link:

- belongs to one `user`

### 10. `simulation-run-schema.json`

Purpose:

- stores one simulation execution and its high-level summary

Examples:

- retirement projection run
- full financial plan projection
- what-if scenario run

What it should contain:

- run type
- scenario type
- projection start and end year
- retirement year
- opening net worth
- projected retirement corpus
- required corpus
- funding ratio
- readiness flag

Why it exists:

- dashboards usually need a summary record before loading detailed yearly output

Primary links:

- belongs to one `user`
- uses one `simulation_assumption`

### 11. `simulation-year-snapshot-schema.json`

Purpose:

- stores the year-by-year output of a simulation run

What it should contain:

- year
- age
- retirement status
- total income
- total expenses
- annual surplus
- planned investments
- opening and closing net worth
- growth
- goal funding ratio
- retirement gap

Why it exists:

- this is the main data source for the simulation graphs and tables

Primary links:

- belongs to one `simulation_run`
- belongs to one `user`

### 12. `instrument-master-schema.json`

Purpose:

- stores optional reference data for known schemes, instruments, or securities

Examples:

- mutual fund master list
- ETF master list
- internal classification records

What it should contain:

- instrument code
- name
- asset type
- subtype
- provider
- benchmark

Why it exists:

- user investment records should be able to point to normalized reference data later
- this helps classification, enrichment, and reporting

This is reference data, not user-owned planning data.

### 13. `fund-underlying-snapshot-schema.json`

Purpose:

- stores portfolio composition snapshots for mutual funds or ETFs

Examples:

- large cap percentage
- mid cap percentage
- small cap percentage
- debt percentage
- cash percentage
- top holdings

Why it exists:

- this powers goal-level analysis such as:
  - large cap exposure
  - mid cap exposure
  - small cap exposure
  - debt exposure
  - equity look-through across direct and indirect holdings

Primary link:

- belongs to one `instrument_master`

This is also reference data, not user-owned planning data.

## How These Schemas Link Together

The most important links are:

- `user` -> `user_settings`
- `user` -> `income_stream`
- `user` -> `expense_stream`
- `user` -> `goal`
- `user` -> `investment_account`
- `investment_account` -> `transaction`
- `goal` <-> `investment_account` through `goal_allocation`
- `user` -> `simulation_assumption`
- `simulation_assumption` -> `simulation_run`
- `simulation_run` -> `simulation_year_snapshot`

Reference data links:

- `investment_account` can later point to `instrument_master`
- `instrument_master` -> `fund_underlying_snapshot`

## Conceptual Relationship Diagram

```text
User
 |- UserSettings
 |- IncomeStreams
 |- ExpenseStreams
 |- Goals
 |- InvestmentAccounts
 |   |- Transactions
 |- SimulationAssumptions
 |   |- SimulationRuns
 |       |- SimulationYearSnapshots
 |
Goals <-> GoalAllocations <-> InvestmentAccounts

InstrumentMaster -> FundUnderlyingSnapshots
```

## How This Will Be Stored in DynamoDB

The simplest cost-effective approach for phase 1 is a single-table design.

Suggested table name:

- `fingoal-main`

Suggested primary key pattern:

- `PK`
- `SK`

Use the user as the partition root for user-owned records.

### User-Owned Records

For everything directly owned by a user:

- `PK = USER#<user_id>`

Then use sort keys like:

- `SK = PROFILE#<user_id>`
- `SK = SETTINGS#<settings_id>`
- `SK = INCOME#<income_stream_id>`
- `SK = EXPENSE#<expense_stream_id>`
- `SK = GOAL#<goal_id>`
- `SK = INVESTMENT#<investment_account_id>`
- `SK = ASSUMPTION#<simulation_assumption_id>`
- `SK = SIMRUN#<simulation_run_id>`

This gives fast reads for:

- load full dashboard context for one user
- load all goals for one user
- load all income streams for one user
- load all investment accounts for one user

### Child Records of an Investment

Transactions should usually be queryable by investment account, so a good option is:

- `PK = USER#<user_id>`
- `SK = TRANSACTION#<investment_account_id>#<transaction_date>#<transaction_id>`

This keeps all user records together.

If transaction volume grows later, we can also add a GSI:

- `GSI1PK = INVESTMENT#<investment_account_id>`
- `GSI1SK = TRANSACTION#<transaction_date>#<transaction_id>`

### Goal Allocation Records

Goal allocations can live under the user root:

- `PK = USER#<user_id>`
- `SK = GOALMAP#<goal_id>#<investment_account_id>#<goal_allocation_id>`

This supports:

- all mappings for a user
- all mappings for a goal through prefix filtering

If we want direct goal-centric reads, add a GSI:

- `GSI2PK = GOAL#<goal_id>`
- `GSI2SK = INVESTMENT#<investment_account_id>`

### Simulation Year Output

Simulation runs can be stored under the user root:

- `PK = USER#<user_id>`
- `SK = SIMRUN#<simulation_run_id>`

Year snapshots can be stored as:

- `PK = SIMRUN#<simulation_run_id>`
- `SK = YEAR#<year>`

This is a useful exception to the user-root pattern because year snapshots are naturally grouped by run.

Benefits:

- easy to fetch the full yearly timeline for one run
- avoids mixing large simulation output with small profile data queries

### Reference Data Records

Reference data such as instrument master and fund composition should usually be stored separately from user-owned planning data.

Recommended patterns:

- `PK = INSTRUMENT#<instrument_master_id>`
- `SK = META`

and for composition snapshots:

- `PK = INSTRUMENT#<instrument_master_id>`
- `SK = SNAPSHOT#<as_of_date>`

This allows:

- multiple snapshots per instrument
- fast retrieval of the latest classification data

## Suggested DynamoDB Access Patterns

Here are the main things the application will need to query:

### Dashboard Load

Need:

- user profile
- settings
- active income streams
- active expense streams
- goals
- investments
- latest simulation run summary

Query approach:

- query `PK = USER#<user_id>`
- filter or prefix-match on `SK`

### Goal Details Screen

Need:

- one goal
- its allocations
- linked investments

Query approach:

- get goal from user root
- query goal allocation GSI or user-root prefix
- batch get linked investments

### Investment Details Screen

Need:

- one investment account
- its transactions
- optional reference data

Query approach:

- get investment from user root
- query transaction GSI or user-root prefix
- optionally get instrument master

### Simulation Screen

Need:

- simulation run summary
- yearly snapshots

Query approach:

- get `SIMRUN`
- query `PK = SIMRUN#<simulation_run_id>`

## Why We Separate User Data and Reference Data

There are two fundamentally different data categories in this system:

### User-Owned Data

This changes per user:

- profile
- settings
- goals
- investments
- transactions
- simulations

### Shared Reference Data

This is reused across many users:

- instrument definitions
- classification data
- fund look-through snapshots

Keeping these separate helps:

- reduce duplication
- simplify updates
- keep user partitions smaller

## How the Simulation Engine Will Use These Schemas

At a high level:

1. Load `user` and `user_settings`
2. Load active `income_stream` records
3. Load active `expense_stream` records
4. Load `investment_account` records
5. Load `goal` and `goal_allocation` records
6. Build one assumption set from `simulation_assumption`
7. Generate a `simulation_run`
8. Persist one `simulation_year_snapshot` per projected year

So the simulation output is not handwritten user data. It is generated system data based on user-owned inputs plus assumptions.

## Which Schemas Are Inputs vs Outputs

### User Input Schemas

- `user-schema.json`
- `user-settings-schema.json`
- `income-stream-schema.json`
- `expense-stream-schema.json`
- `goal-schema.json`
- `investment-account-schema.json`
- `transaction-schema.json`
- `goal-allocation-schema.json`
- `simulation-assumption-schema.json`

### System-Generated or Derived Schemas

- `simulation-run-schema.json`
- `simulation-year-snapshot-schema.json`

### Shared Reference Schemas

- `instrument-master-schema.json`
- `fund-underlying-snapshot-schema.json`

## Important Notes for Future API Design

These JSON schemas should not be treated as final frontend forms or final API payloads.

Later we will probably create:

- create request contracts
- update request contracts
- read models for dashboard screens
- simulation API models

That is normal.

This folder is the clean domain starting point underneath those layers.

## Summary

In short:

- `user` tells us who the person is
- `user_settings` tells us how to simulate their future
- `income_stream` and `expense_stream` describe cashflow
- `investment_account` and `transaction` describe wealth and contributions
- `goal` and `goal_allocation` describe financial intent
- `simulation_assumption`, `simulation_run`, and `simulation_year_snapshot` describe projected outcomes
- `instrument_master` and `fund_underlying_snapshot` support classification and look-through portfolio analysis

Together, these schemas give FinGoal the structure needed to become a proper financial planning engine.
