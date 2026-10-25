import { test, expect } from '../../src/fixtures/index.js';

/**
 * Occupancy rules — room capacity and bed uniqueness are enforced by the Worker
 * and are the easiest thing to regress when onboarding changes.
 */
test.describe('@regression Occupancy rules', () => {
  test('REG-OCC-01 a room cannot exceed its capacity', async ({ hostel }) => {
    for (let bed = 1; bed <= hostel.room.capacity; bed += 1) {
      await hostel.addInmate({ bed_no: bed });
    }
    await expect(hostel.addInmate({ bed_no: 2 })).rejects.toThrow(/full|capacity/i);
  });

  test('REG-OCC-02 a bed cannot be assigned twice', async ({ hostel }) => {
    await hostel.addInmate({ bed_no: 1 });
    await expect(hostel.addInmate({ bed_no: 1 })).rejects.toThrow(/already taken|bed/i);
  });

  test('REG-OCC-03 bed number outside 1..capacity is rejected', async ({ hostel }) => {
    await expect(hostel.addInmate({ bed_no: 99 })).rejects.toThrow(/out of range|bed/i);
  });

  test('REG-OCC-04 an API-created resident appears with room and bed', async ({ hostel, api }) => {
    const inmate = await hostel.addInmate();
    const { inmates } = await api.listInmates(hostel.property.id);
    const found = inmates.find((i) => i.id === inmate.id);

    expect(found).toBeTruthy();
    expect(found.room_no).toBe(hostel.room.room_no);
    expect(found.bed_no).toBe(1);
    expect(found.rent_amount).toBe(inmate.rent_amount);
  });
});
