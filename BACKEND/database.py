import sqlite3
import pandas as pd

DATABASE = 'sensor_data.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS readings (
            timestamp TEXT PRIMARY KEY,
            sea_level REAL,
            wave_height REAL,
            wind_speed REAL,
            water_quality REAL,
            temperature REAL,
            threat_level TEXT
        )
    ''')
    conn.commit()
    conn.close()
    
    print("Database initialized successfully.")

def insert_reading(data):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO readings (timestamp, sea_level, wave_height, wind_speed, water_quality, temperature, threat_level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['timestamp'],
        data['sea_level'],
        data['wave_height'],
        data['wind_speed'],
        data['water_quality'],
        data['temperature'],
        data['threat_level']
    ))
    conn.commit()
    conn.close()

def get_all_readings():
    conn = sqlite3.connect(DATABASE)
    df = pd.read_sql_query("SELECT * FROM readings ORDER BY timestamp DESC", conn)
    conn.close()
    
    return df.to_dict('records')

if __name__ == '__main__':
    init_db()