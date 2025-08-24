# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from rag_orchestrator import RAGOrchestrator
# from dotenv import load_dotenv
# import google.generativeai as genai
# from enum import Enum
# import os

# load_dotenv()

# app = Flask(__name__)
# CORS(app)  # Enable CORS for frontend communication

# # Initialize RAG system
# pdf_folder = "./pdf"
# gemini_api_key = os.getenv("GEMINI_API_KEY")
# rag_system = None

# class QueryIntent(Enum):
#     DRUG_RELATED = "drug_related"  # Query is about drugs, medications, pharmacology
#     GREETING = "greeting"          # Hello, hi, etc.
#     IRRELEVANT = "irrelevant"      # Everything else

# def classify_and_handle_query(query: str):
#     """
#     Uses the Gemini API to classify the user's query intent and generate appropriate responses.
#     For greeting and irrelevant queries, the LLM itself generates the response.
#     """
#     # System prompt that handles both classification and response generation
#     classification_prompt = f"""
#     You are a strict pharmaceutical chatbot. Analyze the user's query and:

#     1. If this is a GREETING (hello, hi, hey, greetings, how are you): 
#        - Respond with: "GREETING_RESPONSE: [your friendly greeting here]"

#     2. If this is IRRELEVANT (anything not related to drugs, medicine, pharmaceuticals, health conditions, treatments):
#        - Respond with: "IRRELEVANT_RESPONSE: [your polite decline here]"

#     3. If this is DRUG-RELATED (anything about drugs, medications, side effects, interactions, dosage, pharmacology, medical conditions):
#        - Respond with only: "DRUG_RELATED_QUERY"

#     User Query: "{query}"

#     Your response:
#     """

#     try:
#         # Use a fast, cheap model for this task
#         genai.configure(api_key=gemini_api_key)
#         model = genai.GenerativeModel('gemini-1.5-flash')
#         response = model.generate_content(classification_prompt)
#         response_text = response.text.strip()

#         # Check the response type
#         if "DRUG_RELATED_QUERY" in response_text:
#             return QueryIntent.DRUG_RELATED, None
#         elif "GREETING_RESPONSE:" in response_text:
#             # Extract just the response part
#             greeting_response = response_text.split("GREETING_RESPONSE:", 1)[1].strip()
#             return QueryIntent.GREETING, greeting_response
#         elif "IRRELEVANT_RESPONSE:" in response_text:
#             # Extract just the response part
#             irrelevant_response = response_text.split("IRRELEVANT_RESPONSE:", 1)[1].strip()
#             return QueryIntent.IRRELEVANT, irrelevant_response
#         else:
#             # Fallback if the model doesn't follow instructions
#             print(f"Unexpected response format: {response_text}")
#             return QueryIntent.DRUG_RELATED, None

#     except Exception as e:
#         print(f"Error during intent classification: {e}. Defaulting to drug_related.")
#         return QueryIntent.DRUG_RELATED, None

# def initialize_rag_system():
#     """Initialize the RAG system"""
#     global rag_system
#     try:
#         rag_system = RAGOrchestrator(pdf_folder, gemini_api_key)
        
#         # Check if database has documents
#         if not rag_system.vector_db.is_initialized():
#             if not rag_system.vector_db.initialize(reset=False):
#                 return False
        
#         if rag_system.vector_db.get_document_count() == 0:
#             return False
            
#         return True
#     except Exception as e:
#         print(f"Error initializing RAG system: {e}")
#         return False

# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint"""
#     return jsonify({
#         'status': 'healthy',
#         'database_initialized': rag_system is not None and rag_system.vector_db.is_initialized(),
#         'document_count': rag_system.vector_db.get_document_count() if rag_system else 0
#     })

# @app.route('/api/query', methods=['POST'])
# def process_query():
#     """Process user query"""
#     try:
#         data = request.get_json()
#         query = data.get('query', '').strip()
        
#         if not query:
#             return jsonify({'error': 'Query is required'}), 400
        
