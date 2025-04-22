// LLM service for Virtual Tutor application
const { OpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('langchain/prompts');
const { StringOutputParser } = require('langchain/schema/output_parser');
const { RunnableSequence } = require('langchain/schema/runnable');
const logger = require('../utils/logger');

class LLMService {
  constructor() {
    this.model = process.env.DEFAULT_LLM_MODEL || 'gpt-4';
    this.llm = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: this.model,
      temperature: 0.7,
    });
    this.outputParser = new StringOutputParser();
  }

  // Initialize different prompt templates for various tutoring scenarios
  initPromptTemplates() {
    // General tutoring prompt
    this.tutorPrompt = PromptTemplate.fromTemplate(`
      You are a helpful and knowledgeable tutor specializing in {subject}.
      Your goal is to help the student understand concepts, solve problems, and learn effectively.
      
      Student's current skill level: {skillLevel}
      Current topic: {topic}
      
      Previous conversation context:
      {conversationHistory}
      
      Student's question: {question}
      
      Provide a clear, helpful response that will aid the student's understanding.
      If appropriate, include examples or step-by-step explanations.
      Identify any misconceptions and gently correct them.
      If the student is struggling, provide hints rather than complete solutions.
    `);

    // Prompt for explaining concepts
    this.explainConceptPrompt = PromptTemplate.fromTemplate(`
      You are a tutor explaining a concept in {subject}.
      
      Concept to explain: {concept}
      Student's current skill level: {skillLevel}
      
      Provide a clear explanation of this concept that is appropriate for the student's skill level.
      Include relevant examples and analogies to aid understanding.
      Connect this concept to other related concepts when helpful.
      
      Your explanation:
    `);

    // Prompt for providing practice exercises
    this.practiceExercisePrompt = PromptTemplate.fromTemplate(`
      You are a tutor creating practice exercises for a student studying {subject}.
      
      Topic: {topic}
      Student's current skill level: {skillLevel}
      Areas needing improvement: {improvementAreas}
      
      Create {numExercises} practice exercises that will help the student improve in the specified areas.
      The exercises should be challenging but appropriate for the student's skill level.
      Include a mix of question types (multiple choice, short answer, problem-solving).
      Provide clear instructions for each exercise.
      
      Your practice exercises:
    `);

    // Prompt for assessing student performance
    this.assessmentPrompt = PromptTemplate.fromTemplate(`
      You are a tutor assessing a student's performance in {subject}.
      
      Student's responses to exercises:
      {studentResponses}
      
      Correct answers:
      {correctAnswers}
      
      Provide a detailed assessment of the student's performance.
      Identify specific strengths and areas for improvement.
      Suggest targeted strategies or additional practice to address any weaknesses.
      Be encouraging and constructive in your feedback.
      
      Your assessment:
    `);
  }

  // Method to generate tutor response
  async generateTutorResponse(subject, skillLevel, topic, conversationHistory, question) {
    try {
      if (!this.tutorPrompt) {
        this.initPromptTemplates();
      }

      const chain = RunnableSequence.from([
        this.tutorPrompt,
        this.llm,
        this.outputParser
      ]);

      const response = await chain.invoke({
        subject,
        skillLevel,
        topic,
        conversationHistory: conversationHistory || "No previous conversation.",
        question
      });

      logger.info(`Generated tutor response for subject: ${subject}, topic: ${topic}`);
      return response;
    } catch (error) {
      logger.error('Error generating tutor response:', error);
      throw new Error('Failed to generate tutor response');
    }
  }

  // Method to explain a concept
  async explainConcept(subject, concept, skillLevel) {
    try {
      if (!this.explainConceptPrompt) {
        this.initPromptTemplates();
      }

      const chain = RunnableSequence.from([
        this.explainConceptPrompt,
        this.llm,
        this.outputParser
      ]);

      const explanation = await chain.invoke({
        subject,
        concept,
        skillLevel
      });

      logger.info(`Generated concept explanation for: ${concept} in ${subject}`);
      return explanation;
    } catch (error) {
      logger.error('Error explaining concept:', error);
      throw new Error('Failed to generate concept explanation');
    }
  }

  // Method to generate practice exercises
  async generatePracticeExercises(subject, topic, skillLevel, improvementAreas, numExercises = 3) {
    try {
      if (!this.practiceExercisePrompt) {
        this.initPromptTemplates();
      }

      const chain = RunnableSequence.from([
        this.practiceExercisePrompt,
        this.llm,
        this.outputParser
      ]);

      const exercises = await chain.invoke({
        subject,
        topic,
        skillLevel,
        improvementAreas: improvementAreas || "General practice",
        numExercises
      });

      logger.info(`Generated ${numExercises} practice exercises for topic: ${topic}`);
      return exercises;
    } catch (error) {
      logger.error('Error generating practice exercises:', error);
      throw new Error('Failed to generate practice exercises');
    }
  }

  // Method to assess student performance
  async assessPerformance(subject, studentResponses, correctAnswers) {
    try {
      if (!this.assessmentPrompt) {
        this.initPromptTemplates();
      }

      const chain = RunnableSequence.from([
        this.assessmentPrompt,
        this.llm,
        this.outputParser
      ]);

      const assessment = await chain.invoke({
        subject,
        studentResponses,
        correctAnswers
      });

      logger.info(`Generated performance assessment for subject: ${subject}`);
      return assessment;
    } catch (error) {
      logger.error('Error assessing performance:', error);
      throw new Error('Failed to generate performance assessment');
    }
  }

  // Method to identify areas for improvement
  async identifyImprovementAreas(subject, studentResponses, correctAnswers) {
    try {
      const promptTemplate = PromptTemplate.fromTemplate(`
        You are analyzing a student's performance in {subject} to identify specific areas for improvement.
        
        Student's responses:
        {studentResponses}
        
        Correct answers:
        {correctAnswers}
        
        Identify the top 3 specific areas where the student needs improvement.
        For each area, provide a brief explanation of why you identified it.
        Format your response as a JSON array of objects with "area" and "reason" properties.
        
        Example format:
        [
          {
            "area": "Understanding quadratic equations",
            "reason": "The student struggled with factoring and identifying roots."
          }
        ]
      `);

      const chain = RunnableSequence.from([
        promptTemplate,
        this.llm,
        this.outputParser
      ]);

      const areasJson = await chain.invoke({
        subject,
        studentResponses,
        correctAnswers
      });

      const areas = JSON.parse(areasJson);
      logger.info(`Identified ${areas.length} improvement areas for subject: ${subject}`);
      return areas;
    } catch (error) {
      logger.error('Error identifying improvement areas:', error);
      throw new Error('Failed to identify improvement areas');
    }
  }

  // Method to change the LLM model
  setModel(modelName) {
    this.model = modelName;
    this.llm = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: this.model,
      temperature: 0.7,
    });
    logger.info(`Changed LLM model to: ${modelName}`);
  }

  // Method to adjust temperature
  setTemperature(temperature) {
    this.llm = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: this.model,
      temperature: temperature,
    });
    logger.info(`Adjusted LLM temperature to: ${temperature}`);
  }
}

module.exports = new LLMService();
