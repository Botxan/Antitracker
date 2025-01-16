import os
import pandas as pd
import numpy as np
import random
import math
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, recall_score, f1_score, roc_auc_score, classification_report
from scipy import stats

def apply_noise_to_position(pos, sigma=10):
    """
    Apply changes as in mouse.js
    """
    _2PI = math.pi * 2
    u1 = random.random()
    u2 = random.random()
    z0 = math.sqrt(-2.0 * math.log(u1)) * math.cos(_2PI * u2)
    noisy_position = max(0, math.floor(pos + z0 * sigma))
    return noisy_position

def extract_features(group):

    xpos = group['xpos'].values
    ypos = group['ypos'].values
    

    dx = np.diff(xpos)
    dy = np.diff(ypos)
    velocities = np.sqrt(dx**2 + dy**2)
    accelerations = np.diff(velocities)
    
    features = {
        'xpos_mean': np.mean(xpos),
        'ypos_mean': np.mean(ypos),
        'xpos_std': np.std(xpos),
        'ypos_std': np.std(ypos),
        'velocity_mean': np.mean(velocities),
        'velocity_std': np.std(velocities),
        'num_events': len(group),
        'duration': group['timestamp'].max() - group['timestamp'].min()
    }
    return pd.Series(features)


participants_df = pd.read_csv('dataset/participants.tsv', sep='\t')
participants_df['log_id'] = participants_df['log_id'].astype(str)

all_logs_df = []
logs_directory = "dataset/logs/"

for filename in os.listdir(logs_directory):
    if filename.endswith(".csv"):
        file_path = os.path.join(logs_directory, filename)
        logs = pd.read_csv(file_path, sep='\s+', 
                          names=['cursor', 'timestamp', 'xpos', 'ypos', 'event', 'xpath', 'attrs', 'extras'])
        logs['log_id'] = filename.split('.')[0]
        logs['log_id'] = logs['log_id'].astype(str)
        
        logs['xpos'] = pd.to_numeric(logs['xpos'], errors='coerce')
        logs['ypos'] = pd.to_numeric(logs['ypos'], errors='coerce')
        logs['timestamp'] = pd.to_numeric(logs['timestamp'], errors='coerce')
        
        logs['xpos'].fillna(np.mean(logs['xpos']), inplace=True)
        logs['ypos'].fillna(np.mean(logs['ypos']), inplace=True)
        
        all_logs_df.append(logs)

all_logs_df = pd.concat(all_logs_df, ignore_index=True)


user_features = all_logs_df.groupby('log_id').apply(extract_features).reset_index()

merged_df = pd.merge(user_features, participants_df, on='log_id', how='inner')

# normalize
scaler = StandardScaler()
feature_columns = [col for col in user_features.columns if col != 'log_id']
merged_df[feature_columns] = scaler.fit_transform(merged_df[feature_columns])

columns_to_predict = ['age', 'gender', 'education', 'income']

for column in columns_to_predict:
    print(f"\n{'='*50}")
    print(f"Analysis for {column}")
    print(f"{'='*50}")
    

    X = merged_df[feature_columns]
    y = merged_df[column]
    
    # Data division: 60% train, 20% test, 20% test obfuscated
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.4, random_state=42)
    X_test, X_test_noise, y_test, y_test_noise = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
    

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    

    cv_scores = cross_val_score(model, X_train, y_train, cv=5)
    print(f"\nCross-validation (5-fold):")
    print(f"Mean: {cv_scores.mean():.4f}")
    print(f"Standard deviation: {cv_scores.std():.4f}")
    
    # Train final model
    model.fit(X_train, y_train)
    

    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    
    print("\nResults with original data:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"Recall weighted: {recall_score(y_test, y_pred, average='weighted'):.4f}")
    print(f"F1 weighted: {f1_score(y_test, y_pred, average='weighted'):.4f}")
    
    if len(np.unique(y)) == 2:  # binary classification
        print(f"AUC-ROC: {roc_auc_score(y_test, y_pred_proba[:, 1]):.4f}")
    
    print("\nDetailed classification report:")
    print(classification_report(y_test, y_pred))
    

    X_test_noisy = X_test_noise.copy()
    for col in X_test_noise.columns:
        if col.startswith(('xpos', 'ypos')):
            X_test_noisy[col] = X_test_noisy[col].apply(lambda x: apply_noise_to_position(x, sigma=10))
    
    y_pred_noise = model.predict(X_test_noisy)
    y_pred_proba_noise = model.predict_proba(X_test_noisy)
    
    print("\nResults with obfuscated data:")
    print(f"Accuracy: {accuracy_score(y_test_noise, y_pred_noise):.4f}")
    print(f"Recall weighted: {recall_score(y_test_noise, y_pred_noise, average='weighted'):.4f}")
    print(f"F1 weighted: {f1_score(y_test_noise, y_pred_noise, average='weighted'):.4f}")
    
    if len(np.unique(y)) == 2:
        print(f"AUC-ROC: {roc_auc_score(y_test_noise, y_pred_proba_noise[:, 1]):.4f}")
    
    print("\nNoise classification report:")
    print(classification_report(y_test_noise, y_pred_noise))
    
 
    original_predictions = model.predict_proba(X_test)
    noisy_predictions = model.predict_proba(X_test_noisy)
    
    t_stat, p_value = stats.ttest_rel(original_predictions.max(axis=1), 
                                     noisy_predictions.max(axis=1))
    
    print("\nStatistic analysis:")
    print(f"T-statistic: {t_stat:.4f}")
    print(f"P-value: {p_value:.4f}")
    print("Significant difference" if p_value < 0.05 else "Non-significant difference")