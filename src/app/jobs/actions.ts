'use server'

import { prisma } from "@/lib/prisma"
import { getApiKeys } from "@/lib/ai/engine"
import { revalidatePath } from "next/cache"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function refreshJobs() {
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();

    if (geminiKeys.length === 0 && groqKeys.length === 0) {
        return { success: false, error: "AI API keys (Gemini/Groq) not found." };
    }

    try {
        // 1. Cleanup: Mark jobs older than 7 days as inactive
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        await (prisma as any).job.updateMany({
            where: { targetDate: { lt: sevenDaysAgo } },
            data: { isActive: false }
        });

        const now = new Date();
        const todayStr = now.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        const queries = [
            "Product Manager roles at Walmart Global Tech India Feb 2026",
            "JPMC and Goldman Sachs India Product deep links",
            "Target India and Shell India PM roles",
            "Amazon India PM Senior PM deep links Feb 2026",
            "Google India Product Management career links",
            "Microsoft India PM job links 2026",
            "Adobe and Oracle India PM deep links",
            "Razorpay, PhonePe, CRED PM deep links India",
            "Swiggy, Zomato, Meesho PM roles 2026",
            "Flipkart and Blinkit PM deep links",
            "Zepto PM roles India 2026",
            "SaaS PM roles at Freshworks, Zoho, BrowserStack",
            "TPM and Lead PM roles at Intuit, Uber, Atlassian India"
        ];

        let allJobItems: any[] = [];

        // Helper to call AI
        const callAI = async (query: string): Promise<any[]> => {
            const prompt = `You are a job search assistant. Search for: ${query}. 
Return exactly a JSON array of 5-8 UNIQUE, AUTHENTIC job objects for Product Management roles in INDIA: [{"title": "...", "company": "...", "location": "...", "source": "...", "url": "...", "experience": "...", "category": "JOB", "jobType": "PM", "postedAt": "..."}].

CRITICAL: 
1. URLs MUST be deep links to Greenhouse, Lever, Workday (e.g. https://job-boards.greenhouse.io/company/jobs/123).
2. ONLY include roles hiring in INDIA (Bengaluru, Hyderabad, Gurgaon, Remote-India).
3. If you cannot find a valid direct link, return an empty array [].`;

            // Try Gemini first
            for (const key of geminiKeys) {
                try {
                    const genAI = new GoogleGenerativeAI(key);
                    const model = genAI.getGenerativeModel({
                        model: "gemini-2.0-flash",
                    });

                    const result = await model.generateContent(prompt);
                    const text = result.response.text();
                    const jsonMatch = text.match(/\[[\s\S]*\]/);
                    if (jsonMatch) return JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.warn(`[Job Action] Gemini attempt failed: ${e instanceof Error ? e.message : 'Unknown'}`);
                }
            }

            // Try Groq as fallback
            for (const key of groqKeys) {
                try {
                    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                        body: JSON.stringify({
                            model: "llama-3.3-70b-versatile",
                            messages: [{ role: "user", content: prompt }],
                            temperature: 0.1
                        })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const text = data.choices[0].message.content;
                        const jsonMatch = text.match(/\[[\s\S]*\]/);
                        if (jsonMatch) return JSON.parse(jsonMatch[0]);
                    }
                } catch (e) {
                    console.warn(`[Job Action] Groq fallback failed`);
                }
            }
            return [];
        };

        for (const [idx, query] of queries.entries()) {
            console.log(`[Job Action] Query ${idx + 1}/${queries.length}: ${query}`);
            const chunkJobs = await callAI(query);
            if (Array.isArray(chunkJobs)) {
                allJobItems = [...allJobItems, ...chunkJobs];
            }
            await new Promise(r => setTimeout(r, 1000)); // Rate limiting gap
        }
        let count = 0;
        const verifiedJobs: any[] = [];

        // 1. Pre-validation & Sanitization
        const sanitizedItems = allJobItems.filter(item => {
            if (!item.title || !item.url) return false;

            const urlLower = item.url.toLowerCase();
            const urlPath = item.url.replace(/^https?:\/\/[^\/]+/, '').toLowerCase();
            const companyLower = (item.company || '').toLowerCase();

            // A. Block obvious sequential/hallucinated IDs 
            const sequentialPatterns = ['123456', '654321', '987654', 'abc123', '012345'];
            if (sequentialPatterns.some(p => item.url.includes(p))) return false;

            // B. Company Domain Enforcement
            if (companyLower.includes('google') && !urlLower.includes('google.com')) return false;
            if (companyLower.includes('amazon') && !urlLower.includes('amazon.jobs')) return false;
            if (companyLower.includes('microsoft') && !urlLower.includes('microsoft.com')) return false;
            if (companyLower.includes('meta') && !urlLower.includes('metacareers.com')) return false;

            // C. Generic URL check
            const genericTerms = ['/careers', '/jobs', '/career', '/job-search', '/openings', '/all-jobs', '/work-with-us'];
            const isGenericPath = genericTerms.some(term =>
                urlPath === term || urlPath === term + '/' || urlPath.endsWith(term) || urlPath.endsWith(term + '/')
            );
            if (isGenericPath && item.url.length < 50) return false;

            // D. Identifier Check (Must have a long numeric or mixed ID)
            const hasDeepLinkIdentifier = /[\/\-]([0-9]{6,}|[a-f0-9\-]{24,}|[0-9a-z]{10,})$/i.test(item.url);
            if (!hasDeepLinkIdentifier && !urlLower.includes('indeed.com')) return false;

            return true;
        });

        // 2. Link Health Verification (Checking for redirects to "Closed" or "Error" pages)
        console.log(`[Job Action] Verifying health of ${sanitizedItems.length} candidate links...`);
        for (const item of sanitizedItems) {
            try {
                // For Greenhouse/Lever, check if the link actually exists
                if (item.url.includes('greenhouse.io') || item.url.includes('lever.co')) {
                    const checkRes = await fetch(item.url, { method: 'HEAD', redirect: 'follow' });
                    const finalUrl = checkRes.url;

                    // Greenhouse redirects to board home or error=true if closed
                    if (finalUrl.includes('error=true') ||
                        (finalUrl.includes('greenhouse.io') && finalUrl.split('/').length < 6) ||
                        (finalUrl.includes('lever.co') && finalUrl.split('/').length < 5)) {
                        console.warn(`[Job Action] Discarding stale/closed link: ${item.url}`);
                        continue;
                    }
                }
                verifiedJobs.push(item);
            } catch (e) {
                // Keep if check fails (might be a network blip), but prioritize clean ones
                verifiedJobs.push(item);
            }
        }

        for (const item of verifiedJobs) {
            try {
                const titleLower = item.title.toLowerCase();
                let jobType = item.jobType || 'PM';
                let category = item.category || 'JOB';

                if (titleLower.includes('intern')) {
                    category = 'INTERNSHIP';
                    jobType = 'PM Intern';
                } else if (titleLower.includes('associate') || titleLower.includes('apm')) {
                    jobType = 'APM';
                } else if (titleLower.includes('technical') || titleLower.includes('tpm')) {
                    jobType = 'Technical PM';
                } else if (titleLower.includes('growth')) {
                    jobType = 'Growth PM';
                } else if (titleLower.includes('marketing') || titleLower.includes('pmm')) {
                    jobType = 'Product Marketing';
                } else if (titleLower.includes('senior') || titleLower.includes('sr.')) {
                    jobType = 'Senior PM';
                } else if (titleLower.includes('lead')) {
                    jobType = 'Lead PM';
                } else if (titleLower.includes('director') || titleLower.includes('vp') || titleLower.includes('head')) {
                    jobType = 'Director';
                }

                await (prisma as any).job.upsert({
                    where: { url: item.url },
                    update: { isActive: true, postedAt: item.postedAt || todayStr, updatedAt: new Date() },
                    create: {
                        title: item.title,
                        company: item.company || 'Confidential',
                        location: item.location || 'Global',
                        source: item.source || 'Direct',
                        url: item.url,
                        salary: item.experience || null,
                        jobType: category,
                        category: jobType,
                        postedAt: item.postedAt || todayStr,
                        tags: [item.experience || "", jobType, item.location || ""].filter(Boolean),
                        isActive: true
                    }
                });
                count++;
            } catch (e) {
                console.error(`[Job Action] Failed to save: ${item.title}`, e);
            }
        }

        try { revalidatePath('/jobs'); } catch (e) { }
        return { success: true, count };
    } catch (error) {
        console.error("[Job Action] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed" };
    }
}