#         if not rag_system:
#             initialized = initialize_rag_system()
#             if not initialized:
#                 return jsonify({'error': 'RAG system not initialized. Please run ingestion first.'}), 500
        
#         # --- CLASSIFY AND HANDLE THE QUERY --- #
#         intent, immediate_response = classify_and_handle_query(query)
        
#         if intent == QueryIntent.DRUG_RELATED:
#             # Only drug-related queries go through the full RAG flow
#             response_text = rag_system.query(query)
#         else:
#             # Use the response already generated by the LLM for greeting/irrelevant
#             response_text = immediate_response
#         # --- END OF CLASSIFICATION CODE --- #

#         return jsonify({
#             'response': response_text,
#             'query': query,
#             'detected_intent': intent.value,
#             'success': True
#         })
        
#     except Exception as e:
#         return jsonify({
#             'error': f'Error processing query: {str(e)}',
#             'success': False
#         }), 500

# @app.route('/api/database-info', methods=['GET'])
# def get_database_info():
#     """Get database information"""
#     try:
#         if not rag_system:
#             initialized = initialize_rag_system()
#             if not initialized:
#                 return jsonify({'error': 'RAG system not initialized'}), 400
        
#         pdfs_in_db = rag_system.vector_db.list_all_documents()
        
#         return jsonify({
#             'document_count': rag_system.vector_db.get_document_count(),
#             'pdfs_in_database': pdfs_in_db,
#             'initialized': rag_system.vector_db.is_initialized()
#         })
        
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# if __name__ == '__main__':
#     # Initialize RAG system on startup
#     print("Initializing RAG system...")
#     if initialize_rag_system():
#         print("RAG system initialized successfully")
#         print(f"Documents in database: {rag_system.vector_db.get_document_count()}")
#     else:
#         print("Warning: RAG system could not be initialized. Please run ingestion first.")
    
#     # Run Flask app
#     app.run(debug=True, host='0.0.0.0', port=5001)



from flask import Flask, request, jsonify
from flask_cors import CORS
from rag_orchestrator import RAGOrchestrator
from dotenv import load_dotenv
import google.generativeai as genai
from enum import Enum
import os
import json
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize RAG system
pdf_folder = "./pdf"
gemini_api_key = os.getenv("GEMINI_API_KEY")
rag_system = None

# In-memory conversation store (in production, use a proper database)
conversation_store = {}

class QueryIntent(Enum):
    DRUG_RELATED = "drug_related"  # Query is about drugs, medications, pharmacology
    GREETING = "greeting"          # Hello, hi, etc.
    IRRELEVANT = "irrelevant"      # Everything else

def classify_and_handle_query(query: str, conversation_id: str = None):
    """
    Uses the Gemini API to classify the user's query intent and generate appropriate responses.
    For greeting and irrelevant queries, the LLM itself generates the response.
    """
    # Get conversation context for better classification
    conversation_context = ""
    if conversation_id and conversation_id in conversation_store:
        conversation = conversation_store[conversation_id]
        # Include the last few exchanges for context
        for exchange in conversation["history"][-3:]:
            conversation_context += f"User: {exchange['user_query']}\n"
            conversation_context += f"Assistant: {exchange['assistant_response']}\n"
    
    # System prompt that handles both classification and response generation
    classification_prompt = f"""
    You are a strict pharmaceutical chatbot. Analyze the user's query and:

    1. If this is a GREETING (hello, hi, hey, greetings, how are you): 
       - Respond with: "GREETING_RESPONSE: [your friendly greeting here]"

    2. If this is IRRELEVANT (anything not related to drugs, medicine, pharmaceuticals, health conditions, treatments):
       - Respond with: "IRRELEVANT_RESPONSE: [your polite decline here]"

    3. If this is DRUG-RELATED (anything about drugs, medications, side effects, interactions, dosage, pharmacology, medical conditions):
       - Respond with only: "DRUG_RELATED_QUERY"

    IMPORTANT: Consider the conversation context. If the user asks follow-up questions like 
    "what are its usescases", "what are its sideeffects", "how does it work", "what is the dosage", 
    "are there any interactions", etc. - these are ALWAYS drug-related queries even if no specific 
    drug is mentioned in the current sentence. The user is referring to a drug discussed earlier.

    Conversation Context:
    {conversation_context}

    User Query: "{query}"

    Your response:
    """

    try:
        # Use a fast, cheap model for this task
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(classification_prompt)
        response_text = response.text.strip()

        # Check the response type
        if "DRUG_RELATED_QUERY" in response_text:
            return QueryIntent.DRUG_RELATED, None
        elif "GREETING_RESPONSE:" in response_text:
            # Extract just the response part
            greeting_response = response_text.split("GREETING_RESPONSE:", 1)[1].strip()
            return QueryIntent.GREETING, greeting_response
        elif "IRRELEVANT_RESPONSE:" in response_text:
            # Extract just the response part
            irrelevant_response = response_text.split("IRRELEVANT_RESPONSE:", 1)[1].strip()
            return QueryIntent.IRRELEVANT, irrelevant_response
        else:
            # Fallback if the model doesn't follow instructions
            print(f"Unexpected response format: {response_text}")
            return QueryIntent.DRUG_RELATED, None

    except Exception as e:
        print(f"Error during intent classification: {e}. Defaulting to drug_related.")
        return QueryIntent.DRUG_RELATED, None

