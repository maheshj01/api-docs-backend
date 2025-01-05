// src/services/requestService.ts
import { Request, Response } from 'express';
import { Worker } from 'worker_threads';
import path from 'path';
import { RAGApplicationBuilder } from '@llm-tools/embedjs';
import { OllamaEmbeddings, Ollama } from '@llm-tools/embedjs-ollama';
import { WebLoader } from '@llm-tools/embedjs-loader-web';
import { HNSWDb } from '@llm-tools/embedjs-hnswlib';
class RequestService {
    async dummyRequest(req: Request, res: Response): Promise<void> {
        try {
            const ragApplication = await new RAGApplicationBuilder()
                .setModel(new Ollama({ modelName: "llama3.3", baseUrl: 'http://localhost:11434' }))
                .setEmbeddingModel(new OllamaEmbeddings({ model: 'nomic-embed-text', baseUrl: 'http://localhost:11434' }))
                .setVectorDatabase(new HNSWDb())
                .build();

            await ragApplication.addLoader(new WebLoader({ urlOrContent: 'https://www.forbes.com/profile/elon-musk' }));
            await ragApplication.addLoader(new WebLoader({ urlOrContent: 'https://en.wikipedia.org/wiki/Elon_Musk' }));

            const response = await ragApplication.query('What is the net worth of Elon Musk today?')
            res.status(201).json({ message: 'Request submitted successfully', response });

        } catch (error) {
            console.error('Error in submitRequest:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async expensiveRequest(req: Request, res: Response): Promise<void> {
        const startTime = new Date().getTime();
        const worker = new Worker(path.join(__dirname, '../utils/threadWorker.js'));
        worker.on('message', (result) => {
            const endTime = new Date().getTime();
            const timeTaken = (endTime - startTime) / 1000;

            res.status(200).json({
                message: 'Expensive request completed',
                time: `Time taken: ${timeTaken} seconds`,
                result: result
            });
        });

        worker.on('error', (error) => {
            console.error('Error in worker:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
    }
}
export default RequestService;

