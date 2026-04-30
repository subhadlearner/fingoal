# FinGoal Phase-1 MVP Schemas - 30 Apr 2026

This folder contains the recalibrated Phase-1 MVP persistence schemas.

The intent is to keep the first product focused on:

- user profile and settings
- salary-only income projection, including bonus in the payout month
- simple monthly expense projection
- investment tracking and deterministic future projection
- transaction capture for instruments such as mutual funds
- unlimited financial goals
- percentage-based goal to investment allocation
- portfolio and goal progress summaries

Existing schema folders are intentionally left untouched.

## Schema Files

- `user-schema.json`
- `user-settings-schema.json`
- `income-schema.json`
- `income-month-schema.json`
- `expense-schema.json`
- `expense-month-schema.json`
- `investment-schema.json`
- `transaction-schema.json`
- `goal-schema.json`
- `goal-investment-allocation-schema.json`
- `portfolio-summary-schema.json`

## Phase-1 Rules

- Income supports salary only. Bonus is modeled as a percentage of annual gross salary and added to the configured bonus month.
- Income and expense monthly records may be edited by the user, but future simulation regeneration can overwrite future records when YoY assumptions change. Past records are not changed by future-only regeneration.
- Expense is not a tracker in Phase-1. It is a monthly projection baseline plus YoY growth.
- Investments support monthly and annual contributions.
- Current corpus can be manual or derived from transactions/imports depending on instrument type.
- Goals are unlimited and can be linked to investments through percentage allocation.
