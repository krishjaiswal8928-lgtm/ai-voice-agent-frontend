import sys
import os

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.database.firestore import db

def cleanup_duplicate_phones():
    """Clean up duplicate phone number entries"""
    if db is None:
        print("CRITICAL: Firestore DB client is None. Check app/database/firestore.py initialization.")
        return
    
    print("=== CLEANING UP DUPLICATE PHONE NUMBERS ===\n")
    
    try:
        # Check virtual_phone_numbers collection
        phones_ref = db.collection('virtual_phone_numbers')
        phone_docs = list(phones_ref.stream())
        
        print(f"Total phone numbers in virtual_phone_numbers: {len(phone_docs)}")
        
        # Group phone numbers by actual phone number
        phone_groups = {}
        for doc in phone_docs:
            phone_data = doc.to_dict()
            phone_number = phone_data.get('phone_number')
            if phone_number not in phone_groups:
                phone_groups[phone_number] = []
            phone_groups[phone_number].append((doc.id, phone_data))
        
        # Check for duplicates
        duplicates_found = False
        for phone_number, entries in phone_groups.items():
            if len(entries) > 1:
                duplicates_found = True
                print(f"\nDuplicate entries found for {phone_number}:")
                
                # Sort by user ID to prioritize current user's entries
                current_user_id = 'dfAPmBRXXJYAgI9SFZf2'  # Aditi's user ID
                entries.sort(key=lambda x: 0 if x[1].get('user_id') == current_user_id else 1)
                
                # Keep the first one (current user's) and delete the rest
                keep_entry = entries[0]
                delete_entries = entries[1:]
                
                print(f"  Keeping: {keep_entry[0]} (User: {keep_entry[1].get('user_id')})")
                
                for entry_id, entry_data in delete_entries:
                    print(f"  Deleting: {entry_id} (User: {entry_data.get('user_id')})")
                    phones_ref.document(entry_id).delete()
                    print(f"    ✓ Deleted {entry_id}")
                    
        if not duplicates_found:
            print("No duplicate phone numbers found.")
            
        # Final verification
        print("\n=== FINAL VERIFICATION ===")
        remaining_docs = list(phones_ref.stream())
        print(f"Remaining phone numbers: {len(remaining_docs)}")
        
        for doc in remaining_docs:
            phone_data = doc.to_dict()
            phone_number = phone_data.get('phone_number')
            user_id = phone_data.get('user_id')
            assigned_agents = phone_data.get('assigned_agents', [])
            print(f"  {phone_number} (User: {user_id}) - Assigned to: {assigned_agents}")
            
    except Exception as e:
        print(f"Error cleaning up duplicate phones: {e}")

if __name__ == "__main__":
    cleanup_duplicate_phones()