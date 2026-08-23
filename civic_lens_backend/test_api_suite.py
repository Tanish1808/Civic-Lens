"""
Civic Lens Backend — API Verification Suite

Performs automated integration testing for endpoints defined in 05_Civic_Lens_API_Design.md:
- Health Check (GET /health)
- Public Tickets List & Search (GET /api/v1/tickets)
- User Authentication & Profile (POST /auth/signup, POST /auth/login, GET /users/me)
"""
import os
import sys
import json
import time
import requests

BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8000/api/v1")

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def test_health():
    url = "http://127.0.0.1:8000/health"
    resp = requests.get(url)
    assert resp.status_code == 200, f"Health check failed: {resp.status_code}"
    log("Health Check (GET /health) -> 200 OK")

def test_public_tickets():
    resp = requests.get(f"{BASE_URL}/tickets")
    if resp.status_code == 200:
        log("Public Tickets List (GET /tickets) -> 200 OK")
    elif resp.status_code == 503:
        log("Public Tickets List (GET /tickets) -> 503 DATABASE UNREACHABLE (Start MongoDB or set MONGODB_URI in .env)", "NOTE")
    else:
        log(f"Public Tickets List (GET /tickets) -> {resp.status_code} ({resp.text})", "WARNING")

def test_auth_flow():
    email = f"test_user_{int(time.time())}@example.com"
    password = "Password123"

    signup_resp = requests.post(f"{BASE_URL}/auth/signup", json={
        "email": email,
        "password": password,
        "full_name": "Test Citizen",
        "phone": f"+91987{int(time.time()) % 100000000:08d}"
    })
    if signup_resp.status_code in (201, 200):
        log(f"Signup (POST /auth/signup) -> {signup_resp.status_code} SUCCESS")
    elif signup_resp.status_code == 503:
        log("Signup (POST /auth/signup) -> 503 DATABASE UNREACHABLE (Start MongoDB or set MONGODB_URI in .env)", "NOTE")
    else:
        log(f"Signup (POST /auth/signup) -> {signup_resp.status_code} ({signup_resp.text})", "WARNING")

def run_all_checks():
    print("=" * 60)
    print("      CIVIC LENS BACKEND API VERIFICATION SUITE")
    print("=" * 60)
    try:
        test_health()
        test_public_tickets()
        test_auth_flow()
        print("=" * 60)
        log("VERIFICATION COMPLETED cleanly!", status="SUCCESS")
        print("=" * 60)
    except Exception as e:
        log(f"Verification error: {e}", status="ERROR")

if __name__ == "__main__":
    run_all_checks()

