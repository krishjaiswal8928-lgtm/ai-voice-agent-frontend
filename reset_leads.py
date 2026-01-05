import sqlite3

# Connect to the database
conn = sqlite3.connect('ai_voice_agent.db')
cursor = conn.cursor()

# Reset lead statuses for campaign 4
cursor.execute("UPDATE leads SET status='new' WHERE campaign_id=4")
conn.commit()
print('Leads reset to new status')

# Check current leads status
cursor.execute('SELECT id, phone, status FROM leads WHERE campaign_id=4')
leads = cursor.fetchall()
print('Current leads status:')
for lead in leads:
    print(f'  - Lead {lead[0]}: {lead[1]} ({lead[2]})')
    
conn.close()