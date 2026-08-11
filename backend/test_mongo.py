import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

uri = os.getenv("MONGODB_URI")

print("URI loaded:", bool(uri))

if not uri:
    raise Exception("MONGODB_URI was not loaded")

print("Creating MongoDB client...")

client = MongoClient(
    uri,
    serverSelectionTimeoutMS=15000,
    connectTimeoutMS=15000,
    socketTimeoutMS=15000
)

print("Pinging MongoDB...")

try:
    result = client.admin.command("ping")
    print("================================")
    print("MONGODB CONNECTION SUCCESSFUL")
    print("================================")
    print(result)

except Exception as e:
    print("================================")
    print("MONGODB CONNECTION FAILED")
    print("================================")
    print(repr(e))

finally:
    client.close()