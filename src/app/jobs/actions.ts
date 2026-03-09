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
            "High confidence Greenhouse job links for Product Manager roles at Zepto, Swiggy, and Razorpay India",
            "Latest Lever job postings for Product Manager at Atlan, FamPay, and Jupiter India",
            "Walmart Global Tech India Product Management active jobs myworkdayjobs.com",
            "JPMC India and Goldman Sachs India Product Manager current openings on myworkdayjobs.com",
            "Direct job links for Senior Product Manager at Amazon.jobs India 2026",
            "Microsoft India careers current Product Manager roles",
            "Zomato PM job deep links on Greenhouse boards",
            "Meesho PM roles India greenhouse.io/meesho",
            "SaaS PM roles at BrowserStack, Freshworks, and Zoho direct links",
            "Postman India Product Manager Greenhouse links"
        ];

        let allJobItems: any[] = [];

        // Helper to call AI
        const callAI = async (query: string): Promise<any[]> => {
            const prompt = `You are a high-precision job discovery agent. Search for: ${query}. 
Return exactly a JSON array of 3-5 AUTHENTIC, RECENT Product Management job objects in INDIA.

CRITICAL URL RULES: 
1. Greenhouse: https://boards.greenhouse.io/{company}/jobs/{id} or https://job-boards.greenhouse.io/{company}/jobs/{id}
2. Lever: https://jobs.lever.co/{company}/{id}
3. Workday: https://{company}.wd1.myworkdayjobs.com/en-US/{Board}/job/{Location}/{Title}_{id}
4. DO NOT INVENT URLs. If you are not 100% sure of the exact deep link, do not return it.
5. NO GENERIC LINKS: Do not return "https://google.com/careers". Only return links to SPECIFIC job posts.
6. DOMAIN CHECK: Company specific subdomains like "targetindia.greenhouse.io" are often fake. Use "boards.greenhouse.io/target".

JSON Format: [{"title": "...", "company": "...", "location": "...", "source": "...", "url": "...", "experience": "...", "category": "JOB", "jobType": "PM", "postedAt": "..."}]

Return as many as you find (up to 5). If no high-confidence links are found, return [].`;

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
        console.log(`[Job Action] AI returned ${allJobItems.length} total raw items.`);

        if (allJobItems.length > 0) {
            console.log(`[Job Action] First few items:`, JSON.stringify(allJobItems.slice(0, 2), null, 2));
        }
        let count = 0;
        const verifiedJobs: any[] = [];

        // 2. Link Health Verification & Hallucination Filter
        console.log(`[Job Action] Verifying health of ${allJobItems.length} candidate links...`);
        const blocklistedPatterns = [
            'targetindia.greenhouse.io',
            'shellindia.greenhouse.io',
            'walmartindia.greenhouse.io',
            'jpmcindia.greenhouse.io',
            'example.com',
            'test.com',
            'myworkday.com', // Too generic, usually wd1.myworkdayjobs.com
            'linkedin.com/jobs/view/12345',
            'greenhouse.io/company/jobs/id'
        ];

        const sanitizedItems = allJobItems.filter(item => {
            if (!item.url || !item.url.startsWith('http')) return false;
            const urlLow = item.url.toLowerCase();

            // Filter out obvious hallucinations
            if (blocklistedPatterns.some(pattern => urlLow.includes(pattern))) {
                console.warn(`[Job Action] Hallucination detected and blocked: ${item.url}`);
                return false;
            }

            // ENSURE AUTHENTIC DOMAINS
            const isGreenhouse = urlLow.includes('greenhouse.io');
            const isLever = urlLow.includes('lever.co');
            const isWorkday = urlLow.includes('myworkdayjobs.com');
            const isIndeed = urlLow.includes('indeed.com');

            if (!isGreenhouse && !isLever && !isWorkday && !isIndeed && !urlLow.includes(item.company?.toLowerCase().replace(/\s/g, ''))) {
                console.warn(`[Job Action] Blocking suspicious domain: ${item.url}`);
                return false;
            }

            // Workday deep link check (must have /job/ or /details/)
            if (isWorkday && !urlLow.includes('/job/') && !urlLow.includes('/details/')) {
                console.warn(`[Job Action] Blocking invalid Workday link: ${item.url}`);
                return false;
            }

            // Ensure no generic "example" IDs
            if (urlLow.includes('123456') || urlLow.includes('000000')) return false;

            // Ensure it's a deep link (at least a few slashes deep)
            if (urlLow.split('/').length < 4) return false;

            return true;
        });

        for (const item of sanitizedItems) {
            try {
                const res = await fetch(item.url, {
                    method: 'GET',
                    redirect: 'follow',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml'
                    }
                });

                const finalUrl = res.url.toLowerCase();
                const isGenericRedirect =
                    (item.url.includes('greenhouse.io') && finalUrl.split('/').length < 6) ||
                    (item.url.includes('lever.co') && finalUrl.split('/').length < 5);

                if (!res.ok || res.status === 404 || isGenericRedirect || finalUrl.includes('error=true') || finalUrl.includes('job-closed')) {
                    console.warn(`[Job Action] Discarded link: ${item.url} (Status: ${res.status}, Generic: ${isGenericRedirect}, Final: ${finalUrl})`);
                    continue;
                }

                const text = await res.text();
                const textLow = text.toLowerCase();
                if (textLow.includes('job no longer available') || textLow.includes('this job has been closed') || textLow.includes('page not found')) {
                    console.warn(`[Job Action] Discarded closed job (content check): ${item.url}`);
                    continue;
                }

                verifiedJobs.push(item);
            } catch (e: any) {
                console.warn(`[Job Action] Verification failed for: ${item.url}`, e.message);
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

                const postedVal = (item.postedAt && item.postedAt !== 'Unknown') ? item.postedAt : todayStr;
                await (prisma as any).job.upsert({
                    where: { url: item.url },
                    update: { isActive: true, postedAt: postedVal, updatedAt: new Date() },
                    create: {
                        title: item.title,
                        company: item.company || 'Confidential',
                        location: item.location || 'Global',
                        source: item.source || 'Direct',
                        url: item.url,
                        salary: item.experience || null,
                        jobType: category,
                        category: jobType,
                        postedAt: postedVal,
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
        // Detect LinkedIn and apply guest URL transformation if possible
        let processingUrl = url;
        if (url.includes('linkedin.com/jobs/view/')) {
            processingUrl = url.replace('linkedin.com/jobs/view/', 'linkedin.com/jobs-guest/jobs/view/');
        }

        // Try to fetch page title and H1 for additional context
        let pageContext = "";
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(processingUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.ok) {
                const html = await res.text();
                const titleMatch = html.match(/<title>(.*?)<\/title>/i);
                const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);

                // Extract JSON-LD for high-fidelity structured data
                const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
                if (jsonLdMatches) {
                    pageContext += "--- JSON-LD STRUCTURED DATA ---\n";
                    jsonLdMatches.forEach((match, i) => {
                        const content = match.replace(/<[^>]*>/g, '').trim();
                        if (content.includes('"JobPosting"') || content.includes('"title"')) {
                            pageContext += `JSON-LD [${i}]: ${content.substring(0, 3000)}\n`;
                        }
                    });
                }

                if (titleMatch) pageContext += `Page Title: "${titleMatch[1]}"\n`;
                if (h1Match) pageContext += `Main Heading (H1): "${h1Match[1].replace(/<[^>]*>/g, '').trim()}"\n`;

                // Extract common meta tags for additional context
                const ogTitle = html.match(/<meta[^>]+(?:property|name)="og:title"[^>]+content="([^"]+)"/i) ||
                    html.match(/<meta[^>]+content="([^"]+)"[^>]+(?:property|name)="og:title"/i);
                const ogDesc = html.match(/<meta[^>]+(?:property|name)="og:description"[^>]+content="([^"]+)"/i) ||
                    html.match(/<meta[^>]+content="([^"]+)"[^>]+(?:property|name)="og:description"/i);
                if (ogTitle) pageContext += `OG Title: "${ogTitle[1]}"\n`;
                if (ogDesc) pageContext += `OG Description: "${ogDesc[1]}"\n`;

                // Extract framework-specific data scripts (e.g., Next.js, Nuxt)
                const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
                if (nextDataMatch) {
                    pageContext += "--- FRAMEWORK DATA (JSON) ---\n";
                    pageContext += nextDataMatch[1].substring(0, 20000) + "\n";
                }

                const initialPropsMatch = html.match(/window\.__INITIAL_PROPS__\s*=\s*(\{[\s\S]*?\});/i) ||
                    html.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/i);
                if (initialPropsMatch) {
                    pageContext += `Initial State Data: ${initialPropsMatch[1].substring(0, 10000)}\n`;
                }

                // Extract and clean body text
                const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                if (bodyMatch) {
                    const cleanText = bodyMatch[1]
                        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
                        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
                        .replace(/<[^>]*>/g, ' ')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&quot;/g, '"')
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/\s+/g, ' ')
                        .trim();
                    pageContext += `Content Snippet (Top): "${cleanText.substring(0, 8000)}"\n`;
                }
            }
        } catch (e) {
            console.warn(`[addJobByUrl] Could not fetch page context: ${e instanceof Error ? e.message : 'Unknown'}`);
        }

        const prompt = `You are a high-fidelity job extractor. Analyze this URL: ${processingUrl}
Here is the context extracted from the page:
${pageContext}

CRITICAL RULES:
1. JSON-LD STRUCTURED DATA (if provided above) is your SUPREME source of truth. Use it for the Title, Company, and Location.
2. DO NOT HALLUCINATE "Microsoft" or "Redmond" just because it is a LinkedIn URL.
3. TITLE: Use the clean job title (e.g., "Product Manager"). Remove any SEO boilerplate.
4. LOCATION: Look for the specific city and country (e.g., "Gurugram, India").
5. EXPERIENCE: Scan the "Content Snippet" for years of experience (e.g., "5+ years", "3-5 years").
6. If the info is in the JSON-LD or Snippet, DO NOT return "Unknown".
7. Return EXACTLY a JSON object: {"title": "...", "company": "...", "location": "...", "source": "...", "experience": "...", "category": "JOB", "jobType": "PM", "postedAt": "..."}.
8. Source should be the company name or platform.

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
                postedAt: (jobData.postedAt && jobData.postedAt !== 'Unknown') ? jobData.postedAt : todayStr,
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
export async function deleteJobs(ids: string[]) {
    try {
        await (prisma as any).job.deleteMany({
            where: { id: { in: ids } }
        });
        revalidatePath('/jobs');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("[Job Action] Delete Error:", error);
        return { success: false, error: "Failed to delete jobs" };
    }
}

export async function cleanupInactiveJobs() {
    try {
        const activeJobs = await (prisma as any).job.findMany({
            where: { isActive: true },
            select: { id: true, url: true, title: true }
        });

        console.log(`[Job Cleanup] Starting check for ${activeJobs.length} active jobs...`);
        let removedCount = 0;

        const CHUNK_SIZE = 10;
        for (let i = 0; i < activeJobs.length; i += CHUNK_SIZE) {
            const chunk = activeJobs.slice(i, i + CHUNK_SIZE);
            const results = await Promise.all(chunk.map(async (job: any) => {
                try {
                    const res = await fetch(job.url, {
                        method: 'HEAD',
                        redirect: 'follow',
                        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                    });

                    const finalUrl = res.url.toLowerCase();
                    const isClosed =
                        !res.ok ||
                        res.status === 404 ||
                        finalUrl.includes('error=true') ||
                        finalUrl.includes('job-closed') ||
                        finalUrl.includes('not-found') ||
                        (job.url.includes('greenhouse.io') && finalUrl.split('/').length < 6) ||
                        (job.url.includes('lever.co') && finalUrl.split('/').length < 5);

                    if (isClosed) return job.id;
                } catch (e) { }
                return null;
            }));

            const idsToRemove = results.filter(id => id !== null) as string[];
            if (idsToRemove.length > 0) {
                await (prisma as any).job.deleteMany({
                    where: { id: { in: idsToRemove } }
                });
                removedCount += idsToRemove.length;
            }
            console.log(`[Job Cleanup] Processed ${Math.min(i + CHUNK_SIZE, activeJobs.length)}/${activeJobs.length}...`);
        }

        revalidatePath('/jobs');
        revalidatePath('/admin');
        return { success: true, removedCount };
    } catch (error) {
        console.error("[Job Cleanup] Error:", error);
        return { success: false, error: "Cleanup failed" };
    }
}
