// ==================== УТИЛИТЫ ====================

// Экранирование HTML для защиты от XSS
function escapeHtml(str) {
    if (typeof str !== 'string') return String(str);
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
}

// Toast-уведомления (заменяют alert)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const container = document.getElementById('toast-container') || createToastContainer();
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Debounce-утилита
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Debounced-версия renderInventory для поиска
const debouncedRenderInventory = debounce(() => renderInventory(), 300);

// ==================== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ====================

// Данные о маркерах пользователя (LS_PREFIX определён в data.js)
let inventory = JSON.parse(localStorage.getItem(LS_PREFIX + 'inventory')) || {};
let history = JSON.parse(localStorage.getItem(LS_PREFIX + 'history')) || [];

// ==================== ДИНАМИЧЕСКИЕ БРЕНДЫ ====================

// Заполнить все select-ы брендов динамически
function populateBrandSelects() {
    const allBrands = getAllBrands();
    
    // Селекты с опцией "Все бренды"
    const filterBrand = document.getElementById('filter-brand');
    if (filterBrand) {
        const currentVal = filterBrand.value;
        filterBrand.innerHTML = '<option value="all">Все бренды</option>';
        allBrands.forEach(brand => {
            const opt = document.createElement('option');
            opt.value = brand;
            opt.textContent = brand;
            filterBrand.appendChild(opt);
        });
        filterBrand.value = currentVal || 'all';
    }
    
    // Селекты для добавления/расхода/поиска/сравнения
    const simpleSelects = ['add-brand', 'use-brand', 'search-brand'];
    simpleSelects.forEach(id => {
        const sel = document.getElementById(id);
        if (sel) {
            const currentVal = sel.value;
            sel.innerHTML = '';
            allBrands.forEach(brand => {
                const opt = document.createElement('option');
                opt.value = brand;
                opt.textContent = brand;
                sel.appendChild(opt);
            });
            if (currentVal && allBrands.includes(currentVal)) {
                sel.value = currentVal;
            }
        }
    });
    
    // Селект для набора (бренд)
    const bulkBrand = document.getElementById('bulk-brand');
    if (bulkBrand) {
        const currentVal = bulkBrand.value;
        bulkBrand.innerHTML = '';
        // Показываем только бренды, у которых есть наборы в MARKER_SETS
        const brandsWithSets = Object.keys(MARKER_SETS).filter(b => MARKER_SETS[b].length > 0);
        brandsWithSets.forEach(brand => {
            const opt = document.createElement('option');
            opt.value = brand;
            opt.textContent = brand;
            bulkBrand.appendChild(opt);
        });
        if (currentVal && brandsWithSets.includes(currentVal)) {
            bulkBrand.value = currentVal;
        }
        // Заполняем селект наборов для текущего бренда
        onBulkBrandChange();
    }
    
    // Селекты в форме маппинга
    document.querySelectorAll('.mapping-brand-0, .mapping-brand-1').forEach(sel => {
        const currentVal = sel.value;
        sel.innerHTML = '';
        allBrands.forEach(brand => {
            const opt = document.createElement('option');
            opt.value = brand;
            opt.textContent = brand;
            sel.appendChild(opt);
        });
        if (currentVal && allBrands.includes(currentVal)) {
            sel.value = currentVal;
        }
    });
    // Обновить autocomplete (функция из features.js)
    if (typeof updateAutocompleteLists === 'function') {
        setTimeout(updateAutocompleteLists, 50);
    }
}

// Обновить селект наборов при смене бренда
function onBulkBrandChange() {
    const brand = document.getElementById('bulk-brand').value;
    const setSelect = document.getElementById('bulk-set');
    if (!setSelect || !brand) return;
    
    setSelect.innerHTML = '';
    const sets = MARKER_SETS[brand] || [];
    
    if (sets.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Нет доступных наборов';
        setSelect.appendChild(opt);
        return;
    }
    
    sets.forEach((set, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = set.name;
        setSelect.appendChild(opt);
    });
}

