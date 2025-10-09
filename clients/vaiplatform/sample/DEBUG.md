# VAI Embed Widget - Debugging Guide

## Issue: Nothing happens when clicking "Book Now"

### Step 1: Check if Tourist App is Running

```bash
# Terminal 1: Start Tourist App
cd /Users/desilva/Desktop/vai-studio-website/tourist-app
npm run dev
```

**Expected output:**
```
  VITE v4.4.5  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Test it:** Open http://localhost:5173 in your browser - you should see the VAI Tourist App.

---

### Step 2: Test with Simple Test Page

```bash
# Terminal 2: Serve sample website
cd /Users/desilva/Desktop/vai-studio-website/clients/vaiplatform/sample
python3 -m http.server 8000
```

**Open:** http://localhost:8000/test.html

**Expected behavior:**
1. ✅ Page loads
2. ✅ Click button
3. ✅ Modal appears
4. ✅ Template page loads in iframe

---

### Step 3: Check Browser Console

**Open Developer Tools:**
- Chrome/Edge: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- Firefox: Press `F12`
- Safari: Enable Developer menu first, then press `Cmd+Option+I`

**Look for these messages:**

**✅ Success:**
```
✅ Test page loaded
📦 Embed widget should load from: http://localhost:5173/src/embed/button/index.js
[VAI Analytics] { event_name: 'embed.widget.loaded', ... }
[VAI Analytics] { event_name: 'embed.modal.opened', ... }
```

**❌ Errors:**
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
→ Tourist App is not running
→ Solution: Run `npm run dev` in tourist-app directory

CORS error: Access to script blocked
→ CORS issue between localhost:8000 and localhost:5173
→ This is expected, continue reading...
```

---

### Step 4: Fix CORS Issue (If Needed)

If you see CORS errors, we need to update Vite config to allow cross-origin requests.

**Edit:** `/tourist-app/vite.config.js`

Add this to the `server` config:
```javascript
server: {
  port: 5173,
  cors: true,  // ← Add this line
  headers: {   // ← Add this block
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
```

Then restart the dev server.

---

### Step 5: Alternative - Use Built Widget

If dev server doesn't work, copy the built widget to the sample directory:

```bash
# Copy built widget
cp /Users/desilva/Desktop/vai-studio-website/tourist-app/dist/embed/button.js \
   /Users/desilva/Desktop/vai-studio-website/clients/vaiplatform/sample/

cp /Users/desilva/Desktop/vai-studio-website/tourist-app/dist/embed/style.css \
   /Users/desilva/Desktop/vai-studio-website/clients/vaiplatform/sample/
```

Then update `test.html`:
```html
<!-- Change this line: -->
<script type="module" src="http://localhost:5173/src/embed/button/index.js"></script>

<!-- To this: -->
<script src="button.js"></script>
```

---

### Step 6: Check Network Tab

1. Open Developer Tools → Network tab
2. Reload the page
3. Look for `index.js` or `button.js` request

**Status codes:**
- `200 OK` ✅ - File loaded successfully
- `404 Not Found` ❌ - File path is wrong
- `ERR_CONNECTION_REFUSED` ❌ - Server not running
- `CORS error` ⚠️ - Need to fix CORS (see Step 4)

---

### Step 7: Check Console for JavaScript Errors

Look for red errors in console:

**Common errors:**

1. **"Cannot read property 'addEventListener' of null"**
   → Button not found with data attributes
   → Check if data-vai-operator and data-vai-template exist

2. **"Failed to fetch"**
   → Network issue, check if Tourist App is running

3. **"Uncaught SyntaxError"**
   → JavaScript error in embed widget code

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Tourist App running at http://localhost:5173
- [ ] Sample website running at http://localhost:8000
- [ ] Browser console open (F12)
- [ ] No CORS errors in console
- [ ] Button has correct data attributes:
  - `data-vai-operator="c78f7f64-cab8-4f48-9427-de87e12ec2b9"`
  - `data-vai-template="db896f3d-da54-4304-bdf4-9a8499c2a7de"`
- [ ] Embed script loads (check Network tab)
- [ ] Analytics event logged: `embed.widget.loaded`

---

## Still Not Working?

Please provide:
1. **Browser console output** (copy all messages)
2. **Network tab screenshot** (showing button.js/index.js request)
3. **Which browser** you're using
4. **Tourist App status** (is it running?)

---

## Expected Analytics Events

When everything works, you should see these events in console:

1. **On page load:**
```javascript
[VAI Analytics] {
  event_name: 'embed.widget.loaded',
  operator_id: 'c78f7f64-cab8-4f48-9427-de87e12ec2b9',
  template_id: 'db896f3d-da54-4304-bdf4-9a8499c2a7de',
  integration_method: 'data-attributes'
}
```

2. **On button click:**
```javascript
[VAI Analytics] {
  event_name: 'embed.modal.opened',
  operator_id: 'c78f7f64-cab8-4f48-9427-de87e12ec2b9',
  template_id: 'db896f3d-da54-4304-bdf4-9a8499c2a7de',
  dark_mode: false,
  theme_color: '#0066cc'
}
```

3. **On booking complete:**
```javascript
[VAI Analytics] {
  event_name: 'embed.booking.completed',
  operator_id: 'c78f7f64-cab8-4f48-9427-de87e12ec2b9',
  template_id: 'db896f3d-da54-4304-bdf4-9a8499c2a7de',
  booking_id: '...'
}
```
