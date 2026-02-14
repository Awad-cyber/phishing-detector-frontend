const ResultScreen = {
    init() {
        document.getElementById('result-back-btn').onclick = () => AppState.navigateTo('scan-screen');
        document.getElementById('scan-another-btn').onclick = () => {
            ScanScreen.clearInput();
            AppState.navigateTo('scan-screen');
        };
        document.getElementById('home-btn').onclick = () => {
            ScanScreen.clearInput();
            AppState.navigateTo('home-screen');
        };
    },

    showResult(resultData) {
        const score = typeof resultData === 'object' ? resultData.risk_score : resultData;
        const t = translations[AppState.lang];
        const { statusCard, resultIcon, riskLevel, riskScore, progressCircle } = AppState.elements;

        // تحديث العناصر الأساسية - تصميم احترافي ومتوافق مع جميع المتصفحات
        let statusClass, iconText, levelText, statusBgColor, statusBorderColor, statusIcon;
        
        if (resultData.risk_level === 'Critical') {
            statusClass = 'critical';
            iconText = 'gpp_bad';
            levelText = 'خطير جداً';
            statusBgColor = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
            statusBorderColor = '#dc2626';
            statusIcon = '🚨';
        } else if (resultData.risk_level === 'High') {
            statusClass = 'dangerous';
            iconText = 'error';
            levelText = 'خطير';
            statusBgColor = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
            statusBorderColor = '#fca5a5';
            statusIcon = '⚠️';
        } else if (resultData.risk_level === 'Medium') {
            statusClass = 'suspicious';
            iconText = 'warning';
            levelText = 'مشبوه';
            statusBgColor = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            statusBorderColor = '#f59e0b';
            statusIcon = '⚡';
        } else {
            statusClass = 'safe';
            iconText = 'check_circle';
            levelText = 'آمن';
            statusBgColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            statusBorderColor = '#10b981';
            statusIcon = '✅';
        }
        
        statusCard.className = `status-card ${statusClass}`;
        statusCard.style.background = statusBgColor;
        statusCard.style.border = `2px solid ${statusBorderColor}`;
        statusCard.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
        resultIcon.textContent = iconText;
        riskLevel.textContent = levelText;
        riskScore.textContent = score;

        // عرض التقرير التفصيلي
        const reportSection = document.getElementById('ai-report-section');
        const textAnalysisContainer = document.getElementById('ai-text-analysis');
        const reasonsList = document.getElementById('ai-reasons-list');
        const recommendation = document.getElementById('ai-recommendation');
        const urlAnalysisContainer = document.getElementById('ai-url-analysis');

        if (reportSection && typeof resultData === 'object') {
            reportSection.classList.remove('hidden');

            // عرض ملخص التحليل النصي المبسط جداً
            if (textAnalysisContainer) {
                const a = resultData.text_analysis || {};
                const totalIssues = (a.urgency_hits || 0) + (a.threat_hits || 0) + (a.credential_hits || 0) + (a.spam_hits || 0);
                const hasIssues = totalIssues > 0;
                
                textAnalysisContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">${hasIssues ? '⚠️' : '✅'}</span>
                            <h4 style="margin: 0; font-weight: 700; color: #1f2937;">تحليل النص</h4>
                        </div>
                        ${hasIssues ? `<span style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${totalIssues} تحذير</span>` : '<span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">آمن</span>'}
                    </div>
                    ${hasIssues ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            ${(a.urgency_hits || 0) > 0 ? `<div style="background: rgba(239, 68, 68, 0.15); padding: 6px; border-radius: 6px; text-align: center; border: 1px solid rgba(239, 68, 68, 0.3);">
                                <div style="font-weight: 700; color: #dc2626; font-size: 0.9rem;">${a.urgency_hits}</div>
                                <div style="color: #7f1d1d; font-size: 0.7rem;">استعجال</div>
                            </div>` : ''}
                            ${(a.threat_hits || 0) > 0 ? `<div style="background: rgba(245, 158, 11, 0.15); padding: 6px; border-radius: 6px; text-align: center; border: 1px solid rgba(245, 158, 11, 0.3);">
                                <div style="font-weight: 700; color: #d97706; font-size: 0.9rem;">${a.threat_hits}</div>
                                <div style="color: #92400e; font-size: 0.7rem;">تهديد</div>
                            </div>` : ''}
                            ${(a.credential_hits || 0) > 0 ? `<div style="background: rgba(239, 68, 68, 0.15); padding: 6px; border-radius: 6px; text-align: center; border: 1px solid rgba(239, 68, 68, 0.3);">
                                <div style="font-weight: 700; color: #dc2626; font-size: 0.9rem;">${a.credential_hits}</div>
                                <div style="color: #7f1d1d; font-size: 0.7rem;">بيانات شخصية</div>
                            </div>` : ''}
                            ${(a.spam_hits || 0) > 0 ? `<div style="background: rgba(168, 85, 247, 0.15); padding: 6px; border-radius: 6px; text-align: center; border: 1px solid rgba(168, 85, 247, 0.3);">
                                <div style="font-weight: 700; color: #9333ea; font-size: 0.9rem;">${a.spam_hits}</div>
                                <div style="color: #6b21a8; font-size: 0.7rem;">عروض مبالغ فيها</div>
                            </div>` : ''}
                        </div>
                    ` : '<div style="text-align: center; padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 6px; color: #065f46; font-weight: 500;">لم يتم العثور على عبارات مشبوهة</div>'}
                `;
            }

            // عرض أهم نتيجة واحدة فقط
            const topReason = resultData.reasons[0];
            reasonsList.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 18px;">🔍</span>
                    <h4 style="margin: 0; font-weight: 700; color: #1f2937;">السبب الرئيسي</h4>
                </div>
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); padding: 12px; border-radius: 8px; border-right: 4px solid #f59e0b; display: flex; align-items: center; gap: 8px;">
                    <span style="background: #f59e0b; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem;">!</span>
                    <span style="color: #92400e; font-weight: 600; line-height: 1.4;">${topReason}</span>
                </div>
            `;

            // عرض تحليل الروابط المبسط
            if (urlAnalysisContainer) {
                const urlAnalysis = resultData.url_analysis || [];
                if (urlAnalysis.length === 0) {
                    urlAnalysisContainer.innerHTML = `
                        <div style="text-align: center; padding: 20px; background: #f0fdf4; border-radius: 8px; border: 2px solid #22c55e;">
                            <span style="font-size: 24px;">✅</span>
                            <p style="margin: 8px 0 0; color: #16a34a; font-weight: 600;">لم يتم العثور على روابط مشبوهة</p>
                        </div>
                    `;
                } else {
                    const suspiciousLinks = urlAnalysis.filter(item => 
                        item.category !== 'legitimate'
                    );
                    
                    if (suspiciousLinks.length === 0) {
                        urlAnalysisContainer.innerHTML = `
                            <div style="text-align: center; padding: 20px; background: #f0fdf4; border-radius: 8px; border: 2px solid #22c55e;">
                                <span style="font-size: 24px;">✅</span>
                                <p style="margin: 8px 0 0; color: #16a34a; font-weight: 600;">جميع الروابط آمنة</p>
                            </div>
                        `;
                    } else {
                        const cards = suspiciousLinks.map(item => {
                            const catLabel =
                                item.category === 'suspicious_lookalike' ? 'تقليد' :
                                item.category === 'suspicious_ip' ? 'IP مشبوه' :
                                item.category === 'unsafe' ? 'غير آمن' :
                                'غير معروف';
                            
                            const cardColor =
                                item.category === 'unsafe' ? '#dc2626' :
                                item.category === 'suspicious_lookalike' ? '#f59e0b' :
                                '#ef4444';
                            
                            return `
                                <div style="background: rgba(254, 242, 242, 0.8); border: 1px solid ${cardColor}; padding: 10px; border-radius: 6px; margin-bottom: 6px;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                                        <span style="background: ${cardColor}; color: white; padding: 2px 6px; border-radius: 8px; font-size: 0.7rem; font-weight: 600;">${catLabel}</span>
                                        <span style="font-size: 14px;">⚠️</span>
                                    </div>
                                    <div style="background: white; padding: 6px; border-radius: 4px; margin-bottom: 4px;">
                                        <div style="direction: ltr; font-size: 0.8rem; font-weight: 600; color: #374151; word-break: break-all;">${item.url}</div>
                                    </div>
                                    <div style="font-size: 0.75rem; color: #dc2626; font-weight: 500;">${item.reason}</div>
                                </div>
                            `;
                        }).join('');

                        urlAnalysisContainer.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                <span style="font-size: 18px;">🔗</span>
                                <h4 style="margin: 0; font-weight: 700; color: #1f2937;">الروابط المشبوهة</h4>
                                <span style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${suspiciousLinks.length}</span>
                            </div>
                            ${cards}
                        `;
                    }
                }
            }

            // عرض نتائج VirusTotal إن وُجدت (تأتي من خادم Node عند وجود مفتاح API)
            const vtSection = document.getElementById('virustotal-section');
            const vtResultsContainer = document.getElementById('virustotal-results');
            const vtList = resultData.virustotal_results || [];
            if (vtSection && vtResultsContainer) {
                if (vtList.length === 0) {
                    vtSection.classList.add('hidden');
                } else {
                    vtSection.classList.remove('hidden');
                    const vtRows = vtList.map(item => {
                        const s = item.stats || {};
                        const mal = s.malicious != null ? s.malicious : '-';
                        const sus = s.suspicious != null ? s.suspicious : '-';
                        const harm = s.harmless != null ? s.harmless : '-';
                        const undet = s.undetected != null ? s.undetected : '-';
                        const statusLabel = item.status === 'completed' ? 'مكتمل' : item.status === 'queued' ? 'قيد الانتظار' : item.status === 'error' ? 'خطأ' : (item.status || '-');
                        const errMsg = item.error ? `<br><span style="color:#b91c1c; font-size:0.8rem;">${item.error}</span>` : '';
                        return `
                            <div style="margin-bottom: 14px; padding: 10px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <div style="direction:ltr; font-size:0.85rem; word-break:break-all; margin-bottom: 6px;"><strong>الرابط:</strong> ${item.url}${errMsg}</div>
                                <div style="font-size:0.85rem; color:#475569;"><strong>حالة الفحص:</strong> ${statusLabel}</div>
                                <table style="width:100%; margin-top: 6px; font-size:0.8rem; border-collapse:collapse;">
                                    <tr><td style="color:#b91c1c;">خبيث (malicious)</td><td>${mal}</td></tr>
                                    <tr><td style="color:#d97706;">مشبوه (suspicious)</td><td>${sus}</td></tr>
                                    <tr><td style="color:#059669;">آمن (harmless)</td><td>${harm}</td></tr>
                                    <tr><td style="color:#64748b;">غير مكتشف (undetected)</td><td>${undet}</td></tr>
                                </table>
                            </div>
                        `;
                    }).join('');
                    vtResultsContainer.innerHTML = vtRows;
                }
            }
            
            // عرض التوصية المبسطة جداً
            recommendation.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span style="font-size: 16px;">💡</span>
                    <h4 style="margin: 0; font-weight: 700; color: #1f2937; font-size: 0.9rem;">توصية</h4>
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); padding: 10px; border-radius: 6px; border-right: 3px solid #3b82f6;">
                    <p style="margin: 0; color: #1e40af; font-weight: 500; font-size: 0.85rem; line-height: 1.4;">${resultData.recommendation}</p>
                </div>
            `;
            recommendation.style.borderRightColor = score > 70 ? '#f56565' : '#4299e1';
        }

        // تحريك الدائرة - حركة سلسة وأنيقة مع ألوان ديناميكية
        const radius = progressCircle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        // إعداد الدائرة
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;
        progressCircle.style.strokeLinecap = 'round';
        progressCircle.style.strokeWidth = '4';
        
        // تحديد لون الدائرة بناءً على مستوى الخطورة
        let strokeColor, glowColor;
        if (resultData.risk_level === 'Critical') {
            strokeColor = '#dc2626';
            glowColor = 'rgba(220, 38, 38, 0.3)';
        } else if (resultData.risk_level === 'High') {
            strokeColor = '#ef4444';
            glowColor = 'rgba(239, 68, 68, 0.3)';
        } else if (resultData.risk_level === 'Medium') {
            strokeColor = '#f59e0b';
            glowColor = 'rgba(245, 158, 11, 0.3)';
        } else {
            strokeColor = '#10b981';
            glowColor = 'rgba(16, 185, 129, 0.3)';
        }
        
        progressCircle.style.stroke = strokeColor;
        progressCircle.style.filter = `drop-shadow(0 0 8px ${glowColor})`;
        
        // تحريك سلس ومناسب
        let currentScore = 0;
        const targetScore = score;
        const duration = 2000; // 2 ثانية للحركة الكاملة
        const steps = 60; // 60 خطوة للحركة السلسة
        const increment = targetScore / steps;
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        const animateCircle = () => {
            currentStep++;
            currentScore = Math.min(increment * currentStep, targetScore);
            
            const offset = circumference - (currentScore / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
            
            if (currentStep < steps) {
                requestAnimationFrame(() => {
                    setTimeout(animateCircle, stepDuration);
                });
            }
        };
        
        // بدء الحركة بعد تأخير بسيط
        setTimeout(() => {
            animateCircle();
        }, 300);
    }
};
