# HTML Sanitization in Recipe Tracker

This project uses DOMPurify for safe HTML parsing to prevent XSS attacks while allowing rich text formatting.

## Available Functions

### `safeParseHtml(html: string, sanitizeOptions?: any)`
Primary function for parsing HTML in components. Sanitizes and converts to React elements.

### `sanitizeHtml(html: string, options?: any)`
Returns sanitized HTML string. Useful for data processing before storage.

### `sanitizeUserContent(html: string)`
More restrictive sanitization for user-generated content (only basic formatting).

### `stripAllHtml(html: string)`
Removes all HTML tags. Use for sensitive contexts like titles.

## Usage Examples

```typescript
import { safeParseHtml, sanitizeUserContent, stripAllHtml } from '@/lib/htmlSanitizer';

// For displaying recipe instructions (allows most formatting)
<div>{safeParseHtml(recipe.instructions)}</div>

// For user comments (restricted formatting only)
<div>{safeParseHtml(comment.content, sanitizeUserContent)}</div>

// For titles/names (no HTML allowed)
const cleanTitle = stripAllHtml(userInput);
```

## Security Features

✅ **XSS Prevention**: Removes dangerous scripts and event handlers
✅ **URL Validation**: Only allows safe protocols (http, https, mailto)
✅ **Attribute Filtering**: Removes dangerous attributes like `onerror`, `onclick`
✅ **Tag Whitelisting**: Only allows safe formatting tags
✅ **SSR Safe**: Falls back to text-only on server side

## Allowed HTML Tags

- Text formatting: `<strong>`, `<em>`, `<u>`, `<b>`, `<i>`
- Structure: `<p>`, `<br>`, `<div>`, `<span>`, `<hr>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Headings: `<h1>` through `<h6>`
- Links: `<a>` (with safe href validation)
- Code: `<code>`, `<pre>`
- Other: `<blockquote>`, `<sup>`, `<sub>`, `<mark>`, `<del>`, `<ins>`

## Blocked Elements

❌ Scripts: `<script>`, `<object>`, `<embed>`, `<iframe>`
❌ Forms: `<form>`, `<input>`, `<textarea>`, `<button>`
❌ Event handlers: `onclick`, `onerror`, `onload`, etc.
❌ Data attributes: `data-*` attributes
❌ Dangerous protocols: `javascript:`, `data:`, etc.
