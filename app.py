from flask import Flask, render_template, request, jsonify, send_from_directory
import sqlite3
import json
import os
import re
from datetime import datetime, timedelta
import requests
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle
import os.path

app = Flask(__name__)

# Google Calendar API setup
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

# Database setup
def init_db():
    conn = sqlite3.connect('skytebane.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activities (
            id TEXT PRIMARY KEY,
            iCalUID TEXT,
            date TEXT NOT NULL,
            dayOfWeek TEXT NOT NULL,
            startTime TEXT NOT NULL,
            endTime TEXT NOT NULL,
            activities TEXT NOT NULL,
            colors TEXT NOT NULL,
            comment TEXT,
            rangeOfficer TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# API Endpoints
@app.route('/api/activities', methods=['GET'])
def get_activities():
    conn = sqlite3.connect('skytebane.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM activities ORDER BY date, startTime')
    rows = cursor.fetchall()
    conn.close()
    
    activities = []
    for row in rows:
        activities.append({
            'id': row[0],
            'iCalUID': row[1],
            'date': row[2],
            'dayOfWeek': row[3],
            'startTime': row[4],
            'endTime': row[5],
            'activities': json.loads(row[6]),
            'colors': json.loads(row[7]),
            'comment': row[8],
            'rangeOfficer': row[9]
        })
    
    return jsonify(activities)

@app.route('/api/activities', methods=['POST'])
def add_activity():
    data = request.json
    
    conn = sqlite3.connect('skytebane.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT OR REPLACE INTO activities 
        (id, iCalUID, date, dayOfWeek, startTime, endTime, activities, colors, comment, rangeOfficer)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['id'],
        data.get('iCalUID'),
        data['date'],
        data['dayOfWeek'],
        data['startTime'],
        data['endTime'],
        json.dumps(data['activities']),
        json.dumps(data['colors']),
        data.get('comment', ''),
        data.get('rangeOfficer', '')
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'id': data['id']})

