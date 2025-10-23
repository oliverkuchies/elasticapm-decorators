
<p align="center">
  <a href="https://www.npmjs.com/package/elasticapm-decorators">
    <img src="https://img.shields.io/npm/v/elasticapm-decorators.svg?style=flat-square" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/elasticapm-decorators">
    <img src="https://img.shields.io/npm/dm/elasticapm-decorators.svg?style=flat-square" alt="NPM Downloads" />
  </a>
  <a href="https://github.com/oliverkuchies/elasticapm-decorators/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/oliverkuchies/elasticapm-decorators?style=flat-square" alt="License" />
  </a>
  <a href="https://github.com/oliverkuchies/elasticapm-decorators/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/oliverkuchies/elasticapm-decorators/ci.yml?branch=main&style=flat-square" alt="Build Status" />
  </a>
</p>

# 🚀 ElasticAPM Decorators for TypeScript

Supercharge your TypeScript methods with effortless performance monitoring and distributed tracing using Elastic APM! 

## ✨ Features
- **Zero-boilerplate**: Just decorate your methods—no manual instrumentation needed.
- **Automatic Span & Transaction Management**: Instantly track performance and errors for any async method.
- **TypeScript-first**: Built for modern TypeScript projects, with full type safety.
- **Flexible**: Works with any Elastic APM Node.js agent (v4+).

---

## 📦 Installation

```sh
npm install elastic-apm-node elasticapm-decorators
```

> **Requires:** `elastic-apm-node` v4 or higher (see your `package.json` for compatibility)

---

## ⚡️ Quick Start

### 1. Import and Configure Elastic APM

```typescript
import apm from 'elastic-apm-node';
apm.start({
  serviceName: 'my-service',
  // ...other config
});
```

### 2. Decorate Your Methods

```typescript
import { ElasticTransaction, ElasticSpan } from 'elasticapm-decorators';

class UserService {
  @ElasticTransaction('user-signup', 'request')
  async signupUser(data: UserData) {
    // ...your logic
  }

  @ElasticSpan('db-query', 'db', 'postgres')
  async fetchUser(id: string) {
    // ...your logic
  }
}
```

---

## 🛠 How It Works
- **@ElasticTransaction**: Wraps your async method in an Elastic APM transaction. Tracks duration, errors, and outcome.
- **@ElasticSpan**: Wraps your async method in a span. Perfect for sub-operations (e.g., DB queries, external calls).
- **Automatic error handling**: Errors are captured and labeled in APM.

---

## 🧪 Testing

This package is fully tested with [Vitest](https://vitest.dev/). To run tests:

```sh
npm test
```

---

## 📚 API Reference

### `@ElasticTransaction(name: string, type: string)`
- **name**: Transaction name (e.g., 'user-signup')
- **type**: Transaction type (e.g., 'request', 'background')

### `@ElasticSpan(name: string, type: string, subtype?: string)`
- **name**: Span name (e.g., 'db-query')
- **type**: Span type (e.g., 'db', 'external')
- **subtype**: (Optional) Span subtype (e.g., 'postgres', 'http')

---

## 💡 Why Use This?
- **Save time**: No more manual APM boilerplate.
- **Consistency**: Every method is traced the same way.
- **Observability**: Instantly see performance bottlenecks and errors in Elastic APM.

---

## 📝 License
MIT — Made with ❤️ by Oliver Kucharzewski

---

## 🌟 Contributing
Pull requests, issues, and stars are always welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📣 Stay in Touch
- [GitHub Issues](https://github.com/oliverkuchies/elasticapm-decorators/issues)
- [Elastic APM Docs](https://www.elastic.co/guide/en/apm/agent/nodejs/current/index.html)

---

Happy tracing! 🚀
