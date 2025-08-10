from flask import Flask, render_template, request, jsonify, send_from_directory
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
# Import pg8000 only when needed (Vercel)
pg8000 = None
RealDictCursor = None

def get_placeholder():
    """Get the correct SQL placeholder based on environment"""
    return '%s' if IS_VERCEL else '?'

app = Flask(__name__)

# Add CORS headers for Vercel
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Google Calendar API setup
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

# Database setup
import os

# Check if we're running on Vercel
IS_VERCEL = os.environ.get('VERCEL') == '1'

def get_db_connection():
    """Get database connection"""
    if IS_VERCEL:
        # Import pg8000 dynamically for Vercel
        global pg8000, RealDictCursor
        if pg8000 is None:
            import pg8000
            from pg8000.extras import RealDictCursor
        
        # Supabase PostgreSQL connection (with connection pooling for Vercel)
        DATABASE_URL = "postgresql://postgres.toofqfonichtzexpuvzc:sauer200STR!!@aws-0-eu-north-1.pooler.supabase.com:6543/postgres"
        
        try:
            # Parse connection string for pg8000
            parts = DATABASE_URL.replace('postgresql://', '').split('@')
            user_pass = parts[0].split(':')
            host_port_db = parts[1].split('/')
            host_port = host_port_db[0].split(':')
            
            print(f"Connecting to Supabase: {host_port[0]}:{host_port[1]}")
            
            conn = pg8000.Connection(
                user=user_pass[0],
                password=user_pass[1],
                host=host_port[0],
                port=int(host_port[1]),
                database=host_port_db[1]
            )
            print("Supabase connection successful")
            return conn
        except Exception as e:
            print(f"Supabase connection error: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            traceback.print_exc()
            return None
    else:
        # Local SQLite database
        import sqlite3
        try:
            print("Connecting to local SQLite database")
            conn = sqlite3.connect('skytebane.db')
            print("Local SQLite connection successful")
            return conn
        except Exception as e:
            print(f"Local SQLite connection error: {str(e)}")
            return None

def init_db():
    """Initialize database - safe to call multiple times"""
    try:
        conn = get_db_connection()
        if not conn:
            print("Could not connect to database")
            return
            
        cursor = conn.cursor()
        
        if IS_VERCEL:
            # PostgreSQL schema for Supabase
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS activities (
                    id VARCHAR(255) PRIMARY KEY,
                    iCalUID VARCHAR(255),
                    date VARCHAR(10) NOT NULL,
                    dayOfWeek VARCHAR(20) NOT NULL,
                    startTime VARCHAR(5) NOT NULL,
                    endTime VARCHAR(5) NOT NULL,
                    activities JSONB NOT NULL,
                    colors JSONB NOT NULL,
                    comment TEXT,
                    rangeOfficer VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
        else:
            # SQLite schema for local development
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
        print(f"Database initialized successfully ({'Supabase PostgreSQL' if IS_VERCEL else 'Local SQLite'})")
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        import traceback
        traceback.print_exc()

# Initialize database on startup
init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/debug/static')
def debug_static():
    import os
    static_dir = 'static'
    if os.path.exists(static_dir):
        files = os.listdir(static_dir)
        return jsonify({
            'static_dir_exists': True,
            'files': files
        })
    else:
        return jsonify({
            'static_dir_exists': False,
            'files': []
        })

@app.route('/debug/ical')
def debug_ical():
    try:
        ical_url = "https://calendar.google.com/calendar/ical/2h495fqj8gr9p42361rriptlibc7gf6k%40import.calendar.google.com/public/basic.ics"
        response = requests.get(ical_url, timeout=10)
        return jsonify({
            'status_code': response.status_code,
            'content_length': len(response.text),
            'content_preview': response.text[:500] if response.text else 'No content'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status_code': None,
            'content_length': 0
        })

@app.route('/debug/pg8000')
def debug_pg8000():
    """Debug pg8000 import and connection"""
    try:
        print("Debug pg8000 endpoint called")
        
        if not IS_VERCEL:
            return jsonify({
                'message': 'Not on Vercel - pg8000 not needed',
                'is_vercel': IS_VERCEL
            })
        
        # Test pg8000 import
        print("Testing pg8000 import...")
        import pg8000
        print("pg8000 imported successfully")
        
        from pg8000.extras import RealDictCursor
        print("RealDictCursor imported successfully")
        
        # Test connection
        print("Testing connection...")
        conn = get_db_connection()
        if conn:
            print("Connection successful")
            conn.close()
            print("Connection closed")
            return jsonify({
                'message': 'pg8000 import and connection successful',
                'is_vercel': IS_VERCEL,
                'status': 'success'
            })
        else:
            print("Connection failed")
            return jsonify({
                'message': 'pg8000 import successful but connection failed',
                'is_vercel': IS_VERCEL,
                'status': 'connection_failed'
            })
            
    except Exception as e:
        print(f"pg8000 debug error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'error_type': str(type(e)),
            'is_vercel': IS_VERCEL,
            'status': 'error'
        }), 500

@app.route('/debug/database')
def debug_database():
    """Test database connectivity without changing anything"""
    try:
        print("Debug database endpoint called")
        
        # Ensure database is initialized
        init_db()
        
        conn = get_db_connection()
        if not conn:
            return jsonify({
                'database_type': 'Supabase PostgreSQL',
                'is_vercel': IS_VERCEL,
                'error': 'Database connection failed',
                'status': 'Database connection failed'
            })
            
        cursor = conn.cursor()
        
        if IS_VERCEL:
            # Test if table exists (PostgreSQL)
            cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activities')")
            table_exists = cursor.fetchone()[0]
        else:
            # Test if table exists (SQLite)
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='activities'")
            table_exists = cursor.fetchone() is not None
        
        # Test if we can read
        cursor.execute("SELECT COUNT(*) FROM activities")
        count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'database_type': 'Supabase PostgreSQL' if IS_VERCEL else 'Local SQLite',
            'is_vercel': IS_VERCEL,
            'table_exists': table_exists,
            'activity_count': count,
            'status': 'Database connection successful'
        })
    except Exception as e:
        print(f"Database debug error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'database_type': 'Supabase PostgreSQL' if IS_VERCEL else 'Local SQLite',
            'is_vercel': IS_VERCEL,
            'error': str(e),
            'status': 'Database connection failed'
        })

