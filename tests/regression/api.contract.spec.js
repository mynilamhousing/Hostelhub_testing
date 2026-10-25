import { test, expect } from '../../src/fixtures/index.js';
import { dataFactory } from '../../src/fixtures/data.factory.js';

/**
 * API contract regression — guards the behaviours that have broken before and
 * would fail silently in the UI (SQLite 0/1 booleans, JSON columns, auth codes).
 */
test.describe('@regression API contract', () => {
  test('REG-API-01 /health and /pricing keep their shape', async ({ api }) => {
    expect(await api.health()).toEqual({ status: 'ok' });

    const { pricing } = await api.pricing();
    expect(pricing.global).toEqual(
      expect.objectContaining({
        monthly: expect.any(Number),
        yearly: expect.any(Number),
        extra_property: expect.any(Number),
      }),
    );
  });

  test('REG-API-02 register and login issue a signed JWT', async ({ api }) => {
    const user = dataFactory.owner();
    const registered = await api.register(user);

    expect(registered.user.username).toBe(user.username);
    expect(registered.user).not.toHaveProperty('password');
    expect(registered.token.split('.')).toHaveLength(3); // header.payload.signature

    const loggedIn = await api.login(user.username, user.password);
    expect(loggedIn.user.id).toBe(registered.user.id);
  });

  test('REG-API-03 wrong password is 401 and never echoes the password', async ({ api }) => {
    const user = dataFactory.owner();
    await api.register(user);

    const { status, body } = await api.raw('POST', '/auth/login', {
      username: user.username,
      password: 'WrongPass!1',
    });
    expect(status).toBe(401);
    expect(JSON.stringify(body)).not.toContain(user.password);
  });

  test('REG-API-04 duplicate username is rejected', async ({ api }) => {
    const user = dataFactory.owner();
    await api.register(user);

    const { status } = await api.raw('POST', '/auth/register', { ...dataFactory.owner(), username: user.username });
    expect([400, 409]).toContain(status);
  });

  test('REG-API-05 boolean fields are real JSON booleans', async ({ api }) => {
    const registered = await api.register(dataFactory.owner());
    expect(typeof registered.user.kyc_verified).toBe('boolean');
  });

  test('REG-API-06 tenants are isolated', async ({ api }) => {
    const a = dataFactory.owner();
    const b = dataFactory.owner();
    const ownerA = await api.register(a);
    const ownerB = await api.register(b);

    const propertyA = (await api.createProperty(ownerA.user.id, dataFactory.property())).property;
    await api.createProperty(ownerB.user.id, dataFactory.property());

    const { properties } = await api.listProperties(ownerA.user.id);
    expect(properties).toHaveLength(1);
    expect(properties[0].id).toBe(propertyA.id);
  });
});
