# USCOR 2.1 — Identity, Wallet, Platform & Commerce Completion Mission

Context:

USCOR analysis, thesis extraction, architecture audit, marketplace roadmap, UI modernization plan and feature matrix have already been completed.

You are now entering implementation mode.

Do not redesign USCOR.

Preserve USCOR identity.

Preserve the orange design system.

Preserve dark mode.

Preserve the current architecture.

Prefer enhancements over rewrites.

The thesis remains the source of truth.

---

# PHASE 13 — AUTHENTICATION V2 COMPLETION

Current Auth Structure

```txt
(auth)

create-business-setup
create-business-setup-v2

login
login-v2

signup
signup-v2

register-superadmin

verify-email

unauthorized
```

Goal:

Promote V2 pages into production pages.

Archive V1.

Do not delete V1.

Rename:

login-v2

→ login

signup-v2

→ signup

create-business-setup-v2

→ create-business-setup

Preserve old implementations as legacy.

Move them into:

```txt
legacy/
```

or

```txt
deprecated/
```

---

Authentication Experience Goals

Modern

Clean

Responsive

Worker Friendly

Mobile Friendly

Fast

Offline aware

Accessible

---

Implement:

Forgot Password

Reset Password

OTP Verification

Email Verification

Password Change

Resend OTP

Session Expiration

Remember Device

Trusted Device

Recent Login History

Device Tracking

Security Logs

---

Use:

Nodemailer

SMTP

Environment Variables

OTP Entity

OTP Expiration

Verification Tokens

Rate Limiting

Hash OTP

Auto Cleanup

Email Templates

---

Suggested flows

Forgot Password

User enters email

↓

OTP generated

↓

OTP stored

↓

Email sent

↓

Verify OTP

↓

Reset password

↓

Invalidate OTP

↓

Success

---

Verify Email

Register

↓

Send OTP

↓

Email verification

↓

Activate account

↓

Login allowed

---

Security

OTP expiry

10 minutes

maximum retries

lockout

hash tokens

revoke tokens

audit logs

password history

---

Apply Phase 11 Modernization

Typography

Spacing

Dark Mode

Light Mode

Orange Identity

Responsive layouts

Improved forms

Improved validation

Loading states

Skeletons

Animations

Accessibility

---

# PHASE 14 — OFFLINE LOGIN

Offline capability is restricted.

Only workers can login offline.

Business Owners

Admins

Platform Admins

must remain online authenticated.

---

Offline Worker Authentication

Requirements

User logs in online once

↓

credentials cached securely

↓

encrypted local session

↓

offline token stored

↓

worker can login offline

↓

limited permissions

↓

sales continue

↓

transactions queued

↓

sync when online

---

Offline permissions

POS

Inventory

Sales

Receipts

Customer lookup

Returns

Shift operations

Queue management

---

Restricted offline

Wallet

Subscriptions

Admin Panel

Payments

KYC

Business Setup

Account Conversion

System Settings

---

Suggested implementation

IndexedDB

Encrypted Worker Session

Local Worker Cache

Device Binding

Expiration

Offline JWT

Revalidation

---

Display

Offline Worker Mode

Pending Synchronization

Last Connected

Queued Transactions

---

# PHASE 15 — PLATFORM ADMIN COMPLETION

Current structure

(platform)

admin

DashboardOverview

AuditLogs

Announcements

KycManagement

Disputes

PlatformSettings

Users

Verification

---

Goal

Complete platform governance.

USCOR should feel SaaS-ready.

---

Platform Admin responsibilities

User Management

Business Management

Worker Management

Marketplace Oversight

KYC Verification

Disputes

Token Monitoring

Wallet Monitoring

Analytics

Audits

Announcements

Pricing

Subscriptions

Security

Moderation

Feature Flags

---

Dashboard should include

Users

Businesses

Workers

Transactions

Revenue

Tokens

Wallet Volume

Pending KYC

Disputes

Marketplace Activity

Freelance Orders

Subscriptions

Growth Metrics

---

KYC Improvements

Business uploads

Trade License

ID Card

TIN

Certificates

Proof of Address

Store Photos

Business Logo

Supporting Documents

---

Status Tracking

Draft

Submitted

Pending Review

Approved

Rejected

Expired

Need Revision

---

Implement timeline

KYC Submitted

↓

Admin Review

↓

Approved

↓

B2B Enabled

or

Rejected

↓

Business notified

---

Business Settings

Business Profile

Branding

Stores

Branches

Documents

Verification

Payments

Notifications

Employees

Marketplace Visibility

B2B Status

Subscription Status

Wallet Status

---

# PHASE 16 — B2B ENABLEMENT

Goal

Make B2B operational.

Business verification required.

Only approved businesses participate.

---

Features

Wholesale Pricing

Procurement

Bulk Orders

Purchase Requests

Negotiation

Suppliers

Vendor Marketplace

RFQ

Invoices

Credit Requests

Business Discovery

Vendor Ratings

Inter-store Purchases