@app.route('/api/activities/<activity_id>', methods=['PUT'])
def update_activity(activity_id):
    data = request.json
    
    conn = sqlite3.connect('skytebane.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE activities 
        SET date = ?, dayOfWeek = ?, startTime = ?, endTime = ?, 
            activities = ?, colors = ?, comment = ?, rangeOfficer = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (
        data['date'],
        data['dayOfWeek'],
        data['startTime'],
        data['endTime'],
        json.dumps(data['activities']),
        json.dumps(data['colors']),
        data.get('comment', ''),
        data.get('rangeOfficer', ''),
        activity_id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/activities/<activity_id>', methods=['DELETE'])
def delete_activity(activity_id):
    conn = sqlite3.connect('skytebane.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM activities WHERE id = ?', (activity_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/import/calendar', methods=['POST'])
def import_calendar():
    try:
        # Get date range and auto-categorize setting from request
        data = request.get_json()
        from_date = data.get('from_date')
        to_date = data.get('to_date')
        auto_categorize = data.get('auto_categorize', True)  # Default to True for backward compatibility
        
        if not from_date or not to_date:
            return jsonify({
                'success': False,
                'error': 'Fra- og til-dato må være spesifisert'
            }), 400
        
        # iCal URL for Lorenskog Skytterlag
        ical_url = "https://calendar.google.com/calendar/ical/2h495fqj8gr9p42361rriptlibc7gf6k%40import.calendar.google.com/public/basic.ics"
        
        # Fetch iCal data
        response = requests.get(ical_url, timeout=10)
        response.raise_for_status()
        
        # Parse iCal data
        ical_data = response.text
        events = parse_ical_data(ical_data, from_date, to_date, auto_categorize)
        
        if not events:
            return jsonify({
                'success': True,
                'message': 'Ingen nye aktiviteter funnet i kalenderen',
                'imported_count': 0
            })
        
        # Save events to database
        conn = sqlite3.connect('skytebane.db')
        cursor = conn.cursor()
        
        imported_count = 0
        for event in events:
            # Check if event already exists
            cursor.execute('''
                SELECT id FROM activities 
                WHERE date = ? AND startTime = ? AND endTime = ?
            ''', (event['date'], event['startTime'], event['endTime']))
            
            if not cursor.fetchone():
                cursor.execute('''
                    INSERT INTO activities (id, date, dayOfWeek, startTime, endTime, 
                                          activities, colors, comment, rangeOfficer, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ''', (
                    event['id'],
                    event['date'],
                    event['dayOfWeek'],
                    event['startTime'],
                    event['endTime'],
                    json.dumps(event['activities']),
                    json.dumps(event['colors']),
                    event['comment'],
                    event['rangeOfficer']
                ))
                imported_count += 1
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Suksess! {imported_count} nye aktiviteter importert fra Lorenskog Skytterlag kalender',
            'imported_count': imported_count
        })
        
    except requests.RequestException as e:
        return jsonify({
            'success': False, 
            'error': f'Kunne ikke hente kalenderdata: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False, 
            'error': f'Feil ved import: {str(e)}'
        }), 500

def parse_ical_data(ical_content, from_date=None, to_date=None, auto_categorize=True):
    """Parse iCal data and convert to activities"""
    events = []
    current_event = {}
    in_event = False
    
    # Day names for Norwegian
    day_names = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']
    
    for line in ical_content.split('\n'):
        line = line.strip()
        
        if line.startswith('BEGIN:VEVENT'):
            current_event = {}
            in_event = True
        elif line.startswith('END:VEVENT'):
            if current_event and 'summary' in current_event:
                # Convert to activity format
                activity = convert_event_to_activity(current_event, day_names)
                if activity:
                    # Filter by date range if specified
                    if from_date and to_date:
                        event_date = activity['date']
                        if from_date <= event_date <= to_date:
                            events.append(activity)
                    else:
                        events.append(activity)
            in_event = False
        elif in_event and line.startswith('SUMMARY:'):
            current_event['summary'] = line[8:]
        elif in_event and line.startswith('DTSTART:'):
            current_event['start'] = parse_ical_datetime(line[8:])
        elif in_event and line.startswith('DTEND:'):
            current_event['end'] = parse_ical_datetime(line[6:])
        elif in_event and line.startswith('DESCRIPTION:'):
            current_event['description'] = line[12:]
    
    return events

def parse_ical_datetime(dt_string):
    """Parse iCal datetime string"""
    # Handle different iCal datetime formats
    if 'T' in dt_string and 'Z' in dt_string:
        # Format: 20250108T180000Z
        dt_string = dt_string.replace('Z', '+00:00')
    elif 'T' in dt_string and len(dt_string) == 15:
        # Format: 20250108T180000
        dt_string = dt_string + '+00:00'
    
    try:
        return datetime.fromisoformat(dt_string.replace('T', ' ').replace('Z', ''))
    except:
        return None

def convert_event_to_activity(event, day_names):
    """Convert iCal event to activity format"""
    if not event.get('start') or not event.get('summary'):
        return None
    
    start_dt = event['start']
    end_dt = event.get('end', start_dt + timedelta(hours=1))
    
    # Get day of week
    day_of_week = day_names[(start_dt.weekday()) % 7]
    
    # Determine activity types based on summary and day of week
    summary = event['summary']
    activity_types = determine_activity_types(summary, day_of_week, auto_categorize)
    if not activity_types:
        return None  # Skip maintenance events
    
    # Extract range officer
    range_officer = extract_range_officer(summary)
    
    # Get colors for multiple activities
    colors = [get_color_for_activity(activity_type) for activity_type in activity_types]
    
    return {
        'id': f"ical-{start_dt.strftime('%Y%m%d%H%M%S')}-{hash(summary) % 10000}",
        'date': start_dt.strftime('%Y-%m-%d'),
        'dayOfWeek': day_names[(start_dt.weekday()) % 7],
        'startTime': start_dt.strftime('%H:%M'),
        'endTime': end_dt.strftime('%H:%M'),
        'activities': activity_types,
        'colors': colors,
        'comment': f"Importert fra Lorenskog Skytterlag: {summary}",
        'rangeOfficer': range_officer
    }

def determine_activity_types(summary, day_of_week=None, auto_categorize=True):
    """Determine activity types from summary and day of week - can return multiple types"""
    summary_lower = summary.lower()
    activities = []
    
    # Skip maintenance events
    maintenance_words = [
        'opplåsing', 'klargjøring', 'låsing', 'åpning', 'stengning',
        'låse opp', 'låse ned', 'åpne', 'stenge', 'lukke',
        'klargjør', 'klargjøre', 'opplås', 'lås opp', 'lås ned',
        'avslutte', 'avslutt', 'låse', 'lås'
    ]
    if any(word in summary_lower for word in maintenance_words):
        return []
    
    # Check for "Ledig" or "Ikke satt" - mark as Uavklart
    if any(word in summary_lower for word in ['ledig', 'ikke satt', 'uavklart']):
        activities.append('Uavklart')
        # Don't return early - continue to check for other activity types
    
    # Check specific activity types from summary
    if 'jaktskyting' in summary_lower or 'jakt' in summary_lower:
        activities.append('Jeger')  # Changed from Jaktskyting to Jeger
    if 'dfs' in summary_lower:
        activities.append('DFS')
    if 'pistol' in summary_lower:
        activities.append('Pistol')
    if 'prs' in summary_lower:
        activities.append('PRS')
    if 'leirdue' in summary_lower:
        activities.append('Leirdue')
    if 'storviltprøve' in summary_lower or 'storvilt' in summary_lower:
        activities.append('Storviltprøve')
    if '100m' in summary_lower or '100 m' in summary_lower:
        activities.append('100m')
    if '200m' in summary_lower or '200 m' in summary_lower:
        activities.append('200m')
    
    # Auto-categorize based on day of week if no specific activities found (excluding Uavklart) and auto_categorize is enabled
    if auto_categorize and day_of_week and len([a for a in activities if a != 'Uavklart']) == 0:
        day_activities = {
            'Mandag': ['DFS', '100m', '200m'],
            'Tirsdag': ['Pistol', '100m'],
            'Onsdag': ['PRS', '200m'],
            'Torsdag': ['Jeger', '100m', '200m'],
            'Fredag': ['Leirdue'],
            'Lørdag': ['Åpen for alle', '100m', '200m'],
            'Søndag': []  # No default activities for Sunday
        }
        
        if day_of_week in day_activities:
            activities.extend(day_activities[day_of_week])
    
    # If still no activities found, add 'Annet'
    if len(activities) == 0:
        activities.append('Annet')
    
    return activities

def extract_range_officer(summary):
    """Extract range officer from summary"""
    # Look for patterns like "Vakt: Navn" or "Standsplassleder: Navn"
    patterns = [
        r'vakt:\s*([^,\n]+)',
        r'standsplassleder:\s*([^,\n]+)',
        r'leder:\s*([^,\n]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, summary, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    return 'Ikke satt'

def get_color_for_activity(activity_type):
    """Get color for activity type"""
    colors = {
        'Åpen for alle': '#FF6B6B',
        'Jeger': '#3B82F6',
        'DFS': '#FFFFFF',
        'Pistol': '#F59E0B',
        'PRS': '#8B5CF6',
        'Leirdue': '#EC4899',
        'Storviltprøve': '#10B981',
        'Annet': '#6B7280',
        'Uavklart': '#EF4444',
        '100m': '#FF6B6B',
        '200m': '#4ECDC4'
    }
    return colors.get(activity_type, '#6B7280')

@app.route('/api/duplicates', methods=['GET'])
def check_duplicates():
    conn = sqlite3.connect('skytebane.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT date, startTime, endTime, COUNT(*) as count
        FROM activities 
        GROUP BY date, startTime, endTime 
        HAVING COUNT(*) > 1
    ''')
    duplicates = cursor.fetchall()
    conn.close()
    
    return jsonify({
        'duplicates': [
            {
                'date': row[0],
                'startTime': row[1],
                'endTime': row[2],
                'count': row[3]
            } for row in duplicates
        ]
    })

@app.route('/api/duplicates', methods=['DELETE'])
def remove_duplicates():
    conn = sqlite3.connect('skytebane.db')
    cursor = conn.cursor()
    
    # Find and remove duplicates, keeping only the first occurrence
    cursor.execute('''
        DELETE FROM activities 
        WHERE id NOT IN (
            SELECT MIN(id) 
            FROM activities 
            GROUP BY date, startTime, endTime
        )
    ''')
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/cleanup/maintenance', methods=['DELETE'])
def cleanup_maintenance_events():
    """Remove maintenance events from database"""
    conn = sqlite3.connect('skytebane.db')
    cursor = conn.cursor()
    
    # Get all activities
    cursor.execute('SELECT id, comment FROM activities')
    activities = cursor.fetchall()
    
    maintenance_words = [
        'opplåsing', 'klargjøring', 'låsing', 'åpning', 'stengning',
        'låse opp', 'låse ned', 'åpne', 'stenge', 'lukke',
        'klargjør', 'klargjøre', 'opplås', 'lås opp', 'lås ned',
        'avslutte', 'avslutt', 'låse', 'lås'
    ]
    
    deleted_count = 0
    for activity_id, comment in activities:
        # Check both comment and activity ID for maintenance words
        should_delete = False
        if comment and any(word in comment.lower() for word in maintenance_words):
            should_delete = True
        elif any(word in activity_id.lower() for word in maintenance_words):
            should_delete = True
            
        if should_delete:
            cursor.execute('DELETE FROM activities WHERE id = ?', (activity_id,))
            deleted_count += 1
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'deleted_count': deleted_count,
        'message': f'Fjernet {deleted_count} vedlikeholdsevents'
    })

@app.route('/api/activities/all', methods=['DELETE'])
def delete_all_activities():
    """Delete all activities from database"""
    conn = sqlite3.connect('skytebane.db')
    cursor = conn.cursor()
    
    # Get count before deletion
    cursor.execute('SELECT COUNT(*) FROM activities')
    count = cursor.fetchone()[0]
    
    # Delete all activities
    cursor.execute('DELETE FROM activities')
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'deleted_count': count,
        'message': f'Slettet alle {count} aktiviteter'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000) 