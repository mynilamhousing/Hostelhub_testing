import { login, openTab, waitForAnyText } from '../../src/mobile/mobile.driver.js';
import { api } from '../../src/api/hostelhub.api.js';
import { dataFactory } from '../../src/fixtures/data.factory.js';

/** Native shell navigation and resident list (Appium). */
describe('@mobile Shell navigation (Appium)', () => {
  let owner;

  before(async () => {
    const draft = dataFactory.owner();
    const registered = await api.register(draft);
    owner = { ...draft, id: registered.user.id };

    const property = (await api.createProperty(owner.id, dataFactory.property({ name: 'Mobile Shell Hostel' }))).property;
    const room = (await api.createRoom(property.id, dataFactory.room({ room_no: '101', capacity: 2 }))).room;

    const inmate = dataFactory.inmate({ room_id: room.id, bed_no: 1 });
    owner.inmateName = inmate.name;
    await api.createInmate(property.id, inmate);

    await login(owner);
  });

  it('MOB-NAV-01 shows the owner tabs', async () => {
    await waitForAnyText(['Inmates', 'Polls', 'More']);
  });

  it('MOB-NAV-02 opens the inmates tab and lists the resident', async () => {
    await openTab('Inmates');
    await waitForAnyText([owner.inmateName], 30_000);
  });

  it('MOB-NAV-03 returns to the dashboard', async () => {
    await openTab('Home');
    await waitForAnyText(['Occupancy', 'Quick actions']);
  });
});
