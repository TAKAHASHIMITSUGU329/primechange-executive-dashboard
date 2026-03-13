# PRIMECHANGE Executive Dashboard Requirements

## 1. Objective

Build a daily dashboard that helps the PRIMECHANGE president make fast decisions about revenue growth, client retention, and service quality.

The dashboard should answer:

- Are revenue and profit moving in the right direction?
- Which hotels are at risk due to cleaning-related quality issues?
- Which hotels are the best candidates for upsell proposals?
- Where should operations or sales act first today?

## 2. Primary Users

- President / executive decision maker
- Sales manager
- Operations manager

## 3. Business Outcomes

- Increase monthly revenue through upsell proposals
- Reduce churn risk by detecting quality deterioration early
- Improve contract profitability by linking service quality and labor efficiency
- Standardize action priorities across hotels

## 4. MVP Scope

The first version should include:

- Executive KPI summary
- Hotel risk ranking
- Upsell opportunity ranking
- Review-based cleaning quality insights
- Daily action list

The MVP does not need:

- Full CRM integration
- Predictive AI scoring
- Role-based access control
- Multi-company support

## 5. Core KPIs

### Executive KPIs

- Monthly revenue
- Revenue vs previous month
- Number of active hotel accounts
- Number of at-risk hotels
- Number of upsell candidate hotels
- Special cleaning revenue
- Average review score
- Cleaning-related negative review rate

### Hotel-Level KPIs

- Contract revenue
- Special cleaning revenue
- Profit margin
- Rooms cleaned
- Labor hours
- Revenue per labor hour
- Average review score
- Cleaning-positive review count
- Cleaning-negative review count
- Main complaint category
- Main praise category

## 6. Required Data Sources

### Available now

- Hotel master list
- Monthly review reports per hotel

### Needed next

- Hotel contract revenue
- Extra service sales
- Room count
- Occupancy
- Rooms cleaned
- Labor hours / staffing
- Complaint records
- Proposal history

## 7. Daily Decision Workflows

### For the president

- Check revenue and risk summary in under 2 minutes
- Identify top 5 hotels requiring action
- Identify top 5 hotels for sales expansion

### For sales

- Review upsell targets
- See proposal themes by hotel

### For operations

- See quality issues by hotel
- Track the issue category trend over time

## 8. Alert Logic for MVP

- Red alert: review score drop and cleaning-negative review rate increase
- Yellow alert: stable score but recurring cleaning complaints
- Green: strong review quality and upsell potential

## 9. Success Criteria

- Executive can review daily status in under 3 minutes
- Hotel priority list is trusted enough to guide meetings
- Sales can identify concrete proposal targets every week
- Operations can identify hotels where cleaning quality action is urgent

## 10. Recommended Build Phases

1. Build review-driven dashboard MVP
2. Add revenue and labor data integration
3. Add profitability and upsell scoring
4. Add automation and daily refresh
