"""
Merge new keywords into keywordCategories.js
Intelligently adds new keywords while avoiding duplicates
"""

import re
import json

def read_keyword_file():
    """Read the keywordCategories.js file"""
    with open('server/src/config/keywordCategories.js', 'r', encoding='utf-8') as f:
        return f.read()

def get_existing_keywords(content):
    """Extract existing keywords from the file"""
    existing = {}
    
    # Pattern to match categories
    category_pattern = r"'([^']+)':\s*\{"
    categories = re.findall(category_pattern, content)
    
    for category in categories:
        # Extract primary keywords
        primary_pattern = rf"'{category}':\s*\{{[^}}]*?primaryKeywords:\s*\[(.*?)\],"
        primary_match = re.search(primary_pattern, content, re.DOTALL)
        primary_keywords = set()
        if primary_match:
            primary_keywords = set(re.findall(r"'([^']+)'", primary_match.group(1)))
        
        # Extract secondary keywords
        secondary_pattern = rf"'{category}':\s*\{{[^}}]*?secondaryKeywords:\s*\[(.*?)\],"
        secondary_match = re.search(secondary_pattern, content, re.DOTALL)
        secondary_keywords = set()
        if secondary_match:
            secondary_keywords = set(re.findall(r"'([^']+)'", secondary_match.group(1)))
        
        # Extract phrases
        phrases_pattern = rf"'{category}':\s*\{{[^}}]*?phrases:\s*\[(.*?)\],"
        phrases_match = re.search(phrases_pattern, content, re.DOTALL)
        phrases = set()
        if phrases_match:
            phrases = set(re.findall(r"'([^']+)'", phrases_match.group(1)))
        
        existing[category] = {
            'primaryKeywords': primary_keywords,
            'secondaryKeywords': secondary_keywords,
            'phrases': phrases
        }
    
    return existing

def filter_new_keywords(suggestions, existing):
    """Filter out keywords that already exist"""
    filtered = {}
    
    for category, data in suggestions.items():
        if category not in existing:
            continue
        
        existing_set = existing[category]
        
        # Normalize for comparison (lowercase)
        existing_primary_lower = {k.lower() for k in existing_set['primaryKeywords']}
        existing_secondary_lower = {k.lower() for k in existing_set['secondaryKeywords']}
        existing_phrases_lower = {p.lower() for p in existing_set['phrases']}
        
        # Filter primary keywords
        new_primary = [
            kw for kw in data['new_primary_keywords']
            if kw.lower() not in existing_primary_lower and 
               kw.lower() not in existing_secondary_lower and
               len(kw) > 3  # Filter very short keywords
        ]
        
        # Filter secondary keywords
        all_existing = existing_primary_lower | existing_secondary_lower
        new_secondary = [
            kw for kw in data['new_secondary_keywords']
            if kw.lower() not in all_existing and
               len(kw) > 2  # Allow shorter secondary keywords
        ]
        
        # Filter phrases
        new_phrases = [
            ph for ph in data['new_phrases']
            if ph.lower() not in existing_phrases_lower and
               len(ph) > 5  # Filter very short phrases
        ]
        
        filtered[category] = {
            'primaryKeywords': new_primary[:30],  # Limit to top 30
            'secondaryKeywords': new_secondary[:40],  # Limit to top 40
            'phrases': new_phrases[:25]  # Limit to top 25
        }
    
    return filtered