// Получить CSS-стиль для badge бренда
function getBadgeStyle(brand) {
    const customBrands = getCustomBrands();
    const found = customBrands.find(b => b.name === brand);
    if (found) {
        return `background: ${found.color}; color: white;`;
    }
    return '';
}

// Получить CSS-класс для badge бренда
function getBadgeClass(brand) {
    if (BUILTIN_BRANDS.includes(brand)) {
        return `badge-${brand.toLowerCase()}`;
    }
    return 'badge-custom';
}

// Получить HTML badge для бренда
function getBadgeHtml(brand) {
    const cls = getBadgeClass(brand);
    const style = getBadgeStyle(brand);
    return `<span class="badge ${cls}" style="${style}">${escapeHtml(brand)}</span>`;
}

// ==================== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЬСКИМИ БРЕНДАМИ ====================

function addCustomBrand() {
    const nameInput = document.getElementById('new-brand-name');
    const colorCodeInput = document.getElementById('new-brand-color-code');
    const name = nameInput.value.trim();
    const colorCode = colorCodeInput.value.trim().toUpperCase();
    
    if (!name) {
        showToast('Введите название бренда', 'warning');
        return;
    }
    
    if (!colorCode) {
        showToast('Введите код цвета', 'warning');
        return;
    }
    
    // Проверка на дубликат бренда
    const allBrands = getAllBrands();
    const brandExists = allBrands.some(b => b.toLowerCase() === name.toLowerCase());
    
    // Автоматически назначить цвет badge из палитры (только для новых брендов)
    if (!brandExists) {
        const customBrands = getCustomBrands();
        const nextColorIndex = customBrands.length % CUSTOM_BRAND_COLORS.length;
        const badgeColor = CUSTOM_BRAND_COLORS[nextColorIndex];
        customBrands.push({ name, color: badgeColor });
        saveCustomBrands(customBrands);
    }
    
    // Добавить маркер с указанным кодом цвета
    const key = `${name}_${colorCode}`;
    if (!inventory[key]) {
        inventory[key] = { brand: name, code: colorCode, quantity: 1, timesEmptied: 0 };
    } else {
        inventory[key].quantity += 1;
    }
    
    history.push({
        date: new Date().toISOString(),
        action: 'purchase',
        brand: name,
        code: colorCode,
        quantity: 1
    });
    
    saveData();
    
    nameInput.value = '';
    colorCodeInput.value = '';
    
    // Обновить всё
    populateBrandSelects();
    renderCustomBrandsList();
    renderInventory();
    
    if (!brandExists) {
        showToast(`Бренд "${escapeHtml(name)}" добавлен с цветом ${escapeHtml(colorCode)}!`, 'success');
    } else {
        showToast(`Добавлен ${escapeHtml(name)} ${escapeHtml(colorCode)} (1 шт.)`, 'success');
    }
}

function removeCustomBrand(name) {
    if (!confirm(`Удалить бренд "${name}"? Маркеры этого бренда останутся в инвентаре.`)) {
        return;
    }
    
    let customBrands = getCustomBrands();
    customBrands = customBrands.filter(b => b.name !== name);
    saveCustomBrands(customBrands);
    
    // Удалить маппинги этого бренда
    const customMappings = getCustomMappings();
    for (const key of Object.keys(customMappings)) {
        if (key.startsWith(`${name}_`)) {
            delete customMappings[key];
        } else {
            for (const targetBrand of Object.keys(customMappings[key])) {
                if (targetBrand === name) {
                    delete customMappings[key][targetBrand];
                }
            }
            // Если маппинг стал пустым — удалить
            if (Object.keys(customMappings[key]).length === 0) {
                delete customMappings[key];
            }
        }
    }
    saveCustomMappings(customMappings);
    
    // Перестроить индекс
    buildReverseIndex();
    mergeCustomMappingsIntoReverseIndex();
    
    populateBrandSelects();
    renderCustomBrandsList();
    renderExistingMappings();
    renderInventory();
}

