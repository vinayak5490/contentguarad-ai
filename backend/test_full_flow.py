#!/usr/bin/env python
"""
Test script to verify the full API flow works correctly.
"""
import json
from app import app

def test_analyze_endpoint():
    """Test the /analyze endpoint with a sample content."""
    client = app.test_client()
    
    # Test 1: Valid content
    print("Test 1: Valid content with risk scoring...")
    response = client.post('/analyze', 
        json={'content': 'This is a test blog with amazing products that guarantee results and can help achieve financial freedom. It should be longer than 50 characters for validation purposes.'},
        content_type='application/json'
    )
    
    print(f"Status: {response.status_code}")
    data = response.get_json()
    print(f"Response: {json.dumps(data, indent=2)}")
    
    # Verify response structure
    assert 'risk_level' in data, "Missing risk_level"
    assert 'risk_score' in data, "Missing risk_score"
    assert 'tone' in data, "Missing tone"
    assert 'issues' in data, "Missing issues"
    assert 'plagiarism_risk' in data, "Missing plagiarism_risk"
    assert 'recommendations' in data, "Missing recommendations"
    assert isinstance(data['risk_score'], int), "risk_score should be an integer"
    assert 0 <= data['risk_score'] <= 100, "risk_score should be between 0 and 100"
    
    print("\n✓ All fields present and valid!\n")
    
    # Test 2: Short content (should fail)
    print("Test 2: Short content (should fail)...")
    response = client.post('/analyze',
        json={'content': 'Short'},
        content_type='application/json'
    )
    print(f"Status: {response.status_code}")
    data = response.get_json()
    print(f"Response: {json.dumps(data, indent=2)}")
    assert response.status_code == 400, "Should return 400 for short content"
    assert 'error' in data, "Should contain error message"
    print("\n✓ Short content validation works!\n")
    
    # Test 3: Missing content field
    print("Test 3: Missing content field...")
    response = client.post('/analyze',
        json={},
        content_type='application/json'
    )
    print(f"Status: {response.status_code}")
    data = response.get_json()
    print(f"Response: {json.dumps(data, indent=2)}")
    assert response.status_code == 400, "Should return 400 for missing content"
    print("\n✓ Missing content validation works!\n")
    
    print("=" * 50)
    print("All tests passed! ✓")
    print("=" * 50)

if __name__ == '__main__':
    test_analyze_endpoint()
