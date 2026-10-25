import { test, expect } from '../../src/fixtures/index.js';
import { dataFactory } from '../../src/fixtures/data.factory.js';

/**
 * Resident onboarding — the highest-risk flow in the product: it creates a
 * login for a paying resident, so both the UI and the API state are asserted.
 */
test.describe('@e2e Inmates', () => {
  test('E2E-INM-01 inmates tab shows the property, rooms and residents', async ({ hostelApp, hostel, inmatesPage }) => {
    const inmate = await hostel.addInmate();
    await inmatesPage.reload();
    await inmatesPage.open();
    await inmatesPage.expectLoaded(hostel.property.name);
    await inmatesPage.expectRoomsSection();
    await inmatesPage.expectInmateListed(inmate.name);
  });

  test('E2E-INM-02 owner adds a resident through the form', async ({ hostelApp, hostel, inmateFlow, inmatesPage }) => {
    const inmate = dataFactory.inmate({ bed_no: 2, rent_amount: 7000, due_day: 10 });
    const created = await inmateFlow.addResident({ roomNo: hostel.room.room_no, inmate });

    await inmatesPage.open();
    await inmatesPage.expectInmateListed(created.name);
  });

  test('E2E-INM-03 the resident created in the UI exists in the API', async ({ hostelApp, hostel, inmateFlow, api }) => {
    const inmate = dataFactory.inmate({ bed_no: 3 });
    const created = await inmateFlow.addResident({ roomNo: hostel.room.room_no, inmate });

    const { inmates } = await api.listInmates(hostel.property.id);
    const found = inmates.find((i) => i.name === created.name);
    expect(found, 'resident created via UI must be readable from the API').toBeTruthy();
    expect(found.room_no).toBe(hostel.room.room_no);
    expect(found.bed_no).toBe(3);
  });
});