function renderCustomBrandsList() {
    const container = document.getElementById('custom-brands-list');
    const customBrands = getCustomBrands();
    
    if (customBrands.length === 0) {
        container.innerHTML = '<p class="text-disabled text-14">Пока нет добавленных брендов</p>';
        return;
    }
    
    container.innerHTML = '<h3 class="mb-8 text-16">Добавленные бренды:</h3>' +
        customBrands.map(b => `
            <div class="custom-brand-item">
                <div class="color-dot" style="background: ${escapeHtml(b.color)};"></div>
                <span class="brand-name">${escapeHtml(b.name)}</span>
                <button class="btn-remove-row" onclick="removeCustomBrand('${escapeHtml(b.name)}')">✕ Удалить</button>
            </div>
        `).join('');
}

// ==================== УПРАВЛЕНИЕ МАППИНГАМИ ====================

let mappingRowIndex = 1;

function addMappingRow() {
    const container = document.getElementById('mapping-rows');
    const allBrands = getAllBrands();
    const optionsHtml = allBrands.map(b => `<option value="${b}">${b}</option>`).join('');
    
    const row = document.createElement('div');
    row.className = 'mapping-row';
    row.setAttribute('data-index', mappingRowIndex);
    row.innerHTML = `
        <select class="mapping-brand-0">${optionsHtml}</select>
        <input type="text" class="mapping-code-0" placeholder="Код цвета" style="width: 120px;">
        <span class="text-primary-accent" style="font-weight: bold;">⟷</span>
        <select class="mapping-brand-1">${optionsHtml}</select>
        <input type="text" class="mapping-code-1" placeholder="Код цвета" style="width: 120px;">
        <button class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(row);
    mappingRowIndex++;
}

function saveMapping() {
    const rows = document.querySelectorAll('#mapping-rows .mapping-row');
    const customMappings = getCustomMappings();
    let savedCount = 0;
    
    rows.forEach(row => {
        const brand0 = row.querySelector('.mapping-brand-0').value;
        const code0 = row.querySelector('.mapping-code-0').value.trim().toUpperCase();
        const brand1 = row.querySelector('.mapping-brand-1').value;
        const code1 = row.querySelector('.mapping-code-1').value.trim().toUpperCase();
        
        if (!code0 || !code1) return;
        if (brand0 === brand1) return;
        
        const key0 = `${brand0}_${code0}`;
        const key1 = `${brand1}_${code1}`;
        
        // Добавляем прямую связь
        if (!customMappings[key0]) {
            customMappings[key0] = {};
        }
        customMappings[key0][brand1] = code1;
        
        // Добавляем обратную связь
        if (!customMappings[key1]) {
            customMappings[key1] = {};
        }
        customMappings[key1][brand0] = code0;
        
        savedCount++;
    });
    
    if (savedCount === 0) {
        showToast('Заполните коды цвета в обеих колонках. Бренды должны быть разными.', 'warning');
        return;
    }
    
    saveCustomMappings(customMappings);
    
    // Перестроить индекс
    buildReverseIndex();
    mergeCustomMappingsIntoReverseIndex();
    
    // Очистить форму
    const container = document.getElementById('mapping-rows');
    container.innerHTML = `
        <div class="mapping-row" data-index="0">
            <select class="mapping-brand-0"></select>
            <input type="text" class="mapping-code-0" placeholder="Код цвета" style="width: 120px;">
            <span class="text-primary-accent" style="font-weight: bold;">⟷</span>
            <select class="mapping-brand-1"></select>
            <input type="text" class="mapping-code-1" placeholder="Код цвета" style="width: 120px;">
        </div>
    `;
    populateBrandSelects();
    
    renderExistingMappings();
    renderInventory();
    
    showToast(`Сохранено ${savedCount} соответствие(ий)!`, 'success');
}

function removeMapping(key0, brand1) {
    const customMappings = getCustomMappings();
    const code1 = customMappings[key0] ? customMappings[key0][brand1] : null;
    
    if (customMappings[key0]) {
        delete customMappings[key0][brand1];
        if (Object.keys(customMappings[key0]).length === 0) {
            delete customMappings[key0];
        }
    }
    
    // Удалить обратную связь
    if (code1) {
        const key1 = `${brand1}_${code1}`;
        if (customMappings[key1]) {
            const [brand0] = key0.split('_');
            delete customMappings[key1][brand0];
            if (Object.keys(customMappings[key1]).length === 0) {
                delete customMappings[key1];
            }
        }
    }
    
    saveCustomMappings(customMappings);
    buildReverseIndex();
    mergeCustomMappingsIntoReverseIndex();
    
    renderExistingMappings();
    renderInventory();
}

function renderExistingMappings() {
    const container = document.getElementById('existing-mappings');
    const customMappings = getCustomMappings();
    const keys = Object.keys(customMappings);
    
    if (keys.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    // Собираем уникальные пары (避免 дублирование прямая+обратная)
    const pairs = new Set();
    const items = [];
    
    keys.forEach(key0 => {
        const [brand0, code0] = key0.split('_');
        const targets = customMappings[key0];
        for (const [brand1, code1] of Object.entries(targets)) {
            const pairKey = [`${brand0}_${code0}`, `${brand1}_${code1}`].sort().join('|||');
            if (!pairs.has(pairKey)) {
                pairs.add(pairKey);
                items.push({ brand0, code0, brand1, code1, key0 });
            }
        }
    });
    
    container.innerHTML = `
        <h3 class="mt-16 mb-8 text-16">Сохранённые соответствия:</h3>
        ${items.map(item => `
            <div class="existing-mapping-item">
                ${getBadgeHtml(item.brand0)} <strong>${escapeHtml(item.code0)}</strong>
                <span class="arrow">⟷</span>
                ${getBadgeHtml(item.brand1)} <strong>${escapeHtml(item.code1)}</strong>
                <button class="btn-remove-row ml-auto" onclick="removeMapping('${escapeHtml(item.key0)}', '${escapeHtml(item.brand1)}')">✕</button>
            </div>
        `).join('')}
    `;
}

// ==================== ЭКСПОРТ/ИМПОРТ ДАННЫХ ====================

function exportData() {
    const data = {
        inventory: inventory,
        history: history,
        customBrands: getCustomBrands(),
        customMappings: getCustomMappings(),
        backups: getBackupsList(),
        exportDate: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `marker-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Данные экспортированы!', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка размера файла (макс 10 МБ)
    if (file.size > 10 * 1024 * 1024) {
        showToast('Файл слишком большой (максимум 10 МБ)', 'error');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            // Валидация структуры данных
            if (!data.inventory || typeof data.inventory !== 'object') {
                showToast('Ошибка: файл не содержит корректных данных инвентаря', 'error');
                return;
            }

            if (!confirm(`Импортировать данные?\n\nЭто заменит все текущие данные.\nФайл: ${file.name}\nЭкспортирован: ${data.exportDate || 'неизвестно'}`)) {
                return;
            }

            inventory = data.inventory;
            history = Array.isArray(data.history) ? data.history : [];

            if (Array.isArray(data.customBrands)) {
                saveCustomBrands(data.customBrands);
            }
            if (data.customMappings && typeof data.customMappings === 'object') {
                saveCustomMappings(data.customMappings);
            }
            if (Array.isArray(data.backups)) {
                localStorage.setItem(LS_PREFIX + 'backups', JSON.stringify(data.backups));
            }

            saveData();
            buildReverseIndex();
            mergeCustomMappingsIntoReverseIndex();

            populateBrandSelects();
            renderCustomBrandsList();
            renderExistingMappings();
            renderInventory();
            renderHistory();
            renderRecommendations();
            renderStats();

            showToast('Данные успешно импортированы!', 'success');
        } catch (err) {
            showToast('Ошибка чтения файла: ' + err.message, 'error');
        }
    };
    reader.onerror = function() {
        showToast('Не удалось прочитать файл', 'error');
    };
    reader.readAsText(file);

    // Сброс input для повторного выбора того же файла
    event.target.value = '';
}

