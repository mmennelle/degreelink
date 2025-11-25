# Advisor Guide - Degree Link System

**For Academic Advisors**  
*Last Updated: November 25, 2025*

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Signing In](#signing-in)
3. [Managing Program Requirements](#managing-program-requirements)
4. [Working with Student Plans](#working-with-student-plans)
5. [Security & Best Practices](#security--best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What is Degree Link?

Degree Link is a system that helps you:
- **Manage program requirements** - Upload and maintain degree requirements for all programs
- **Track student progress** - View how students are progressing toward their degrees
- **Validate course selections** - Check if students meet prerequisites and constraints
- **Advise on course planning** - Help students choose courses that fit their degree path

### Who Can Use It?

Academic advisors with whitelisted university email addresses have full administrative privileges to:
- Upload and modify program requirements
- Manage course catalogs and equivalencies
- Add other advisors to the whitelist
- Access all student plans via shared codes

---

## Signing In

### First-Time Setup

1. **Open Degree Link** at dlink.cs.uno.edu
2. **Click the Settings icon** in the top-right corner
3. **Enter your university email** (must be whitelisted by another advisor)
4. **Click "Request Code"**
5. **Download an authenticator app** if you don't have one:
   - Google Authenticator (iOS/Android)
   - Authy (iOS/Android/Desktop)
   - Microsoft Authenticator (iOS/Android)
   - 1Password, Bitwarden, or any TOTP-compatible app
6. **Scan the QR code** that appears with your authenticator app
7. **Enter the 6-digit code** from your authenticator app
8. **Click "Sign In"**

Your authenticator app will now generate a new 6-digit code every 30 seconds for signing in.

### Signing In (After Setup)

1. **Click the Settings icon**
2. **Enter your university email**
3. **Click "Request Code"**
4. **Open your authenticator app** and find the Degree Link entry
5. **Enter the current 6-digit code**
6. **Click "Sign In"**

Your session will remain active for **1 hour**. After that, you'll need to sign in again.

### Lost Your Phone / New Device?

If you lose access to your authenticator app:

1. **Sign in on a device where you still have access**
2. **Click the Settings icon**
3. **Enter your email and request a code**
4. **Click "Regenerate TOTP Secret"** (appears below the sign-in button)
5. **Scan the new QR code** with your authenticator app on the new device

**Note:** Regenerating your secret will invalidate the old one - make sure to scan the new QR code immediately.

---

## Managing Program Requirements

### Accessing Admin Features

Once signed in as an advisor, you'll see additional tabs:
- **Upload** - Upload CSV files for courses, equivalencies, and program requirements
- **App Settings** - Manage the advisor whitelist (add/remove advisors)

### Adding Another Advisor

1. **Sign in as an advisor**
2. **Navigate to "App Settings"** tab
3. **Enter the advisor's university email address**
4. **Click "Add Advisor"**

The new advisor can now complete their first-time TOTP setup.

### Uploading Program Requirements

For detailed instructions on uploading and managing program requirements, see:
- **[User Guide - Program Requirements](USER_GUIDE_PROGRAM_REQUIREMENTS.md)**

Quick overview:
1. Navigate to the **Upload** tab
2. Select **"Program Requirements"** from the dropdown
3. Upload your CSV file (see User Guide for format)
4. Review the preview of changes
5. Edit requirements directly if needed
6. Confirm upload

### Managing Existing Requirements

You can edit requirements directly in the web interface:
- **Add courses** to requirement groups
- **Remove courses** from groups
- **Modify constraints** (credit requirements, course counts, etc.)
- **Update categories** and group names
- **Delete entire requirements**

No need to re-upload CSV files for small changes!

---

## Working with Student Plans

### Accessing Student Plans

Students create degree plans and receive an 8-character plan code. To view a student's plan:

1. **Get the plan code** from the student (e.g., `ABC12345`)
2. **Enter the code** in the plan access field
3. **View their progress** toward degree requirements

### What You Can See

When viewing a student plan, you'll see:
- **All courses** in their plan, organized by semester
- **Progress bars** showing completion of each requirement category
- **Constraint validation** (credit requirements, course counts, etc.)
- **Satisfied/unsatisfied indicators** for each requirement
- **Prerequisite warnings** if courses are taken out of order

### Helping Students Plan

You can help students by:
- **Identifying missing requirements** using the progress tracking
- **Checking prerequisite chains** for planned courses
- **Suggesting courses** that meet unsatisfied constraints
- **Validating** that their plan meets all degree requirements

**Note:** Students control their own plans. You can view and advise, but they make the changes.

---

## Security & Best Practices

### Protecting Your Account

**DO:**
- Keep your authenticator app on a secure device
- Sign out when using shared computers
- Use a secure authenticator app (Google Authenticator, Authy, etc.)
- Regenerate your TOTP secret if you suspect compromise

**DON'T:**
- Share your 6-digit codes with anyone
- Screenshot your QR code during setup
- Use authenticator apps on rooted/jailbroken devices
- Sign in on public/untrusted computers

### Whitelist Management

When adding advisors to the whitelist:
- **Verify the email address** belongs to a legitimate advisor
- **Use official university email addresses only**
- **Remove advisors** who no longer need access
- **Check the whitelist regularly** for unauthorized additions

### Session Management

- Sessions expire after **1 hour of inactivity**
- You'll be automatically signed out when your session expires
- Sign in again to continue working
- No limit on how many times you can sign in

---

## Troubleshooting

### "Invalid code" Error

**Problem:** The 6-digit code isn't working  
**Solutions:**
- Make sure you're using the **current code** (they change every 30 seconds)
- Check your device's **time/date settings** (TOTP requires accurate time)
- Try the **next code** if you're near the 30-second boundary
- Make sure you're using the code for **Degree Link** (not another service)

### "Email not whitelisted" Error

**Problem:** Your email isn't in the system  
**Solutions:**
- Contact another advisor to add your email to the whitelist
- Verify you're using your **official university email**
- Check for typos in the email address

### QR Code Won't Scan

**Problem:** Your authenticator app can't read the QR code  
**Solutions:**
- Adjust your screen brightness (too dim can cause issues)
- Try the **manual entry option** - enter the secret key shown below the QR code
- Use a different authenticator app
- Take a screenshot and import it into your authenticator app

### Session Expired

**Problem:** You're signed out unexpectedly  
**Solutions:**
- This is normal after 1 hour of inactivity
- Sign in again using your authenticator app code
- Your work is automatically saved, so you won't lose progress

### Lost Access to Authenticator

**Problem:** Your phone is lost/broken/reset  
**Solutions:**
1. If you have access from another device, sign in and regenerate your TOTP secret
2. If you can't sign in anywhere, contact another advisor to temporarily remove you from the whitelist
3. Have them re-add your email, then complete first-time setup again on your new device

### Can't Access App Settings Tab

**Problem:** The App Settings tab isn't showing  
**Solutions:**
- Make sure you're signed in as an advisor (not just browsing as a student)
- Check that your session hasn't expired
- Refresh the page
- If still not showing, contact a system administrator (your account may not have proper privileges)

---

## Getting Help

### Documentation Resources

- **[User Guide - Program Requirements](USER_GUIDE_PROGRAM_REQUIREMENTS.md)** - Detailed CSV upload guide
- **[CSV Format Specification](UNIFIED_CSV_FORMAT.md)** - Technical format details
- **[Current System Status](CURRENT_SYSTEM_STATUS.md)** - System overview and features

### Technical Support

For technical issues or questions:
- **Contact:** UNO Computer Science Department
- **Email:** Your department's IT support
- **Production URL:** dlink.cs.uno.edu

### Feature Requests

Have ideas for improvements? Contact the development team to discuss new features or enhancements.

---

## Quick Reference

### Authentication
- **Session Duration:** 1 hour
- **Code Format:** 6 digits, changes every 30 seconds
- **Setup:** One-time QR code scan
- **Reset:** Regenerate TOTP secret

### Admin Privileges
- Upload program requirements
- Manage course catalogs
- Add/remove advisors from whitelist
- View all student plans (with plan codes)

### Common Tasks
- **Sign In:** Settings icon → Email → Authenticator code
- **Add Advisor:** App Settings → Enter email → Add Advisor
- **Upload Requirements:** Upload tab → Select type → Choose file → Confirm
- **View Student Plan:** Enter 8-character plan code
- **Regenerate TOTP:** Sign in → Request code → Regenerate TOTP Secret

---

*For technical implementation details, see: ADVISOR_AUTH_IMPLEMENTATION.md*
