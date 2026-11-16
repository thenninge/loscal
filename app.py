from flask import Flask, render_template, request, jsonify, send_from_directory
import json
import os
import re
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
import requests
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle
import os.path
# Import pg8000 only when needed (Vercel)
pg8000 = None

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
OSLO_TZ = ZoneInfo('Europe/Oslo')
SMARTPLAN_ICAL_URL = (
    'https://lorenskogskytterlag.smartplanapp.io/feeds/calendar/'
    '17385/2f15b6de06f7807dde12975fc421799bc79b5acc27b6b7a810c4d1fcafb723c1/'
    '?alarm=false'
)

# Database setup
import os

# Check if we're running on Vercel
IS_VERCEL = os.environ.get('VERCEL') == '1'

def get_db_connection():
    """Get database connection"""
    if IS_VERCEL:
        # Import pg8000 dynamically for Vercel
        global pg8000
        if pg8000 is None:
            import pg8000
        
        # Supabase PostgreSQL connection (with connection pooling for Vercel)
        DATABASE_URL = "postgresql://postgres.toofqfonichtzexpuvzc:sauer200STR!!@aws-0-eu-north-1.pooler.supabase.com:6543/postgres"
        
        try:
            # Parse connection string for pg8000
            parts = DATABASE_URL.replace('postgresql://', '').split('@')
            user_pass = parts[0].split(':')
            host_port_db = parts[1].split('/')
            host_port = host_port_db[0].split(':')

            conn = pg8000.Connection(
                user=user_pass[0],
                password=user_pass[1],
                host=host_port[0],
                port=int(host_port[1]),
                database=host_port_db[1]
            )
            return conn
        except Exception as e:
            print(f"Supabase connection error: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            traceback.print_exc()
            return None
    else:
        # Local SQLite database
        try:
            import sqlite3
            return sqlite3.connect('skytebane.db')
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
                    source VARCHAR(20) DEFAULT 'manual',
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
                    source TEXT DEFAULT 'manual',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS calendar_sync (
                scope VARCHAR(64) PRIMARY KEY,
                synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''' if IS_VERCEL else '''
            CREATE TABLE IF NOT EXISTS calendar_sync (
                scope TEXT PRIMARY KEY,
                synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Add source column if it doesn't exist (migration)
        try:
            if IS_VERCEL:
                # PostgreSQL - check if column exists
                cursor.execute("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'activities' AND column_name = 'source'
                """)
                if not cursor.fetchone():
                    print("Adding 'source' column to existing database...")
                    cursor.execute('ALTER TABLE activities ADD COLUMN source VARCHAR(20) DEFAULT \'manual\'')
            else:
                # SQLite - check if column exists
                cursor.execute("PRAGMA table_info(activities)")
                columns = [column[1] for column in cursor.fetchall()]
                if 'source' not in columns:
                    print("Adding 'source' column to existing database...")
                    cursor.execute('ALTER TABLE activities ADD COLUMN source TEXT DEFAULT \'manual\'')
        except Exception as migration_error:
            print(f"Migration warning (column might already exist): {str(migration_error)}")
        
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

@app.route('/localweather')
def localweather():
    return render_template('localweather.html')

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
        ical_url = SMARTPLAN_ICAL_URL
        response = requests.get(
            ical_url,
            timeout=15,
            headers={
                'User-Agent': 'LosbyKalender/1.0',
                'Cache-Control': 'no-cache',
            }
        )
        response.encoding = 'utf-8'
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
        
        # pg8000 doesn't have RealDictCursor, so we don't need to import it
        print("pg8000 doesn't have RealDictCursor - using regular cursor")
        
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
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500
            
        if IS_VERCEL:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM activities ORDER BY date, startTime')
            rows = cursor.fetchall()
            
            activities = []
            for row in rows:
                try:
                    # Handle activities field (index 6)
                    activities_data = row[6]
                    if isinstance(activities_data, str):
                        activities_data = json.loads(activities_data)
                    elif activities_data is None:
                        activities_data = []
                    
                    # Handle colors field (index 7)
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
                        'rangeOfficer': row[9],
                        'source': row[10] if len(row) > 10 else 'manual'
                    })
                except Exception as e:
                    print(f"Error processing PostgreSQL row {row[0]}: {str(e)}")
                    print(f"Row data: {row}")
                    # Skip this row and continue
                    continue
        else:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM activities ORDER BY date, startTime')
            rows = cursor.fetchall()
            
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
                        'rangeOfficer': row[9],
                        'source': row[12] if len(row) > 12 else 'manual'
                    })
                except Exception as e:
                    print(f"Error processing SQLite row {row[0]}: {str(e)}")
                    print(f"Row data: {row}")
                    # Skip this row and continue
                    continue
        
        conn.close()
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
                (id, iCalUID, date, dayOfWeek, startTime, endTime, activities, colors, comment, rangeOfficer, source)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                    source = EXCLUDED.source,
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
                data.get('rangeOfficer', ''),
                data.get('source', 'manual')
            ))
        else:
            # SQLite syntax
            cursor.execute('''
                INSERT OR REPLACE INTO activities 
                (id, iCalUID, date, dayOfWeek, startTime, endTime, activities, colors, comment, rangeOfficer, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                data.get('rangeOfficer', ''),
                data.get('source', 'manual')
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
                source = %s, updated_at = CURRENT_TIMESTAMP
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
            data.get('source', 'manual'),
            activity_id
        ))
    else:
        cursor.execute('''
            UPDATE activities 
            SET date = ?, dayOfWeek = ?, startTime = ?, endTime = ?, 
                activities = ?, colors = ?, comment = ?, rangeOfficer = ?,
                source = ?, updated_at = CURRENT_TIMESTAMP
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
            data.get('source', 'manual'),
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

TODAY_SYNC_MAX_AGE = timedelta(minutes=15)


def oslo_today():
    return datetime.now(OSLO_TZ).strftime('%Y-%m-%d')


def map_activity_row(row):
    activities_data = row[6]
    if isinstance(activities_data, str):
        activities_data = json.loads(activities_data)
    elif activities_data is None:
        activities_data = []

    colors_data = row[7]
    if isinstance(colors_data, str):
        colors_data = json.loads(colors_data)
    elif colors_data is None:
        colors_data = []

    return {
        'id': row[0],
        'iCalUID': row[1],
        'date': row[2],
        'dayOfWeek': row[3],
        'startTime': row[4],
        'endTime': row[5],
        'activities': activities_data,
        'colors': colors_data,
        'comment': row[8],
        'rangeOfficer': row[9],
        'source': row[10] if len(row) > 10 else 'manual'
    }


def fetch_activities_for_date(date_str):
    conn = get_db_connection()
    if not conn:
        return []
    try:
        cursor = conn.cursor()
        placeholder = get_placeholder()
        cursor.execute(
            f'''SELECT id, iCalUID, date, dayOfWeek, startTime, endTime, activities, colors, comment, rangeOfficer, source
                FROM activities WHERE date = {placeholder} ORDER BY startTime''',
            (date_str,)
        )
        return [map_activity_row(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def is_today_sync_fresh():
    today = oslo_today()
    conn = get_db_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        placeholder = get_placeholder()
        cursor.execute(
            f'SELECT synced_at FROM calendar_sync WHERE scope = {placeholder}',
            (f'today:{today}',)
        )
        row = cursor.fetchone()
        if not row or not row[0]:
            return False
        synced_at = row[0]
        if isinstance(synced_at, str):
            synced_at = datetime.fromisoformat(synced_at.replace('Z', ''))
        if getattr(synced_at, 'tzinfo', None) is None:
            synced_at = synced_at.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) - synced_at.astimezone(timezone.utc) < TODAY_SYNC_MAX_AGE
    except Exception as e:
        print(f"Freshness check failed: {e}")
        return False
    finally:
        conn.close()


def mark_today_synced():
    today = oslo_today()
    conn = get_db_connection()
    if not conn:
        return
    try:
        cursor = conn.cursor()
        placeholder = get_placeholder()
        scope = f'today:{today}'
        if IS_VERCEL:
            cursor.execute(
                f'''INSERT INTO calendar_sync (scope, synced_at)
                    VALUES ({placeholder}, CURRENT_TIMESTAMP)
                    ON CONFLICT (scope) DO UPDATE SET synced_at = CURRENT_TIMESTAMP''',
                (scope,)
            )
        else:
            cursor.execute(
                'INSERT OR REPLACE INTO calendar_sync (scope, synced_at) VALUES (?, CURRENT_TIMESTAMP)',
                (scope,)
            )
        conn.commit()
    finally:
        conn.close()


def import_calendar_range(from_date, to_date, auto_categorize=True):
    response = requests.get(
        SMARTPLAN_ICAL_URL,
        timeout=15,
        headers={
            'User-Agent': 'LosbyKalender/1.0',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        }
    )
    response.raise_for_status()
    response.encoding = 'utf-8'
    ical_data = response.text
    if 'BEGIN:VEVENT' not in ical_data:
        raise ValueError('Kalenderfeeden inneholdt ingen hendelser')

    events = parse_ical_data(ical_data, from_date, to_date, auto_categorize)
    print(f"Import: {len(events)} aktiviteter i perioden {from_date}–{to_date}")

    init_db()
    conn = get_db_connection()
    if not conn:
        raise RuntimeError('Database connection failed')

    cursor = conn.cursor()
    placeholder = get_placeholder()
    imported_count = 0
    skipped_manual = 0

    try:
        cursor.execute(
            f'SELECT date, startTime, endTime FROM activities WHERE source = {placeholder} AND date >= {placeholder} AND date <= {placeholder}',
            ('manual', from_date, to_date)
        )
        manual_slots = {(row[0], row[1], row[2]) for row in cursor.fetchall()}

        events_to_save = [
            event for event in events
            if (event['date'], event['startTime'], event['endTime']) not in manual_slots
        ]
        skipped_manual = len(events) - len(events_to_save)

        cursor.execute(
            f'DELETE FROM activities WHERE source = {placeholder} AND date >= {placeholder} AND date <= {placeholder}',
            ('imported', from_date, to_date)
        )

        insert_sql = '''
            INSERT INTO activities (id, iCalUID, date, dayOfWeek, startTime, endTime,
                                  activities, colors, comment, rangeOfficer, source, created_at, updated_at)
            VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        '''.format(ph=placeholder)
        if IS_VERCEL:
            insert_sql += '''
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
                    source = EXCLUDED.source,
                    updated_at = CURRENT_TIMESTAMP
            '''
        else:
            insert_sql = insert_sql.replace('INSERT INTO', 'INSERT OR REPLACE INTO', 1)

        for event in events_to_save:
            cursor.execute(insert_sql, (
                event['id'],
                event.get('iCalUID'),
                event['date'],
                event['dayOfWeek'],
                event['startTime'],
                event['endTime'],
                json.dumps(event['activities']),
                json.dumps(event['colors']),
                event['comment'],
                event['rangeOfficer'],
                event['source']
            ))
            imported_count += 1

        conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
        raise
    finally:
        try:
            conn.close()
        except Exception:
            pass

    return imported_count, skipped_manual


@app.route('/api/today', methods=['GET'])
def get_today():
    try:
        init_db()
        today = oslo_today()
        refreshed = False
        if not is_today_sync_fresh():
            import_calendar_range(today, today, True)
            mark_today_synced()
            refreshed = True
        return jsonify({
            'success': True,
            'date': today,
            'refreshed': refreshed,
            'activities': fetch_activities_for_date(today)
        })
    except Exception as e:
        print(f"Today endpoint error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Kunne ikke hente dagens åpningstider: {str(e)}'
        }), 500


@app.route('/api/import/calendar', methods=['POST', 'OPTIONS'])
def import_calendar():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json() or {}
        from_date = data.get('from_date')
        to_date = data.get('to_date')
        auto_categorize = data.get('auto_categorize', True)

        if not from_date or not to_date:
            return jsonify({
                'success': False,
                'error': 'Fra- og til-dato må være spesifisert'
            }), 400

        imported_count, skipped_manual = import_calendar_range(from_date, to_date, auto_categorize)
        message = f'{imported_count} aktiviteter importert/oppdatert' if imported_count else 'Ingen endringer'
        if skipped_manual:
            message += f' ({skipped_manual} hoppet over pga. manuelle aktiviteter)'

        return jsonify({
            'success': True,
            'message': f'Suksess! {message} fra Lorenskog Skytterlag kalender',
            'imported_count': imported_count
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

def unfold_ical_lines(ical_content):
    """Join RFC 5545 folded lines so properties like DTSTART;TZID=... are complete."""
    text = ical_content.replace('\r\n', '\n').replace('\r', '\n')
    unfolded = []
    for line in text.split('\n'):
        if unfolded and line[:1] in (' ', '\t'):
            unfolded[-1] += line[1:]
        else:
            unfolded.append(line)
    return unfolded


def unescape_ical_text(value):
    if not value:
        return value
    return (
        value.replace('\\\\', '\\')
        .replace('\\n', '\n')
        .replace('\\N', '\n')
        .replace('\\,', ',')
        .replace('\\;', ';')
    )


def split_ical_property(line):
    if ':' not in line:
        return None, {}, ''
    name_params, value = line.split(':', 1)
    parts = name_params.split(';')
    params = {}
    for part in parts[1:]:
        if '=' in part:
            key, val = part.split('=', 1)
            params[key.upper()] = val
        else:
            params[part.upper()] = True
    return parts[0].upper(), params, value


def timeslot_activity_id(activity):
    date = activity['date'].replace('-', '')
    start = activity['startTime'].replace(':', '')
    end = activity['endTime'].replace(':', '')
    return f"ical-{date}-{start}-{end}"


def parse_ical_data(ical_content, from_date=None, to_date=None, auto_categorize=True):
    """Parse iCal data and convert to activities"""
    events = []
    current_event = {}
    in_event = False
    day_names = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

    for line in unfold_ical_lines(ical_content):
        stripped = line.strip()
        if stripped == 'BEGIN:VEVENT':
            current_event = {}
            in_event = True
            continue
        if stripped == 'END:VEVENT':
            if in_event and current_event.get('summary'):
                status = (current_event.get('status') or '').upper()
                if status != 'CANCELLED':
                    activity = convert_event_to_activity(current_event, day_names, auto_categorize)
                    if activity:
                        if not from_date or not to_date or from_date <= activity['date'] <= to_date:
                            events.append(activity)
            in_event = False
            current_event = {}
            continue
        if not in_event:
            continue

        name, params, value = split_ical_property(stripped)
        if name == 'SUMMARY':
            current_event['summary'] = unescape_ical_text(value)
        elif name == 'DTSTART':
            current_event['start'] = parse_ical_datetime(value, params.get('TZID'))
        elif name == 'DTEND':
            current_event['end'] = parse_ical_datetime(value, params.get('TZID'))
        elif name == 'DESCRIPTION':
            current_event['description'] = unescape_ical_text(value)
        elif name == 'UID':
            current_event['uid'] = value
        elif name == 'STATUS':
            current_event['status'] = value

    events = remove_duplicate_events(events)
    for event in events:
        event['id'] = timeslot_activity_id(event)
    return events

def remove_duplicate_events(events):
    """Combine duplicate events by merging their activities instead of choosing one"""
    # Group events by date and time
    event_groups = {}
    
    for event in events:
        key = f"{event['date']}_{event['startTime']}_{event['endTime']}"
        if key not in event_groups:
            event_groups[key] = []
        event_groups[key].append(event)
    
    # For each group, combine activities or choose the best one
    filtered_events = []
    
    for key, group_events in event_groups.items():
        if len(group_events) == 1:
            # No duplicates, keep the event
            filtered_events.append(group_events[0])
        else:
            # Named standplassleder beats ledig standplassleder; then storvilt; then other.
            base_event = group_events[0]
            best_priority = -1

            for event in group_events:
                summary = event['comment'].lower()
                if 'standplassleder' in summary:
                    priority = 30
                elif 'storviltprøve kontrollør' in summary:
                    priority = 20
                else:
                    priority = 10
                if 'ledig' not in summary:
                    priority += 5
                if priority > best_priority:
                    base_event = event
                    best_priority = priority
            
            # Combine all activities from all events, then pick range officer separately.
            all_activities = []
            all_colors = []
            range_officer = "Ikke satt"

            for event in group_events:
                all_activities.extend(event['activities'])
                all_colors.extend(event['colors'])

            for event in group_events:
                if 'standplassleder' not in event['comment'].lower():
                    continue
                if ' - ' in event['comment']:
                    comment_parts = event['comment'].replace('Importert fra Lorenskog Skytterlag: ', '').split(' - ')
                    if len(comment_parts) >= 2 and 'standplassleder' in comment_parts[1].lower():
                        extracted_name = comment_parts[0].strip()
                        if extracted_name and extracted_name.lower() != 'ledig':
                            range_officer = extracted_name
                            break
                elif event.get('rangeOfficer') and event['rangeOfficer'] != "Ikke satt":
                    range_officer = event['rangeOfficer']
                    break
            
            # Remove duplicates while preserving order
            unique_activities = []
            unique_colors = []
            for i, activity in enumerate(all_activities):
                if activity not in unique_activities:
                    unique_activities.append(activity)
                    unique_colors.append(all_colors[i])
            
            # If we have a named Standplassleder, remove "Uavklart" from activities
            if range_officer != "Ikke satt" and "Uavklart" in unique_activities:
                uavklart_index = unique_activities.index("Uavklart")
                unique_activities.pop(uavklart_index)
                unique_colors.pop(uavklart_index)
            
            # Create combined event
            combined_event = base_event.copy()
            combined_event['activities'] = unique_activities
            combined_event['colors'] = unique_colors
            combined_event['rangeOfficer'] = range_officer
            merged_uids = []
            for event in group_events:
                uid = event.get('iCalUID')
                if uid:
                    merged_uids.extend(part for part in uid.split(',') if part)
            combined_event['iCalUID'] = ','.join(sorted(set(merged_uids)))
            
            # Clean up the combined comment - remove prefixes and make it cleaner
            clean_comments = []
            for event in group_events:
                comment = event['comment'].replace('Importert fra Lorenskog Skytterlag: ', '')
                # Keep "Ledig" information but clean up the format
                if comment.startswith('Ledig ') and 'vakt' in comment.lower():
                    # Change "Ledig Standplassleder vakt" to "Standplassleder vakt - ledig"
                    comment = comment.replace('Ledig ', '').replace(' vakt', ' vakt - ledig')
                clean_comments.append(comment)
            
            # Use the most descriptive comment as base, or create a summary
            if len(clean_comments) == 1:
                combined_event['comment'] = clean_comments[0]
            else:
                # Find the most descriptive comment (has a person name)
                best_comment = clean_comments[0]
                for comment in clean_comments:
                    if ' - ' in comment:  # Has person name
                        best_comment = comment
                        break
                
                # Always show all comments, regardless of count
                combined_event['comment'] = f"{', '.join(clean_comments)}"
            
            filtered_events.append(combined_event)
    
    return filtered_events

def parse_ical_datetime(dt_string, tzid=None):
    """Parse iCal datetime into Europe/Oslo local time, including DST."""
    if not dt_string:
        return None
    dt_string = dt_string.strip()
    try:
        if dt_string.endswith('Z'):
            parsed = datetime.strptime(dt_string, '%Y%m%dT%H%M%SZ').replace(tzinfo=timezone.utc)
            return parsed.astimezone(OSLO_TZ)
        if 'T' not in dt_string and len(dt_string) == 8:
            return datetime.strptime(dt_string, '%Y%m%d').replace(tzinfo=OSLO_TZ)
        if 'T' in dt_string:
            parsed = datetime.strptime(dt_string[:15], '%Y%m%dT%H%M%S')
            tz = ZoneInfo(tzid.strip('"')) if tzid else OSLO_TZ
            return parsed.replace(tzinfo=tz)
    except Exception as e:
        print(f"Failed to parse datetime: {dt_string} tzid={tzid} ({e})")
        return None
    return None

def convert_event_to_activity(event, day_names, auto_categorize=True):
    """Convert iCal event to activity format"""
    if not event.get('start') or not event.get('summary'):
        return None

    start_dt = event['start']
    end_dt = event.get('end') or (start_dt + timedelta(hours=1))
    if start_dt.tzinfo:
        start_dt = start_dt.astimezone(OSLO_TZ)
        end_dt = end_dt.astimezone(OSLO_TZ)

    day_of_week = day_names[start_dt.weekday() % 7]
    summary = event['summary']
    activity_types = determine_activity_types(summary, day_of_week, auto_categorize)
    if not activity_types:
        return None

    activity = {
        'date': start_dt.strftime('%Y-%m-%d'),
        'dayOfWeek': day_of_week,
        'startTime': start_dt.strftime('%H:%M'),
        'endTime': end_dt.strftime('%H:%M'),
        'activities': activity_types,
        'colors': [get_color_for_activity(activity_type) for activity_type in activity_types],
        'comment': f"Importert fra Lorenskog Skytterlag: {summary}",
        'rangeOfficer': extract_range_officer(summary),
        'source': 'imported',
        'iCalUID': event.get('uid')
    }
    activity['id'] = timeslot_activity_id(activity)
    return activity

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
    
    # Clean summary for comparison (remove backslashes and normalize)
    clean_summary = summary_lower.replace('\\', '')
    if any(word in clean_summary for word in maintenance_words):
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
    if 'storviltprøve' in summary_lower or 'storvilt' in summary_lower or 'kontrollør' in summary_lower:
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
    match = re.match(r'^(.+?)\s*-\s*(.+)$', summary)
    if not match:
        return 'Ikke satt'

    person_name = match.group(1).strip()
    role = match.group(2).strip().lower()
    if role == 'standplassleder' and person_name and person_name.lower() != 'ledig':
        return person_name
    return 'Ikke satt'

def get_color_for_activity(activity_type):
    """Get color for activity type"""
    colors = {
        'Åpen for alle': '#98FB98',  # Mykere lys grønn
        'Jeger': '#228B22',          # Mørk grønn
        'DFS': '#8B4513',            # Brun
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
    
    # Find duplicates
    cursor.execute('''
        SELECT date, startTime, endTime, COUNT(*) as count
        FROM activities 
        GROUP BY date, startTime, endTime 
        HAVING COUNT(*) > 1
    ''')
    duplicates = cursor.fetchall()
    
    # For each duplicate group, keep the one with highest priority
    for duplicate in duplicates:
        date, start_time, end_time, count = duplicate
        
        # Get all activities in this time slot
        if IS_VERCEL:
            cursor.execute('''
                SELECT id, comment, source FROM activities 
                WHERE date = %s AND startTime = %s AND endTime = %s
            ''', (date, start_time, end_time))
        else:
            cursor.execute('''
                SELECT id, comment, source FROM activities 
                WHERE date = ? AND startTime = ? AND endTime = ?
            ''', (date, start_time, end_time))
        
        activities = cursor.fetchall()
        best_id = activities[0][0]  # Default to first
        best_priority = 0
        
        # Find the best activity with priority:
        # 1. Manual activities (highest priority)
        # 2. Standplassleder (imported)
        # 3. Vakt Standplass (imported)
        # 4. Other imported activities (lowest priority)
        for activity_id, comment, source in activities:
            priority = 0
            
            # Manual activities get highest priority
            if source == 'manual':
                priority = 100
            else:
                # For imported activities, prioritize by content
                comment_lower = comment.lower() if comment else ''
                if 'standplassleder' in comment_lower:
                    priority = 50
                elif 'vakt standplass' in comment_lower:
                    priority = 25
                else:
                    priority = 10
            
            if priority > best_priority:
                best_priority = priority
                best_id = activity_id
        
        # Delete all except the best one
        if IS_VERCEL:
            cursor.execute('''
                DELETE FROM activities 
                WHERE date = %s AND startTime = %s AND endTime = %s AND id != %s
            ''', (date, start_time, end_time, best_id))
        else:
            cursor.execute('''
                DELETE FROM activities 
                WHERE date = ? AND startTime = ? AND endTime = ? AND id != ?
            ''', (date, start_time, end_time, best_id))
    
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

@app.route('/api/activities/imported', methods=['DELETE', 'OPTIONS'])
def delete_imported_activities():
    if request.method == 'OPTIONS':
        return '', 200
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
    cursor = conn.cursor()
    
    # Get count before deletion
    cursor.execute('SELECT COUNT(*) FROM activities WHERE source = %s' if IS_VERCEL else 'SELECT COUNT(*) FROM activities WHERE source = ?', ('imported',))
    count = cursor.fetchone()[0]
    
    # Delete imported activities
    cursor.execute('DELETE FROM activities WHERE source = %s' if IS_VERCEL else 'DELETE FROM activities WHERE source = ?', ('imported',))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'deleted_count': count,
        'message': f'Slettet {count} importerte aktiviteter'
    })

@app.route('/api/activities/manual', methods=['DELETE', 'OPTIONS'])
def delete_manual_activities():
    if request.method == 'OPTIONS':
        return '', 200
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
    cursor = conn.cursor()
    
    # Get count before deletion
    cursor.execute('SELECT COUNT(*) FROM activities WHERE source = %s' if IS_VERCEL else 'SELECT COUNT(*) FROM activities WHERE source = ?', ('manual',))
    count = cursor.fetchone()[0]
    
    # Delete manual activities
    cursor.execute('DELETE FROM activities WHERE source = %s' if IS_VERCEL else 'DELETE FROM activities WHERE source = ?', ('manual',))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'deleted_count': count,
        'message': f'Slettet {count} manuelt opprettede aktiviteter'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000) 