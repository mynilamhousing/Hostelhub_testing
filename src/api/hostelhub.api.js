/**
 * HostelHub API client.
 *
 * Purpose in the framework: build and tear down test data fast (a tenant with
 * property, rooms and residents takes one call chain instead of two minutes of
 * UI clicking) and assert server-side effects that the UI would only reflect
 * after a reload. UI paths are still covered by the page objects.
 */
import { env } from '../config/env.js';
import { ENDPOINTS } from './endpoints.js';

export class HostelHubApi {
  constructor(baseUrl = env.apiBaseUrl, logger = console) {
    this.baseUrl = baseUrl;
    this.log = logger;
  }

  /**
   * Transport-level retries only (Cloudflare occasionally drops the first
   * connection when IPv6 is attempted). HTTP errors surface immediately.
   */
  async request(method, path, { body, token, retries = env.apiRetries } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        const text = await res.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { raw: text };
        }
        if (!res.ok) throw new TypeError(`HTTP ${res.status}: ${text.slice(0, 300)}`);
        return data;
      } catch (error) {
        // A real API error (4xx/5xx) must not be retried.
        if (String(error.message).startsWith('HTTP ')) {
          throw new Error(`${method} ${path} -> ${error.message}`);
        }
        lastError = error;
        if (attempt < retries) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
    throw new Error(`${method} ${path} -> network error after ${retries + 1} attempts: ${lastError?.message}`);
  }

  get(path, opts) { return this.request('GET', path, opts); }
  post(path, body, opts = {}) { return this.request('POST', path, { ...opts, body }); }

  // ── Auth ──────────────────────────────────────────────────────────────────
  health() { return this.get(ENDPOINTS.health()); }
  pricing() { return this.get(ENDPOINTS.pricing()); }
  register(user) { return this.post(ENDPOINTS.register(), user); }
  login(username, password) { return this.post(ENDPOINTS.login(), { username, password }); }

  // ── Tenant data ───────────────────────────────────────────────────────────
  createProperty(ownerId, property) {
    return this.post(ENDPOINTS.properties(), { owner_id: ownerId, ...property });
  }
  createRoom(propertyId, room) {
    return this.post(ENDPOINTS.rooms(), { property_id: propertyId, ...room });
  }
  createInmate(propertyId, inmate) {
    return this.post(ENDPOINTS.inmates(), { property_id: propertyId, ...inmate });
  }
  createPoll(propertyId, poll) {
    return this.post(ENDPOINTS.polls(propertyId).split('?')[0], { property_id: propertyId, ...poll });
  }
  createNotice(propertyId, notice) {
    return this.post('/notices', { property_id: propertyId, ...notice });
  }

  // ── Reads ─────────────────────────────────────────────────────────────────
  listProperties(ownerId) { return this.get(`/properties?owner_id=${ownerId}`); }
  listRooms(propertyId) { return this.get(ENDPOINTS.rooms() + `?property_id=${propertyId}`); }
  listInmates(propertyId) { return this.get(ENDPOINTS.inmatesByProperty(propertyId)); }
  listPolls(propertyId) { return this.get(ENDPOINTS.polls(propertyId)); }
  pnl(propertyId) { return this.get(ENDPOINTS.pnl(propertyId)); }

  /** Raw fetch helper for negative tests (returns status + body instead of throwing). */
  async raw(method, path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
    return { status: res.status, body: data };
  }
}

export const api = new HostelHubApi();
