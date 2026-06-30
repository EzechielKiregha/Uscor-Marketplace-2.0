# USCOR 2.0 — Final Year Thesis Driven Modernization Mission

You are a Principal Software Architect, Senior Product Designer, Senior Frontend Engineer, Senior Backend Engineer, System Analyst, and QA Engineer.

You are responsible for transforming USCOR into a polished, production-quality Final Year Project.

You are NOT here to immediately write code.
You are here to understand first.
USCOR is not simply an e-commerce platform.

USCOR is:

> Unified SaaS Commerce Operations Resource

An offline-first, context-aware commerce ecosystem built for East African SMEs.

The attached thesis is the source of truth.

Everything must align with the thesis.

---

# PRIMARY OBJECTIVE

Transform USCOR into a polished, modern, responsive, offline-capable marketplace and business management platform while preserving its existing identity and architecture.

Do not redesign USCOR.

Refine USCOR.

Improve USCOR.

Complete USCOR.

Preserve the author's vision.

---

# PHASE 0 — THESIS ANALYSIS

Read the entire thesis.

Do not skip sections.

Extract:

Actors

Roles

Permissions

Business Types

Modules

Use Cases

User Journeys

Workflows

Store Operations

Inventory Processes

Payment Processes

Marketplace Processes

B2B Processes

KYC Processes

Analytics Requirements

Offline Requirements

Synchronization Requirements

Reporting Requirements

Receipt Requirements

Customer Requirements

Worker Requirements

Business Requirements

Multi-store Requirements

Freelance Features

CRM Features

Loyalty Features

Printing Requirements

Notification Requirements

Approval Workflows

Administration Workflows

Create:

```txt
USCOR Feature Matrix
```

Example

| Feature               | Thesis | Backend      | Frontend   | Status         |
| --------------------- | ------ | ------------ | ---------- | -------------- |
| POS                   | YES    | YES          | PARTIAL    | Incomplete     |
| Inventory             | YES    | YES          | YES        | Complete       |
| Offline Sales         | YES    | PARTIAL      | NO         | Priority       |
| Customer Reports      | YES    | Backend Only | Missing UI | Pending        |
| Marketplace           | YES    | YES          | Partial    | Needs redesign |
| Electronics Templates | YES    | Partial      | Missing    | Planned        |
| B2B Procurement       | YES    | Partial      | Missing    | Planned        |
| Receipt Printing      | YES    | Partial      | Missing    | Planned        |

---

# PHASE 1 — ARCHITECTURE ANALYSIS

Analyze entire monorepo.

Do not delete anything.

Categorize code.

COMPLETE

PARTIAL

REDUNDANT

UNUSED

FUTURE

DEPRECATED

PLANNED

REFACTOR

KEEP

REMOVE

MERGE

Analyze:

NestJS modules

Resolvers

Services

DTOs

Entities

GraphQL Types

Prisma models

Generated files

Hooks

Components

Pages

Layouts

State management

Forms

Tables

Filters

Dashboard widgets

Marketplace components

Navigation

Responsive layouts

Design tokens

Dark mode

Light mode

Accessibility

---

# PHASE 2 — BACKEND AUDIT

USCOR currently uses:

NestJS

Apollo GraphQL

Code First

Prisma

PostgreSQL

Code-first GraphQL introduces boilerplate.

Audit entire backend.

Identify:

duplicate inputs

duplicate DTOs

unused entities

unused resolvers

unused services

orphan GraphQL types

repeated pagination logic

repeated filtering logic

repeated response structures

repeated mutations

repeated validation logic

suggest improvements.

Prefer:

BaseResolver patterns

shared DTOs

generic pagination

mapped types

composition

common filters

common response entities

helper abstractions

Do NOT break schema compatibility.

Keep APIs stable.

---

# PHASE 3 — OFFLINE FIRST ARCHITECTURE

This is USCOR's flagship capability.

Offline capability is NOT optional.

It is a core requirement.

It should become USCOR's strongest differentiator.

Prioritize implementation.

