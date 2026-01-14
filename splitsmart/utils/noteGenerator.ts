import { ReceiptData, Assignment } from '../types';

/**
 * Generates a descriptive note from receipt and assignments
 * Format: "Jan 1, 2026 - Sarah, Rick - Pizza, Salad | Wine"
 */
export function generateReceiptNote(
    receipt: ReceiptData,
    assignments: Assignment[]
): string {
    if (assignments.length === 0) {
        return `Receipt from ${new Date().toLocaleDateString()} - No assignments`;
    }

    const date = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const people = [...new Set(assignments.map(a => a.personName))];
    const peopleList = people.join(', ');

    // Create item summary per person
    const itemsByPerson = assignments.map(a => {
        const items = a.itemIds
            .map(id => receipt.items.find(i => i.id === id)?.name)
            .filter(Boolean);

        if (items.length === 0) return null;

        // If person has many items, summarize
        if (items.length > 3) {
            return `${a.personName}: ${items.slice(0, 2).join(', ')} +${items.length - 2} more`;
        }

        return `${a.personName}: ${items.join(', ')}`;
    }).filter(Boolean);

    if (itemsByPerson.length === 0) {
        return `${date} - ${peopleList}`;
    }

    return `${date} - ${itemsByPerson.join(' | ')}`;
}

/**
 * Generates a summary of current assignments for AI Chat
 */
export function generateAssignmentSummary(
    assignments: Assignment[],
    receipt: ReceiptData
): string {
    if (assignments.length === 0) {
        return "No items assigned yet.";
    }

    const summary = assignments.map(a => {
        const items = a.itemIds
            .map(id => receipt.items.find(i => i.id === id)?.name)
            .filter(Boolean);

        if (items.length === 0) return null;

        return `• ${a.personName}: ${items.join(', ')}`;
    }).filter(Boolean);

    return summary.join('\n');
}
