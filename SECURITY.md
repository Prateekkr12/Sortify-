# Security Guidelines

## 🔒 Protecting Sensitive Information

This document outlines security best practices to prevent committing secrets and sensitive data to the repository.

## ❌ NEVER Commit These

- **API Keys** (Google OAuth, AWS, etc.)
- **Database Credentials** (MongoDB connection strings, passwords)
- **JWT Secrets** and authentication tokens
- **Private Keys** (SSH, SSL certificates)
- **Passwords** of any kind
- **Personal Access Tokens**
- **Service Account Keys**

## ✅ How to Handle Secrets

### 1. Use Environment Variables

All sensitive configuration should be stored in environment variables, not hardcoded in files.

**✅ GOOD:**
```javascript
const mongoUri = process.env.MONGO_URI;
```

**❌ BAD:**
```javascript
const mongoUri = 'mongodb+srv://username:password@cluster.mongodb.net';
```

### 2. Use .env Files (Local Development)

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Fill in your actual credentials in `.env`
3. The `.env` file is automatically ignored by git
4. **Never commit `.env` files**

### 3. Docker Compose

For docker-compose, use environment variable substitution:

```yaml
environment:
  - MONGO_URI=${MONGO_URI}
  - JWT_SECRET=${JWT_SECRET}
```

Then load from `.env`:
```bash
docker-compose --env-file .env up
```

### 4. Production

For production environments:
- Use your platform's secret management (AWS Secrets Manager, Azure Key Vault, etc.)
- Use environment variables in your deployment platform
- Never commit production secrets

## 🔍 Pre-Commit Checklist

Before committing code, always check:

- [ ] No hardcoded passwords or API keys
- [ ] No database connection strings with credentials
- [ ] No JWT secrets in code
- [ ] All sensitive values use environment variables
- [ ] `.env` file is in `.gitignore`
- [ ] Documentation doesn't contain actual credentials (only placeholders)

## 🛡️ Git Hooks (Recommended)

Consider setting up pre-commit hooks to automatically scan for secrets:

```bash
# Install git-secrets (Mac/Linux)
brew install git-secrets

# Install truffleHog or similar tools
pip install truffleHog
```

## 🚨 If You Accidentally Commit Secrets

1. **IMMEDIATE**: Rotate/change the exposed credentials
2. Remove the file from git history using:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
   Or use tools like [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
3. Force push (⚠️ only if private repo and team is aware)
4. Consider making the repository private if public

## 📝 Files That Should Be Tracked

- `env.example` or `.env.example` - Template with placeholder values
- `docker-compose.yml` - With environment variable placeholders
- Documentation files - With placeholder examples only

## 📝 Files That Should NOT Be Tracked

- `.env` - Your actual environment variables
- `.env.local`, `.env.production` - Environment-specific configs
- Any file containing actual credentials
- Private keys and certificates

## 🔄 Current Security Status

✅ **FIXED**: 
- `docker-compose.yml` now uses environment variables
- All hardcoded secrets removed from code files
- Documentation sanitized

⚠️ **ACTION REQUIRED**:
- If secrets were previously committed, rotate them immediately
- Set up your `.env` file from `env.example`
- Consider using git-secrets or similar tools for prevention

## 📚 Additional Resources

- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_cryptographic_key)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Docker: Environment variables](https://docs.docker.com/compose/environment-variables/)

---

**Remember**: When in doubt, use environment variables. Never hardcode secrets!