def add_keywords_to_file(content, new_keywords):
    """Add new keywords to the file"""
    result = content
    
    for category, keywords in new_keywords.items():
        if not any(keywords.values()):  # Skip if no new keywords
            continue
        
        # Find the category block
        category_pattern = rf"('{category}':\s*\{{)"
        match = re.search(category_pattern, result)
        if not match:
            continue
        
        # Add to primaryKeywords
        if keywords['primaryKeywords']:
            primary_pattern = rf"('{category}':\s*\{{[^}}]*?primaryKeywords:\s*\[)(.*?)(\],)"
            def add_primary(m):
                existing = m.group(2).strip()
                new_kws = ', '.join(f"'{kw}'" for kw in keywords['primaryKeywords'])
                if existing:
                    return m.group(1) + existing + ',\n      ' + new_kws + m.group(3)
                else:
                    return m.group(1) + '\n      ' + new_kws + m.group(3)
            result = re.sub(primary_pattern, add_primary, result, flags=re.DOTALL)
        
        # Add to secondaryKeywords
        if keywords['secondaryKeywords']:
            secondary_pattern = rf"('{category}':\s*\{{[^}}]*?secondaryKeywords:\s*\[)(.*?)(\],)"
            def add_secondary(m):
                existing = m.group(2).strip()
                new_kws = ', '.join(f"'{kw}'" for kw in keywords['secondaryKeywords'])
                if existing:
                    return m.group(1) + existing + ',\n      ' + new_kws + m.group(3)
                else:
                    return m.group(1) + '\n      ' + new_kws + m.group(3)
            result = re.sub(secondary_pattern, add_secondary, result, flags=re.DOTALL)
        
        # Add to phrases
        if keywords['phrases']:
            phrases_pattern = rf"('{category}':\s*\{{[^}}]*?phrases:\s*\[)(.*?)(\],)"
            def add_phrases(m):
                existing = m.group(2).strip()
                new_phrs = ', '.join(f"'{ph}'" for ph in keywords['phrases'])
                if existing:
                    return m.group(1) + existing + ',\n      ' + new_phrs + m.group(3)
                else:
                    return m.group(1) + '\n      ' + new_phrs + m.group(3)
            result = re.sub(phrases_pattern, add_phrases, result, flags=re.DOTALL)
    
    return result

def main():
    print("=" * 60)
    print("MERGE NEW KEYWORDS INTO KEYWORD CATEGORIES")
    print("=" * 60)
    
    # Load suggestions
    print("\n1. Loading keyword suggestions...")
    with open('keyword_suggestions.json', 'r', encoding='utf-8') as f:
        suggestions_data = json.load(f)
    suggestions = suggestions_data['suggestions']
    print(f"   Loaded suggestions for {len(suggestions)} categories")
    
    # Read existing file
    print("\n2. Reading existing keyword file...")
    content = read_keyword_file()
    existing = get_existing_keywords(content)
    print(f"   Found {len(existing)} existing categories")
    
    # Filter new keywords
    print("\n3. Filtering new keywords (removing duplicates)...")
    new_keywords = filter_new_keywords(suggestions, existing)
    
    # Count new keywords
    total_new = 0
    for cat, kws in new_keywords.items():
        count = len(kws['primaryKeywords']) + len(kws['secondaryKeywords']) + len(kws['phrases'])
        total_new += count
        if count > 0:
            print(f"   {cat}: {len(kws['primaryKeywords'])} primary, {len(kws['secondaryKeywords'])} secondary, {len(kws['phrases'])} phrases")
    
    print(f"\n   Total new keywords/phrases to add: {total_new}")
    
    if total_new == 0:
        print("\nNo new keywords to add. All suggested keywords already exist.")
        return
    
    # Backup original file
    print("\n4. Creating backup...")
    with open('server/src/config/keywordCategories.js.backup', 'w', encoding='utf-8') as f:
        f.write(content)
    print("   Backup created: keywordCategories.js.backup")
    
    # Merge keywords
    print("\n5. Merging new keywords into file...")
    updated_content = add_keywords_to_file(content, new_keywords)
    
    # Write updated file
    print("\n6. Writing updated file...")
    with open('server/src/config/keywordCategories.js', 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print("\n" + "=" * 60)
    print("MERGE COMPLETE!")
    print("=" * 60)
    print(f"✓ Added {total_new} new keywords/phrases")
    print("✓ Backup saved to: keywordCategories.js.backup")
    print("\nNext steps:")
    print("  1. Review the updated keywordCategories.js file")
    print("  2. Test email classification")
    print("  3. If issues occur, restore from backup")

if __name__ == "__main__":
    main()

