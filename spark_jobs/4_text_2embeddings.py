'''
    Kafka full-sentence consumer. Listens to stage after transcribed chunks have been stitched.
    Stores raw text to S3 and generates embeddings then inserts them into database.
'''

from openai import OpenAI
from pgvector.psycopg import register_vector
import psycopg

from kafka import KafkaConsumer
from pyspark.sql import SparkSession
import openai
import json


openai.api_key = 'your_openai_api_key'
KAFKA_TOPIC = 'topic'
KAFKA_BOOTSTRAP_SERVERS = 'localhost:9092'  # Update with your Kafka broker address
KAFKA_CONSUMER_GROUP_ID = 'consumer_group'
spark_appname = 'sparkapp'

pinecone.init(api_key='your_pinecone_api_key', environment='your_environment')  # Update with your Pinecone API key and environment
index_name = 'pinecone_index'
index = pinecone.Index(index_name)

# Initialize Spark Session
spark = SparkSession.builder \
    .appName(spark_appname) \
    .getOrCreate()

consumer = KafkaConsumer(
    KAFKA_TOPIC,
    bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
    auto_offset_reset='earliest',  # Start reading at the earliest offset
    enable_auto_commit=True,
    group_id=KAFKA_CONSUMER_GROUP_ID,  # Define a consumer group
    value_deserializer=lambda x: x.decode('utf-8')
)



def generate_embedding(text):
    """Call OpenAI API to generate embeddings from input text."""
    response = openai.Embedding.create(
        input=text,
        model="text-embedding-ada-002"  # Update with the appropriate model
    )
    return response['data'][0]['embedding']


def insert_embedding_into_pinecone(embedding, message_id):
    """Insert the generated embedding into Pinecone."""
    try:
        index.upsert([(message_id, embedding)])
        print(f"Inserted embedding for message ID: {message_id}")
    except Exception as e:
        print(f"Error inserting into Pinecone: {e}")

def process_message(message, message_id):
    """Process each Kafka message."""
    try:
        embedding = generate_embedding(message) # Make sentence embedding
        insert_embedding_into_pinecone(embedding, message_id) 
        
        df = spark.createDataFrame([embedding], schema="vector array<double>")
        df.show()  # Display the DataFrame
        # do more stuff 
    except Exception as e:
        print(f"Error processing message: {e}")

    return df

if __name__ == "__main__":
    print(f"Listening to Kafka topic: {KAFKA_TOPIC}")
    for message in consumer:
        print(f"Received message: {message.value}")
        process_message(message.value)







######## EXAMPLES ###########

def open_ai(kafka_topic):
    conn = psycopg.connect(dbname='pgvector_example', autocommit=True)

    conn.execute('CREATE EXTENSION IF NOT EXISTS vector')
    register_vector(conn)

    conn.execute('DROP TABLE IF EXISTS documents')
    conn.execute('CREATE TABLE documents (id bigserial PRIMARY KEY, content text, embedding vector(1536))')

    input = kafka_topic

    client = OpenAI()
    response = client.embeddings.create(input=input, model='text-embedding-3-small')
    embeddings = [v.embedding for v in response.data]

    for content, embedding in zip(input, embeddings):
        conn.execute('INSERT INTO documents (content, embedding) VALUES (%s, %s)', (content, embedding))

    document_id = 1
    neighbors = conn.execute('SELECT content FROM documents WHERE id != %(id)s ORDER BY embedding <=> (SELECT embedding FROM documents WHERE id = %(id)s) LIMIT 5', {'id': document_id}).fetchall()
    
    for neighbor in neighbors:
        print(neighbor[0])
    
    return neighbors


def sentence_embeddings(kafka_topic):
    from sentence_transformers import SentenceTransformer

    conn = psycopg.connect(dbname='pgvector_example', autocommit=True)

    conn.execute('CREATE EXTENSION IF NOT EXISTS vector')
    register_vector(conn)

    conn.execute('DROP TABLE IF EXISTS documents')
    conn.execute('CREATE TABLE documents (id bigserial PRIMARY KEY, content text, embedding vector(384))')

    input = kafka_topic

    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(input)

    for content, embedding in zip(input, embeddings):
        conn.execute('INSERT INTO documents (content, embedding) VALUES (%s, %s)', (content, embedding))

    document_id = 1
    neighbors = conn.execute('SELECT content FROM documents WHERE id != %(id)s ORDER BY embedding <=> (SELECT embedding FROM documents WHERE id = %(id)s) LIMIT 5', {'id': document_id}).fetchall()
    for neighbor in neighbors:
        print(neighbor[0])

    return neighbors
