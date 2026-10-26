---
name: lumis-cost-analysis
description: "Build LUMIS lamp cost models, manufacturing comparisons, budgets, spreadsheets and charts from actual inputs. Use for filament costs, print time, assembly, packaging, margins and ad break-even; no invented selling price."
---

# LUMIS cost analysis
Use actual quotes, print measurements and user inputs. Record source, date, currency and VAT basis for each input. Leave unknown numeric values blank and flag them; zero is a real value, not a missing-data marker.

Model filament mass/cost, power, machine cost allocation, print time, rejects/reprints, LED/USB components, fasteners, ballast, assembly labour, packaging, transaction fees, shipping contribution and applicable taxes. Avoid double counting energy or depreciation already included in a machine hourly rate. Separate fixed, variable and one-off development costs.

Show assumptions for yield/reject rates rather than silently multiplying arbitrary percentages. Calculate gross margin as (net revenue minus defined cost)/net revenue and distinguish it from markup. Treat maximum affordable customer acquisition cost as a scenario based on contribution before advertising, not a guaranteed ad result. Do not estimate LTV from hypothetical repeat purchases.

Deliver CSV or an original spreadsheet using available pandas/openpyxl tools, with editable inputs, formulas, units, a missing-input list and charts that distinguish scenarios from actuals. If spreadsheet tools are absent, provide CSV plus documented formulas; do not claim a working XLSX was generated. Do not copy the proprietary Anthropic XLSX skill. The user's official Claude document features can be used when available.

Recommend prices only when requested and supported by costs plus customer/market evidence. Do not publish prices, start campaigns or spend budget as part of a cost analysis.
