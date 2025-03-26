document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt');
    const keywordsInput = document.getElementById('keywords');
    const toneSelect = document.getElementById('tone');
    const storyLengthSelect = document.getElementById('story-length');
    const customLengthContainer = document.getElementById('custom-length-container');
    const customLengthInput = document.getElementById('custom-length');
    const modelSelect = document.getElementById('model');
    const apiKeyInput = document.getElementById('api-key');
    const storyResult = document.getElementById('story-result');
    const wordCountElement = document.getElementById('word-count');
    
    // تنظیم نمایش فیلد طول سفارشی بر اساس انتخاب کاربر
    storyLengthSelect.addEventListener('change', () => {
        if (storyLengthSelect.value === 'custom') {
            customLengthContainer.style.display = 'block';
        } else {
            customLengthContainer.style.display = 'none';
        }
    });
    
    generateBtn.addEventListener('click', generateStory);
    
    // به کلیدهای ذخیره شده دسترسی پیدا کنید (اگر وجود داشته باشد)
    const savedApiKey = localStorage.getItem('openrouter-api-key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    } else {
        // استفاده از کلید API پیش‌فرض
        apiKeyInput.value = "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";
        // ذخیره کلید پیش‌فرض در localStorage
        localStorage.setItem('openrouter-api-key', apiKeyInput.value);
    }
    
    // دریافت مدل‌های هوش مصنوعی از OpenRouter
    fetchAIModels(apiKeyInput.value.trim());
    
    // وقتی کلید API تغییر کند، مدل‌ها را به‌روزرسانی کن
    apiKeyInput.addEventListener('change', () => {
        fetchAIModels(apiKeyInput.value.trim());
    });
    
    async function fetchAIModels(apiKey) {
        if (!apiKey) return;
        
        try {
            modelSelect.innerHTML = '<option value="gemini-1.5-flash" selected>Google Gemini 2.0 Flash</option>';
            
            const response = await fetch("https://openrouter.ai/api/v1/models", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": window.location.href
                }
            });
            
            if (!response.ok) {
                throw new Error(`خطای API با کد ${response.status}`);
            }
            
            const data = await response.json();
            
            // پاک کردن لیست
            modelSelect.innerHTML = '';
            
            // نمایش مدل‌های دریافت شده
            if (data && data.data && data.data.length > 0) {
                const models = data.data;
                let geminiModelFound = false;
                
                // ابتدا به دنبال مدل Gemini 2.0 Flash (1.5) بگردیم
                const geminiModels = models.filter(model => 
                    model.id.includes('gemini-1.5-flash') || 
                    model.id.includes('google/gemini-1.5-flash') ||
                    (model.id.includes('gemini') && model.id.includes('flash'))
                );
                
                if (geminiModels.length > 0) {
                    // مدل Gemini را در ابتدای لیست قرار دهیم
                    geminiModels.forEach(model => {
                        const option = document.createElement('option');
                        option.value = model.id;
                        option.textContent = `${model.name}`;
                        option.selected = true; // این مدل را انتخاب کن
                        modelSelect.appendChild(option);
                        geminiModelFound = true;
                    });
                    
                    // سایر مدل‌ها را اضافه کنیم
                    models.filter(model => !geminiModels.includes(model)).forEach(model => {
                        const option = document.createElement('option');
                        option.value = model.id;
                        option.textContent = `${model.name}`;
                        modelSelect.appendChild(option);
                    });
                } else {
                    // اگر Gemini پیدا نشد، تمام مدل‌ها را اضافه کنیم
                    models.forEach((model, index) => {
                        const option = document.createElement('option');
                        option.value = model.id;
                        option.textContent = `${model.name}`;
                        
                        // اولین مدل را انتخاب کنیم اگر Gemini پیدا نشد
                        if (index === 0) {
                            option.selected = true;
                        }
                        
                        modelSelect.appendChild(option);
                    });
                }
            } else {
                // اگر هیچ مدلی دریافت نشد، مدل‌های پیش‌فرض را نمایش بده
                addDefaultModels();
            }
        } catch (error) {
            console.error("خطا در دریافت مدل‌ها:", error);
            // در صورت خطا، مدل‌های پیش‌فرض را نمایش بده
            addDefaultModels();
        }
    }
    
    function addDefaultModels() {
        modelSelect.innerHTML = '';
        
        const defaultModels = [
            { id: "gemini-1.5-flash", name: "Google Gemini 2.0 Flash" },
            { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
            { id: "gpt-4o", name: "GPT-4o" }
        ];
        
        defaultModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            if (model.id === "gemini-1.5-flash") {
                option.selected = true;
            }
            modelSelect.appendChild(option);
        });
    }
    
    async function generateStory() {
        const prompt = promptInput.value.trim();
        const keywords = keywordsInput.value.trim();
        const tone = toneSelect.value;
        const storyLength = storyLengthSelect.value;
        const model = modelSelect.value;
        const apiKey = apiKeyInput.value.trim();
        
        // محاسبه تعداد کلمات بر اساس انتخاب کاربر
        let maxWords;
        switch (storyLength) {
            case 'short':
                maxWords = 200;
                break;
            case 'medium':
                maxWords = 400;
                break;
            case 'long':
                maxWords = 600;
                break;
            case 'custom':
                maxWords = parseInt(customLengthInput.value) || 500;
                break;
            default:
                maxWords = 400;
        }
        
        if (!prompt) {
            alert('لطفاً موضوع داستان را وارد کنید.');
            return;
        }
        
        if (!apiKey) {
            // اگر کلید خالی بود، کلید پیش‌فرض را قرار دهیم
            apiKeyInput.value = "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";
            localStorage.setItem('openrouter-api-key', apiKeyInput.value);
        }
        
        // نمایش حالت در حال بارگذاری
        storyResult.innerHTML = '';
        storyResult.classList.add('loading');
        generateBtn.disabled = true;
        wordCountElement.textContent = 'تعداد کلمات: ۰';
        
        try {
            const storyStream = await fetchStoryFromAI(prompt, keywords, tone, maxWords, model, apiKey);
            storyResult.classList.remove('loading');
            
            // اگر لحن کودکانه است، استیکرهای کودکانه اضافه کنیم
            if (tone === 'childish') {
                const storyWithEmojis = addChildEmojis(storyStream);
                typeWriter(storyWithEmojis, storyResult);
                updateWordCount(storyStream); // شمارش کلمات بدون استیکرها
            } else {
                typeWriter(storyStream, storyResult);
                updateWordCount(storyStream);
            }
        } catch (error) {
            storyResult.classList.remove('loading');
            storyResult.innerHTML = `<p class="error">خطا: ${error.message}</p>`;
            generateBtn.disabled = false;
        }
    }
    
    // اضافه کردن استیکرهای کودکانه به متن داستان
    function addChildEmojis(text) {
        // لیست استیکرهای کودکانه
        const childEmojis = [
            '🧚', '🦄', '🌈', '🐶', '🐱', '🦊', '🐻', '🐼', '🦁', 
            '🐨', '🐯', '🦋', '🐝', '🐞', '🌻', '🌺', '⭐', '🌟', 
            '✨', '🎈', '🎀', '🎁', '🌍', '🚀', '🛸', '🧸', '🍦', 
            '🍭', '🍬', '🍩', '🎪', '🎠', '🎡', '🎢', '🌳', '🍄'
        ];
        
        // بررسی پایان جملات و اضافه کردن استیکرها
        const sentences = text.split(/(?<=[.!؟،،\n])/);
        
        return sentences.map(sentence => {
            // برای هر جمله با احتمال 40٪ استیکر اضافه کنیم
            if (sentence.trim().length > 0 && Math.random() < 0.4) {
                const randomEmoji = childEmojis[Math.floor(Math.random() * childEmojis.length)];
                return `${sentence} <span class="child-emoji">${randomEmoji}</span>`;
            }
            return sentence;
        }).join('');
    }
    
    // به‌روزرسانی شمارنده کلمات
    function updateWordCount(text) {
        // حذف فاصله‌های اضافی و شمارش کلمات
        const wordCount = text.trim().split(/\s+/).length;
        
        // تبدیل اعداد انگلیسی به فارسی
        const persianWordCount = wordCount.toString().replace(/\d/g, d => {
            return ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][d];
        });
        
        wordCountElement.textContent = `تعداد کلمات: ${persianWordCount}`;
    }
    
    function typeWriter(text, element, speed = 20) {
        let i = 0;
        element.innerHTML = '<span class="typewriter"></span>';
        const typewriterElement = element.querySelector('.typewriter');
        
        const timer = setInterval(() => {
            if (i < text.length) {
                // اگر به یک تگ HTML رسیدیم، آن را به صورت کامل اضافه کنیم
                if (text.charAt(i) === '<') {
                    const endTagIndex = text.indexOf('>', i);
                    if (endTagIndex !== -1) {
                        typewriterElement.innerHTML += text.substring(i, endTagIndex + 1);
                        i = endTagIndex + 1;
                    } else {
                        typewriterElement.innerHTML += text.charAt(i);
                        i++;
                    }
                } else if (text.charAt(i) === '\n') {
                    typewriterElement.innerHTML += '<br>';
                    i++;
                } else {
                    typewriterElement.innerHTML += text.charAt(i);
                    i++;
                }
                // اسکرول به پایین به صورت خودکار
                element.scrollTop = element.scrollHeight;
            } else {
                clearInterval(timer);
                // حذف کلاس typewriter و تبدیل به متن عادی (با حفظ تگ‌های HTML)
                element.innerHTML = text;
                generateBtn.disabled = false;
            }
        }, speed);
    }
    
    async function fetchStoryFromAI(prompt, keywords, tone, maxWords, model, apiKey) {
        let tonePrompt = '';
        switch (tone) {
            case 'childish':
                tonePrompt = 'یک داستان کودکانه با زبان ساده و شخصیت‌های دوست‌داشتنی بنویس. از کلمات ساده استفاده کن و اتفاقات جالب و آموزنده را شرح بده.';
                break;
            case 'serious':
                tonePrompt = 'یک داستان جدی و عمیق بنویس که مفاهیم پیچیده را بررسی کند. از زبان رسمی و توصیفات دقیق استفاده کن.';
                break;
            case 'normal':
                tonePrompt = 'یک داستان متعادل با زبان روان و طبیعی بنویس که برای همه سنین مناسب باشد.';
                break;
        }
        
        let keywordsPrompt = '';
        if (keywords) {
            keywordsPrompt = `در داستان خود از این کلمات کلیدی استفاده کن: ${keywords}`;
        }
        
        const systemMessage = `تو یک نویسنده خلاق هستی. یک داستان کوتاه و جذاب بنویس که حداکثر ${maxWords} کلمه داشته باشد. هر داستان باید شخصیت‌های جالب، طرح داستانی منسجم و یک نتیجه‌گیری رضایت‌بخش داشته باشد.`;
        
        const messages = [
            {
                "role": "system",
                "content": systemMessage
            },
            {
                "role": "user",
                "content": `${tonePrompt} ${keywordsPrompt} موضوع داستان: ${prompt}. داستان را در حداکثر ${maxWords} کلمه بنویس.`
            }
        ];
        
        const baseURL = "https://openrouter.ai/api/v1/chat/completions";
        
        const response = await fetch(baseURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": window.location.href,
                "X-Title": "AI Story Generator"
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: maxWords * 5 // تخمین تقریبی برای حداکثر توکن‌ها
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `خطای API با کد ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
}); 