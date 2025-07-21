#!/usr/bin/env python3
"""
Fixed startup script for the portfolio server
"""
import os
import sys

def main():
    print("🚀 Starting Fixed Portfolio Server...")
    
    # Ensure we're in the right directory
    server_dir = os.path.join(os.path.dirname(__file__), 'server', 'VisualPortfolioServer')
    
    if not os.path.exists(server_dir):
        print("❌ Server directory not found!")
        return
        
    # Add server to Python path
    sys.path.insert(0, server_dir)
    
    # Change to server directory
    original_dir = os.getcwd()
    os.chdir(server_dir)
    
    try:
        # Import and run the app
        from app import app
        
        print("✅ Flask app loaded")
        print("🌐 Server starting on http://0.0.0.0:5000")
        print("📱 Homepage: http://localhost:5000")
        print("=" * 50)
        
        # Run with proper error handling
        app.run(
            host='0.0.0.0', 
            port=5000, 
            debug=False,
            use_reloader=False,  # Prevent double startup
            threaded=True
        )
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        os.chdir(original_dir)

if __name__ == '__main__':
    main()