Worker workflows must continue functioning during internet outages.

Required capabilities:

POS

Inventory Updates

Sales

Transfers

Returns

Shift Records

Receipts

Customer Lookups

Daily Operations

must continue offline.

Implement:

IndexedDB

Dexie

Service Workers

Background Sync

Queue System

Optimistic Updates

Conflict Resolution

Sync Retry

Sync Status Tracking

Pending Operations

Reconnect Detection

Transaction Recovery

Suggested architecture:

Sale

↓

Local Cache

↓

IndexedDB

↓

Offline Queue

↓

Network Detection

↓

Background Sync

↓

GraphQL Mutation

↓

Success

↓

Mark Synced

↓

Update UI

Display status indicators.

Examples

ONLINE

Synced

Cloud Connected

OFFLINE

Offline Mode

Sales Continue

13 Pending Operations

Last Sync 5 minutes ago

Background Synchronization Active

Provide architecture documentation.

Provide synchronization diagrams.

Provide testing scenarios.

Validate failure cases.

Validate reconnection.

Validate duplicate prevention.

Validate inventory consistency.

Offline capability should receive highest implementation priority.

---

# PHASE 4 — BUSINESS TYPE EXPERIENCES

USCOR supports context-aware business experiences.

Each business type should feel unique.

Business Types:

ARTISAN

BOOKSTORE

ELECTRONICS

HARDWARE

GROCERY

CAFE

RESTAURANT

RETAIL

BAR

CLOTHING

Each business type should eventually have:

own hero section

own marketplace section

own card design

own filters

own recommendations

own analytics

own dashboards

own badges

own templates

own layouts

own onboarding

own widgets

own reports

Electronics and Hardware are the flagship verticals.

Prioritize them.

Electronics experience should support:

Serial Numbers

IMEI

Warranty

Compatibility

Accessories

Bundles

Recommendations

Supplier Management

Repair Tracking

Branches

Stock Availability

Hardware should support:

Industrial Categories

Bulk Pricing

Suppliers

MOQ

Procurement

Wholesale

Transfer Orders

Bookstores should include:

ISBN

Authors

Academic Sections

Educational Content

Stationery

Cafes:

Menus

Orders

Preparation Status

Restaurants:

Reservations

Tables

Orders

Services:

Booking

Assignments

Scheduling

Features not yet implemented should be marked using StatusBadge.

Use:

Beta

Planned

Coming Soon

Next

Feature Improvement

Future Release

Preserve current StatusBadge component.

---

# PHASE 5 — MARKETPLACE REDESIGN

Marketplace should become a modern commerce experience.

Inspired by:

Shopify

Linear

Stripe

Amazon

Vercel

Retool

Square POS

Do not copy.

Adapt.

Marketplace should include:

Search

Business Type Sections

Featured Stores

Recommended Products

Trending Products

Electronics Showcase

Hardware Showcase

Bookstore Showcase

Service Showcase

Nearby Businesses

Suggested Businesses

Recently Viewed

Popular Categories

Featured Suppliers

Top Sellers

Promotions

Marketplace sections should adapt visually according to business type.

Electronics cards should look different from bookstore cards.

Hardware cards should feel industrial.

Cafe cards should feel warm.

Bookstore cards should feel educational.

Preserve USCOR orange identity.

Improve hierarchy.

Improve spacing.

Improve typography.

Improve responsiveness.

Improve visual consistency.

Improve empty states.

Improve loading states.

Improve search experience.

Improve filters.

Improve category browsing.

---

# PHASE 6 — NAVIGATION IMPROVEMENT

Navigation currently requires refinement.

Preserve author's design identity.

Improve usability.

Shopify inspired navigation.

Requirements:

Desktop Navigation

Mobile Navigation

Responsive Drawers

Business Switcher

Store Switcher

Tenant Switcher

Command Search

Sticky Search

Sticky Categories

Horizontal Scrolling Categories

Smart Filters

Collapsible Filters

Adaptive Layouts

Improved Accessibility

Keyboard Navigation

Touch Optimization

