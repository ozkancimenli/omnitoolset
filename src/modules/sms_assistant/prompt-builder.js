import { formatSlotForSms } from './booking-planner.js';

function summarizeHistory(history) {
  return history
    .slice(-6)
    .map((message) => `${message.direction === 'inbound' ? 'Customer' : 'Assistant'}: ${message.body}`)
    .join('\n');
}

export function buildSystemPrompt(business) {
  return [
    `You are the SMS AI assistant for ${business.name}.`,
    'Write like a helpful front-desk teammate.',
    'Rules:',
    '- Keep replies short, warm, and natural.',
    '- Never mention being an AI or a bot.',
    '- Always move the conversation toward a booking when appropriate.',
    '- If slots are provided, mention only those slots.',
    '- If a booking is confirmed, clearly restate the booked time.',
    '- If the customer opts out, confirm that you will stop messaging them.',
    `Business services: ${business.services_summary || 'General appointments'}.`,
    `Business hours: ${business.hours_summary || 'Mon-Fri, 9:00 AM to 5:00 PM'}.`
  ].join('\n');
}

export function buildUserPrompt({ history, plan, customerMessage }) {
  const offeredSlotsText =
    plan.offeredSlots?.map((slot) => formatSlotForSms(slot, plan.timezone)).join(' | ') || 'None';

  return [
    `Latest customer message: ${customerMessage || 'Missed call with no SMS content.'}`,
    `Conversation summary:\n${summarizeHistory(history) || 'No prior messages.'}`,
    `Workflow type: ${plan.type}`,
    `Goal: ${plan.goal}`,
    `Offered slots: ${offeredSlotsText}`,
    `Confirmed slot: ${plan.selectedSlot ? formatSlotForSms(plan.selectedSlot, plan.timezone) : 'None'}`,
    'Respond with SMS text only.'
  ].join('\n\n');
}

export function buildFallbackReply({ business, plan }) {
  const slotList = plan.offeredSlots?.map((slot) => formatSlotForSms(slot, plan.timezone)) || [];

  switch (plan.type) {
    case 'confirm_booking':
      return `Perfect, you're booked for ${formatSlotForSms(plan.selectedSlot, plan.timezone)}. If anything changes, just text us here.`;
    case 'clarify_choice':
      return `Happy to lock that in. Which works better for you: ${slotList.join(' or ')}?`;
    case 'booked_follow_up':
      return `You're all set for ${formatSlotForSms(plan.selectedSlot, plan.timezone)}. If you need anything before then, just text us here.`;
    case 'opt_out':
      return `Understood. We won't send more messages unless you reach back out.`;
    case 'offer_slots':
    default:
      return `Happy to help. I can get you in ${slotList.join(' or ')}. Which one works better for you?`;
  }
}
