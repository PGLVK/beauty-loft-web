document.addEventListener('DOMContentLoaded', () => {
    
    // === 1. РОЗУМНИЙ КАЛЕНДАР (Автоматичне завантаження зайнятих дат) ===
    async function initCalendar() {
        let disabledDates = [];
        
        try {
            // Завантажуємо файл із зайнятими датами з сервера
            const response = await fetch('booked-dates.json');
            if (response.ok) {
                const data = await response.json();
                disabledDates = data.dates || [];
            }
        } catch (error) {
            console.log('Дати ще не налаштовані в адмінці або файл порожній');
        }

        if (document.getElementById('date')) {
            flatpickr("#date", {
                locale: "uk",
                dateFormat: "d.m.Y",
                minDate: "today",
                disable: disabledDates, // Ті самі дати, які Олена введе в адмінці
                disableMobile: "true"
            });
        }
    }
    // Запускаємо календар
    initCalendar();

    // === 2. МОБІЛЬНЕ МЕНЮ ТА ПЛАВНИЙ СКРОЛ ===
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if(hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement){
                 e.preventDefault();
                 targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // === 3. ЛОГІКА АВТОМАТИЧНОГО БЛОГУ ===
    async function loadLatestPosts() {
        const blogGrid = document.querySelector('.blog-grid');
        if (!blogGrid) return; 

        try {
            const response = await fetch('blog-data.json');
            if (!response.ok) return; 
            const newPosts = await response.json();
            newPosts.forEach(post => {
                const cardHTML = `
                    <article class="blog-card">
                        <div class="blog-image"><img src="${post.image}" alt="${post.title}"></div>
                        <div class="blog-content">
                            <span class="blog-date">${post.date}</span>
                            <h3 class="blog-title">${post.title}</h3>
                            <p class="blog-excerpt">${post.description}</p>
                            <a href="article-dynamic.html?post=${post.slug}" class="read-more">Читати далі →</a>
                        </div>
                    </article>
                `;
                blogGrid.insertAdjacentHTML('beforeend', cardHTML);
            });
        } catch (error) {
            console.log('Блог готовий до публікації!');
        }
    }
    loadLatestPosts(); 

    // === 4. ВІДПРАВКА ФОРМИ В ТЕЛЕГРАМ ===
    const contactForm = document.getElementById('tg-form');
    const formMessage = document.getElementById('form-message');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault(); 

            const clientName = document.getElementById('name').value || 'Не вказано';
            const clientPhone = document.getElementById('phone').value || 'Не вказано';
            const clientProcedure = document.getElementById('service').value || 'Не вказано';
            const clientDate = document.getElementById('date').value || 'Не вказано';
            const clientTimePeriod = document.getElementById('time_period').value || 'Не вказано';

            const messageText = `🎉 Нова заявка з сайту!\n\n👤 Ім'я: ${clientName}\n📞 Телефон: ${clientPhone}\n💅 Процедура: ${clientProcedure}\n📅 Дата: ${clientDate}\n⏰ Час: ${clientTimePeriod}`;

            const botToken = '8204168253:AAEqJZY32L1LuugQT_OGUYRx2gENpg5mS0o';
            const chatId = '260464270';
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Відправка...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: chatId, text: messageText })
                });

                if (response.ok) {
                    if(formMessage) formMessage.style.display = 'block';
                    contactForm.reset(); 
                    setTimeout(() => { if(formMessage) formMessage.style.display = 'none'; }, 5000);
                } else {
                    alert('Помилка при відправці.');
                }
            } catch (error) {
                alert('Помилка з\'єднання.');
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});