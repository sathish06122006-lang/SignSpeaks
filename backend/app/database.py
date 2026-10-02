import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongo_uri, tlsCAFile=certifi.where() if "mongodb+srv" in settings.mongo_uri else None)
db = client[settings.db_name]

# Collections
users_collection = db["users"]
detections_collection = db["detections"]
conversations_collection = db["conversations"]
tutorials_collection = db["tutorials"]
categories_collection = db["categories"]
feedback_collection = db["feedback"]
models_collection = db["cnn_models"]
dataset_samples_collection = db["dataset_samples"]
sign_images_collection = db["sign_images"]
practice_sessions_collection = db["practice_sessions"]


async def ensure_indexes():
    await users_collection.create_index("email", unique=True)
    await tutorials_collection.create_index("category")
    await detections_collection.create_index("user_id")
    await conversations_collection.create_index("user_id")
    await dataset_samples_collection.create_index("label")
    await sign_images_collection.create_index("label", unique=True)
    await practice_sessions_collection.create_index("user_id")