// ==================== ТЁМНАЯ ТЕМА ====================

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(LS_PREFIX + 'theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function applySavedTheme() {
    const saved = localStorage.getItem(LS_PREFIX + 'theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', function() {
    applySavedTheme();
    populateBrandSelects();
    renderCustomBrandsList();
    renderExistingMappings();
    renderInventory();
    renderHistory();
    renderRecommendations();
    renderStats();
    updateWishlistBadge();
    
    // Autocomplete (из features.js)
    if (typeof updateAutocompleteLists === 'function') {
        updateAutocompleteLists();
        document.getElementById('add-brand')?.addEventListener('change', updateAutocompleteLists);
        document.getElementById('use-brand')?.addEventListener('change', updateAutocompleteLists);
    }
});

// Переключение вкладок
function switchTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
    
    if (tabName === 'inventory') {
        renderInventory();
    } else if (tabName === 'add') {
        populateBrandSelects();
        renderCustomBrandsList();
        renderExistingMappings();
    } else if (tabName === 'history') {
        renderHistory();
    } else if (tabName === 'stats') {
        renderStats();
    } else if (tabName === 'wishlist') {
        populateBrandSelects();
        renderWishlist();
    }
}

// Сохранение данных
function saveData() {
    localStorage.setItem(LS_PREFIX + 'inventory', JSON.stringify(inventory));
    localStorage.setItem(LS_PREFIX + 'history', JSON.stringify(history));
    updateWishlistBadge();
    // Автобэкап (функция из features.js)
    if (typeof scheduleAutoBackup === 'function') {
        scheduleAutoBackup();
    }
}

