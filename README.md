# Vai Studio Website

Professional website for Vai Studio - Digital Solutions for French Polynesia.

## 🌐 Live Site
[vai.studio](https://vai.studio)

## 🚀 Technologies
- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript
- Hosted on Render.com

## 📁 Structure
```
vai-studio-website/
├── index.html      # Main HTML structure
├── styles.css      # All styling
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## 🎨 Features
- Responsive design
- Animated glowing frame effect
- Smooth scrolling navigation
- Floating particle effects
- Contact form (ready for backend integration)
- Mobile-optimized

## 🛠️ Local Development
1. Clone this repository
2. Open `index.html` in your browser
3. Make changes and refresh to see updates

## 📧 JotForm Styles (Backup)

/* VAI Studio JotForm Multi-Page CSS - Corrected Selectors */

/* ==============================================
   FORM FOUNDATION & CONTAINER
   ============================================== */

.form-all {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    color: #ffffff !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* ==============================================
   PAGE SECTIONS (Multi-page form)
   ============================================== */

.form-section.page-section {
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 12px !important;
    padding: 1rem !important;
    margin-bottom: 1.5rem !important;
    transition: all 0.3s ease !important;
    min-height: 400px !important;
}

.form-section.page-section:hover {
    border-color: rgba(255, 255, 255, 0.12) !important;
    background: rgba(255, 255, 255, 0.03) !important;
}

/* ==============================================
   FORM HEADER & TITLE
   ============================================== */

.form-header {
    background: transparent !important;
    border: none !important;
    text-align: center !important;
    margin-bottom: 2rem !important;
    padding: 0 !important;
}

.form-header h1,
.form-header .form-header-group h1 {
    color: #ffffff !important;
    font-size: 1.4rem !important;
    font-weight: 700 !important;
    margin: 0 0 0.8rem 0 !important;
    line-height: 1.3 !important;
    background: linear-gradient(135deg, #00d4ff 0%, #ff006e 100%) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
}

.form-header .form-subHeader {
    color: rgba(255, 255, 255, 0.8) !important;
    font-size: 0.9rem !important;
    line-height: 1.5 !important;
    margin: 0 !important;
}

/* ==============================================
   FORM LINES & INPUTS
   ============================================== */

.form-line {
    padding: 0.8rem 0 !important;
    margin: 0 !important;
    border: none !important;
}

.form-input,
.form-input-wide {
    width: 100% !important;
}

/* ==============================================
   LABELS
   ============================================== */

.form-label,
.form-label-top,
.form-label-left {
    color: #ffffff !important;
    font-weight: 600 !important;
    font-size: 0.95rem !important;
    margin-bottom: 0.6rem !important;
    line-height: 1.4 !important;
    font-size: 1rem !important;
    margin-bottom: 0.8rem !important;
}

.form-required {
    color: #ff4757 !important;
}

.form-sub-label {
    color: rgba(255, 255, 255, 0.7) !important;
    font-size: 0.8rem !important;
    margin-top: 0.3rem !important;
}

/* ==============================================
   INPUT FIELDS
   ============================================== */

.form-textbox,
.form-textarea,
.form-dropdown,
input[type="text"],
input[type="email"], 
textarea,
select {
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 8px !important;
    color: #ffffff !important;
    padding: 0.8rem 1rem !important;
    font-size: 0.9rem !important;
    font-family: inherit !important;
    transition: all 0.3s ease !important;
    width: 100% !important;
    box-sizing: border-box !important;
    -webkit-text-fill-color: #ffffff !important;
    height:auto !important;
  
}

.form-textbox:focus,
.form-textarea:focus,
.form-dropdown:focus,
input:focus,
textarea:focus {
    background: rgba(255, 255, 255, 0.12) !important;
    border-color: #00d4ff !important;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.2) !important;
    outline: none !important;
}

.form-textbox::placeholder,
.form-textarea::placeholder,
input::placeholder,
textarea::placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
}

/* ==============================================
   DROPDOWN STYLING
   ============================================== */

.form-dropdown,
select {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
    background-repeat: no-repeat !important;
    background-position: right 12px center !important;
    background-size: 16px !important;
    padding-right: 40px !important;
}

/* ==============================================
   RADIO BUTTONS & CHECKBOXES
   ============================================== */

.form-radio-item,
.form-checkbox-item {
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 8px !important;
    padding: 0.8rem !important;
    margin-bottom: 0.6rem !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
}

.form-radio-item:hover,
.form-checkbox-item:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: rgba(0, 212, 255, 0.3) !important;
    transform: translateY(-1px) !important;
}

.form-radio-item label,
.form-checkbox-item label {
    color: #ffffff !important;
    font-size: 0.9rem !important;
    cursor: pointer !important;
    font-weight: 500 !important;
}

.form-radio-item input:checked + label,
.form-checkbox-item input:checked + label {
    color: #00d4ff !important;
    font-weight: 600 !important;
}

.form-checkbox-item label:before
{
    background: transparent !important;
    border-style: solid;
    border:1px solid rgba(255, 255, 255, 0.15) !important;
}


/* ==============================================
   PAGE BREAK NAVIGATION BUTTONS
   ============================================== */

.form-pagebreak-next.jf-form-buttons,
.form-pagebreak-back.jf-form-buttons {
    text-align: center !important;
    margin: 2rem 0 !important;
    padding: 1rem 0 !important;
}

.form-pagebreak-next-container,
.form-pagebreak-back-container {
    display: inline-block !important;
    margin: 0 0.5rem !important;
}

/* Next Button */
.form-pagebreak-next,
button[type="button"].form-pagebreak-next {
    background: linear-gradient(135deg, #00d4ff 0%, #ff006e 100%) !important;
    border: none !important;
    border-radius: 12px !important;
    color: white !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
    padding: 1rem 2rem !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    min-width: 120px !important;
}

.form-pagebreak-next:hover,
button[type="button"].form-pagebreak-next:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3) !important;
}

/* Back Button */
.form-pagebreak-back,
button[type="button"].form-pagebreak-back {
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 12px !important;
    color: #d0d0d0 !important;
    font-weight: 500 !important;
    font-size: 1rem !important;
    padding: 0.8rem 1.5rem !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    min-width: 120px !important;
}

.form-pagebreak-back:hover,
button[type="button"].form-pagebreak-back:hover {
    background: rgba(255, 255, 255, 0.12) !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
    transform: translateY(-1px) !important;
}

.form-pagebreak {
    border-color: transparent !important;
}

/* ==============================================
   SUBMIT BUTTON (Final Page)
   ============================================== */

.form-submit-button,
input[type="submit"],
button[type="submit"] {
    background: linear-gradient(135deg, #00d4ff 0%, #ff006e 100%) !important;
    border: none !important;
    border-radius: 12px !important;
    color: white !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
    padding: 1rem 2rem !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    width: 100% !important;
    max-width: 280px !important;
    margin: 2rem auto 0 auto !important;
    display: block !important;
}

.form-submit-button:hover,
input[type="submit"]:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3) !important;
}

/* ==============================================
   PROGRESS BAR
   ============================================== */

.form-pagebreak-progress {
    background: rgba(255, 255, 255, 0.1) !important;
    border-radius: 10px !important;
    height: 6px !important;
    overflow: hidden !important;
    margin: 1rem 0 2rem 0 !important;
    width: 100% !important;
}

.form-pagebreak-progress-bar {
    background: linear-gradient(135deg, #00d4ff 0%, #2ed573 100%) !important;
    height: 100% !important;
    border-radius: 10px !important;
    transition: width 0.5s ease !important;
}

/* ==============================================
   ERROR HANDLING
   ============================================== */


.form-line-error .form-textbox,
.form-line-error .form-textarea,
.form-line-error .form-dropdown {
    background: transparent !important;
    color: #ff4757 !important;
}

/* ==============================================
   CONDITIONAL LOGIC MESSAGES
   ============================================== */

.form-description,
.form-text {
    background: rgba(0, 212, 255, 0.08) !important;
    border: 1px solid rgba(0, 212, 255, 0.2) !important;
    border-radius: 8px !important;
    padding: 0.8rem !important;
    color: #00d4ff !important;
    font-size: 0.85rem !important;
    margin: 0.5rem 0 !important;
    line-height: 1.5 !important;
}



/* ==============================================
   JOTFORM FOOTER
   ============================================== */

.form-footer {
    opacity: 0.6 !important;
    margin-top: 2rem !important;
    text-align: center !important;
}

.form-footer a {
    color: rgba(255, 255, 255, 0.5) !important;
    font-size: 0.8rem !important;
}

/* ==============================================
   FINAL OVERRIDES
   ============================================== */

.form-all * {
    color: inherit !important;
}

.form-all input,
.form-all textarea,
.form-all select {
    -webkit-appearance: none !important;
    -webkit-text-fill-color: #ffffff !important;
}

.form-all *,
.form-all *::before,
.form-all *::after {
    box-sizing: border-box !important;
}