Transfer Orders

B2B Chat

Approval Workflow

---

Marketplace indicators

Verified Vendor

B2B Enabled

Wholesale Seller

Top Supplier

Enterprise

---

Subscriptions

Can remain

Feature Improvement

Planned

Next Release

Coming Soon

Use StatusBadge

StatusBadge

variant="next"

variant="beta"

variant="pro"

---

# PHASE 17 — SUBSCRIPTIONS

Do not implement fully.

Prepare architecture.

Mark as roadmap.

Subscription plans

Starter

Growth

Pro

Enterprise

---

Capabilities

Multiple Stores

Analytics

Advanced Reports

B2B

Freelance Marketplace

Priority Support

Ads

Marketing

Custom Branding

API Access

---

Display using StatusBadge

Feature Improvement

Planned

Coming Soon

---

# PHASE 18 — WALLET SECURITY

Current Wallet

wallet/page.tsx

ConvertModal

RechargeModal

WithdrawModal

TokenManagement

TransactionHistory

---

Current USCOR Token

1 UTN

=

10 USD

---

Goal

Analyze current implementation.

Do not rewrite blindly.

Understand existing logic.

Review flows.

Review assumptions.

Review vulnerabilities.

---

Wallet Review

Recharge

Withdraw

Transfer

Token Conversion

Account Recharge

Token Purchase

Balance Updates

Escrow

Booking Payments

Order Payments

Refunds

Commission

Settlement

---

Security Requirements

Atomic Transactions

Double Spend Protection

Audit Logs

Idempotency

Transaction Locking

Concurrency Handling

Rollback

Ledger Pattern

Immutable Logs

Balance Validation

Signature Validation

Rate Limiting

Fraud Detection

Alerts

---

Wallet Architecture

Wallet

↓

Ledger Entries

↓

Transactions

↓

Verification

↓

Approval

↓

Settlement

↓

Audit

---

Track

Pending

Processing

Completed

Failed

Cancelled

Refunded

Disputed

Expired

---

Every balance movement

must create a ledger record.

Never mutate balances directly.

---

# PHASE 19 — TOKEN SYSTEM REVIEW

UTN Token

1 UTN

=

10 USD

Goal

Validate token economics.

Validate conversion.

Validate precision.

Validate rounding.

Validate consistency.

---

Operations

Recharge Wallet

↓

Purchase Tokens

↓

Spend Tokens

↓

Escrow

↓

Release Funds

↓

Refund

↓

Commission

↓

Withdraw

---

Validate

B2B

B2C

Freelance Services

Bookings

Orders

Marketplace

Advertisements

Subscriptions

---

# PHASE 20 — PAYMENT ARCHITECTURE REVIEW

Current integrations

Africa's Talking Sandbox

USSD

Recharge

Token Transactions

Wallet Payments

---

Analyze

payment-transaction

account-recharge

wallet

order

marketplace

freelance-service

freelance-order

token-transaction

business

client

platform

---

Review entire payment lifecycle.

---

B2C

Customer

↓

Order

↓

Payment

↓

Escrow

↓

Business

↓

Settlement

↓

Receipt

---

B2B

Business A

↓

Purchase Request

↓

Approval

↓

Payment

↓

Escrow

↓

Business B

↓

Confirmation

↓

Settlement

---

Freelance

Client

↓

Booking

↓

Escrow

↓

Worker Acceptance

↓

Completion

↓

Release Funds

↓

Commission

↓

Payout

---

Validate

Refunds

Chargebacks

Cancellation

Disputes

Partial Refunds

Escrow

Settlement Timing

Wallet Updates

Token Updates

Ledger Updates

Notifications

Receipts

Audit Records

---

# PHASE 21 — COMMERCE TESTING

Validate

Offline Login

Offline Sales

Wallet

Payments

Recharge

Tokens

Ledger

Escrow

Transfers

Refunds

Receipts

B2B

B2C

Freelance

Business Verification

KYC

Subscriptions

Admin Dashboard

Marketplace

Permissions

Responsive Layouts

Dark Mode

Light Mode

Security

OTP

Email Verification

Password Reset

Session Handling

Worker Offline Restrictions

---

Deliverables

Authentication Completion Report

Offline Worker Report

Platform Governance Report

KYC Roadmap

Wallet Security Report

Token Audit

Payment Audit

Escrow Architecture

B2B Readiness Report

Subscription Roadmap

Admin Completion Report

Commerce Completion Roadmap

Security Assessment

Production Readiness Assessment

Implementation Checklist

Technical Debt Report

Migration Plan

Final USCOR 2.1 Assessment

USCOR must preserve existing architecture.

Prefer improvements.

Prefer refactoring.

Preserve existing modules.

Avoid destructive rewrites.

Maintain thesis alignment.

Electronics and Hardware remain highest business priority.

Offline capability remains highest platform priority.

USCOR should ultimately feel like:

Shopify + Square POS + Odoo + Stripe Connect + local East African commerce realities.

The thesis remains the ultimate specification.
