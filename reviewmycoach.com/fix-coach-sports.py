#!/usr/bin/env python3
"""
Script to fix coach sports mapping for existing coaches in Firebase
Run this after uploading coaches to properly categorize them by sport
"""

import firebase_admin
from firebase_admin import credentials, firestore
import re
import sys

# Sports mapping dictionary
SPORTS_MAPPING = {
    'basketball': 'Basketball',
    'soccer': 'Soccer', 
    'football': 'Football',
    'tennis': 'Tennis',
    'swimming': 'Swimming',
    'baseball': 'Baseball',
    'volleyball': 'Volleyball',
    'golf': 'Golf',
    'track': 'Track & Field',
    'field': 'Track & Field',
    'gymnastics': 'Gymnastics',
    'wrestling': 'Wrestling',
    'boxing': 'Boxing',
    'martial arts': 'Martial Arts',
    'karate': 'Martial Arts',
    'judo': 'Martial Arts',
    'taekwondo': 'Martial Arts',
    'hockey': 'Hockey',
    'lacrosse': 'Lacrosse',
    'softball': 'Softball',
    'cricket': 'Cricket',
    'mma': 'MMA',
    'fitness': 'Fitness Training',
    'personal training': 'Personal Training',
    'yoga': 'Yoga',
    'pilates': 'Pilates',
    'crossfit': 'CrossFit'
}

def extract_sports_from_role(role_description):
    """Extract sports from role description"""
    if not role_description:
        return ['General Coaching']
    
    sports = []
    role_lower = role_description.lower()
    
    # Check for each sport in the role description
    for keyword, sport_name in SPORTS_MAPPING.items():
        if keyword in role_lower:
            if sport_name not in sports:
                sports.append(sport_name)
    
    # If no specific sport found, keep as General Coaching
    if not sports:
        sports = ['General Coaching']
    
    return sports

def fix_coach_sports(firebase_key_path):
    """Fix sports mapping for all coaches"""
    
    # Initialize Firebase
    if not firebase_admin._apps:
        cred = credentials.Certificate(firebase_key_path)
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    
    # Get all coaches
    coaches_ref = db.collection('coaches')
    coaches = coaches_ref.stream()
    
    updated_count = 0
    
    for coach_doc in coaches:
        coach_data = coach_doc.to_dict()
        coach_id = coach_doc.id
        
        # Get current role and sports
        current_role = coach_data.get('role', '')
        current_sports = coach_data.get('sports', [])
        
        # Extract sports from role
        new_sports = extract_sports_from_role(current_role)
        
        # Update if sports changed
        if set(new_sports) != set(current_sports):
            print(f"Updating {coach_data.get('displayName', coach_id)}:")
            print(f"  Role: {current_role}")
            print(f"  Old sports: {current_sports}")
            print(f"  New sports: {new_sports}")
            print()
            
            # Update the coach document
            coaches_ref.document(coach_id).update({
                'sports': new_sports,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            
            updated_count += 1
    
    print(f"Updated {updated_count} coaches")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python fix-coach-sports.py <firebase-key.json>")
        sys.exit(1)
    
    firebase_key_path = sys.argv[1]
    fix_coach_sports(firebase_key_path)