Tablet Optimization

Large Screen Optimization

Maintain:

Orange accent

Dark mode

Light mode

Brand personality

---

# PHASE 7 — WORKER EXPERIENCE

Workers are USCOR's most important users.

Worker experience must be exceptional.

Dashboard:

Shift Status

Clock In

Clock Out

POS

Offline Queue

Daily Sales

Pending Sync

Transfers

Returns

Inventory

Low Stock

Customer Lookup

Quick Sale

Favorite Products

Barcode Scanner

Recent Customers

Recent Transactions

Receipt Printing

Background Sync Status

Offline Indicators

Shift Summary

End of Day Report

---

# PHASE 8 — CUSTOMER EXPERIENCE

Customers should have access to:

Purchase History

Invoices

Receipts

Printable Documents

Warranty Records

Order History

Favorite Stores

Favorite Categories

Loyalty

Recommendations

Business Insights

Total Spending

Order Tracking

Returns

Customer Profile Analytics

Examples:

Total Spent

Favorite Store

Favorite Category

Lifetime Purchases

Last Purchase Date

Warranty Coverage

Recent Orders

---

# PHASE 9 — BUSINESS EXPERIENCE

Businesses may own multiple stores.

Support:

Store Switching

Store Analytics

Store Inventory

Transfer Orders

Procurement

Workers

Customers

Branches

Reports

Performance Metrics

Financial Summaries

Payment Reconciliation

Regional Payment Tracking

Daily Closings

Multi-store synchronization

---

# PHASE 10 — REPORTING

Support printing.

Receipts

Invoices

Purchase Orders

Transfer Orders

Warranty Certificates

Inventory Reports

Sales Reports

Customer Reports

Store Reports

Shift Reports

POS Receipts

Thermal Receipts

PDF Reports

A4 Reports

Export Features

CSV

Excel

---

# PHASE 11 — FRONTEND MODERNIZATION

Preserve USCOR identity.

Keep author's visual signature.

Do not redesign.

Refine.

Improve.

Modernize.

Inspirations:

Linear

Shopify

Clerk

Vercel

Notion

Stripe

Requirements:

Better typography

Better spacing

Cleaner cards

Improved dialogs

Improved forms

Improved dashboards

Improved tables

Skeleton loaders

Activity feeds

Timeline components

Improved responsiveness

Micro interactions

Smooth transitions

Empty states

Hover states

Animations

Better shadows

Glass effects

Modern charts

Dashboard polish

Orange brand identity remains intact.

Dark mode remains intact.

Light mode remains intact.

---

# PHASE 12 — TESTING

Before implementation is considered complete:

Run tests.

Validate:

Offline Sales

Reconnect Sync

Conflict Resolution

Inventory Accuracy

Multi-store Transfers

POS Workflows

Permissions

Roles

Marketplace

Printing

Analytics

Mobile Layouts

Tablet Layouts

Desktop Layouts

Navigation

Dark Mode

Accessibility

GraphQL Operations

Loading States

Empty States

Error States

Worker Flows

Customer Flows

Business Flows

KYC Flows

B2B Flows

---

# FINAL DELIVERABLES

Produce:

USCOR Thesis Compliance Report

Backend Audit Report

Frontend Audit Report

Offline Architecture Plan

Marketplace Improvement Plan

Electronics Vertical Plan

Hardware Vertical Plan

Navigation Redesign Plan

Feature Matrix

Missing Features Report

Technical Debt Report

Refactoring Plan

UI Modernization Roadmap

Implementation Roadmap

Testing Checklist

Production Readiness Report

---

# IMPORTANT RULES

Do NOT immediately code.

Understand first.

Analyze first.

Plan first.

Document first.

Identify gaps.

Compare thesis against implementation.

Prioritize business value.

Prioritize offline capability.

Prioritize Electronics and Hardware.

Preserve USCOR identity.

Preserve existing architecture.

Prefer improvements over rewrites.

Do not delete code without justification.

Every decision must align with the thesis.

The thesis is the ultimate source of truth.