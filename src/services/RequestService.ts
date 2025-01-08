// src/services/requestService.ts
import { Request, Response } from 'express';
import { OpenAiEmbeddings } from '@llm-tools/embedjs-openai';
import { RAGApplicationBuilder, SIMPLE_MODELS, TextLoader } from '@llm-tools/embedjs';
import { WebLoader } from '@llm-tools/embedjs-loader-web';
import { HNSWDb } from '@llm-tools/embedjs-hnswlib';
import axios from 'axios';
import xml2js from 'xml2js';
import { PineconeDb } from '@llm-tools/embedjs-pinecone';
import Constants from '../constants';
import { Ollama, OllamaEmbeddings } from '@llm-tools/embedjs-ollama';

class RequestService {
    private static ragApplicationInstance: any | null = null;
    constructor() {
        this.queryCrustData = this.queryCrustData.bind(this);
        this.vectorize = this.vectorize.bind(this);
    }
    // Singleton pattern for RAG application
    private async getRAGApplication() {
        if (!RequestService.ragApplicationInstance) {
            console.log('Initializing RAG application...');
            // const model = new OpenAi({ model: "text-embedding-3-large" })
            const model = new Ollama({ modelName: "llama3.1", baseUrl: 'http://localhost:11434' })
            const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text", baseUrl: 'http://localhost:11434' });
            RequestService.ragApplicationInstance = await new RAGApplicationBuilder()
                .setModel(model)
                .setEmbeddingModel(embeddings)
                .setVectorDatabase(new HNSWDb())
                .build();
            console.log('RAG application initialized.');
        }
        return RequestService.ragApplicationInstance;
    }

    // Query method
    async queryCrustData(req: Request, res: Response): Promise<void> {
        try {
            const prompt = req.body.prompt || 'What is the capital of France?';
            const ragApplication = await this.getRAGApplication();
            const response = await ragApplication.query(prompt);

            res.status(201).json({ message: 'Request submitted successfully', response });
        } catch (error) {
            console.error('Error in queryCrustData:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }   

    // Vectorize method
    async vectorize(req: Request, res: Response): Promise<void> {
        try {
            const ragApplication = await this.getRAGApplication();
            await ragApplication.addLoader(new TextLoader({ text: 'Sample text to vectorize' }));

            res.status(201).json({ message: 'Vectorization completed.' });
        } catch (error) {
            console.error('Error in vectorize:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async loadFromText(text: string): Promise<void> {
        try {
            const ragApplication = await this.getRAGApplication();
            const loader = new TextLoader({ text });
            const initialLoader = new TextLoader({ text: Constants.initialPrompt });
            await ragApplication.addLoader(initialLoader);
            await ragApplication.addLoader(loader);
            console.log(`Added text to loader: ${text.substring(0, 50)}...`);
        } catch (error) {
            console.error('Error in loadFromText:', error);
        }
    }

    // Load URLs from sitemap
    async loadFromSitemap(url: string): Promise<void> {
        try {
            const sitemapUrl = url || 'https://nextjs.org/sitemap.xml';

            // Fetch and parse the sitemap
            const response = await axios.get(sitemapUrl);
            const sitemapXml = response.data;
            const parsedSitemap = await xml2js.parseStringPromise(sitemapXml, { explicitArray: false });
            const urls = parsedSitemap.urlset.url.map((entry: any) => entry.loc);

            console.log('Extracted URLs from sitemap:', urls);

            // Load URLs into RAG application
            const ragApplication = await this.getRAGApplication();
            for (let i = 0; i < urls.length; i++) {
                const loader = new WebLoader({ urlOrContent: urls[i] });
                await ragApplication.addLoader(loader);
                console.log(`Added URL to loader: ${urls[i]}`);
            }

        } catch (error) {
            console.error('Error in loadFromSitemap:', error);
        }
    }
}

export default RequestService;