// Обновить badge на вкладке "Список покупок"
function updateWishlistBadge() {
    const badge = document.getElementById('wishlist-badge');
    if (!badge) return;
    const emptyCount = Object.values(inventory).filter(item => item.quantity === 0).length;
    if (emptyCount > 0) {
        badge.textContent = emptyCount;
        badge.style.display = 'inline-flex';
    } else {
        badge.style.display = 'none';
    }
}

// Модальное окно
function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal').classList.add('active');
}

// Сброс данных — очистка всего инвентаря
function resetData() {
    if (!confirm('Вы уверены? Все текущие данные будут удалены.\n\nПользовательские бренды и соответствия также будут удалены!')) {
        return;
    }
    localStorage.removeItem(LS_PREFIX + 'inventory');
    localStorage.removeItem(LS_PREFIX + 'history');
    localStorage.removeItem(LS_PREFIX + 'customBrands');
    localStorage.removeItem(LS_PREFIX + 'customMappings');
    localStorage.removeItem(LS_PREFIX + 'wishlist');
    localStorage.removeItem(LS_PREFIX + 'backups');
    inventory = {};
    history = [];
    initializeData();
    migrateTimesEmptied();
    buildReverseIndex();
    mergeCustomMappingsIntoReverseIndex();
    inventory = JSON.parse(localStorage.getItem(LS_PREFIX + 'inventory')) || {};
    history = JSON.parse(localStorage.getItem(LS_PREFIX + 'history')) || [];
    populateBrandSelects();
    renderCustomBrandsList();
    renderExistingMappings();
    renderInventory();
    renderHistory();
    renderRecommendations();
    renderStats();
    showToast('Данные сброшены! Инвентарь пуст.', 'success');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Закрытие модального окна при клике вне его
document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// ==================== PWA: РЕГИСТРАЦИЯ SERVICE WORKER ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((reg) => {
                console.log('Service Worker зарегистрирован:', reg.scope);
            })
            .catch((err) => {
                console.warn('Ошибка регистрации Service Worker:', err);
            });
    });
}
