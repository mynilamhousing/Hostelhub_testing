/**
 * Tenant provisioning — the data half of a test.
 *
 * Always through the API, for three reasons: it is an order of magnitude faster
 * than clicking onboarding, it is identical on web and native, and it keeps the
 * UI free for the behaviour actually under test. The email domain marks every
 * row for scripts/cleanup.sql.
 */
import { api } from '../api/hostelhub.api.js';
import { dataFactory } from './data.factory.js';

/**
 * Creates an isolated owner, optionally with a property and one room.
 * @returns {Promise<{owner: object, property?: object, room?: object,
 *   addInmate: Function, addPoll: Function, addNotice: Function}>}
 */
export async function provisionTenant({ withProperty = true, withRoom = true, roomCapacity = 3 } = {}) {
  const draft = dataFactory.owner();
  const registered = await api.register(draft);
  const owner = { ...draft, id: registered.user.id, token: registered.token };

  const tenant = { owner };

  if (withProperty) {
    tenant.property = (await api.createProperty(owner.id, dataFactory.property())).property;
  }

  if (withProperty && withRoom) {
    tenant.room = (await api.createRoom(tenant.property.id, dataFactory.room({ capacity: roomCapacity }))).room;
  }

  tenant.addInmate = async (overrides = {}) => {
    const payload = dataFactory.inmate({ room_id: tenant.room?.id, ...overrides });
    const res = await api.createInmate(tenant.property.id, payload);
    return { ...payload, id: res.inmate.id, username: res.inmate.username, generatedPassword: res.password };
  };

  tenant.addPoll = async (overrides = {}) =>
    (await api.createPoll(tenant.property.id, dataFactory.poll(overrides))).poll;

  tenant.addNotice = async (overrides = {}) =>
    (await api.createNotice(tenant.property.id, dataFactory.notice(overrides))).notice;

  return tenant;
}
