#!/usr/bin/env python3
"""
Test script to identify bugs in the portfolio application
"""
import os
import sys
import requests
import time
import subprocess
import threading

def test_server():
    """Test the server startup and identify bugs"""
    print("🔍 Testing Portfolio Server for Bugs...")
    
    # Add the server directory to Python path
    server_dir = os.path.join(os.getcwd(), 'server', 'VisualPortfolioServer')
    sys.path.insert(0, server_dir)
    
    # Change to the Flask app directory
    original_dir = os.getcwd()
    os.chdir(server_dir)
    
    try:
        # Import the Flask app
        from app import app
        print("✅ Flask app imported successfully")
        
        # Test static folder configuration
        print(f"📁 Static folder: {app.static_folder}")
        print(f"📁 Static folder exists: {os.path.exists(app.static_folder)}")
        
        if os.path.exists(app.static_folder):
            files = os.listdir(app.static_folder)
            print(f"📁 Static folder contents: {files}")
            
            # Check if index.html exists
            if 'index.html' in files:
                print("✅ index.html found")
            else:
                print("❌ BUG: index.html missing from static folder")
                
        # Start server in a thread for testing
        def run_server():
            app.run(host='0.0.0.0', port=5001, debug=False)
            
        server_thread = threading.Thread(target=run_server, daemon=True)
        server_thread.start()
        
        # Wait for server to start
        time.sleep(3)
        
        # Test API endpoints
        base_url = "http://localhost:5001"
        
        print("\n🧪 Testing API Endpoints...")
        
        # Test health endpoint
        try:
            response = requests.get(f"{base_url}/api/health", timeout=5)
            if response.status_code == 200:
                print("✅ Health endpoint working")
            else:
                print(f"❌ BUG: Health endpoint failed - {response.status_code}")
        except Exception as e:
            print(f"❌ BUG: Health endpoint error - {e}")
            
        # Test homepage
        try:
            response = requests.get(f"{base_url}/", timeout=5)
            if response.status_code == 200:
                print("✅ Homepage loading")
                # Check if it's serving the React app
                if '<div id="root"></div>' in response.text:
                    print("✅ React app structure found")
                else:
                    print("❌ BUG: Homepage not serving React app properly")
            else:
                print(f"❌ BUG: Homepage failed - {response.status_code}")
                print(f"Response: {response.text[:200]}")
        except Exception as e:
            print(f"❌ BUG: Homepage error - {e}")
            
        # Test API endpoints
        endpoints_to_test = [
            "/api/about",
            "/api/projects", 
            "/api/blogs",
            "/api/certifications"
        ]
        
        for endpoint in endpoints_to_test:
            try:
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
                if response.status_code == 200:
                    print(f"✅ {endpoint} working")
                else:
                    print(f"❌ BUG: {endpoint} failed - {response.status_code}")
            except Exception as e:
                print(f"❌ BUG: {endpoint} error - {e}")
                
        # Test static assets
        try:
            response = requests.get(f"{base_url}/assets/index-s9wSr6Zm.js", timeout=5)
            if response.status_code == 200:
                print("✅ Static assets serving")
            else:
                print(f"❌ BUG: Static assets failed - {response.status_code}")
        except Exception as e:
            print(f"❌ BUG: Static assets error - {e}")
            
    except Exception as e:
        print(f"❌ CRITICAL BUG: Server startup failed - {e}")
        import traceback
        traceback.print_exc()
    finally:
        os.chdir(original_dir)
        
    print("\n🏁 Bug testing complete!")

if __name__ == '__main__':
    test_server()