@app.route('/api/activities', methods=['OPTIONS'])
def handle_options():
    return '', 200

@app.route('/static/<path:filename>')
def static_files(filename):
    try:
        return send_from_directory('static', filename)
    except FileNotFoundError:
        return "File not found", 404

# API Endpoints
@app.route('/api/activities', methods=['GET'])
def get_activities():
    try:
        print("Get activities endpoint called")
        print(f"IS_VERCEL: {IS_VERCEL}")
        
        # Ensure database is initialized
        print("Initializing database...")
        init_db()
        print("Database initialization completed")
        
        print("Getting database connection...")
        conn = get_db_connection()
        if not conn:
            print("Database connection failed")
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        print("Database connection successful")
            
        if IS_VERCEL:
            print("Using PostgreSQL (Vercel)")
            # Import RealDictCursor dynamically
            global RealDictCursor
            if RealDictCursor is None:
                print("Importing RealDictCursor...")
                from pg8000.extras import RealDictCursor
                print("RealDictCursor imported successfully")
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            print("Executing SELECT query...")
            cursor.execute('SELECT * FROM activities ORDER BY date, startTime')
            print("Fetching rows...")
            rows = cursor.fetchall()
            print(f"Fetched {len(rows)} rows from PostgreSQL")
            
            activities = []
            for row in rows:
                try:
                    # Handle activities field
                    activities_data = row['activities']
                    if isinstance(activities_data, str):
                        activities_data = json.loads(activities_data)
                    elif activities_data is None:
                        activities_data = []
                    
                    # Handle colors field
                    colors_data = row['colors']
                    if isinstance(colors_data, str):
                        colors_data = json.loads(colors_data)
                    elif colors_data is None:
                        colors_data = []
                    
                    activities.append({
                        'id': row['id'],
                        'iCalUID': row['icaluid'],
                        'date': row['date'],
                        'dayOfWeek': row['dayofweek'],
                        'startTime': row['starttime'],
                        'endTime': row['endtime'],
                        'activities': activities_data,
                        'colors': colors_data,
                        'comment': row['comment'],
                        'rangeOfficer': row['rangeofficer']
                    })
                except Exception as e:
                    print(f"Error processing row {row['id']}: {str(e)}")
                    print(f"Row data: {row}")
                    # Skip this row and continue
                    continue
        else:
            print("Using SQLite (Local)")
            cursor = conn.cursor()
            print("Executing SELECT query...")
            cursor.execute('SELECT * FROM activities ORDER BY date, startTime')
            print("Fetching rows...")
            rows = cursor.fetchall()
            print(f"Fetched {len(rows)} rows from SQLite")
            
            activities = []
            for row in rows:
                try:
                    # Handle activities field
                    activities_data = row[6]
                    if isinstance(activities_data, str):
                        activities_data = json.loads(activities_data)
                    elif activities_data is None:
                        activities_data = []
                    
                    # Handle colors field
                    colors_data = row[7]
                    if isinstance(colors_data, str):
                        colors_data = json.loads(colors_data)
                    elif colors_data is None:
                        colors_data = []
                    
                    activities.append({
                        'id': row[0],
                        'iCalUID': row[1],
                        'date': row[2],
                        'dayOfWeek': row[3],
                        'startTime': row[4],
                        'endTime': row[5],
                        'activities': activities_data,
                        'colors': colors_data,
                        'comment': row[8],
                        'rangeOfficer': row[9]
                    })
                except Exception as e:
                    print(f"Error processing SQLite row {row[0]}: {str(e)}")
                    print(f"Row data: {row}")
                    # Skip this row and continue
                    continue
        
        conn.close()
        print(f"Retrieved {len(activities)} activities from database")
        
        print(f"Returning {len(activities)} activities from database")
        
        # Add debug info about the first activity if any
        if activities:
            print(f"First activity sample: {activities[0]}")
        
        return jsonify(activities)
    except Exception as e:
        print(f"Error getting activities: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Feil ved henting av aktiviteter: {str(e)}'}), 500

@app.route('/api/activities', methods=['POST', 'OPTIONS'])
def add_activity():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        print("Add activity endpoint called")
        data = request.json
        print("Request data:", data)
        
        if not data:
            print("No data received")
            return jsonify({'success': False, 'error': 'Ingen data mottatt'}), 400
        
        # Ensure database is initialized
        print("Initializing database...")
        init_db()
        print("Database initialization completed")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500
            
        cursor = conn.cursor()
        print("Database connection established")
        
        if IS_VERCEL:
            # PostgreSQL syntax
            cursor.execute('''
                INSERT INTO activities 
                (id, iCalUID, date, dayOfWeek, startTime, endTime, activities, colors, comment, rangeOfficer)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    iCalUID = EXCLUDED.iCalUID,
                    date = EXCLUDED.date,
                    dayOfWeek = EXCLUDED.dayOfWeek,
                    startTime = EXCLUDED.startTime,
                    endTime = EXCLUDED.endTime,
                    activities = EXCLUDED.activities,
                    colors = EXCLUDED.colors,
                    comment = EXCLUDED.comment,
                    rangeOfficer = EXCLUDED.rangeOfficer,
                    updated_at = CURRENT_TIMESTAMP
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
        else:
            # SQLite syntax
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
        print("Activity saved successfully")
        
        return jsonify({'success': True, 'id': data['id']})
    except Exception as e:
        print(f"Error adding activity: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Feil ved lagring av aktivitet: {str(e)}'}), 500

@app.route('/api/activities/<activity_id>', methods=['PUT', 'OPTIONS'])
def update_activity(activity_id):
    if request.method == 'OPTIONS':
        return '', 200
    data = request.json
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
    cursor = conn.cursor()
    
    if IS_VERCEL:
        cursor.execute('''
            UPDATE activities 
            SET date = %s, dayOfWeek = %s, startTime = %s, endTime = %s, 
                activities = %s, colors = %s, comment = %s, rangeOfficer = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
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
    else:
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

@app.route('/api/activities/<activity_id>', methods=['DELETE', 'OPTIONS'])
def delete_activity(activity_id):
    if request.method == 'OPTIONS':
        return '', 200
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
    cursor = conn.cursor()
    if IS_VERCEL:
        cursor.execute('DELETE FROM activities WHERE id = %s', (activity_id,))
    else:
        cursor.execute('DELETE FROM activities WHERE id = ?', (activity_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/import/calendar', methods=['POST', 'OPTIONS'])
def import_calendar():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        print("Import calendar endpoint called")
        # Get date range and auto-categorize setting from request
        data = request.get_json()
        print("Request data:", data)
        
        from_date = data.get('from_date')
        to_date = data.get('to_date')
        auto_categorize = data.get('auto_categorize', True)  # Default to True for backward compatibility
        
        print(f"Date range: {from_date} to {to_date}")
        print(f"Auto categorize: {auto_categorize}")
        
        if not from_date or not to_date:
            print("Missing date parameters")
            return jsonify({
                'success': False,
                'error': 'Fra- og til-dato må være spesifisert'
            }), 400
        
        # iCal URL for Lorenskog Skytterlag
        ical_url = "https://calendar.google.com/calendar/ical/2h495fqj8gr9p42361rriptlibc7gf6k%40import.calendar.google.com/public/basic.ics"
        
        print(f"Fetching iCal data from: {ical_url}")
        
        # Fetch iCal data
        response = requests.get(ical_url, timeout=10)
        print(f"iCal response status: {response.status_code}")
        response.raise_for_status()
        
        # Parse iCal data
        ical_data = response.text
        print(f"iCal data length: {len(ical_data)} characters")
        
        events = parse_ical_data(ical_data, from_date, to_date, auto_categorize)
        print(f"Parsed events: {len(events)} events found")
        
        if not events:
            print("No events found in date range")
            return jsonify({
                'success': True,
                'message': 'Ingen nye aktiviteter funnet i kalenderen',
                'imported_count': 0
            })
        
        # Save events to database
        # Ensure database is initialized
        init_db()
        
        conn = get_db_connection()
        if not conn:
            return jsonify({
                'success': False,
                'error': 'Database connection failed'
            }), 500
            
        cursor = conn.cursor()
        
        imported_count = 0
        updated_count = 0
        
        try:
            for event in events:
                if IS_VERCEL:
                    # PostgreSQL syntax
                    cursor.execute('''
                        INSERT INTO activities (id, date, dayOfWeek, startTime, endTime, 
                                              activities, colors, comment, rangeOfficer, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        ON CONFLICT (id) DO UPDATE SET
                            date = EXCLUDED.date,
                            dayOfWeek = EXCLUDED.dayOfWeek,
                            startTime = EXCLUDED.startTime,
                            endTime = EXCLUDED.endTime,
                            activities = EXCLUDED.activities,
                            colors = EXCLUDED.colors,
                            comment = EXCLUDED.comment,
                            rangeOfficer = EXCLUDED.rangeOfficer,
                            updated_at = CURRENT_TIMESTAMP
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
                else:
                    # SQLite syntax
                    cursor.execute('''
                        INSERT OR REPLACE INTO activities (id, date, dayOfWeek, startTime, endTime, 
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
                
                # Check if this was an insert or update by checking if row was affected
                if cursor.rowcount > 0:
                    imported_count += 1
                else:
                    updated_count += 1
            
            # Commit the transaction
            conn.commit()
            
        except Exception as e:
            # Rollback on error
            try:
                conn.rollback()
            except:
                pass  # Ignore rollback errors
            print(f"Database error during import: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            traceback.print_exc()
            raise e
        finally:
            try:
                conn.close()
            except:
                pass  # Ignore close errors
        
        message_parts = []
        if imported_count > 0:
            message_parts.append(f'{imported_count} nye aktiviteter importert')
        if updated_count > 0:
            message_parts.append(f'{updated_count} eksisterende aktiviteter oppdatert')
        
        if not message_parts:
            message_parts.append('Ingen endringer')
        
        return jsonify({
            'success': True,
            'message': f'Suksess! {", ".join(message_parts)} fra Lorenskog Skytterlag kalender',
            'imported_count': imported_count,
            'updated_count': updated_count
        })
        
    except requests.RequestException as e:
        print(f"Request exception: {str(e)}")
        return jsonify({
            'success': False, 
            'error': f'Kunne ikke hente kalenderdata: {str(e)}'
        }), 500
    except Exception as e:
        print(f"General exception: {str(e)}")
        import traceback
        traceback.print_exc()
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
                activity = convert_event_to_activity(current_event, day_names, auto_categorize)
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

def convert_event_to_activity(event, day_names, auto_categorize=True):
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
            'Onsdag': ['PRS', 'Jeger', 'Pistol', '200m'],
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
        'Åpen for alle': '#98FB98',  # Mykere lys grønn
        'Jeger': '#228B22',          # Mørk grønn
        'DFS': '#FFFFFF',            # Hvit
        'Pistol': '#F59E0B',         # Oransje
        'PRS': '#8B5CF6',            # Lilla
        'Leirdue': '#EC4899',        # Rosa
        'Storviltprøve': '#3B82F6',  # Blå
        'Annet': '#6B7280',          # Grå
        'Uavklart': '#EF4444',       # Rød
        '100m': '#87CEEB',           # Lys blå
        '200m': '#4ECDC4'            # Turkis
    }
    return colors.get(activity_type, '#6B7280')

@app.route('/api/duplicates', methods=['GET', 'OPTIONS'])
def check_duplicates():
    if request.method == 'OPTIONS':
        return '', 200
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
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

@app.route('/api/duplicates', methods=['DELETE', 'OPTIONS'])
def remove_duplicates():
    if request.method == 'OPTIONS':
        return '', 200
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
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

@app.route('/api/cleanup/maintenance', methods=['DELETE', 'OPTIONS'])
def cleanup_maintenance_events():
    if request.method == 'OPTIONS':
        return '', 200
    """Remove maintenance events from database"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
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
            if IS_VERCEL:
                cursor.execute('DELETE FROM activities WHERE id = %s', (activity_id,))
            else:
                cursor.execute('DELETE FROM activities WHERE id = ?', (activity_id,))
            deleted_count += 1
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'deleted_count': deleted_count,
        'message': f'Fjernet {deleted_count} vedlikeholdsevents'
    })

@app.route('/api/activities/all', methods=['DELETE', 'OPTIONS'])
def delete_all_activities():
    if request.method == 'OPTIONS':
        return '', 200
    """Delete all activities from database"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
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