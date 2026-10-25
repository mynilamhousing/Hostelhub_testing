/**
 * REST endpoints of the HostelHub Worker (single place to change if the API
 * versioning changes).
 */
export const ENDPOINTS = Object.freeze({
  health: () => '/health',
  pricing: () => '/pricing',

  register: () => '/auth/register',
  login: () => '/auth/login',
  forgotPassword: () => '/auth/forgot-password',
  resetPassword: () => '/auth/reset-password',

  properties: () => '/properties',
  property: (id) => `/properties/${id}`,

  rooms: () => '/rooms',
  room: (id) => `/rooms/${id}`,

  inmates: () => '/inmates',
  inmatesByProperty: (propertyId) => `/inmates?property_id=${propertyId}`,
  inmate: (id) => `/inmates/${id}`,

  payments: (propertyId) => `/payments?property_id=${propertyId}`,
  polls: (propertyId) => `/polls?property_id=${propertyId}`,
  poll: (id) => `/polls/${id}`,
  pollResponses: (id) => `/polls/${id}/responses`,

  complaints: (propertyId) => `/complaints?property_id=${propertyId}`,
  notices: (propertyId) => `/notices?property_id=${propertyId}`,
  visitors: (propertyId) => `/visitors?property_id=${propertyId}`,
  leave: (propertyId) => `/leave?property_id=${propertyId}`,
  deposits: (propertyId) => `/deposits?property_id=${propertyId}`,
  expenses: (propertyId) => `/expenses?property_id=${propertyId}`,
  ratings: (propertyId) => `/ratings?property_id=${propertyId}`,
  sos: (propertyId) => `/sos?property_id=${propertyId}`,
  documents: (propertyId) => `/documents?property_id=${propertyId}`,
  pnl: (propertyId) => `/pnl?property_id=${propertyId}`,
});
