# Troubleshooting & FAQ

Common issues, solutions, and frequently asked questions about the POS System.

## Common Issues

### Installation Problems

#### `npm install` fails

**Error**: Dependencies not installing

**Solutions**:

1. Check Node.js version: `node --version` (must be 18+)
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and `package-lock.json`, then retry:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

#### Prisma database errors

**Error**: `Can't reach database server` or migration failures

**Solutions**:

1. Delete and recreate database:

   ```bash
   rm prisma/dev.db
   npx prisma db push
   npx prisma db seed
   ```

2. Check file permissions on `prisma/` directory
3. Ensure SQLite is supported on your OS

#### Port 3000 already in use

**Error**: `Port 3000 is already in use`

**Solutions**:

1. Run on different port:

   ```bash
   PORT=3001 npm run dev
   ```

2. Find and kill the process:

   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

---

### Functional Issues

#### Products not appearing in POS

**Possible Causes**:

- Database not seeded
- Products have zero stock
- Category filter active

**Solutions**:

1. Check inventory page to verify products exist
2. Run seed again: `npx prisma db seed`
3. Check stock levels are > 0

#### Discounts not calculating correctly

**Issue**: Senior Citizen / PWD discount not applying

**Solutions**:

1. Verify discount is selected before checkout
2. Check that cart has items
3. Review VAT calculation logic in receipt component

#### Smart Suggestions not working

**Issue**: AI recommendations not appearing

**Solutions**:

1. Ensure cart has items
2. Check that other products exist in database
3. Verify recommendation rules are seeded

#### Receipt not printing

**Issue**: Receipt dialog appears but doesn't print

**Solutions**:

1. Use browser's print function (Ctrl/Cmd + P)
2. Check printer is connected and set as default
3. Try "Save as PDF" option instead

---

### Payment Integration Issues

#### E-wallet payments not processing

**Issue**: GCash or Maya integration failing

**Possible Causes**:

- Invalid API keys
- Wrong environment (Sandbox vs Live)
- Network connectivity

**Solutions**:

1. Verify API keys in Settings
2. Confirm you're using correct environment (Sandbox for testing)
3. Check console for error messages
4. Test with mock/test credentials first

#### Payment gateway toggle not working

**Issue**: Can't enable/disable payment gateways

**Solutions**:

1. Ensure you're on Settings page
2. Check that API keys are entered before toggling
3. Clear browser cache and reload

---

## Frequently Asked Questions

### General

#### Q: Is this free to use?

**A**: Yes, the POS System is completely open-source and free for personal and commercial use.

#### Q: Do I need internet connection?

**A**: For basic POS operations (sales, inventory), **no internet is required**. Internet is only needed for:

- Payment gateway integrations (GCash, Maya)
- Delivery platform integrations
- Downloading updates

#### Q: Can I use this on a tablet or phone?

**A**: Yes, the system is responsive. However:

- **Tablets** (10"+): Full functionality, recommended
- **Phones**: Limited usability due to screen size, not recommended for cashier use

#### Q: What browsers are supported?

**A**: Modern browsers including:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

### Business & Compliance

#### Q: Is this BIR-compliant?

**A**: The system generates BIR-compliant receipts with required tax information. However, **you must still**:

- Register your business with BIR
- Obtain a TIN
- File required tax returns
- Keep records for 5 years

See [BIR Compliance](BIR-Compliance) for details.

#### Q: Can multiple people use this simultaneously?

**A**: Currently, the system supports **single-user access** (one cashier terminal). Multi-user support is planned for Phase 4 (Cloud & Multi-Location).

#### Q: How do I backup my data?

**A**: Your data is stored in `prisma/dev.db`. To backup:

```bash
# Create backup
cp prisma/dev.db prisma/backup_$(date +%Y%m%d).db

# Restore from backup
cp prisma/backup_20250101.db prisma/dev.db
```

> [!TIP]
> Set up automated daily backups using cron jobs or scheduled tasks.

#### Q: Can I customize receipts?

**A**: Yes, edit `components/Receipt.tsx` to modify:

- Layout and styling
- Additional fields
- Logo or branding

---

### Features

#### Q: How do I add my own logo?

**A**: Replace `/public/logo.png` with your logo image (recommended size: 200x200px).

#### Q: Can I change the currency from PHP?

**A**: Yes, edit the currency symbol in:

1. Receipt component
2. Product display components
3. Any hardcoded "₱" symbols

#### Q: How many products can I add?

**A**: SQLite can handle **millions of records**. For typical SME use (100-1000 products), performance is excellent.

#### Q: Can I track employee sales?

**A**: Currently, transactions are linked to the logged-in user (PIN). You can:

- Create multiple user accounts (requires code changes)
- Export transactions and filter by user in spreadsheet

Multi-user support is planned for future releases.

---

### Technical

#### Q: Can I use PostgreSQL instead of SQLite?

**A**: Yes, Prisma supports multiple databases. Update `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then migrate your data.

#### Q: How do I deploy to production?

**A**: See the [Deployment Guide](Deployment-Guide) (coming soon). Quick overview:

```bash
npm run build
npm start
```

#### Q: Can I add my own features?

**A**: Absolutely! Fork the repository, make changes, and submit a pull request. See [Contributing](Contributing).

#### Q: Is there an API for third-party integrations?

**A**: Yes, all backend functionality is exposed via API routes in `/app/api/`. See [API Documentation](API-Documentation).

---

## Error Messages

### Common Errors and Fixes

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| `Prisma Client is not ready` | Database connection issue | Run `npx prisma generate` |
| `Invalid PIN` | Wrong login credentials | Use default PIN `1234` or reset database |
| `Product out of stock` | Inventory depleted | Restock product in Inventory page |
| `Cannot find module` | Missing dependency | Run `npm install` |
| `Network request failed` | API call issue | Check console, verify endpoint exists |

---

## Performance Issues

### Slow Load Times

**Possible Causes**:

- Large database (thousands of products)
- Outdated browser
- Low device resources

**Solutions**:

1. Optimize database (remove old transactions)
2. Update browser to latest version
3. Use higher-spec device for cashier terminal

### Lag when adding to cart

**Possible Causes**:

- Too many products rendered
- AI recommendations taking time

**Solutions**:

1. Implement pagination for product grid
2. Reduce number of AI suggestions
3. Clear browser cache

---

## Getting More Help

### Before Asking for Help

1. ✅ Check this troubleshooting page
2. ✅ Search [GitHub Issues](https://github.com/Keshigami/POS-System/issues)
3. ✅ Check browser console for errors (F12 → Console tab)

### How to Report a Bug

When opening an issue, include:

- **Steps to reproduce**: What did you do?
- **Expected behavior**: What should happen?
- **Actual behavior**: What actually happened?
- **Screenshots**: If applicable
- **Environment**: OS, browser, Node version
- **Console errors**: Any error messages

### Community Support

- 💬 [GitHub Discussions](https://github.com/Keshigami/POS-System/discussions): Ask questions
- 🐛 [GitHub Issues](https://github.com/Keshigami/POS-System/issues): Report bugs
- 📖 [Wiki](Home): Full documentation

---

**Still stuck?** Open an issue with detailed information and we'll help you out! 🚀
