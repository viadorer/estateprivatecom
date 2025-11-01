# ComplianceNotice Component Usage

The `ComplianceNotice` component provides a reusable legal statement for electronically signed documents across the Estate Private platform.

## Location
- File: `frontend/src/components/ComplianceNotice.jsx`

## Purpose
Displays compliance information referencing EU regulation eIDAS and Czech law 297/2016 Sb., emphasizing the legal validity of documents signed through Estate Private.

## Usage
Import the component where legal notice is needed (e.g. signed documents list, audit detail modals):

```jsx
import ComplianceNotice from './ComplianceNotice'

<ComplianceNotice className="mb-6" />
```

### Props
- `className` *(optional)*: additional Tailwind classes for outer container.

## Integration Points
- `SignedDocuments` component: notice shown above the list of signed agreements.
- Can be reused in audit detail views, LOI confirmation dialogs, or email templates preview.

## Text Customization
If the legal basis changes (e.g. different trust service provider), update the text in `ComplianceNotice.jsx`. Ensure marketing/legal team approves wording before modifying.

## Notes
- For higher assurance, consider referencing specific provider (e.g. I.CA) if integrated.
- QR code or verification link can be added later inside the component.
