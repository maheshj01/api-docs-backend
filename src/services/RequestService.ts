// src/services/requestService.ts
import { Request, Response } from 'express';
import { RAGApplicationBuilder, TextLoader } from '@llm-tools/embedjs';
import { WebLoader } from '@llm-tools/embedjs-loader-web';
import axios from 'axios';
import xml2js from 'xml2js';
import Constants from '../constants';
import { DatabaseFactory } from '../Factory/DatabaseFactory';
import { ModelFactory } from '../Factory/ModelFactory';

type DataSources = 'crust-data' | 'nextjs-sitemap' | 'flutter-sitemap';

class RequestService {
    private static ragApplicationInstances: Record<string, any> = {};

    constructor() {
        this.queryData = this.queryData.bind(this);
        this.vectorize = this.vectorize.bind(this);
        this.loadFromText = this.loadFromText.bind(this);
    }

    private async createRAGApplication(model: string, embeddings: string, dataSource: DataSources) {
        const db = DatabaseFactory.createDatabase(dataSource);
        const { modelInstance, embeddingsInstance }: any = ModelFactory.createModelAndEmbeddings(model, embeddings);

        const ragApplication = await new RAGApplicationBuilder()
            .setModel(modelInstance)
            .setEmbeddingModel(embeddingsInstance)
            .setVectorDatabase(db)
            .build();

        RequestService.ragApplicationInstances[dataSource] = ragApplication;
        return ragApplication;
    }

    private async getRAGApplication(model: string, embeddings: string, dataSource: DataSources) {
        if (!RequestService.ragApplicationInstances[dataSource]) {
            return this.createRAGApplication(model, embeddings, dataSource);
        }
        return RequestService.ragApplicationInstances[dataSource];
    }

    async queryData(req: Request, res: Response): Promise<void> {
        try {
            const prompt = req.body.prompt || 'What is the capital of France?';
            const data = req.body.data as DataSources || 'nextjs-sitemap';
            const model = req.body.model || 'llama3.1';
            const embeddings = req.body.embeddings || 'nomic-embed-text';

            if (!['crust-data', 'nextjs-sitemap', 'flutter-sitemap'].includes(data)) {
                res.status(400).json({ error: 'Invalid data type' });
                return;
            }

            const ragApplication = await this.getRAGApplication(model, embeddings, data);
            const response = await ragApplication.query(prompt);

            res.status(201).json({ message: 'Request submitted successfully', response });
        } catch (error) {
            console.error('Error in queryData:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Vectorize method
    async vectorize(req: Request, res: Response): Promise<void> {
        try {
            const prompt = req.body.prompt || 'What is the capital of France?';
            const data = req.body.data as DataSources || 'nextjs-sitemap';
            const model = req.body.model || 'llama3.1';
            const embeddings = req.body.embeddings || 'nomic-embed-text';
            const ragApplication = await this.getRAGApplication(model, embeddings, data);
            await ragApplication.addLoader(new TextLoader({ text: 'Sample text to vectorize' }));

            res.status(201).json({ message: 'Vectorization completed.' });
        } catch (error) {
            console.error('Error in vectorize:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async loadFromText(text: string): Promise<void> {
        try {
            var model = 'llama3.1';
            var embeddings = 'nomic-embed-text';
            var data: DataSources = 'crust-data';
            const ragApplication = await this.getRAGApplication(model, embeddings, data);
            const loader = new TextLoader({ text });
            const initialLoader = new TextLoader({ text: Constants.initialPrompt });
            await ragApplication.addLoader(initialLoader);
            await ragApplication.addLoader(loader);
            console.log(`Added text to loader: ${text.substring(0, 50)}...`);
        } catch (error) {
            console.error('Error in loadFromText:', error);
        }
    }

    async loadFromSitemap(url: string, data: DataSources = 'nextjs-sitemap'): Promise<void> {
        try {
            const sitemapUrl = url || 'https://nextjs.org/sitemap.xml';
            var model = 'llama3.1';
            var embeddings = 'nomic-embed-text';
            // Fetch and parse the sitemap
            const response = await axios.get(sitemapUrl);
            const sitemapXml = response.data;
            const parsedSitemap = await xml2js.parseStringPromise(sitemapXml, { explicitArray: false });
            const urls = parsedSitemap.urlset.url.map((entry: any) => entry.loc);
            console.log('Extracted URLs from sitemap:', urls);

            // Load URLs into RAG application
            const ragApplication = await this.getRAGApplication(model, embeddings, data);
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
