# Testing Notes

## Automated

Run:

```bash
npm test
npm run coverage
```

Covered functions:

- `validateEntry`
- `loadEntries`
- `normalizeStoredEntry`
- `calculateTotal`
- `calculateBalance`

## Manual checklist (browser)

1. Add income / expense entries and verify totals + balance update.
2. Edit and delete entries in Income/Expense/All tabs.
3. Keyboard check:
   - Tab to filter buttons and activate with Enter/Space.
   - Tab to add buttons and activate with Enter/Space.
   - Use Enter on amount input to submit entry.
4. Switch language with the top toggle and verify labels/messages change.
5. Reload page:
   - Before consent: cookie banner visible.
   - After **Accept**: entries persist.
   - After **Decline**: stored entries are cleared and no new persistence.
6. Open Privacy Policy from cookie banner and verify dedicated page `privacy.html` opens.
7. Run Lighthouse in Chrome DevTools and verify **Accessibility >= 90**.
