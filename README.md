# Life Companion

Build a clean, modern personal habit-tracking web app called “Life Ledger”.

The app should have 3 main sections accessible through a simple sidebar or top navigation:

1. 🌿 Allergy Diary

Create a calendar-based allergy tracker where I can record the days I experienced allergies.

For each entry, allow:

Date

Allergy status: No symptoms / Mild / Moderate / Severe

Symptoms

Possible trigger

Notes

Show:

A monthly calendar with allergy days visually marked

Total allergy days this month

A simple breakdown of severity

Most frequently recorded triggers

A small trend showing whether allergy days are increasing or decreasing

Do NOT make medical diagnoses or give medical treatment advice. This is purely a personal diary and pattern tracker.

Allow me to edit and delete entries.

2. 💸 Spending Recorder

Create a weekly/monthly spending tracker.

At the top, have:

Monthly Allowance: ₹ [EDITABLE]

The allowance must be directly editable by the user and persist after refreshing the page.

Show:

Monthly allowance

Total spent this month

Remaining amount

Percentage of allowance used

Weekly spending total

Average weekly spending

Create a spending table with these columns:

| Date | Description | Category | Amount | Week | Actions |

The Description column is important — it should let me write exactly what I spent money on, e.g. “snacks from canteen”, “notebook”, “bus ticket”, etc.

Categories can include:

Food

Transport

College

Shopping

Entertainment

Personal

Other

Allow users to:

Add spending entries

Edit entries

Delete entries

Filter by week/month/category

Sort by date or amount

Automatically calculate all totals.

Use Indian Rupee formatting (₹).

3. 🤖 AI Spending Checker

Create an AI-powered spending analysis section.

The AI should analyze my recorded spending and give short, useful observations such as:

Where most of my money is going

Which categories are taking the biggest share

Whether my spending is consistent or unusually high in certain weeks

Recurring spending patterns

A few practical suggestions for tracking habits better

Keep the tone friendly and non-judgmental. This is meant to help me understand my spending habits, not shame me or tell me what I “should” buy.

Include:
“This week’s spending check”

and generate a concise summary based on the actual recorded data.

Also include a category breakdown/chart so I can visually see where my money goes.

4. 📊 Dashboard / Insights

Make the home screen a simple dashboard containing:

Current month's allowance

Amount spent

Amount remaining

Spending this week

Number of allergy days this month

Top spending category

A small spending trend chart

A small allergy trend/calendar preview

Add an “Insights” card that combines useful patterns from both trackers, but keep the two datasets logically separate.

Data & functionality

Use persistent local storage/database functionality so data isn't lost when I refresh the page.

The app should work properly with empty data and show friendly empty states such as:
“No spending recorded yet.”

Make all calculations automatic.

Use responsive design so it works on both laptop and phone.

Design

Make it feel like a polished personal dashboard rather than a generic finance app.

Style:

Clean

Minimal

Slightly playful

Soft modern UI

Rounded cards

Good typography

Clear charts

Plenty of whitespace

Avoid making it look overly corporate.

The most important thing is functionality and actually working CRUD operations, not just a pretty mockup.

Build the complete working app rather than only generating a UI concept.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://life-ledger-companion.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/416aceec-158f-403e-85fa-9279c64d8fda).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
