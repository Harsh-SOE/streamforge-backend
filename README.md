# Streamforge Backend

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  A production-grade, distributed backend system inspired by modern video streaming platforms.
</p>

<p align="center">
  Built with <b>NestJS</b>, designed using <b>Hexagonal Architecture + CQRS + Event-Driven Architecture</b>,
  and orchestrated locally using <b>Docker</b> and <b>Tilt</b>.
</p>

---

## Overview

Streamforge is a **fully distributed backend system** inspired by platforms like YouTube.

This project focuses on **how large-scale backend systems are actually engineered**.

It emphasizes:

- Strong domain boundaries
- Independent services
- Asynchronous communication
- Clear separation of responsibility
- Production-aligned architecture patterns

---

## 🧠 Architectural Philosophy

The system is intentionally designed using **multiple complementary architecture patterns**, each solving a different class of problems.

| Pattern                   | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| Hexagonal Architecture    | Protect domain logic from frameworks     |
| CQRS                      | Separate write and read responsibilities |
| Event-Driven Architecture | Enable loose coupling and scalability    |

These patterns are not used in isolation — they work together to form a cohesive system.

---

## 🧩 Architectural Patterns Used

### 1️⃣ Hexagonal Architecture (Per Service)

Each microservice follows **Hexagonal Architecture (Ports & Adapters)**.

The core idea:

> Business logic must not depend on databases, transport layers or underlying infrastructure.

**Layered flow inside every service:**

```
Controller / Message Consumer
        ↓
Application Layer (Use Cases)
        ↓
Domain Layer (Entities, Aggregates, Rules)
        ↓
Ports (Interfaces)
        ↓
Adapters (DB, Kafka, External APIs)
```

**Key rules enforced:**

- Domain layer is completely blind to underlying infrastructure and tools, and uses a pragmatic nestjs style
- Infrastructure details are replaceable using ports and adapters at runtime
- Application layer orchestrates all use-cases
- Adapters implement ports, never the other way around

This provides:

- High testability
- Dependencies independence in business logic
- Long-term maintainability

---

### 2️⃣ CQRS (System-Level)

CQRS is applied at the **system boundary**, not merely as folder separation.

The system distinguishes between:

- **Write side (command service) → owns truth**
- **Read side (projection service) → owns representation**

#### Write Side

- Handles commands
- Enforces domain invariants
- Executes business rules
- Emits domain events in business layer
- Translates those domain events to integration events

#### Read Side

- Consumes integration events
- Builds projections
- Stores denormalized view models
- Serves optimized queries

> The read service never performs direct writes and contains no domain logic.

There is:

- No direct database sharing
- No synchronous coupling
- No HTTP calls between write and read services

All communication happens exclusively through events.

---

### 3️⃣ Event-Driven Architecture

Kafka acts as the **backbone of the entire system**.

Domain events represent **facts that already happened**, not intentions.

Examples:

- `UserRegistered`
- `VideoUploaded`
- `VideoPublished`

Events are:

- Immutable
- Past-tense
- Versioned

This enables:

- Loose coupling between services
- Independent deployment
- Horizontal scalability
- Fault isolation

---

## ⚙️ Requirements

- Node.js (>= 18)
- Yarn
- Docker
- Docker Compose
- Tilt
- NestJS CLI

---

## 🚀 Running the Project

### Manual (Service-by-Service)

```bash
yarn build <service_name>
yarn start <service_name>
yarn start:dev <service_name>
yarn start:prod <service_name>
```

If no service is specified, `gateway` is used by default.

---

### Docker + Tilt (Recommended)

```bash
yarn start:all
```

This spins up:

- All microservices
- Kafka & infrastructure
- Hot reload environment
- Unified logging and health visibility

---

## 🧪 Testing

```bash
yarn test

yarn test <service_name>

yarn test:e2e

yarn test:cov
```

---

## 📌 Why This Project Exists

This repository is built as a **long-term backend engineering system**

It is used to:

- Practice real distributed-system design
- Understand CQRS at scale
- Learn event-driven consistency
- Explore production architecture patterns

---

> Streamforge is an evolving backend architecture project focused on correctness, clarity, and scalability.
