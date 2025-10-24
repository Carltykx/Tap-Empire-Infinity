
import json

# Create manifest.json
manifest = {
    "name": "Tap Empire Infinity",
    "short_name": "TapEmpire",
    "description": "Build your empire by tapping and upgrading - An idle clicker game",
    "start_url": "/",
    "scope": "/",
    "display": "standalone",
    "orientation": "portrait",
    "theme_color": "#6366f1",
    "background_color": "#1e1b4b",
    "icons": [
        {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ],
    "categories": ["games", "entertainment"],
    "lang": "en-US"
}

manifest_json = json.dumps(manifest, indent=2)
print("Manifest.json created successfully!")
print(manifest_json)
