# Account Setup Demo Site

This is a rebuilt version of the account setup page that you can modify as a live mockup.

## Files
- `index.html` - Main HTML structure
- `styles.css` - CSS styling with GeistSans font
- `script.js` - Interactive JavaScript functionality

## To run locally:

1. Navigate to this directory:
   ```bash
   cd /home/bth/ntb
   ```

2. Start a local web server:
   ```bash
   python3 -m http.server 8080
   ```

3. Open your browser and go to:
   ```
   http://localhost:8080
   ```

## Features
- **Navigation-friendly sidebar** with expandable household members
- **Member-specific forms** - Click on household members to view their details
- **Owner Details vs Firm Details** - Each member has expandable sections for different data types
- Responsive design that works on desktop and mobile
- Form validation and auto-formatting
- File upload with drag-and-drop
- Auto-save functionality
- Tab navigation between form sections
- Real-time form switching with visual notifications

## Navigation Features
- **Smith Family Household** header with expandable member sections
- **Household Members**: John Smith, Mary Smith, Smith Family Trust
- Each member expands to show:
  - **Owner Details** - Personal information, contact details, employment
  - **Firm Details** - Business information, tax details, incorporation data
- Active member/section highlighting
- Smooth expand/collapse animations
- Auto-populated form data for each member

## Making Modifications
You can edit any of the three main files to customize the site:
- Edit `index.html` for structure changes
- Edit `styles.css` for styling changes  
- Edit `script.js` for functionality changes

The server will serve the updated files immediately after you save them.