export async function getJobs(category?: string) {
    try {
        const where: any = { isActive: true };
        if (category && category !== 'ALL') {
            where.category = { contains: category, mode: 'insensitive' };
        }

        const jobs = await (prisma as any).job.findMany({
            where,
            orderBy: { targetDate: 'desc' },
            take: 500
        });
        return JSON.parse(JSON.stringify(jobs));
    } catch (error) {
        console.error("[Job Action] Fetch Error:", error);
        return [];
    }
}
export async function addJobByUrl(url: string) {
    const { gemini: geminiKeys, groq: groqKeys } = getApiKeys();
    if (geminiKeys.length === 0 && groqKeys.length === 0) {
        return { success: false, error: "AI API keys found." };
    }

    if (!url || !url.startsWith('http')) {
        return { success: false, error: "Invalid URL provided." };
    }

    try {
        const prompt = `You are a job extractor. Analyze this URL: ${url}
Return EXACTLY a JSON object for this specific Product Management job: {"title": "...", "company": "...", "location": "...", "source": "...", "experience": "...", "category": "JOB", "jobType": "PM", "postedAt": "..."}.
If it is a Senior PM role, set jobType to "Senior PM". If it is an internship, set category to "INTERNSHIP" and jobType to "PM Intern".
Return only the JSON object.`;

        let jobData: any = null;

        // Try Gemini
        for (const key of geminiKeys) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    jobData = JSON.parse(jsonMatch[0]);
                    break;
                }
            } catch (e) {
                console.warn(`[addJobByUrl] Gemini failed: ${e instanceof Error ? e.message : 'Unknown'}`);
            }
        }

        // Try Groq as fallback
        if (!jobData) {
            for (const key of groqKeys) {
                try {
                    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                        body: JSON.stringify({
                            model: "llama-3.3-70b-versatile",
                            messages: [{ role: "user", content: prompt }],
                            temperature: 0.1
                        })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const text = data.choices[0].message.content;
                        const jsonMatch = text.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            jobData = JSON.parse(jsonMatch[0]);
                            break;
                        }
                    }
                } catch (e) {
                    console.warn(`[addJobByUrl] Groq fallback failed`);
                }
            }
        }

        if (!jobData || !jobData.title) {
            return { success: false, error: "AI could not extract job details. Please ensure the URL is a direct job posting." };
        }

        const now = new Date();
        const todayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const savedJob = await (prisma as any).job.upsert({
            where: { url },
            update: { isActive: true, updatedAt: new Date() },
            create: {
                title: jobData.title,
                company: jobData.company || 'Confidential',
                location: jobData.location || 'Remote',
                source: jobData.source || 'Direct',
                url: url,
                salary: jobData.experience || null,
                jobType: jobData.category || 'JOB',
                category: jobData.jobType || 'PM',
                postedAt: jobData.postedAt || todayStr,
                tags: [jobData.experience || "", jobData.jobType, jobData.location || ""].filter(Boolean),
                isActive: true
            }
        });

        try { revalidatePath('/jobs'); revalidatePath('/admin'); } catch (e) { }
        return { success: true, job: JSON.parse(JSON.stringify(savedJob)) };

    } catch (error) {
        console.error("[addJobByUrl] Error:", error);
        return { success: false, error: "An error occurred while processing the job URL." };
    }
}
