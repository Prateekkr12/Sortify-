# Gmail Email Fetching Guide

## Overview
This guide explains how to fetch emails directly from Gmail API with full content for training purposes. This is better than extracting from the database because:
- ✅ Gets full email content (HTML, text, body) - not just metadata
- ✅ Real-time data from Gmail
- ✅ Better for training ML models
- ✅ No dependency on database sync status

## Prerequisites

1. **MongoDB Atlas Connection**: Environment variables set
   ```bash
   # Set MONGO_URI in your .env file (never commit actual credentials)
   # Replace YOUR_USERNAME, YOUR_PASSWORD, YOUR_CLUSTER with actual values
   MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/sortify?retryWrites=true&w=majority
   ```

2. **User with Gmail Connected**: At least one user in the database must have:
   - `gmailConnected: true`
   - `gmailAccessToken` (valid OAuth token)
   - `gmailRefreshToken` (for token refresh)

3. **Python Dependencies**: Install required packages
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Basic Usage
Fetch all emails from Gmail (limited to avoid rate limits):
```bash
cd model_service
python fetch_emails_from_gmail.py --limit 100
```

### Fetch with Gmail Query
Filter emails using Gmail search syntax:
```bash
# Fetch emails from specific sender
python fetch_emails_from_gmail.py --query "from:example@domain.com" --limit 50

# Fetch emails from last 30 days
python fetch_emails_from_gmail.py --query "newer_than:30d" --limit 200

# Fetch emails with specific label
python fetch_emails_from_gmail.py --query "label:important" --limit 100
```

### Fetch for Specific User
If you have multiple users with Gmail connected:
```bash
python fetch_emails_from_gmail.py --user "user@example.com" --limit 100
```

### Export with Analysis
Get detailed statistics about fetched emails:
```bash
python fetch_emails_from_gmail.py --limit 100 --analyze
```

### Custom Output File
Specify custom output file name:
```bash
python fetch_emails_from_gmail.py --limit 100 --output "my_training_data.json"
```

## Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--limit` | Maximum number of emails to fetch | `--limit 100` |
| `--query` | Gmail search query | `--query "from:example.com"` |
| `--user` | User email to fetch for | `--user "user@example.com"` |
| `--output` | Output file name | `--output "emails.json"` |
| `--analyze` | Show content analysis | `--analyze` |

## Output Format

The script exports emails in JSON format suitable for training:

```json
[
  {
    "subject": "Email Subject",
    "body": "Full email body content",
    "html": "<html>...</html>",
    "text": "Plain text version",
    "from": "sender@example.com",
    "to": "recipient@example.com",
    "category": "Placement",
    "date": "2024-01-15T10:30:00",
    "snippet": "Email snippet...",
    "labels": ["INBOX", "IMPORTANT"],
    "has_attachments": false
  }
]
```

## How It Works

1. **Connects to MongoDB**: Fetches user credentials from database
2. **Authenticates with Gmail**: Uses stored OAuth tokens to authenticate
3. **Refreshes Token**: Automatically refreshes expired tokens
4. **Fetches Message IDs**: Lists all message IDs matching the query
5. **Fetches Full Content**: Gets complete email content (HTML, text, body)
6. **Parses Emails**: Extracts structured data from Gmail messages
7. **Exports for Training**: Saves in JSON format ready for ML training

## Troubleshooting

### Error: "No user with Gmail connected found"
**Solution**: You need to connect Gmail through the app first:
1. Start your backend server
2. Log in to the app
3. Connect your Gmail account via OAuth
4. Then run the script

### Error: "Token expired" or "Invalid credentials"
**Solution**: The script automatically refreshes tokens. If it fails:
1. Reconnect Gmail through the app
2. Make sure `gmailRefreshToken` is stored in database

### Error: "Rate limit exceeded"
**Solution**: Gmail API has rate limits:
- Reduce `--limit` value
- Add delays between requests
- Use `--query` to filter emails

### Error: "Module not found"
**Solution**: Install dependencies:
```bash
pip install -r requirements.txt
```

## Gmail Search Query Examples

| Query | Description |
|-------|-------------|
| `from:example.com` | Emails from specific domain |
| `to:user@example.com` | Emails to specific address |
| `subject:"keyword"` | Emails with keyword in subject |
| `has:attachment` | Emails with attachments |
| `is:unread` | Unread emails |
| `is:read` | Read emails |
| `newer_than:7d` | Emails from last 7 days |
| `older_than:30d` | Emails older than 30 days |
| `label:important` | Emails with important label |
| `-label:spam` | Exclude spam |

## Next Steps

After fetching emails:

1. **Review the data**: Check `gmail_emails_training.json`
2. **Train your model**: Use the data for ML training
3. **Update extraction script**: Modify `extract_training_data.py` to use this data
4. **Automate**: Set up scheduled fetching for continuous training

## Example Workflow

```bash
# 1. Fetch emails from Gmail
python fetch_emails_from_gmail.py --limit 500 --analyze

# 2. Review the output
cat gmail_emails_training.json | head -20

# 3. Use for training
python train_email_classifier.py --data gmail_emails_training.json
```

## Notes

- The script automatically handles token refresh
- Emails are fetched with full content (HTML, text, body)
- Category information is pulled from database if available
- The script respects Gmail API rate limits
- Output is UTF-8 encoded for international characters

