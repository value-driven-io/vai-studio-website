# 🧪 Testing the VAI Embed Widget

## Quick Fix Applied ✅

**Issues fixed:**
1. ✅ Updated port from 5173 → 3001
2. ✅ Added CORS support to Vite config
3. ✅ Created simple test page

---

## Step-by-Step Testing

### Step 1: Restart Tourist App

**IMPORTANT:** You need to restart the Tourist App to apply CORS changes.

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
cd /Users/desilva/Desktop/vai-studio-website/tourist-app
npm run dev
```

**Expected output:**
```
  VITE v4.4.5  ready in XXX ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: http://192.168.X.X:3001/
```

**✅ Verify:** Open http://localhost:3001 - should see VAI Tourist App

---

### Step 2: Serve Sample Website

```bash
# In a NEW terminal window:
cd /Users/desilva/Desktop/vai-studio-website/clients/vaiplatform/sample
python3 -m http.server 8000
```

**Expected output:**
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

---

### Step 3: Open Test Page

**Open in your browser:**
```
http://localhost:8000/test.html
```

---

### Step 4: Test the Button

1. **Open Developer Console** (Press F12)
2. **Click the blue "Book 'Dive with the Turtles'" button**

**✅ Expected behavior:**
1. Modal overlay appears (dark background)
2. Template page loads in modal
3. You can see the tour details and available dates
4. Console shows analytics events

**Example console output:**
```
✅ Test page loaded
📦 Embed widget should load from: http://localhost:3001/src/embed/button/index.js
[VAI Analytics] {event_name: 'embed.widget.loaded', ...}
[VAI Analytics] {event_name: 'embed.modal.opened', ...}
```

---

### Step 5: Close the Modal

Try all 3 methods:
1. ✅ Click the **X button** (top right)
2. ✅ Click the **dark overlay** (outside modal)
3. ✅ Press **Escape key**

All should close the modal.

---

## 🐛 Still Not Working?

### Check Browser Console

**Look for errors:**

**❌ "Failed to load resource: net::ERR_CONNECTION_REFUSED"**
- Tourist App is not running
- Solution: Run `npm run dev` in tourist-app directory

**❌ "CORS error"**
- Vite changes not applied
- Solution: Restart Tourist App dev server (Ctrl+C, then npm run dev again)

**❌ "Cannot read property 'addEventListener' of null"**
- Button element not found
- Solution: Check if button has data-vai-operator and data-vai-template attributes

---

### Check Network Tab

1. Open Developer Tools → Network tab
2. Reload page
3. Look for `index.js` request

**Status codes:**
- ✅ **200** - Widget loaded successfully
- ❌ **404** - File not found (wrong path)
- ❌ **CORS error** - Need to restart Tourist App

---

## 📸 What Should You See?

### Before Clicking Button:
- Simple test page with blue button
- Console shows "Test page loaded" message

### After Clicking Button:
- **Modal appears** (full screen dark overlay)
- **Template page loads** inside modal (shows tour details)
- **Console shows** 2-3 analytics events
- **Close button visible** (top right, circular, blue)

### When Template Loads:
- Tour title: "Dive with the Turtles"
- Location: Tahiti
- Duration: 6 hours
- Available dates/schedules
- "Book Now" buttons for each date

---

## ✅ Success Checklist

- [ ] Tourist App running at http://localhost:3001
- [ ] Sample website running at http://localhost:8000
- [ ] Test page loads (http://localhost:8000/test.html)
- [ ] Console shows "embed.widget.loaded" event
- [ ] Clicking button opens modal
- [ ] Console shows "embed.modal.opened" event
- [ ] Template page visible in modal
- [ ] Can close modal (X button / overlay / Escape)

---

## 🎉 Next Steps

Once this works, you can test the full sample website:

**Open:** http://localhost:8000/index.html

This has 4 different tours, each with:
- Different template IDs
- Different theme colors
- Same embed widget functionality

---

## 💡 Production Deployment

When ready for production:

1. Build the embed widget:
   ```bash
   npm run build:embed
   ```

2. Deploy `dist/embed/button.js` to:
   ```
   https://embed.vai.studio/button.js
   ```

3. Operators use this script tag:
   ```html
   <script src="https://embed.vai.studio/button.js"></script>
   ```

4. Update CONFIG in embed widget:
   ```javascript
   iframeBaseUrl: 'https://tourist.vai.studio'
   ```

---

**Questions?** Check DEBUG.md or open browser console for error messages.
