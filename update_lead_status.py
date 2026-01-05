import sqlite3

# Connect to the database
conn = sqlite3.connect('ai_voice_agent.db')
cursor = conn.cursor()

# Update the lead status to "new"
cursor.execute("UPDATE leads SET status = 'new' WHERE id = 4;")
conn.commit()

print('Lead status updated to "new"')

# Verify the update
cursor.execute("SELECT * FROM leads WHERE id = 4;")
lead = cursor.fetchone()
print(f"Updated lead: {lead}")

# Close the connection
conn.close()