def initialize_rag_system():
    """Initialize the RAG system"""
    global rag_system
    try:
        rag_system = RAGOrchestrator(pdf_folder, gemini_api_key)
        
        # Check if database has documents
        if not rag_system.vector_db.is_initialized():
            if not rag_system.vector_db.initialize(reset=False):
                return False
        
        if rag_system.vector_db.get_document_count() == 0:
            return False
            
        return True
    except Exception as e:
        print(f"Error initializing RAG system: {e}")
        return False

def get_conversation_history(conversation_id: str):
    """Get conversation history for a given ID"""
    if conversation_id not in conversation_store:
        conversation_store[conversation_id] = {
            "history": [],
            "current_drug": None,
            "last_query": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    
    conversation_store[conversation_id]["updated_at"] = datetime.now().isoformat()
    return conversation_store[conversation_id]

def update_conversation_history(conversation_id: str, user_query: str, response: str, detected_drug: str = None):
    """Update conversation history with new exchange"""
    conversation = get_conversation_history(conversation_id)
    
    # Update current drug context if a drug was mentioned
    if detected_drug:
        conversation["current_drug"] = detected_drug
    elif detected_drug is None and conversation["current_drug"]:
        # If no drug detected but we have a current drug, maintain it for follow-up questions
        detected_drug = conversation["current_drug"]
    
    # Add to history
    conversation["history"].append({
        "user_query": user_query,
        "assistant_response": response,
        "timestamp": datetime.now().isoformat(),
        "detected_drug": detected_drug
    })
    
    # Keep only last 10 exchanges to prevent memory from growing too large
    if len(conversation["history"]) > 10:
        conversation["history"] = conversation["history"][-10:]
    
    conversation["last_query"] = user_query
    conversation_store[conversation_id] = conversation

def extract_drug_from_query(query: str, conversation_id: str = None) -> str:
    """Extract drug name from query, with conversation context"""
    conversation = get_conversation_history(conversation_id) if conversation_id else None
    
    # If we have a current drug in conversation context, use it for follow-up questions
    if conversation and conversation["current_drug"]:
        # Check if this is a follow-up question (doesn't mention any specific drug)
        drug_keywords = ['orencia', 'simponi', 'aria', 'humira', 'enbrel', 'remicade', 'keytruda']
        query_lower = query.lower()
        
        # If no specific drug is mentioned in this query, use the context drug
        if not any(drug in query_lower for drug in drug_keywords):
            return conversation["current_drug"]
    
    # Otherwise, try to detect drug from query
    drug_keywords = {
        'orencia': 'orencia', 
        'simponi': 'simponi', 
        'aria': 'aria',
        'humira': 'humira', 
        'enbrel': 'enbrel', 
        'remicade': 'remicade', 
        'keytruda': 'keytruda'
    }
    
    query_lower = query.lower()
    for drug, filter_term in drug_keywords.items():
        if drug in query_lower:
            return filter_term
    
    return None

def enhance_query_with_context(query: str, conversation_id: str) -> str:
    """Enhance the query with conversation context"""
    conversation = get_conversation_history(conversation_id)
    
    # If we have a current drug context and the query seems to reference it
    if conversation["current_drug"] and not any(drug in query.lower() for drug in ['orencia', 'simponi', 'aria', 'humira', 'enbrel', 'remicade', 'keytruda']):
        enhanced_query = f"{conversation['current_drug']} {query}"
        print(f"Enhanced query with context: {enhanced_query}")
        return enhanced_query
    
    return query

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'database_initialized': rag_system is not None and rag_system.vector_db.is_initialized(),
        'document_count': rag_system.vector_db.get_document_count() if rag_system else 0
    })

