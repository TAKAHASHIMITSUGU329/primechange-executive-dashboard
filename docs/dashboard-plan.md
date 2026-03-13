# PRIMECHANGE Dashboard Plan

## 1. Dashboard Structure

### Page 1: Executive Overview

Purpose:
Provide a daily snapshot for leadership.

Sections:

- KPI cards
- Revenue trend
- Risk alerts
- Upsell opportunities
- Daily action list

### Page 2: Hotel Portfolio

Purpose:
Compare all hotels quickly.

Sections:

- Sortable hotel table
- Filter by status, region, score, and revenue band
- Risk / opportunity badges

### Page 3: Hotel Detail

Purpose:
Understand one hotel's health and next action.

Sections:

- Revenue and margin summary
- Review trend
- Complaint and praise categories
- Suggested actions
- Proposal history

## 2. MVP Information Architecture

- `Overview`
- `Hotels`
- `Alerts`

## 3. Data Model

### Hotel master

- hotel_id
- hotel_name
- region
- rooms
- contract_start_date
- account_owner

### Performance fact

- date
- hotel_id
- contract_revenue
- special_cleaning_revenue
- labor_hours
- rooms_cleaned
- complaints_count

### Review fact

- review_date
- hotel_id
- source
- rating
- positive_comment
- negative_comment
- full_comment
- positive_category
- negative_category
- cleaning_related_flag

## 4. Suggested Derived Metrics

- review_avg_30d
- review_avg_prev_30d
- cleaning_negative_rate_30d
- cleaning_positive_rate_30d
- revenue_per_labor_hour
- upsell_score
- churn_risk_score
- action_priority_score

## 5. Scoring Logic for MVP

### Churn risk score

Combine:

- falling review score
- increasing cleaning-negative reviews
- rising complaint counts
- large revenue account weight

### Upsell score

Combine:

- stable relationship
- high room volume
- recurring pain points that can be solved with extra services
- low current special cleaning revenue

## 6. Daily Refresh Flow

1. Import hotel master
2. Import monthly review reports
3. Normalize review text and categories
4. Aggregate KPI tables
5. Refresh dashboard data

## 7. Recommended Technical Rollout

### Phase A

- Static prototype
- Sample data
- KPI and layout validation

### Phase B

- Spreadsheet-driven data layer
- Automated ETL script
- Daily refresh

### Phase C

- Production web app
- Database
- Authentication
- History and drill-down

## 8. Proposed Tech Stack

### MVP

- HTML / CSS / JavaScript
- Spreadsheet or JSON export as source

### Production

- Next.js
- TypeScript
- Supabase or PostgreSQL
- Scheduled data ingestion

## 9. Immediate Next Tasks

1. Confirm KPI definitions with management
2. Collect revenue and labor source files
3. Build category rules for review text
4. Replace sample data with real monthly aggregates
5. Deploy internal dashboard
