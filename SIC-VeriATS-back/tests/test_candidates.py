from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_my_profile():
    # Use the dummy token from auth router
    headers = {"Authorization": "Bearer fake-jwt-token-xyz-123"}
    response = client.get("/candidates/me", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify structure matches what the frontend expects
    assert "id" in data
    assert "full_name" in data
    assert "email" in data
    assert "cv_filename" in data
    assert data["full_name"] == "John Doe"
    assert "experience" in data

def test_update_profile():
    headers = {"Authorization": "Bearer fake-jwt-token-xyz-123"}
    update_data = {
        "phone": "+999 888 777",
        "experience": "10 Years (Senior)"
    }
    response = client.patch("/candidates/me", json=update_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["phone"] == "+999 888 777"
    assert data["experience"] == "10 Years (Senior)"

def test_upload_cv():
    headers = {"Authorization": "Bearer fake-jwt-token-xyz-123"}
    files = {'file': ('test_cv.pdf', b'dummy content', 'application/pdf')}
    response = client.post("/candidates/me/cv", files=files, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert "filename" in data
    assert data["filename"] == "test_cv.pdf"
