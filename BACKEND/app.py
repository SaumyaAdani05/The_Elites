from flask import Flask, request, jsonify, render_template
import time
import random
import os
from datetime import datetime, timedelta
import threading
import sqlite3
import pandas as pd

from database import init_db, insert_reading, get_all_readings
from models import init_models, detect_anomaly, get_chatbot_response

app = Flask(__name__, static_folder='static')

# Initialize the database and models on application startup
with app.app_context():
    init_db()
    
    # Generate initial mock data if the database is empty
    if not get_all_readings():
        now = datetime.now()
        for i in range(200):
            timestamp = (now - timedelta(hours=i)).isoformat()
            sea_level = 1.0 + (i % 24 / 24) * 0.5 + (random.random() - 0.5) * 0.1
            wave_height = 1.5 + (random.random() * 1.5)
            wind_speed = 10 + (random.random() * 20)
            water_quality = 7.0 + (random.random() * 1.0)
            temperature = 20 + (random.random() * 10)
            
            threat_level = 'low'
            if sea_level > 1.4 or wave_height > 3.0 or wind_speed > 40:
                threat_level = 'medium'
            
            insert_reading({
                "timestamp": timestamp,
                "sea_level": sea_level,
                "wave_height": wave_height,
                "wind_speed": wind_speed,
                "water_quality": water_quality,
                "temperature": temperature,
                "threat_level": threat_level
            })
        
        # Inject some high-threat anomalies for a better demonstration
        for i in range(3):
            anomaly_data = {
                "timestamp": (now - timedelta(hours=random.randint(1, 199))).isoformat(),
                "sea_level": random.uniform(2.5, 3.5),
                "wave_height": random.uniform(4.0, 5.0),
                "wind_speed": random.uniform(55, 70),
                "water_quality": random.uniform(5.5, 6.0),
                "temperature": random.uniform(25, 30),
                "threat_level": 'high'
            }
            insert_reading(anomaly_data)
        
    init_models()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data', methods=['GET', 'POST'])
def handle_data():
    if request.method == 'POST':
        new_reading = {
            "timestamp": datetime.now().isoformat(),
            "sea_level": request.json.get("sea_level"),
            "wave_height": request.json.get("wave_height"),
            "wind_speed": request.json.get("wind_speed"),
            "water_quality": request.json.get("water_quality"),
            "temperature": request.json.get("temperature")
        }
        
        is_anomaly, loss = detect_anomaly(new_reading)
        
        if is_anomaly:
            new_reading['threat_level'] = 'high'
        else:
            new_reading['threat_level'] = 'low'
        
        insert_reading(new_reading)
        
        return jsonify({"status": "success", "data": new_reading})
    
    if request.method == 'GET':
        readings = get_all_readings()
        if readings:
            return jsonify({"status": "success", "data": readings[0]})
        return jsonify({"status": "error", "message": "No data found"}), 404

@app.route('/api/historical', methods=['GET'])
def get_historical_data():
    readings = get_all_readings()
    return jsonify({"status": "success", "data": readings})

@app.route('/api/chatbot', methods=['POST'])
def chatbot_endpoint():
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({"status": "error", "message": "No message provided"}), 400
    
    response = get_chatbot_response(user_input)
    return jsonify({"status": "success", "response": response})

@app.route('/api/retrain', methods=['POST'])
def retrain_models_endpoint():
    init_models()
    return jsonify({"status": "success", "message": "Models retrained."})
    
if __name__ == '__main__':
    app.run(debug=True)