@app.route('/api/query', methods=['POST'])
def process_query():
    """Process user query with conversation memory"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        conversation_id = data.get('conversation_id')
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        if not conversation_id:
            return jsonify({'error': 'Conversation ID is required'}), 400
        
        if not rag_system:
            initialized = initialize_rag_system()
            if not initialized:
                return jsonify({'error': 'RAG system not initialized. Please run ingestion first.'}), 500
        
        # Get conversation context
        conversation = get_conversation_history(conversation_id)
        
        # --- CLASSIFY AND HANDLE THE QUERY --- #
        intent, immediate_response = classify_and_handle_query(query, conversation_id)
        
        if intent == QueryIntent.DRUG_RELATED:
            # Extract drug for context tracking (BEFORE enhancing query)
            detected_drug = extract_drug_from_query(query, conversation_id)
            
            # Enhance query with conversation context
            enhanced_query = enhance_query_with_context(query, conversation_id)
            
            # Process through RAG system with conversation context
            response_text = rag_system.query(enhanced_query, conversation_context=conversation["history"])
        else:
            # Use the response already generated by the LLM for greeting/irrelevant
            response_text = immediate_response
            detected_drug = None
        
        # Update conversation history
        update_conversation_history(conversation_id, query, response_text, detected_drug)
        
        return jsonify({
            'response': response_text,
            'query': query,
            'detected_intent': intent.value,
            'conversation_id': conversation_id,
            'current_drug': conversation_store[conversation_id]["current_drug"],
            'success': True
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error processing query: {str(e)}',
            'success': False
        }), 500

@app.route('/api/database-info', methods=['GET'])
def get_database_info():
    """Get database information"""
    try:
        if not rag_system:
            initialized = initialize_rag_system()
            if not initialized:
                return jsonify({'error': 'RAG system not initialized'}), 400
        
        pdfs_in_db = rag_system.vector_db.list_all_documents()
        
        return jsonify({
            'document_count': rag_system.vector_db.get_document_count(),
            'pdfs_in_database': pdfs_in_db,
            'initialized': rag_system.vector_db.is_initialized()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversation/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    """Get conversation history"""
    try:
        conversation = get_conversation_history(conversation_id)
        return jsonify({
            'history': conversation['history'],
            'current_drug': conversation['current_drug'],
            'created_at': conversation['created_at'],
            'updated_at': conversation['updated_at']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversation/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    """Delete conversation history"""
    try:
        if conversation_id in conversation_store:
            del conversation_store[conversation_id]
            return jsonify({'success': True, 'message': 'Conversation deleted'})
        else:
            return jsonify({'success': False, 'message': 'Conversation not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize RAG system on startup
    print("Initializing RAG system...")
    if initialize_rag_system():
        print("RAG system initialized successfully")
        print(f"Documents in database: {rag_system.vector_db.get_document_count()}")
    else:
        print("Warning: RAG system could not be initialized. Please run ingestion first.")
    
    # Run Flask app
    app.run(debug=True, host='0.0.0.0', port=5001)