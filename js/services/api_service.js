// API Service – يتصل بخادم Node (مع VirusTotal) أو Flask مباشرة كبديل
const ApiService = {
    /** خادم Node المتقدم (منفذ 3000): يجمع تحليل Flask + فحص الروابط عبر VirusTotal */
    advancedBackendUrl: 'https://phishing-detector-backend-djh1.onrender.com',
    /** خادم Flask (منفذ 5000): تحليل النموذج والقواعد فقط – يُستخدم إذا كان Node غير شغال */

    async analyzeEmail(text) {
        if (!text || !text.trim()) {
            return { success: false, error: "محتوى النص مطلوب" };
        }

        // المحاولة الأولى: خادم Node (يعيد تحليل AI + نتائج VirusTotal للروابط)
        const advanced = await this._callAdvancedBackend(text);
        if (advanced) return advanced;

        // البديل: Flask مباشرة (بدون VirusTotal)
        return await this._callFlaskBackend(text);
    },

    async _callAdvancedBackend(text) {
        try {
            const response = await fetch(this.advancedBackendUrl + '/scan-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email_content: text })
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload) return null;

            const v = payload.verdict || {};
            const ai = payload.ai_deep_analysis || {};
            const ext = payload.external_intelligence || {};
            const ling = ai.linguistic_metrics || {};

            const riskScore = Math.round((v.confidence != null ? v.confidence : 0) * 100);
            const riskLevel = v.risk_level || 'Unknown';
            let recommendation = payload.security_recommendation;
            if (!recommendation) {
                recommendation = riskLevel === 'High' ? "تحذير: هذه الرسالة تحمل مستوى خطورة عالٍ. لا تضغط على أي روابط ولا تشارك بياناتك." :
                    riskLevel === 'Medium' ? "تنبيه: الرسالة تبدو مريبة جزئياً. تأكد من هوية المرسل قبل التفاعل معها." :
                    "الرسالة تبدو آمنة بشكل عام، ولكن يفضل دائماً التحقق قبل مشاركة أي بيانات حساسة.";
            }

            return {
                success: true,
                data: {
                    risk_score: riskScore,
                    label: v.label || 'unknown',
                    risk_level: riskLevel,
                    reasons: ai.reasons || [],
                    recommendation,
                    urls_found: (ext.total_urls_found != null) ? ext.total_urls_found : (text.match(/https?:\/\/[^\s]+/g) || []).length,
                    sentiment: ling.sentiment || 'neutral',
                    url_analysis: payload.url_analysis || [],
                    virustotal_results: ext.scanned_urls || [],
                    text_analysis: {
                        length_chars: ling.length_chars,
                        num_urls: ling.num_urls,
                        urgency_hits: ling.urgency_hits,
                        threat_hits: ling.threat_hits,
                        credential_hits: ling.credential_hits,
                        spam_hits: ling.spam_hits,
                        num_exclamations: ling.num_exclamations,
                        uppercase_ratio: ling.uppercase_ratio,
                        non_ascii_ratio: ling.non_ascii_ratio
                    }
                }
            };
        } catch (e) {
            return null;
        }
    },

    async _callFlaskBackend(text) {
        try {
            const response = await fetch(this.flaskBackendUrl + '/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload) {
                const statusMsg = `HTTP ${response.status}`;
                const backendMsg = payload && payload.error ? ` - ${payload.error}` : '';
                throw new Error(statusMsg + backendMsg);
            }
            if (!payload.success) {
                throw new Error(payload.error || "فشل التحليل من الخادم.");
            }

            const prediction = payload.prediction || {};
            const riskScore = Math.round((prediction.confidence_score || 0) * 100);
            const label = prediction.label || 'unknown';
            const riskLevel = prediction.risk_level || 'Unknown';
            const reasons = prediction.reasons || [];
            const urlAnalysis = prediction.url_analysis || [];
            let recommendation;
            if (riskLevel === 'High') {
                recommendation = "تحذير: هذه الرسالة تحمل مستوى خطورة عالٍ. لا تضغط على أي روابط ولا تشارك بياناتك.";
            } else if (riskLevel === 'Medium') {
                recommendation = "تنبيه: الرسالة تبدو مريبة جزئياً. تأكد من هوية المرسل قبل التفاعل معها.";
            } else {
                recommendation = "الرسالة تبدو آمنة بشكل عام، ولكن يفضل دائماً التحقق قبل مشاركة أي بيانات حساسة.";
            }
            const urlsInText = (text.match(/https?:\/\/[^\s]+/g) || []).length;
            const textAnalysis = prediction.linguistic_analysis || {};

            return {
                success: true,
                data: {
                    risk_score: riskScore,
                    label,
                    risk_level: riskLevel,
                    reasons,
                    recommendation,
                    urls_found: urlsInText,
                    sentiment: textAnalysis.sentiment || 'neutral',
                    url_analysis: urlAnalysis,
                    virustotal_results: [],
                    text_analysis: {
                        length_chars: textAnalysis.length_chars,
                        num_urls: textAnalysis.num_urls,
                        urgency_hits: textAnalysis.urgency_hits,
                        threat_hits: textAnalysis.threat_hits,
                        credential_hits: textAnalysis.credential_hits,
                        spam_hits: textAnalysis.spam_hits,
                        num_exclamations: textAnalysis.num_exclamations,
                        uppercase_ratio: textAnalysis.uppercase_ratio,
                        non_ascii_ratio: textAnalysis.non_ascii_ratio
                    }
                }
            };
        } catch (error) {
            console.error("API Error:", error);
            return {
                success: false,
                error: error.message || "تعذر الاتصال بخادم التحليل حالياً."
            };
        }
    }
};
