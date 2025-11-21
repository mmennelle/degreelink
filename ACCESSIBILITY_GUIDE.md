# WCAG Accessibility Quick Reference Guide

## For Developers: Maintaining Accessibility

### When Adding New Forms

Always include these attributes:

```jsx
// Label with htmlFor
<label htmlFor="unique-field-id" className="...">
  Field Name *
</label>

// Input with id, aria attributes
<input
  id="unique-field-id"
  type="text"
  required
  aria-required="true"
  aria-invalid={hasError ? "true" : "false"}
  aria-describedby={hasError ? "field-error" : "field-help"}
  // ... other props
/>

// Error message with role="alert"
{hasError && (
  <p id="field-error" role="alert" className="text-red-600">
    Error message here
  </p>
)}

// Help text
<p id="field-help" className="text-gray-500">
  Help text here
</p>
```

### When Adding Interactive Elements

❌ **DON'T:**
```jsx
<div onClick={handleClick}>Click me</div>
```

✅ **DO:**
```jsx
<button onClick={handleClick} aria-label="Descriptive action">
  Click me
</button>
```

### When Adding Icons

```jsx
// Decorative icons (purely visual)
<Icon size={16} aria-hidden="true" />

// Functional icons (need description)
<button aria-label="Close dialog">
  <X aria-hidden="true" />
</button>
```

### When Adding Progress Indicators

```jsx
<div
  role="progressbar"
  aria-valuenow={currentValue}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Descriptive progress label"
>
  {/* visual representation */}
</div>
```

### When Adding Modals

```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Modal Title</h2>
  <p id="dialog-description">Description</p>
  {/* content */}
</div>
```

### Testing Checklist

Before committing changes:

- [ ] All form inputs have associated labels
- [ ] Required fields have `aria-required="true"`
- [ ] Error messages use `role="alert"`
- [ ] Interactive elements use semantic HTML (`<button>`, `<a>`)
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Custom widgets have appropriate ARIA roles
- [ ] Test with keyboard only (Tab, Enter, Space, Escape)
- [ ] Run: `npm run lint` (if eslint-plugin-jsx-a11y is installed)

### Useful Tools

**Browser Extensions:**
- axe DevTools (Chrome/Firefox)
- WAVE Evaluation Tool
- Lighthouse (Chrome DevTools)

**Keyboard Testing:**
- Tab: Move forward through interactive elements
- Shift+Tab: Move backward
- Enter/Space: Activate buttons
- Escape: Close modals/dialogs
- Arrow keys: Navigate within components

**Screen Readers:**
- Windows: NVDA (free)
- Mac: VoiceOver (built-in, Cmd+F5)
- Chrome: ChromeVox extension

### Common Patterns in This App

1. **Form Modal Pattern** (see CreatePlanModal.jsx)
2. **Search with Filters** (see CourseSearch.jsx)
3. **Clickable List Items** (see PlanList.jsx)
4. **Progress Indicators** (see ProgressTracking.jsx)
5. **Tab Navigation** (see AppShell.jsx)

### Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

---

**Remember:** Accessibility is not a one-time task. Every new feature should be accessible from the start.
