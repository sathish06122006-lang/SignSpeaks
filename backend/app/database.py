from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongo_uri)
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


async def ensure_indexes():
    await users_collection.create_index("email", unique=True)
    await tutorials_collection.create_index("category")
    await detections_collection.create_index("user_id")
    await conversations_collection.create_index("user_id")
    await dataset_samples_collection.create_index("label")
