import { login, waitForAnyText, SELECTORS } from '../../src/mobile/mobile.driver.js';
import { api } from '../../src/api/hostelhub.api.js';
import { dataFactory } from '../../src/fixtures/data.factory.js';

/**
 * Native authentication (Appium). Run with `npm run test:mobile`.
 * Requires an Android emulator/device with the release APK installed.
 */
describe('@mobile Authentication (Appium)', () => {
  let owner;

  before(async () => {
    const draft = dataFactory.owner();
    const registered = await api.register(draft);
    owner = { ...draft, id: registered.user.id, token: registered.token };

    const property = (await api.createProperty(owner.id, dataFactory.property({ name: 'Mobile Hostel' }))).property;
    await api.createRoom(property.id, dataFactory.room({ room_no: '101', capacity: 2 }));
  });

  it('MOB-AUTH-01 starts on the login screen', async () => {
    await waitForAnyText(['Welcome back', 'Log in'], 90_000);
    expect(await $(SELECTORS.username).isDisplayed()).toBe(true);
  });

  it('MOB-AUTH-02 signs in with valid credentials', async () => {
    await login(owner);
    await waitForAnyText(['Inmates', 'Occupancy']);
  });

  it('MOB-AUTH-03 rejects an invalid password', async () => {
    await waitForAnyText(['Welcome back', 'Log in'], 60_000);
    await $(SELECTORS.username).click();
    await $(SELECTORS.username).setValue(owner.username);
    await $(SELECTORS.password).click();
    await $(SELECTORS.password).setValue('WrongPass!1');
    await $(SELECTORS.loginButton).click();
    await waitForAnyText(['Login failed', 'Invalid credentials'], 30_000);
  });
});
