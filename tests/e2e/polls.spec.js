import { test, expect } from '../../src/fixtures/index.js';
import { dataFactory } from '../../src/fixtures/data.factory.js';

/**
 * Mess polls — owner creates a poll, the screen renders it, and the API returns
 * a well-formed payload (options as array, recurring as boolean).
 */
test.describe('@e2e Mess polls', () => {
  test('E2E-POLL-01 polls tab renders an active poll', async ({ hostelApp, hostel, pollsPage }) => {
    await hostel.addPoll({ meal_type: 'dinner' });
    await pollsPage.reload(); // providers cache the first fetch
    await pollsPage.open();
    await pollsPage.expectPollVisible(/dinner|poll/i);
  });

  test('E2E-POLL-02 API returns poll options as an array and recurring as boolean', async ({ hostel, api }) => {
    const poll = await hostel.addPoll();
    const { polls } = await api.listPolls(hostel.property.id);
    const created = polls.find((p) => p.id === poll.id);

    expect(created, 'created poll should be listed').toBeTruthy();
    expect(Array.isArray(created.options), 'options must be an array, not a JSON string').toBe(true);
    expect(created.options).toEqual(['Yes', 'No']);
    expect(typeof created.recurring, 'recurring must be a real boolean, not 0/1').toBe('boolean');
  });

  test('E2E-POLL-03 poll creation is scoped to the property', async ({ hostel, api }) => {
    await hostel.addPoll({ meal_type: 'lunch' });
    const { polls } = await api.listPolls(hostel.property.id);
    expect(polls.every((p) => p.property_id === hostel.property.id)).toBe(true);
  });
});
