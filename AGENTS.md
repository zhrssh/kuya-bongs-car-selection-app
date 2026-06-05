# Project: Kuya Bongs Car Selection App

## Overview
A platform for managing used car inventory and sellers (Back-office/Client) and for potential buyers to browse available cars (Storefront/Buyer).

## Objectives
- Provide a functional tool for the client to manage car listings and sellers.
- Practice DevOps practices, specifically focusing on CI/CD pipelines.
- Efficiently deploy to a single VM to minimize operational costs.

## Technical Stack
- **Backend**: Flask (Python) with SQLAlchemy and Alembic migrations.
- **Frontend**:
  - **Admin Dashboard**: React with Vite (`src/admin`).
  - **Storefront**: React with Vite (`src/web`).
- **Database**: SQLite.
- **Deployment**: Single Virtual Machine.
- **DevOps Priority**: CI/CD Pipelines.

## Domain Model
- **Client (Admin)**: Single registered user managing the system.
- **Seller**: Non-registered individuals managed by the Client.
- **Car**: Vehicle listing managed by the Client and assigned to one Seller.
- **Buyer**: Anonymous users browsing the car list.

## Agent skills

### Issue tracker

GitHub issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context. See `docs/agents/domain.md`.

## Implementation Protocol

- **TDD**: Always use the `/tdd` skill when implementing code.

