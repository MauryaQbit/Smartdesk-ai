export const TICKET_CATEGORIES = [
  { value: 'general', label: 'General question' },
  { value: 'bug', label: 'Bug or technical issue' },
  { value: 'billing', label: 'Billing and payments' },
  { value: 'feature', label: 'Feature request' },
];

export const TICKET_TEMPLATES = {
  bug: {
    title: 'Cannot login to dashboard',
    description: 'Login fails after entering valid credentials. Steps to reproduce:\n1. Open the login page\n2. Enter valid credentials\n3. Submit the form\n\nExpected result: I can access my dashboard.',
    category: 'bug',
  },
  billing: {
    title: 'Question about a billing charge',
    description: 'I need help understanding a recent charge. Please include the transaction date and reference if available.',
    category: 'billing',
  },
  feature: {
    title: 'Feature request',
    description: 'Please describe the feature you need, why it would help, and what you expect it to do.',
    category: 'feature',
  },
};

export const TICKET_LIMITS = { title: 120, description: 5000 };
