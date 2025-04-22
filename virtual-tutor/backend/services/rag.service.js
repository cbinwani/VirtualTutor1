// RAG service for Virtual Tutor application
const { OpenAIEmbeddings } = require('@langchain/openai');
const { PineconeClient } = require('pinecone-client');
const { Document } = require('langchain/document');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const logger = require('../utils/logger');

class RAGService {
  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.DEFAULT_EMBEDDING_MODEL || 'text-embedding-ada-002',
    });
    this.initPinecone();
  }

  // Initialize Pinecone client
  async initPinecone() {
    try {
      this.pinecone = new PineconeClient();
      await this.pinecone.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
      });
      this.index = this.pinecone.Index(process.env.PINECONE_INDEX);
      logger.info('Pinecone client initialized successfully');
    } catch (error) {
      logger.error('Error initializing Pinecone client:', error);
      throw new Error('Failed to initialize Pinecone client');
    }
  }

  // Process and index course material
  async indexCourseMaterial(courseId, material) {
    try {
      // Extract text content from material
      const { materialId, title, content, type } = material;
      
      // Split text into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const docs = await textSplitter.createDocuments([content]);
      
      // Add metadata to each document
      const docsWithMetadata = docs.map((doc, i) => {
        return new Document({
          pageContent: doc.pageContent,
          metadata: {
            courseId,
            materialId,
            title,
            type,
            chunk: i,
          },
        });
      });
      
      // Generate embeddings and index in Pinecone
      const vectors = await Promise.all(
        docsWithMetadata.map(async (doc) => {
          const embedding = await this.embeddings.embedQuery(doc.pageContent);
          return {
            id: `${materialId}-chunk-${doc.metadata.chunk}`,
            values: embedding,
            metadata: doc.metadata,
          };
        })
      );
      
      // Upsert vectors to Pinecone
      await this.index.upsert({
        upsertRequest: {
          vectors,
          namespace: courseId,
        },
      });
      
      logger.info(`Indexed material ${materialId} for course ${courseId}`);
      return {
        success: true,
        count: vectors.length,
      };
    } catch (error) {
      logger.error('Error indexing course material:', error);
      throw new Error('Failed to index course material');
    }
  }

  // Retrieve relevant context for a query
  async retrieveContext(courseId, query, topK = 5) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.embeddings.embedQuery(query);
      
      // Query Pinecone for similar vectors
      const queryResponse = await this.index.query({
        queryRequest: {
          vector: queryEmbedding,
          topK,
          includeMetadata: true,
          namespace: courseId,
        },
      });
      
      // Extract and format the results
      const matches = queryResponse.matches || [];
      const context = matches.map((match) => ({
        content: match.metadata.pageContent,
        title: match.metadata.title,
        materialId: match.metadata.materialId,
        score: match.score,
      }));
      
      logger.info(`Retrieved ${context.length} context items for query in course ${courseId}`);
      return context;
    } catch (error) {
      logger.error('Error retrieving context:', error);
      throw new Error('Failed to retrieve context');
    }
  }

  // Generate RAG-enhanced response
  async generateResponse(llmService, courseId, query, conversationHistory, studentInfo) {
    try {
      // Retrieve relevant context
      const context = await this.retrieveContext(courseId, query);
      
      // Format context for the LLM
      const formattedContext = context
        .map((item) => `From "${item.title}":\n${item.content}`)
        .join('\n\n');
      
      // Create a prompt that includes the retrieved context
      const promptTemplate = `
        You are a virtual tutor helping a student with their studies.
        
        Student information:
        - Skill level: ${studentInfo.skillLevel}
        - Learning goals: ${studentInfo.learningGoals.join(', ')}
        - Areas needing improvement: ${studentInfo.improvementAreas.join(', ')}
        
        Previous conversation:
        ${conversationHistory}
        
        Relevant course materials:
        ${formattedContext}
        
        Student question: ${query}
        
        Using the provided course materials and your knowledge, provide a helpful, accurate response.
        If the course materials don't contain relevant information, rely on your general knowledge but make it clear when you're doing so.
        Tailor your explanation to the student's skill level and learning goals.
      `;
      
      // Generate response using the LLM service
      const response = await llmService.llm.predict(promptTemplate);
      
      logger.info(`Generated RAG-enhanced response for query in course ${courseId}`);
      return {
        response,
        sourceMaterials: context.map((item) => ({
          title: item.title,
          materialId: item.materialId,
        })),
      };
    } catch (error) {
      logger.error('Error generating RAG-enhanced response:', error);
      throw new Error('Failed to generate response');
    }
  }

  // Delete indexed materials for a course
  async deleteCourseMaterials(courseId) {
    try {
      await this.index.delete({
        deleteRequest: {
          namespace: courseId,
          deleteAll: true,
        },
      });
      
      logger.info(`Deleted all indexed materials for course ${courseId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting course materials:', error);
      throw new Error('Failed to delete course materials');
    }
  }

  // Update indexed material
  async updateMaterial(courseId, material) {
    try {
      // First delete existing chunks for this material
      await this.index.delete({
        deleteRequest: {
          namespace: courseId,
          filter: {
            materialId: { $eq: material.materialId },
          },
        },
      });
      
      // Then index the updated material
      return await this.indexCourseMaterial(courseId, material);
    } catch (error) {
      logger.error('Error updating material:', error);
      throw new Error('Failed to update material');
    }
  }
}

module.exports = new RAGService();
