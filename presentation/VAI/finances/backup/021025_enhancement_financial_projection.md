# 1

In the Year 1 Summary section (summary_table):
This is the most important edit in the entire document. We will introduce the concept of Gross Profit to show the true health of your business model.

What to Change: Add your Cost of Revenue and Gross Profit metrics.

Where to Edit: sections.   
summary_table.rows

How to Change It: Add three new rows to the table after "Total Revenue (11%)".

Add: ``

Add: ["Gross Profit", "19,972,880 XPF"]

Add: ["Gross Margin", "49.9%"]

Why: This immediately shows an investor that you have a deep understanding of your unit economics. It demonstrates that after all direct costs of making a sale are paid, your business retains nearly 50% of its revenue. A ~50% Gross Margin is a very strong and attractive metric for a platform business.

# 2

In the Investment vs. Return section:
This section must be completely overhauled to remove the old grant language and reflect the new community investment proposal.

What to Change: The entire section's title, content, and calculations.

Where to Edit: sections[3] (the entire object)

How to Change It:

Change the main title to: "Community Investment & Projected Returns"

Replace the investment object with this:

JSON

"investment": {
  "title": "Community Investment Goal",
  "total": "Total: 42,000,000 XPF"
}
Replace the return object with this:

JSON

"return": {
  "title": "Projected Returns for Investors & Our Community",
  "items":
}
Why: This surgically removes all outdated grant information and replaces it with data that is directly relevant to an investor on the "Invest in Pacific" platform. It clearly states what they get (10% return) and what their investment achieves (profitability and massive local impact).

# 3

In the Conclusion section:
The final step is to remove the last traces of the grant application narrative.

What to Change: The final paragraph and the footer.

Where to Edit: sections.[4]paragraphs and sections.[4]footer

How to Change It:

In the paragraphs array, replace the last paragraph:

Current: "The public investment of 12 million XPF (application in progress) will generate a return of 40 million XPF in the first year alone, while establishing the digital tourism infrastructure for French Polynesia."

Change to: "The community investment of 42 million XPF will fuel a comprehensive, realistic operational plan, projected to generate 40 million XPF in revenue in the first year alone and establish the foundational digital tourism infrastructure for French Polynesia."

DELETE the footer object entirely:

Remove: "footer": "Document prepared for the DAD, AEPE, and PACE funding applications"

Why: This ensures your document ends with a powerful, forward-looking statement that is perfectly aligned with your new funding strategy and speaks directly to your new audience.