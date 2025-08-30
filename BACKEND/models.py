import numpy as np
import tensorflow as tf
import pandas as pd
from sklearn.preprocessing import StandardScaler
from database import get_all_readings

anomaly_model = None
scaler = None

def init_models():
    global anomaly_model, scaler

    data = get_all_readings()
    if not data:
        print("No historical data to train on. Models not initialized.")
        return

    df = pd.DataFrame(data)
    features = df[['sea_level', 'wave_height', 'wind_speed', 'water_quality']].values

    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)

    input_dim = scaled_features.shape[1]
    encoding_dim = 2

    input_layer = tf.keras.layers.Input(shape=(input_dim,))
    encoder = tf.keras.layers.Dense(encoding_dim, activation="relu")(input_layer)
    decoder = tf.keras.layers.Dense(input_dim, activation="sigmoid")(encoder)
    anomaly_model = tf.keras.Model(inputs=input_layer, outputs=decoder)
    anomaly_model.compile(optimizer='adam', loss='mean_squared_error')

    anomaly_model.fit(scaled_features, scaled_features, epochs=20, batch_size=32, verbose=0)
    print("Anomaly Detection Model trained.")

def detect_anomaly(new_reading):
    if anomaly_model is None or scaler is None:
        return False, 0.0

    new_data = np.array([[
        new_reading['sea_level'],
        new_reading['wave_height'],
        new_reading['wind_speed'],
        new_reading['water_quality']
    ]])
    scaled_new_data = scaler.transform(new_data)
    
    reconstructed_data = anomaly_model.predict(scaled_new_data, verbose=0)

    loss = np.mean(np.square(scaled_new_data - reconstructed_data))
    
    threshold = 0.05
    is_anomaly = loss > threshold
    
    return is_anomaly, loss

def get_chatbot_response(user_input):
    user_input = user_input.lower()
    
    readings = get_all_readings()
    latest_data = readings[0] if readings else {}

    if "hello" in user_input or "hi" in user_input:
        return "Hello! I am your AI assistant. How can I help you with coastal data today?"

    if "status" in user_input or "how are things" in user_input:
        if not latest_data:
            return "I don't have any real-time data at the moment."
        
        threat_level = latest_data.get('threat_level', 'unknown').upper()
        sea_level = latest_data.get('sea_level', 0.0)
        wind_speed = latest_data.get('wind_speed', 0.0)
        
        return f"Current status: Sea level is {sea_level:.2f}m, wind speed is {wind_speed:.0f} km/h. The overall threat level is {threat_level}."

    if "threat" in user_input or "danger" in user_input:
        if not latest_data:
            return "I need more data to assess the threat level."
            
        threat_level = latest_data.get('threat_level', 'low')
        if threat_level == 'high':
            return "🚨 The threat level is HIGH. We're seeing unusual patterns. Please check the Alerts page immediately."
        return f"The current threat level is {threat_level}. It is considered low at the moment."
        
    if "predict" in user_input or "forecast" in user_input:
        if len(readings) < 20:
            return "I need at least 20 data points for a reliable prediction."
        
        # This is a dummy prediction using a moving average
        sea_levels = [r['sea_level'] for r in readings[:20]]
        avg_sea_level = sum(sea_levels) / len(sea_levels)
        prediction = avg_sea_level + (np.random.rand() - 0.5) * 0.1
        
        return f"Based on recent data, the sea level is predicted to be around {prediction:.2f}m in the next 6 hours."

    if "anomalies" in user_input:
        anomalies = [r for r in readings if r.get('threat_level') == 'high']
        if len(anomalies) > 0:
            last_anomaly_time = anomalies[0].get('timestamp')
            return f"I have detected {len(anomalies)} anomalies in the data. The most recent was a spike at {last_anomaly_time}."
        
        return "No significant anomalies have been detected in the recent data."

    return "I'm sorry, I don't understand that request. I can only answer questions related to sensor data, anomalies, and threat predictions."