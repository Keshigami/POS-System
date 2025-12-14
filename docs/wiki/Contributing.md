# Contributing

Thank you for your interest in contributing to the POS System! This guide will help you get started.

## 🤝 Ways to Contribute

### 1. Report Bugs 🐛

Found a bug? Help us fix it!

**Before Reporting:**

- Search [existing issues](https://github.com/Keshigami/POS-System/issues) to avoid duplicates
- Verify it's reproducible on the latest version

**How to Report:**

1. Go to [GitHub Issues](https://github.com/Keshigami/POS-System/issues/new)
2. Choose "Bug Report" template
3. Include:
   - Clear title (e.g., "Cart total incorrect when discount applied")
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots or screen recordings
   - Environment (OS, browser, Node version)
   - Console errors (F12 → Console tab)

**Example:**

```markdown
## Bug Description
Senior Citizen discount not applying correctly on packages

## Steps to Reproduce
1. Add "Breakfast Combo" package to cart
2. Select "Senior Citizen" discount
3. Click "Charge"

## Expected
20% discount + VAT exemption applied to ₱120 package

## Actual
Only 20% discount applied, VAT still charged

## Environment
- OS: macOS 14.1
- Browser: Chrome 120
- Node: v18.17.0
```

### 2. Suggest Features 💡

Have an idea? We'd love to hear it!

**Before Suggesting:**

- Check the [Roadmap](Roadmap) to see if it's already planned
- Search [GitHub Discussions](https://github.com/Keshigami/POS-System/discussions)

**How to Suggest:**

1. Go to [GitHub Discussions](https://github.com/Keshigami/POS-System/discussions/new)
2. Choose "Feature Request" category
3. Include:
   - Clear description of the feature
   - Use case (why it's needed)
   - Potential implementation approach
   - Any examples from other systems

### 3. Contribute Code 👨‍💻

Ready to code? Follow these steps:

#### Setup Development Environment

1. **Fork the repository**
   - Click "Fork" on GitHub
   - Clone your fork:

     ```bash
     git clone https://github.com/YOUR_USERNAME/POS-System.git
     cd POS-System/pos-app
     ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup database**

   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Code Guidelines

**File Naming:**

- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)
- API routes: `route.ts` in appropriate folders

**Code Style:**

- Use TypeScript for all new code
- Follow existing code formatting
- Use Prettier for formatting (run `npm run format` if available)
- Write meaningful variable names

**Component Structure:**

```typescript
// Good
export function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="rounded-lg border p-4">
      {/* component content */}
    </div>
  );
}

// Avoid
export const ProductCard = (props) => {
  return <div>{props.name}</div>;
}
```

**API Routes:**

- Use proper HTTP methods (GET, POST, PATCH, DELETE)
- Return consistent JSON responses
- Handle errors gracefully

**Example API Route:**

```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
```

#### Commit Guidelines

**Commit Message Format:**

```
type: brief description

Longer explanation if needed
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat: add barcode scanning to product entry
fix: correct VAT calculation for discounted items
docs: update installation guide with Windows steps
refactor: extract receipt logic into separate service
```

#### Submit Pull Request

1. **Push your changes**

   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill in the PR template:
     - **Title**: Clear, descriptive
     - **Description**: What does this PR do?
     - **Related Issue**: Link to issue if applicable
     - **Screenshots**: For UI changes
     - **Testing**: How did you test it?

3. **Address Review Feedback**
   - Respond to comments
   - Make requested changes
   - Push updates to the same branch

### 4. Improve Documentation 📚

Documentation is crucial! You can help by:

- **Fixing typos** in README or Wiki
- **Adding examples** to guides
- **Creating tutorials** or video walkthroughs
- **Translating** to other languages (Tagalog, Cebuano, etc.)

**How to Contribute Docs:**

- Wiki pages are in `/wiki` folder
- Edit markdown files and submit PR
- Follow markdown formatting guidelines

### 5. Test & Provide Feedback 🧪

Help ensure quality:

- Test new releases
- Try edge cases
- Report unexpected behavior
- Share your experience using the system

### 6. Spread the Word 💬

Non-code contributions matter too!

- ⭐ **Star the repository**
- 🐦 **Share on social media**
- 📝 **Write blog posts** about your experience
- 🎤 **Present** at local tech meetups
- 💼 **Recommend** to Philippine SMEs

---

## Development Workflow

### Branching Strategy

- `main` - Stable, production-ready code
- `develop` - Latest development changes (if exists)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Testing (When Available)

```bash
npm test          # Run all tests
npm test:watch    # Run tests in watch mode
npm test:coverage # Generate coverage report
```

> [!NOTE]
> Comprehensive testing suite coming soon in Phase 3!

### Local Database Management

```bash
# View database in GUI
npx prisma studio

# Reset database
rm prisma/dev.db
npx prisma db push
npx prisma db seed

# Generate Prisma Client after schema changes
npx prisma generate
```

---

## Code of Conduct

### Our Standards

- ✅ Be respectful and inclusive
- ✅ Welcome newcomers
- ✅ Accept constructive criticism
- ✅ Focus on what's best for the community
- ❌ No harassment, trolling, or spam
- ❌ No inappropriate content

### Enforcement

Violations may result in:

1. Warning
2. Temporary ban from project
3. Permanent ban for severe cases

Report issues to the project maintainers.

---

## Recognition

### Contributors

All contributors are recognized in:

- GitHub contributors list
- Future CONTRIBUTORS.md file
- Special mentions in release notes

### Types of Contributions

We value **all** contributions equally:

- 🔧 Code
- 📖 Documentation
- 🐛 Bug reports
- 💡 Feature ideas
- 🎨 Design
- 🌏 Translations
- 📣 Community support

---

## Questions?

- 💬 Ask in [GitHub Discussions](https://github.com/Keshigami/POS-System/discussions)
- 📖 Read the [Wiki](Home)
- 🐛 Check [Troubleshooting](Troubleshooting)

---

## Legal

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Ready to contribute?** Pick an issue, fork the repo, and start coding! 🚀

Thank you for making the POS System better for the Philippine SME community! 🇵🇭
