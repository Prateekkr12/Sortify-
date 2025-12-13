#!/usr/bin/env python3
"""
Fetch emails by category from Gmail API, train model, extract keywords, then cleanup
"""

import os
import sys
import json
import subprocess
from collections import Counter
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fetch_emails_from_gmail import GmailEmailFetcher

# Categories to fetch
CATEGORIES = [
    'Placement',
    'NPTEL',
    'HOD',
    'E-Zone',
    'Promotions',
    "What's happening",
    'Professor',
    'Assistant',
    'Other'
]

MIN_EMAILS_PER_CATEGORY = 100


def fetch_emails_by_category(fetcher, category, min_count=100):
    """Fetch emails for a specific category from database, then get full content from Gmail"""
    print(f"\n{'='*60}")
    print(f"FETCHING EMAILS FOR CATEGORY: {category}")
    print(f"{'='*60}\n")
    
    all_emails = []
    
    # Get emails from database that match this category
    try:
        from pymongo import MongoClient
        uri = os.getenv('MONGO_URI')
        if not uri:
            raise ValueError("MONGO_URI environment variable is required. Please set it in your .env file.")
        client = MongoClient(uri)
        
        # Check both databases
        for db_name in ['test', 'sortify']:
            db = client[db_name]
            emails_collection = db['emails']
            
            # Find emails with this category
            category_emails = list(emails_collection.find({
                'category': category,
                'isDeleted': {'$ne': True},
                'gmailId': {'$exists': True, '$ne': None}
            }).limit(min_count * 3))  # Get more to account for failures
            
            if category_emails:
                print(f"Found {len(category_emails)} emails with category '{category}' in database '{db_name}'")
                
                # Fetch full content from Gmail for these emails
                fetched_count = 0
                failed_count = 0
                
                for email_doc in category_emails:
                    if fetched_count >= min_count:
                        break
                    
                    gmail_id = email_doc.get('gmailId')
                    if gmail_id:
                        try:
                            message = fetcher.fetch_message(gmail_id)
                            if message:
                                parsed_email = fetcher.parse_email_message(message)
                                parsed_email['category'] = category  # Ensure correct category
                                
                                # Only add if it has body content
                                if parsed_email.get('body') or parsed_email.get('text') or parsed_email.get('html'):
                                    all_emails.append(parsed_email)
                                    fetched_count += 1
                                    
                                    if fetched_count % 10 == 0:
                                        print(f"  Fetched {fetched_count}/{min_count} emails...")
                                else:
                                    failed_count += 1
                        except Exception as e:
                            failed_count += 1
                            if failed_count % 10 == 0:
                                print(f"  Warning: {failed_count} emails failed to fetch...")
                            continue
                
                if fetched_count >= min_count:
                    print(f"✅ Fetched {fetched_count} emails for category '{category}'")
                    client.close()
                    return all_emails[:min_count]
                else:
                    print(f"⚠️ Only fetched {fetched_count}/{min_count} emails for category '{category}'")
        
        client.close()
    except Exception as e:
        print(f"Error querying database: {e}")
        import traceback
        traceback.print_exc()
    
    return all_emails[:min_count] if all_emails else []


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Fetch emails by category, train, extract keywords, cleanup')
    parser.add_argument('--user', type=str, help='User email')
    parser.add_argument('--database', type=str, help='Database name')
    parser.add_argument('--min-emails', type=int, default=100, help='Minimum emails per category')
    parser.add_argument('--skip-fetch', action='store_true', help='Skip fetching (use existing data)')
    parser.add_argument('--skip-train', action='store_true', help='Skip training')
    parser.add_argument('--skip-cleanup', action='store_true', help='Skip cleanup')
    
    args = parser.parse_args()
    
    global MIN_EMAILS_PER_CATEGORY
    MIN_EMAILS_PER_CATEGORY = args.min_emails
    
    all_emails = []
    output_file = 'gmail_emails_training.json'
    
    try:
        if not args.skip_fetch:
            # Initialize fetcher
            print("Initializing Gmail fetcher...")
            fetcher = GmailEmailFetcher(user_email=args.user, database_name=args.database)
            
            # Fetch emails for each category
            for category in CATEGORIES:
                try:
                    emails = fetch_emails_by_category(fetcher, category, MIN_EMAILS_PER_CATEGORY)
                    all_emails.extend(emails)
                    print(f"✅ Category '{category}': {len(emails)} emails")
                except Exception as e:
                    print(f"❌ Error fetching category '{category}': {e}")
                    continue
            
            # Save all fetched emails
            if all_emails:
                output_path = os.path.join(os.path.dirname(__file__), output_file)
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(all_emails, f, indent=2, ensure_ascii=False)
                print(f"\n✅ Saved {len(all_emails)} emails to {output_path}")
                
                # Print statistics
                category_counts = Counter(email.get('category', 'Other') for email in all_emails)
                print(f"\n📊 Category Distribution:")
                for cat, count in category_counts.most_common():
                    print(f"   {cat:20s}: {count:5d} emails")
            else:
                print("❌ No emails fetched!")
                return
        else:
            # Load existing data
            output_path = os.path.join(os.path.dirname(__file__), output_file)
            if os.path.exists(output_path):
                with open(output_path, 'r', encoding='utf-8') as f:
                    all_emails = json.load(f)
                print(f"✅ Loaded {len(all_emails)} emails from {output_path}")
            else:
                print(f"❌ File not found: {output_path}")
                return
        
        # Train model
        training_success = False
        if not args.skip_train:
            print(f"\n{'='*60}")
            print("TRAINING MODEL")
            print(f"{'='*60}\n")
            
            # Check if training script exists
            train_scripts = [
                'train_email_classifier.py',
                'distilbert_trainer.py',
                'train_model.py',
                'train_with_dataset.py'
            ]
            
            train_script = None
            for script in train_scripts:
                script_path = os.path.join(os.path.dirname(__file__), script)
                if os.path.exists(script_path):
                    train_script = script
                    break
            
            if train_script:
                print(f"Running training script: {train_script}")
                try:
                    # Try to install missing dependencies first
                    print("Checking dependencies...")
                    result = subprocess.run(
                        [sys.executable, '-m', 'pip', 'install', 'datasets', 'transformers', 'torch', 'scikit-learn'],
                        cwd=os.path.dirname(__file__),
                        capture_output=True,
                        text=True
                    )
                    
                    # Run training
                    result = subprocess.run(
                        [sys.executable, train_script, '--data', output_file],
                        cwd=os.path.dirname(__file__),
                        capture_output=True,
                        text=True,
                        encoding='utf-8',
                        errors='replace'
                    )
                    if result.stdout:
                        print(result.stdout)
                    if result.stderr:
                        print("Errors:", result.stderr)
                    if result.returncode == 0:
                        print("✅ Training completed successfully")
                        training_success = True
                    else:
                        print(f"⚠️ Training exited with code {result.returncode}")
                        print("Note: Training may have failed. Check errors above.")
                except Exception as e:
                    print(f"❌ Error running training: {e}")
                    import traceback
                    traceback.print_exc()
            else:
                print("⚠️ No training script found. Skipping training.")
                print("Available scripts:", train_scripts)
        
        # Extract keywords
        print(f"\n{'='*60}")
        print("EXTRACTING KEYWORDS")
        print(f"{'='*60}\n")
        
        keyword_scripts = [
            'analyze_keywords.py',
            'analyze_category_patterns.py'
        ]
        
        keyword_script = None
        for script in keyword_scripts:
            script_path = os.path.join(os.path.dirname(__file__), script)
            if os.path.exists(script_path):
                keyword_script = script
                break
        
        if keyword_script:
            print(f"Running keyword extraction: {keyword_script}")
            try:
                result = subprocess.run(
                    [sys.executable, keyword_script],
                    cwd=os.path.dirname(__file__),
                    capture_output=True,
                    text=True
                )
                print(result.stdout)
                if result.stderr:
                    print("Errors:", result.stderr)
                if result.returncode == 0:
                    print("✅ Keyword extraction completed")
                else:
                    print(f"⚠️ Keyword extraction exited with code {result.returncode}")
            except Exception as e:
                print(f"❌ Error extracting keywords: {e}")
        else:
            print("⚠️ No keyword extraction script found")
        
        # Cleanup - Delete fetched email files (only if training and keyword extraction succeeded)
        if not args.skip_cleanup and (args.skip_train or training_success):
            print(f"\n{'='*60}")
            print("CLEANING UP")
            print(f"{'='*60}\n")
            
            files_to_delete = [
                output_file,
                'gmail_emails_training.json',
                'extracted_emails.json',
                'enhanced_features.csv'
            ]
            
            deleted_count = 0
            for filename in files_to_delete:
                filepath = os.path.join(os.path.dirname(__file__), filename)
                if os.path.exists(filepath):
                    try:
                        os.remove(filepath)
                        print(f"✅ Deleted: {filename}")
                        deleted_count += 1
                    except Exception as e:
                        print(f"⚠️ Could not delete {filename}: {e}")
            
            print(f"\n✅ Cleanup complete: {deleted_count} file(s) deleted")
        elif not args.skip_cleanup:
            print(f"\n⚠️ Skipping cleanup - training did not complete successfully")
            print(f"   Keeping {output_file} for manual review")
        
        print(f"\n{'='*60}")
        print("✅ ALL TASKS COMPLETE!")
        print(f"{'='*60}")
        print(f"✓ Fetched emails: {len(all_emails)}")
        print(f"✓ Training: {'Completed' if not args.skip_train else 'Skipped'}")
        print(f"✓ Keyword extraction: {'Completed' if keyword_script else 'Skipped'}")
        print(f"✓ Cleanup: {'Completed' if not args.skip_cleanup else 'Skipped'}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

