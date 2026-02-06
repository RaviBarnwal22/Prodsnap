const BASE_URL = 'https://prodsnap.in/api';

export const apiClient = {
    getQuestions: async (category?: string) => {
        const response = await fetch(`${BASE_URL}/practice?category=${category || ''}`);
        return response.json();
    },

    submitAnswer: async (questionId: string, answerText: string, timeSpent: number) => {
        const response = await fetch(`${BASE_URL}/practice/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId, answerText, timeSpent }),
        });
        return response.json();
    },

    getInterviewerResponse: async (context: any) => {
        // This would call your AI interviewer logic
        const response = await fetch(`${BASE_URL}/ai/interviewer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(context),
        });
        return response.json();
    }
};
