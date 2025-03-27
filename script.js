document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateStory');
    const loadingSpinner = document.getElementById('loading');
    const storyResult = document.getElementById('storyResult');
    const storyContent = document.getElementById('storyContent');
    const apiKeyInput = document.getElementById('apiKey');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const aiModelSelect = document.getElementById('aiModel');
    const modelLoadingStatus = document.getElementById('modelLoadingStatus');
    const wordCounter = document.getElementById('wordCounter');
    const storyLengthSelect = document.getElementById('storyLength');
    const customLengthContainer = document.getElementById('customLengthContainer');
    const customWordCount = document.getElementById('customWordCount');
    const searchableSelectContainer = document.querySelector('.searchable-select-container');
    const storyThemeInput = document.getElementById('storyTheme');
    const storyKeywordsInput = document.getElementById('storyKeywords');
    
    // متغیرهای مربوط به مدیریت داستان‌ها
    const savedStoriesContainer = document.getElementById('savedStories');
    const editStoryModal = document.getElementById('editStoryModal');
    const editStoryTitle = document.getElementById('editStoryTitle');
    const editStoryContent = document.getElementById('editStoryContent');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    let currentEditingStoryId = null;
    
    // متغیرهای مربوط به تاریخچه
    const toggleHistoryBtn = document.getElementById('toggleHistory');
    
    // متغیرهای مربوط به مودال مشاهده
    const viewStoryModal = document.getElementById('viewStoryModal');
    const viewStoryContent = document.getElementById('viewStoryContent');
    const viewStoryDate = document.getElementById('viewStoryDate');
    const viewStoryKeywords = document.getElementById('viewStoryKeywords');
    const viewStoryLength = document.getElementById('viewStoryLength');
    const viewStoryModel = document.getElementById('viewStoryModel');
    const closeViewBtn = document.getElementById('closeViewBtn');
    const viewFullStoryBtn = document.getElementById('viewFullStoryBtn');
    const copyStoryBtn = document.getElementById('copyStoryBtn');
    
    // تابع تبدیل اعداد به فارسی
    function toPersianNumber(num) {
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/[0-9]/g, function(w) {
            return persianNumbers[+w];
        });
    }
    
    // دکمه نمایش/مخفی کردن کلید API
    togglePasswordBtn.addEventListener('click', () => {
        const icon = togglePasswordBtn.querySelector('i');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            apiKeyInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
    
    // بارگذاری موضوع و کلمات کلیدی قبلی
    function loadPreviousInputs() {
        const previousTheme = localStorage.getItem('previousTheme');
        const previousKeywords = localStorage.getItem('previousKeywords');
        
        if (previousTheme) {
            storyThemeInput.placeholder = `پیشنهاد: ${previousTheme}`;
            storyThemeInput.title = 'موضوع استفاده شده در آخرین داستان';
        }
        
        if (previousKeywords) {
            storyKeywordsInput.placeholder = `پیشنهاد: ${previousKeywords}`;
            storyKeywordsInput.title = 'کلمات کلیدی استفاده شده در آخرین داستان';
        }
    }
    
    // ذخیره موضوع و کلمات کلیدی فعلی
    function saveCurrentInputs() {
        const currentTheme = storyThemeInput.value.trim();
        const currentKeywords = storyKeywordsInput.value.trim();
        
        if (currentTheme) {
            localStorage.setItem('previousTheme', currentTheme);
        }
        if (currentKeywords) {
            localStorage.setItem('previousKeywords', currentKeywords);
        }
    }
    
    // حذف کلاس previous-input هنگام ویرایش
    storyThemeInput.addEventListener('input', () => {
        storyThemeInput.classList.remove('previous-input');
        storyThemeInput.title = '';
    });
    
    storyKeywordsInput.addEventListener('input', () => {
        storyKeywordsInput.classList.remove('previous-input');
        storyKeywordsInput.title = '';
    });
    
    // بارگذاری تنظیمات ذخیره شده
    if (localStorage.getItem('openrouterApiKey')) {
        apiKeyInput.value = localStorage.getItem('openrouterApiKey');
        loadAvailableModels(localStorage.getItem('openrouterApiKey'));
    } else {
        loadDefaultModels();
    }
    
    // بارگذاری موضوع و کلمات کلیدی قبلی
    loadPreviousInputs();
    
    // بارگذاری لحن انتخاب شده قبلی
    const storyToneSelect = document.getElementById('storyTone');
    if (localStorage.getItem('selectedTone')) {
        storyToneSelect.value = localStorage.getItem('selectedTone');
    }
    
    // ذخیره لحن انتخاب شده
    storyToneSelect.addEventListener('change', function() {
        localStorage.setItem('selectedTone', this.value);
    });
    
    // بارگذاری مدل انتخاب شده قبلی
    if (localStorage.getItem('selectedAIModel')) {
        setTimeout(() => {
            try {
                const savedModel = localStorage.getItem('selectedAIModel');
                if (savedModel) {
                    const options = aiModelSelect.querySelectorAll('option');
                    let modelExists = false;
                    
                    options.forEach(option => {
                        if (option.value === savedModel) {
                            option.selected = true;
                            modelExists = true;
                        }
                    });
                    
                    if (!modelExists) {
                        console.log('مدل ذخیره شده یافت نشد:', savedModel);
                    }
                }
            } catch (e) {
                console.error('خطا در بازیابی مدل ذخیره شده:', e);
            }
        }, 1000);
    }
    
    // ذخیره مدل انتخاب شده
    aiModelSelect.addEventListener('change', function() {
        const selectedModel = this.value;
        if (selectedModel) {
            localStorage.setItem('selectedAIModel', selectedModel);
            console.log('مدل ذخیره شد:', selectedModel);
        }
    });
    
    // نمایش/مخفی کردن فیلد طول سفارشی
    storyLengthSelect.addEventListener('change', () => {
        customLengthContainer.style.display = storyLengthSelect.value === 'custom' ? 'block' : 'none';
    });
    
    // تنظیم محدودیت‌های ورودی طول سفارشی
    customWordCount.addEventListener('input', () => {
        let value = parseInt(customWordCount.value);
        if (value < 50) customWordCount.value = 50;
        if (value > 1000) customWordCount.value = 1000;
        
        // نمایش عدد فارسی در placeholder
        customWordCount.placeholder = `تعداد کلمات مورد نظر را وارد کنید (${toPersianNumber(50)} تا ${toPersianNumber(1000)})`;
    });
    
    // اضافه کردن قابلیت جستجو به باکس انتخاب مدل
    aiModelSelect.addEventListener('keyup', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const options = this.querySelectorAll('option');
        const optgroups = this.querySelectorAll('optgroup');
        
        // اگر کلید Enter زده شد، جستجو را انجام بده
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
            return;
        }
        
        // اگر کلید Escape زده شد، جستجو را پاک کن
        if (e.key === 'Escape') {
            this.value = '';
            this.blur();
            return;
        }
        
        // جستجو در آپشن‌ها
        options.forEach(option => {
            if (option.disabled) return;
            
            const text = option.textContent.toLowerCase();
            const id = option.value.toLowerCase();
            const matches = text.includes(searchTerm) || id.includes(searchTerm);
            
            if (!option.parentElement.tagName || option.parentElement.tagName !== 'OPTGROUP') {
                option.style.display = matches ? '' : 'none';
            }
        });
        
        // جستجو در گروه‌ها
        optgroups.forEach(group => {
            const groupOptions = group.querySelectorAll('option');
            let hasVisibleOptions = false;
            
            groupOptions.forEach(option => {
                const text = option.textContent.toLowerCase();
                const id = option.value.toLowerCase();
                const matches = text.includes(searchTerm) || id.includes(searchTerm);
                
                option.style.display = matches ? '' : 'none';
                if (matches) hasVisibleOptions = true;
            });
            
            group.style.display = hasVisibleOptions ? '' : 'none';
        });
    });
    
    // بارگذاری مدل‌های AI از OpenRouter
    async function loadAvailableModels(apiKey) {
        if (!apiKey) return;
        
        try {
            modelLoadingStatus.textContent = 'در حال بارگذاری مدل‌ها...';
            
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'Content-Type': 'application/json'
                }
            };
            
            console.log('Fetching models with key:', apiKey.substring(0, 8) + '...');
            
            const response = await fetch('https://openrouter.ai/api/v1/models', requestOptions);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response (text):', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: { message: 'خطا در پارس پاسخ' } };
                }
                
                throw new Error(errorData.error?.message || `خطای سرور: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Models data received:', data);
            
            if (data.data && Array.isArray(data.data)) {
                // پاک کردن مدل‌های فعلی
                aiModelSelect.innerHTML = '';
                
                // آرایه‌ای از مدل‌های محبوب
                const featuredModels = [
                    'gemini-1.5-flash',
                    'gpt-4o',
                    'claude-3-opus',
                    'claude-3-sonnet',
                    'claude-3-haiku',
                    'gpt-4-turbo',
                    'gpt-3.5-turbo'
                ];
                
                // ابتدا مدل‌های محبوب را اضافه کنیم
                let addedModels = [];
                
                // گروه‌بندی مدل‌ها بر اساس خانواده
                const modelFamilies = {};
                
                // دسته‌بندی مدل‌ها
                data.data.forEach(model => {
                    const familyName = model.id.split('-')[0]; // مثلاً 'gpt' یا 'claude'
                    if (!modelFamilies[familyName]) {
                        modelFamilies[familyName] = [];
                    }
                    modelFamilies[familyName].push(model);
                });
                
                // ابتدا مدل‌های محبوب را اضافه می‌کنیم
                featuredModels.forEach(modelId => {
                    const model = data.data.find(m => m.id === modelId);
                    if (model) {
                        const option = document.createElement('option');
                        option.value = model.id;
                        option.textContent = `${model.name || model.id}`;
                        
                        // اگر Gemini باشد به طور پیش‌فرض انتخاب شود
                        if (model.id === 'gemini-1.5-flash') {
                            option.selected = true;
                        }
                        
                        aiModelSelect.appendChild(option);
                        addedModels.push(model.id);
                    }
                });
                
                // اضافه کردن خط جداکننده
                if (addedModels.length > 0) {
                    const separator = document.createElement('option');
                    separator.disabled = true;
                    separator.textContent = '─────────────────';
                    aiModelSelect.appendChild(separator);
                }
                
                // سپس سایر مدل‌ها را براساس دسته‌بندی اضافه می‌کنیم
                Object.keys(modelFamilies).forEach(family => {
                    // اضافه کردن گروه مدل
                    const groupElement = document.createElement('optgroup');
                    groupElement.label = family.charAt(0).toUpperCase() + family.slice(1);
                    
                    // اضافه کردن مدل‌های این گروه
                    modelFamilies[family].forEach(model => {
                        if (!addedModels.includes(model.id)) {
                            const option = document.createElement('option');
                            option.value = model.id;
                            option.textContent = `${model.name || model.id}`;
                            groupElement.appendChild(option);
                            addedModels.push(model.id);
                        }
                    });
                    
                    // اگر این گروه مدل داشته باشد، آن را به سلکت باکس اضافه می‌کنیم
                    if (groupElement.childNodes.length > 0) {
                        aiModelSelect.appendChild(groupElement);
                    }
                });
                
                modelLoadingStatus.textContent = `${toPersianNumber(data.data.length)} مدل بارگذاری شد.`;
                
                // بررسی آیا مدل ذخیره شده قبلی وجود دارد
                const savedModel = localStorage.getItem('selectedAIModel');
                if (savedModel) {
                    const options = aiModelSelect.querySelectorAll('option');
                    options.forEach(option => {
                        if (option.value === savedModel) {
                            option.selected = true;
                        }
                    });
                }
            } else {
                throw new Error('فرمت داده دریافتی نامعتبر است');
            }
        } catch (error) {
            console.error('Error loading models:', error);
            modelLoadingStatus.textContent = `خطا در بارگذاری مدل‌ها: ${error.message}`;
            
            // بارگذاری مدل‌های پیش‌فرض در صورت خطا
            loadDefaultModels();
        }
    }
    
    // بارگذاری مدل‌های پیش‌فرض در صورت خطا
    function loadDefaultModels() {
        aiModelSelect.innerHTML = '';
        
        const defaultModels = [
            { id: 'gemini-1.5-flash', name: 'Gemini 2 Flash', selected: true },
            { id: 'gpt-4o', name: 'GPT-4o' },
            { id: 'claude-3-haiku', name: 'Claude 3 Haiku' }
        ];
        
        defaultModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            if (model.selected) {
                option.selected = true;
            }
            aiModelSelect.appendChild(option);
        });
        
        modelLoadingStatus.textContent = 'مدل‌های پیش‌فرض بارگذاری شدند. برای دریافت همه مدل‌ها، کلید API معتبر وارد کنید.';
    }
    
    // تابع ذخیره داستان
    function saveStory(story, theme, keywords, length, tone, model) {
        const stories = JSON.parse(localStorage.getItem('savedStories') || '[]');
        const newStory = {
            id: Date.now(),
            title: theme,
            content: story,
            metadata: {
                keywords,
                length,
                tone,
                model,
                date: new Date().toLocaleString('fa-IR')
            }
        };
        
        stories.unshift(newStory); // اضافه کردن داستان جدید به ابتدای لیست
        localStorage.setItem('savedStories', JSON.stringify(stories));
        displaySavedStories();
    }
    
    // تابع نمایش داستان‌های ذخیره شده
    function displaySavedStories() {
        const savedStories = JSON.parse(localStorage.getItem('savedStories') || '[]');
        savedStoriesContainer.innerHTML = '';
        
        if (savedStories.length === 0) {
            savedStoriesContainer.innerHTML = '<p class="no-stories">هنوز داستانی ذخیره نشده است.</p>';
            return;
        }
        
        savedStories.forEach(story => {
            const storyDate = story.metadata?.date || story.date || new Date().toLocaleDateString('fa-IR');
            const previewContent = story.content.length > 150 ? 
                                 story.content.substring(0, 150) + '...' : 
                                 story.content;
            
            const storyEl = document.createElement('div');
            storyEl.className = 'story-card';
            storyEl.innerHTML = `
                <div class="story-header">
                    <div class="story-title">${story.title || story.theme || 'بدون عنوان'}</div>
                    <div class="story-date">${storyDate}</div>
                </div>
                <div class="story-preview">${previewContent}</div>
                <div class="history-actions">
                    <button class="story-action-btn view-btn" data-id="${story.id}">
                        <i class="fas fa-eye"></i> مشاهده
                    </button>
                    <button class="story-action-btn edit-btn" data-id="${story.id}">
                        <i class="fas fa-edit"></i> ویرایش
                    </button>
                    <button class="story-action-btn delete-btn" data-id="${story.id}">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            `;
            
            savedStoriesContainer.appendChild(storyEl);
        });
        
        // اضافه کردن event listener به دکمه‌ها
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const storyId = this.dataset.id;
                viewStory(storyId);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const storyId = this.dataset.id;
                editStory(storyId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const storyId = this.dataset.id;
                if (confirm('آیا از حذف این داستان اطمینان دارید؟')) {
                    deleteStory(storyId);
                }
            });
        });
    }
    
    // تابع ویرایش داستان
    function editStory(storyId) {
        const stories = JSON.parse(localStorage.getItem('savedStories') || '[]');
        storyId = parseInt(storyId); // تبدیل به عدد
        const story = stories.find(s => s.id === storyId);
        
        if (story) {
            currentEditingStoryId = storyId;
            editStoryTitle.value = story.title || story.theme || 'بدون عنوان';
            editStoryContent.value = story.content;
            editStoryModal.classList.add('show');
        } else {
            console.error('داستان یافت نشد:', storyId);
        }
    }
    
    // تابع حذف داستان
    function deleteStory(storyId) {
        storyId = parseInt(storyId); // تبدیل به عدد
        const stories = JSON.parse(localStorage.getItem('savedStories') || '[]');
        const updatedStories = stories.filter(s => s.id !== storyId);
        localStorage.setItem('savedStories', JSON.stringify(updatedStories));
        displaySavedStories();
    }
    
    // ذخیره تغییرات ویرایش
    saveEditBtn.addEventListener('click', () => {
        if (!currentEditingStoryId) return;
        
        const stories = JSON.parse(localStorage.getItem('savedStories') || '[]');
        const storyIndex = stories.findIndex(s => s.id === currentEditingStoryId);
        
        if (storyIndex !== -1) {
            stories[storyIndex].title = editStoryTitle.value;
            stories[storyIndex].content = editStoryContent.value;
            stories[storyIndex].metadata.date = new Date().toLocaleString('fa-IR');
            localStorage.setItem('savedStories', JSON.stringify(stories));
            displaySavedStories();
            editStoryModal.classList.remove('show');
            currentEditingStoryId = null;
        }
    });
    
    // بستن مودال ویرایش
    cancelEditBtn.addEventListener('click', () => {
        editStoryModal.classList.remove('show');
        currentEditingStoryId = null;
    });
    
    // بستن مودال با کلیک خارج از آن
    editStoryModal.addEventListener('click', (e) => {
        if (e.target === editStoryModal) {
            editStoryModal.classList.remove('show');
            currentEditingStoryId = null;
        }
    });
    
    // تابع مشاهده داستان
    function viewStory(storyId) {
        const stories = JSON.parse(localStorage.getItem('savedStories') || '[]');
        storyId = parseInt(storyId); // تبدیل به عدد
        const story = stories.find(s => s.id === storyId);
        
        if (story) {
            // تاریخ
            viewStoryDate.textContent = story.metadata?.date || story.date || 'نامشخص';
            
            // کلمات کلیدی
            viewStoryKeywords.textContent = story.metadata?.keywords || 'بدون کلمات کلیدی';
            
            // طول داستان
            const length = story.metadata?.length || 'نامشخص';
            viewStoryLength.textContent = length === 'custom' ? 
                `${story.metadata?.customLength || '?'} کلمه` : 
                length === 'short' ? 'کوتاه' :
                length === 'medium' ? 'متوسط' : 
                length === 'long' ? 'بلند' : 'نامشخص';
            
            // مدل
            viewStoryModel.textContent = story.metadata?.model || 'نامشخص';
            
            // محتوا
            viewStoryContent.innerHTML = formatStory(story.content);
            
            // نمایش مودال
            viewStoryModal.classList.add('show');
        } else {
            console.error('داستان یافت نشد:', storyId);
        }
    }
    
    // بستن مودال مشاهده
    closeViewBtn.addEventListener('click', () => {
        viewStoryModal.classList.remove('show');
    });
    
    // بستن مودال با کلیک خارج از آن
    viewStoryModal.addEventListener('click', (e) => {
        if (e.target === viewStoryModal) {
            viewStoryModal.classList.remove('show');
        }
    });
    
    // نمایش داستان‌های ذخیره شده در بارگذاری صفحه
    displaySavedStories();
    
    generateBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            alert('لطفاً کلید API را وارد کنید');
            return;
        }
        
        if (!apiKey.startsWith('sk-or-')) {
            alert('کلید API باید با "sk-or-" شروع شود. لطفاً کلید معتبر وارد کنید.');
            return;
        }
        
        // ذخیره کلید API در localStorage
        localStorage.setItem('openrouterApiKey', apiKey);
        
        // بارگذاری مدل‌ها اگر قبلاً بارگذاری نشده‌اند
        if (aiModelSelect.options.length <= 1 && aiModelSelect.options[0].value === '') {
            await loadAvailableModels(apiKey);
        }
        
        const storyTheme = storyThemeInput.value.trim();
        if (!storyTheme) {
            alert('لطفاً موضوع داستان را وارد کنید');
            return;
        }
        
        const storyKeywords = storyKeywordsInput.value.trim();
        const storyLength = storyLengthSelect.value;
        const storyTone = document.getElementById('storyTone').value;
        const aiModel = aiModelSelect.value;
        
        if (!aiModel) {
            alert('لطفاً یک مدل هوش مصنوعی انتخاب کنید');
            return;
        }
        
        // ذخیره موضوع و کلمات کلیدی فعلی
        saveCurrentInputs();
        
        // نمایش لودینگ
        loadingSpinner.style.display = 'block';
        storyResult.style.display = 'none';
        
        try {
            const story = await generateStory(apiKey, storyTheme, storyKeywords, storyLength, storyTone, aiModel);
            
            // ذخیره داستان
            saveStory(story, storyTheme, storyKeywords, storyLength, storyTone, aiModel);
            
            // نمایش نتیجه
            storyResult.style.display = 'block';
            
            // نمایش داستان به صورت زنده
            typeStory(story);
            
            // اسکرول به پایین برای دیدن نتیجه
            storyResult.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            alert(`خطا در ساخت داستان: ${error.message}`);
            console.error('Error details:', error);
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });
    
    // تابع نمایش متن به صورت زنده
    function typeStory(story) {
        storyContent.innerHTML = '';
        const wordCount = document.getElementById('wordCount');
        if (wordCount) {
            wordCount.textContent = toPersianNumber(0);
        } else {
            wordCounter.textContent = `تعداد کلمات: ${toPersianNumber(0)}`;
        }
        
        // جدا کردن پاراگراف‌ها و اطمینان از جداسازی صحیح متن
        const paragraphs = story.split('\n\n').filter(p => p.trim() !== '');
        let currentParagraph = 0;
        
        // شمارش کل کلمات
        const totalWords = story.trim().split(/\s+/).length;
        
        // محاسبه ارتفاع تقریبی نهایی بر اساس تعداد پاراگراف‌ها
        const estimatedHeight = Math.max(200, paragraphs.length * 100 + 100); // حداقل 200px ارتفاع
        
        // ایجاد همه پاراگراف‌ها از ابتدا برای جلوگیری از تغییر ارتفاع مداوم
        paragraphs.forEach(() => {
            const p = document.createElement('p');
            p.textContent = ''; // پاراگراف خالی
            storyContent.appendChild(p);
        });
        
        // تنظیم حداقل ارتفاع برای پیش‌بینی محتوا
        storyResult.style.minHeight = `${estimatedHeight}px`;
        
        const allParagraphs = storyContent.querySelectorAll('p');
        
        // اطمینان از نمایش کامل کادر
        function updateContainerHeight() {
            const contentHeight = storyContent.scrollHeight;
            const containerPadding = 40; // 20px بالا + 20px پایین
            const actionsHeight = 150; // فضای اضافی برای دکمه‌ها و شمارنده کلمات
            
            // تنظیم ارتفاع کانتینر بر اساس محتوا
            storyResult.style.height = `${contentHeight + containerPadding}px`;
        }
        
        function typeParagraph() {
            if (currentParagraph >= paragraphs.length) return;
            
            const paragraph = paragraphs[currentParagraph];
            const p = allParagraphs[currentParagraph];
            
            let charIndex = 0;
            
            function typeChar() {
                if (charIndex < paragraph.length) {
                    // اطمینان از جدا بودن ایموجی‌ها از متن
                    const char = paragraph.charAt(charIndex);
                    if (isEmoji(char)) {
                        // اضافه کردن فاصله قبل و بعد از ایموجی برای جلوگیری از چسبیدن به متن
                        p.textContent = p.textContent.trim() + ' ' + char + ' ';
                    } else {
                        p.textContent += char;
                    }
                    
                    charIndex++;
                    
                    // به‌روزرسانی شمارنده کلمات هر 10 کاراکتر
                    if (charIndex % 10 === 0) {
                        const currentText = storyContent.textContent;
                        const currentWordCount = currentText.trim().split(/\s+/).length;
                        
                        if (wordCount) {
                            wordCount.textContent = toPersianNumber(currentWordCount);
                        } else {
                            wordCounter.textContent = `تعداد کلمات: ${toPersianNumber(currentWordCount)} از ${toPersianNumber(totalWords)}`;
                        }
                        
                        // به‌روزرسانی ارتفاع کانتینر هر 10 کاراکتر برای نمایش روان‌تر
                        updateContainerHeight();
                    }
                    
                    // سرعت تایپ - سریع‌تر برای راحتی کاربر
                    const speed = Math.floor(Math.random() * 3) + 1;
                    setTimeout(typeChar, speed);
                } else {
                    currentParagraph++;
                    updateContainerHeight(); // به‌روزرسانی ارتفاع پس از اتمام هر پاراگراف
                    setTimeout(typeParagraph, 100);
                }
            }
            
            typeChar();
        }
        
        // آماده‌سازی مشاهده داستان قبل از شروع تایپ
        storyResult.style.display = 'block';
        updateContainerHeight();
        
        typeParagraph();
    }
    
    // تابع تشخیص ایموجی
    function isEmoji(str) {
        const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
        return emojiRegex.test(str);
    }
    
    // تابع فرمت‌دهی به داستان برای نمایش
    function formatStory(storyText) {
        // اطمینان از جداسازی صحیح پاراگراف‌ها
        const paragraphs = storyText.split('\n\n').filter(para => para.trim() !== '');
        
        // فرمت‌دهی هر پاراگراف و بهبود نمایش ایموجی‌ها
        const formattedText = paragraphs.map(paragraph => {
            // جداسازی کاراکترها برای بررسی ایموجی‌ها
            let formatted = '';
            for (let i = 0; i < paragraph.length; i++) {
                const char = paragraph.charAt(i);
                if (isEmoji(char)) {
                    // اضافه کردن فاصله مناسب برای ایموجی‌ها
                    formatted += ` <span class="emoji">${char}</span> `;
                } else {
                    formatted += char;
                }
            }
            
            // تبدیل خط‌های داخل پاراگراف به <br>
            formatted = formatted.replace(/\n/g, '<br>');
            
            return `<p>${formatted}</p>`;
        }).join('');
        
        return formattedText;
    }
    
    // بررسی وجود کلید API و بارگذاری مدل‌ها در صورت وجود
    apiKeyInput.addEventListener('input', function() {
        const apiKey = this.value.trim();
        if (apiKey.length > 10 && apiKey.startsWith('sk-or-')) {
            loadAvailableModels(apiKey);
        }
    });
    
    // نمایش/مخفی کردن باکس جستجو
    aiModelSelect.addEventListener('focus', () => {
        searchableSelectContainer.classList.add('active');
    });
    
    aiModelSelect.addEventListener('blur', (e) => {
        // اگر موس روی باکس جستجو نیست، آن را مخفی کن
        if (!searchableSelectContainer.contains(e.relatedTarget)) {
            searchableSelectContainer.classList.remove('active');
        }
    });
    
    // تابع باز/بسته کردن تاریخچه
    toggleHistoryBtn.addEventListener('click', () => {
        const isVisible = savedStoriesContainer.style.display === 'block';
        savedStoriesContainer.style.display = isVisible ? 'none' : 'block';
        savedStoriesContainer.style.maxHeight = isVisible ? '0' : '600px';
        toggleHistoryBtn.classList.toggle('active');
        
        // تغییر آیکون
        const icon = toggleHistoryBtn.querySelector('i');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });

    // اضافه کردن عملکرد دکمه مشاهده کل داستان
    viewFullStoryBtn.addEventListener('click', () => {
        const storyText = storyContent.textContent;
        // ایجاد محتوا با فرمت صحیح پاراگراف‌ها
        viewStoryContent.innerHTML = formatStory(storyText);
        
        // اضافه کردن تاریخ امروز
        const todayDate = new Date().toLocaleString('fa-IR');
        viewStoryDate.textContent = todayDate;
        
        // اضافه کردن کلمات کلیدی
        viewStoryKeywords.textContent = storyKeywordsInput.value || 'بدون کلمات کلیدی';
        
        // اضافه کردن طول داستان
        const length = storyLengthSelect.value;
        viewStoryLength.textContent = length === 'custom' ? 
            `${customWordCount.value} کلمه` : 
            length === 'short' ? 'کوتاه' :
            length === 'medium' ? 'متوسط' : 'بلند';
        
        // اضافه کردن مدل
        viewStoryModel.textContent = aiModelSelect.options[aiModelSelect.selectedIndex].text;
        
        // نمایش مودال
        viewStoryModal.classList.add('show');
    });

    // اضافه کردن عملکرد دکمه کپی داستان
    copyStoryBtn.addEventListener('click', async () => {
        const storyText = storyContent.textContent;
        try {
            await navigator.clipboard.writeText(storyText);
            copyStoryBtn.innerHTML = '<i class="fas fa-check"></i> کپی شد!';
            setTimeout(() => {
                copyStoryBtn.innerHTML = '<i class="fas fa-copy"></i> کپی داستان';
            }, 2000);
        } catch (err) {
            console.error('خطا در کپی کردن داستان:', err);
            copyStoryBtn.innerHTML = '<i class="fas fa-times"></i> خطا در کپی';
            setTimeout(() => {
                copyStoryBtn.innerHTML = '<i class="fas fa-copy"></i> کپی داستان';
            }, 2000);
        }
    });

    async function generateStory(apiKey, theme, keywords, length, tone, model) {
        // تعیین طول داستان
        let maxWords;
        switch (length) {
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
                maxWords = parseInt(customWordCount.value) || 400;
                break;
        }
        
        // تعیین لحن داستان و تنظیمات ایموجی
        let toneDescription;
        let emojiSettings = '';
        switch (tone) {
            case 'childish':
                toneDescription = 'کودکانه و ساده برای کودکان';
                emojiSettings = `
                از ایموجی‌های کودکانه و شاد در متن استفاده کن. برای مثال:
                - برای شخصیت‌های اصلی: 👶 👧 👦
                - برای حیوانات: 🐱 🐶 🐰 🐼
                - برای طبیعت: 🌞 🌙 ⭐ 🌈
                - برای احساسات: 😊 😄 😍 🎉
                - برای اشیاء: 🎈 🎨 🎭 🎪
                - برای غذاها: 🍎 🍪 🍦 🍫
                - برای فعالیت‌ها: 🎮 🎨 🎭 🎪
                - برای پایان داستان: 🌟 ✨ 🎉
                
                نکات مهم برای استفاده از ایموجی:
                1. از ایموجی‌ها به صورت متعادل استفاده کن (نه خیلی زیاد و نه خیلی کم)
                2. ایموجی‌ها باید با متن هماهنگ باشند
                3. در ابتدای هر پاراگراف از یک ایموجی مرتبط استفاده کن
                4. هر ایموجی باید با یک فاصله از متن جدا شود تا خوانایی بهتر شود
                5. در پایان داستان از ایموجی‌های شاد و مثبت استفاده کن
                `;
                break;
            case 'serious':
                toneDescription = 'جدی و عمیق';
                break;
            case 'normal':
                toneDescription = 'عادی و متعادل';
                break;
        }
        
        // ساخت پیام برای ارسال به API
        let prompt = `
        لطفاً یک داستان با حداکثر ${toPersianNumber(maxWords)} کلمه با موضوع "${theme}" و لحن ${toneDescription} بنویس.
        داستان باید جذاب، خلاقانه و پرمعنا باشد.
        ${tone === 'childish' ? emojiSettings : ''}
        اگر لحن کودکانه است، از کلمات ساده و جملات کوتاه استفاده کن.
        داستان را با پاراگراف‌بندی مناسب و بدون هیچ توضیح اضافی تولید کن.
        مهم: داستان باید کمتر از ${toPersianNumber(maxWords)} کلمه باشد (حدود ${toPersianNumber(Math.floor(maxWords * 0.8))} تا ${toPersianNumber(Math.floor(maxWords * 0.95))} کلمه).
        `;
        
        // اضافه کردن کلمات کلیدی اگر وجود داشته باشند
        if (keywords) {
            prompt += `\nلطفاً از کلمات کلیدی زیر در داستان استفاده کن: ${keywords}`;
        }
        
        const messages = [
            {
                role: 'user',
                content: prompt
            }
        ];
        
        const requestData = {
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: Math.floor(maxWords * 1.5) // تبدیل تقریبی کلمات به توکن
        };
        
        // تنظیمات درخواست API
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin
            },
            body: JSON.stringify(requestData)
        };
        
        console.log('Sending story request with:', {
            model: model,
            theme: theme,
            keywords: keywords,
            length: length,
            tone: tone,
            apiKey: apiKey.substring(0, 8) + '...' // فقط بخشی از کلید نمایش داده می‌شود
        });
        
        try {
            // ارسال درخواست به API
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', requestOptions);
            
            // گرفتن پاسخ به صورت متن برای بررسی بهتر
            const responseText = await response.text();
            console.log('Raw API response:', responseText);
            
            // تبدیل متن به JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Error parsing response:', e);
                throw new Error('خطا در پردازش پاسخ سرور');
            }
            
            // بررسی خطا
            if (!response.ok) {
                console.error('API Error Response:', data);
                throw new Error(data.error?.message || `خطای سرور: ${response.status}`);
            }
            
            // بررسی داده‌های دریافتی
            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else {
                console.error('Invalid API response structure:', data);
                throw new Error('ساختار پاسخ نامعتبر است');
            }
        } catch (error) {
            console.error('Error in fetch operation:', error);
            throw error;
        }
    }
}); 