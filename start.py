#!/usr/bin/env python3
"""
<<<<<<< HEAD
Startup script for the portfolio server with npm build
"""
import os
import sys
import subprocess

def run_npm_build():
    """Run npm install and build commands."""
    print("🔨 Building frontend assets...")
    try:
        # Run npm install if node_modules doesn't exist
        if not os.path.exists('node_modules'):
            print("📦 Installing dependencies...")
            subprocess.run(['npm', 'install'], check=True, shell=True)
        
        # Run npm build
        print("🔧 Running build...")
        subprocess.run(['npm', 'run', 'build'], check=True, shell=True)
        print("✅ Frontend build completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed with error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error during build: {e}")
        return False

def main():
    print("🚀 Starting Portfolio Server...")
    
    # Store original directory
    original_dir = os.getcwd()
    project_root = os.path.dirname(os.path.abspath(__file__))
    server_dir = os.path.join(project_root, 'server', 'VisualPortfolioServer')
=======
Fixed startup script for the portfolio server
"""
import os
import sys

def main():
    print("🚀 Starting Fixed Portfolio Server...")
    
    # Ensure we're in the right directory
    server_dir = os.path.join(os.path.dirname(__file__), 'server', 'VisualPortfolioServer')
>>>>>>> origin/main
    
    if not os.path.exists(server_dir):
        print("❌ Server directory not found!")
        return
<<<<<<< HEAD
    
    # Run npm build in the project root
    os.chdir(project_root)
    if not run_npm_build():
        print("⚠️  Continuing with server start, but build may be incomplete")
    
    # Change to server directory
    os.chdir(server_dir)
    
    # Add server to Python path
    sys.path.insert(0, server_dir)
    
=======
        
    # Add server to Python path
    sys.path.insert(0, server_dir)
    
    # Change to server directory
    original_dir = os.getcwd()
    os.chdir(server_dir)
    
>>>>>>> origin/main
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