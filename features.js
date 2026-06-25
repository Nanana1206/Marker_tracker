// ==================== FEATURES.JS ====================
// Новые функции: Wishlist, CSV-экспорт, Автобэкап, Autocomplete, Графики

// ==================== 1. СПИСОК ПОКУПОК (WISHLIST) — ПО ЦВЕТАМ ====================

// Получить метку приоритета по сумме timesEmptied
// 0 → не показывать; 1 → ⚪ Минимальный; 2 → 🟡 Средний; 3+ → 🔴 Срочно
function getPriorityLabel(sumTimesEmptied) {
    if (sumTimesEmptied >= 3) return { score: sumTimesEmptied, icon: '🔴', text: 'Срочно',       class: 'priority-urgent' };
    if (sumTimesEmptied >= 2) return { score: sumTimesEmptied, icon: '🟡', text: 'Средний',      class: 'priority-medium' };
    if (sumTimesEmptied >= 1) return { score: sumTimesEmptied, icon: '⚪', text: 'Минимальный',  class: 'priority-minimal' };
    return null; // не показывать
}

// Построить цветные группы из инвентаря
// Возвращает { needToBuy: [...], hasAlternative: [...] }
function buildColorGroups() {
    const emptyItems = Object.values(inventory).filter(i => i.quantity === 0);
    const processedKeys = new Set(); // чтобы не дублировать цвета
    const needToBuy = [];
    const hasAlternative = [];
    
    for (const item of emptyItems) {
        const key = `${item.brand}_${item.code}`;
        const entry = REVERSE_INDEX[key];
        
        if (!entry) {
            // Маркер без маппинга — отдельный "цвет"
            const soloKey = `solo_${key}`;
            if (processedKeys.has(soloKey)) continue;
            processedKeys.add(soloKey);
            
            const sumTimesEmptied = item.timesEmptied || 0;
            const priority = getPriorityLabel(sumTimesEmptied);
            
            // Без маппинга — нет альтернатив, показываем если sumTimesEmptied >= 1
            if (priority) {
                needToBuy.push({
                    universalCode: soloKey,
                    displayName: `${item.brand} ${item.code}`,
                    brands: [{
                        brand: item.brand,
                        code: item.code,
                        quantity: 0,
                        timesEmptied: item.timesEmptied || 0
                    }],
                    totalQty: 0,
                    sumTimesEmptied,
                    priority,
                    hasMapping: false,
                    section: 'needToBuy'
                });
            }
            continue;
        }
        
        const uCode = entry.universalCode;
        if (processedKeys.has(uCode)) continue;
        processedKeys.add(uCode);
        
        // Собираем ВСЕ бренды для этого цвета (включая те, где quantity > 0)
        const allBrandsForColor = getAllBrandsForEntry(entry);
        const brands = allBrandsForColor.map(b => ({
            brand: b.name,
            code: b.code,
            quantity: inventory[`${b.name}_${b.code}`]?.quantity || 0,
            timesEmptied: inventory[`${b.name}_${b.code}`]?.timesEmptied || 0
        }));
        
        const totalQty = brands.reduce((s, b) => s + b.quantity, 0);
        const sumTimesEmptied = brands.reduce((s, b) => s + b.timesEmptied, 0);
        const hasBrandWithStock = brands.some(b => b.quantity > 0);
        
        const group = {
            universalCode: uCode,
            displayName: `#${uCode}`,
            brands,
            totalQty,
            sumTimesEmptied,
            hasMapping: true
        };
        
        if (hasBrandWithStock) {
            // Есть альтернатива — хотя бы один бренд в наличии
            group.section = 'hasAlternative';
            hasAlternative.push(group);
        } else {
            // Все бренды = 0 — нужно купить
            const priority = getPriorityLabel(sumTimesEmptied);
            if (priority) {
                group.priority = priority;
                group.section = 'needToBuy';
                needToBuy.push(group);
            }
            // sumTimesEmptied === 0 → не показываем вообще
        }
    }
    
    // Сортируем по приоритету (убывание) внутри каждой секции
    needToBuy.sort((a, b) => b.priority.score - a.priority.score);
    hasAlternative.sort((a, b) => b.sumTimesEmptied - a.sumTimesEmptied);
    
    return { needToBuy, hasAlternative };
}

// Получить все цветные группы (для статистики, до фильтрации)
function getAllColorGroups() {
    const { needToBuy, hasAlternative } = buildColorGroups();
    return [...needToBuy, ...hasAlternative];
}

// Debounced-версия renderWishlist для поиска
const debouncedRenderWishlist = debounce(() => renderWishlist(), 300);

// Переключить свёрнутость группы
function toggleWishlistGroup(groupIndex) {
    const rows = document.querySelectorAll(`.wishlist-child-${groupIndex}`);
    const header = document.querySelector(`.wishlist-group-header-${groupIndex}`);
    const arrow = header?.querySelector('.wishlist-toggle-arrow');
    const isCollapsed = header?.getAttribute('data-collapsed') === 'true';
    
    rows.forEach(row => {
        row.style.display = isCollapsed ? '' : 'none';
    });
    
    if (header) {
        header.setAttribute('data-collapsed', isCollapsed ? 'false' : 'true');
    }
    if (arrow) {
        arrow.textContent = isCollapsed ? '▼' : '▶';
    }
}

// Рендер одной секции (таблица со сворачиваемыми группами)
function renderWishlistSection(groups, sectionId, sectionTitle, sectionIcon, giOffset) {
    if (groups.length === 0) return '';
    
    let html = `
        <div class="wishlist-section wishlist-section-${sectionId}">
            <h3 class="wishlist-section-title">${sectionIcon} ${sectionTitle} (${groups.length} цвет${_pluralEnd(groups.length)})</h3>
            <div class="table-wrapper">
                <table class="wishlist-table-main">
                    <thead>
                        <tr>
                            <th style="width: 40px;"></th>
                            <th>Приоритет</th>
                            <th>Бренд</th>
                            <th>Код</th>
                            <th>Своих</th>
                            <th>Использован (сумма)</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    groups.forEach((group, i) => {
        const gi = giOffset + i;
        const priorityInfo = group.priority;
        const totalText = group.totalQty > 0 ? `✅ ${group.totalQty} шт.` : '❌ Нет';
        
        // Строка-заголовок группы (кликабельная)
        const priorityBadge = priorityInfo
            ? `<span class="priority-badge ${priorityInfo.class}">${priorityInfo.icon} ${priorityInfo.text}</span>`
            : `<span class="priority-badge priority-alternative">ℹ️ Есть альтернатива</span>`;
        
        html += `
            <tr class="wishlist-group-header wishlist-group-header-${gi}"
                data-collapsed="false"
                onclick="toggleWishlistGroup(${gi})">
                <td class="wishlist-toggle-cell"><span class="wishlist-toggle-arrow">▼</span></td>
                <td>${priorityBadge}</td>
                <td colspan="2" class="text-muted">${group.brands.length} бренд(ов)</td>
                <td>${totalText}</td>
                <td class="text-muted">${group.sumTimesEmptied > 0 ? group.sumTimesEmptied + ' раз' : '—'}</td>
            </tr>
        `;
        
        // Строки-дети (бренды внутри группы)
        group.brands.forEach(b => {
            const isEmpty = b.quantity === 0;
            const rowClass = isEmpty ? 'wishlist-row-empty' : 'wishlist-row-available';
            const statusIcon = isEmpty ? '❌' : '✅';
            const statusText = isEmpty ? 'Нет' : `${b.quantity} шт.`;
            const freqBar = b.timesEmptied > 0
                ? `<span class="freq-indicator">${'█'.repeat(Math.min(b.timesEmptied, 5))}</span> ${b.timesEmptied} раз`
                : '<span class="text-disabled">—</span>';
            
            html += `
                <tr class="${rowClass} wishlist-child-${gi}">
                    <td></td>
                    <td></td>
                    <td>${getBadgeHtml(b.brand)}</td>
                    <td><strong>${escapeHtml(b.code)}</strong></td>
                    <td>${statusIcon} ${statusText}</td>
                    <td>${freqBar}</td>
                </tr>
            `;
        });
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return html;
}

// Склонение слова "цвет"
function _pluralEnd(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return 'ов';
    if (mod10 === 1) return '';
    if (mod10 >= 2 && mod10 <= 4) return 'а';
    return 'ов';
}

function renderWishlist() {
    const container = document.getElementById('wishlist-body');
    const filterPriority = document.getElementById('wishlist-filter-status').value;
    const filterBrand = document.getElementById('wishlist-filter-brand').value;
    const searchQuery = (document.getElementById('wishlist-search')?.value || '').trim().toUpperCase();
    
    // Обновить фильтр брендов
    const brandFilter = document.getElementById('wishlist-filter-brand');
    const currentBrandVal = brandFilter.value;
    const allBrands = getAllBrands();
    brandFilter.innerHTML = '<option value="all">Все бренды</option>';
    allBrands.forEach(brand => {
        const opt = document.createElement('option');
        opt.value = brand;
        opt.textContent = brand;
        brandFilter.appendChild(opt);
    });
    brandFilter.value = currentBrandVal || 'all';
    
    // Построить все цветные группы
    const { needToBuy, hasAlternative } = buildColorGroups();
    
    // Статистика (до фильтрации)
    const urgentCount = needToBuy.filter(g => g.priority.score >= 3).length;
    const mediumCount = needToBuy.filter(g => g.priority.score === 2).length;
    const minimalCount = needToBuy.filter(g => g.priority.score === 1).length;
    const altCount = hasAlternative.length;
    
    document.getElementById('wishlist-stats').innerHTML = `
        <div class="stats-grid" style="margin-bottom: 0;">
            <div class="stat-card" style="background: var(--gradient-danger); padding: 12px;">
                <h3 class="text-24">${urgentCount}</h3>
                <p>🔴 Срочно</p>
            </div>
            <div class="stat-card" style="background: var(--gradient-warning, linear-gradient(135deg, #fdcb6e, #e17055)); padding: 12px;">
                <h3 class="text-24">${mediumCount}</h3>
                <p>🟡 Средний</p>
            </div>
            <div class="stat-card" style="background: var(--gradient-info, linear-gradient(135deg, #dfe6e9, #b2bec3)); padding: 12px;">
                <h3 class="text-24">${minimalCount}</h3>
                <p>⚪ Минимальный</p>
            </div>
            <div class="stat-card" style="background: var(--gradient-success); padding: 12px;">
                <h3 class="text-24">${altCount}</h3>
                <p>ℹ️ Альтернатива</p>
            </div>
        </div>
    `;
    
    // Фильтрация
    let filteredNeed = needToBuy;
    let filteredAlt = hasAlternative;
    
    // Фильтр по приоритету — только для секции "Нужно купить"
    if (filterPriority !== 'all') {
        filteredNeed = filteredNeed.filter(g => g.priority.class === filterPriority);
    }
    
    // Фильтр по бренду — для обеих секций
    if (filterBrand !== 'all') {
        filteredNeed = filteredNeed.filter(g => g.brands.some(b => b.brand === filterBrand));
        filteredAlt = filteredAlt.filter(g => g.brands.some(b => b.brand === filterBrand));
    }
    
    // Поиск — для обеих секций
    if (searchQuery) {
        const matchesSearch = g =>
            g.displayName.toUpperCase().includes(searchQuery) ||
            g.brands.some(b => b.code.toUpperCase().includes(searchQuery));
        filteredNeed = filteredNeed.filter(matchesSearch);
        filteredAlt = filteredAlt.filter(matchesSearch);
    }
    
    // Рендер
    let html = '';
    
    html += renderWishlistSection(filteredNeed, 'need', 'Нужно купить', '🛒', 0);
    html += renderWishlistSection(filteredAlt, 'alt', 'Есть альтернатива у другого бренда', 'ℹ️', filteredNeed.length);
    
    if (!html) {
        container.innerHTML = '<div class="empty-state" style="padding: 24px;">Список покупок пуст — все маркеры в наличии!</div>';
        return;
    }
    
    container.innerHTML = html;
}

// ==================== 2. ЭКСПОРТ В CSV ====================

// Унифицированный экспорт CSV с BOM
function downloadCSV(csvContent, filename) {
    const BOM = '\uFEFF';
    downloadFile(BOM + csvContent, filename, 'text/csv;charset=utf-8');
}

function exportHistoryCSV() {
    if (history.length === 0) {
        showToast('Нет данных для экспорта', 'warning');
        return;
    }
    
    let csv = 'Дата;Операция;Бренд;Код цвета;Количество\n';
    
    [...history].reverse().forEach(item => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU');
        
        let actionText = '';
        if (item.action === 'purchase') actionText = 'Покупка';
        else if (item.action === 'usage') actionText = 'Расход';
        else if (item.action === 'bulk_purchase') actionText = 'Покупка набора';
        else if (item.action === 'initial_load') actionText = 'Начальная загрузка';
        else actionText = item.action;
        
        csv += `"${dateStr}";"${actionText}";"${item.brand || ''}";"${item.code || ''}";${item.quantity || ''}\n`;
    });
    
    downloadCSV(csv, `marker-history-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('История экспортирована в CSV!', 'success');
}

function exportWishlistCSV() {
    const { needToBuy, hasAlternative } = buildColorGroups();
    
    if (needToBuy.length === 0 && hasAlternative.length === 0) {
        showToast('Список покупок пуст', 'warning');
        return;
    }
    
    let csv = 'Секция;Приоритет;Заканчивался раз (сумма);Цвет;Бренд;Код;Своих;Итого по цвету\n';
    
    needToBuy.forEach(group => {
        const priorityText = group.priority.text;
        group.brands.forEach(b => {
            csv += `"Нужно купить";"${priorityText}";${group.sumTimesEmptied};"${group.displayName}";"${b.brand}";"${b.code}";${b.quantity};${group.totalQty}\n`;
        });
    });
    
    hasAlternative.forEach(group => {
        group.brands.forEach(b => {
            csv += `"Есть альтернатива";"—";${group.sumTimesEmptied};"${group.displayName}";"${b.brand}";"${b.code}";${b.quantity};${group.totalQty}\n`;
        });
    });
    
    downloadCSV(csv, `marker-wishlist-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Список покупок экспортирован в CSV!', 'success');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== 3. АВТОБЭКАП С ВЕРСИОНИРОВАНИЕМ ====================

const MAX_BACKUPS = 5;

function createAutoBackup() {
    const backups = JSON.parse(localStorage.getItem('markerBackups')) || [];
    
    const backup = {
        timestamp: new Date().toISOString(),
        data: {
            inventory: JSON.parse(localStorage.getItem('markerInventory')) || {},
            history: JSON.parse(localStorage.getItem('markerHistory')) || [],
            customBrands: JSON.parse(localStorage.getItem('customBrands')) || [],
            customMappings: JSON.parse(localStorage.getItem('customMappings')) || {}
        }
    };
    
    backups.push(backup);
    
    // Оставляем только последние MAX_BACKUPS
    while (backups.length > MAX_BACKUPS) {
        backups.shift();
    }
    
    localStorage.setItem('markerBackups', JSON.stringify(backups));
    console.log(`Автобэкап создан: ${backup.timestamp}`);
}

function restoreBackup(index) {
    const backups = JSON.parse(localStorage.getItem('markerBackups')) || [];
    
    if (index < 0 || index >= backups.length) {
        showToast('Бэкап не найден', 'error');
        return;
    }
    
    const backup = backups[index];
    const date = new Date(backup.timestamp);
    const dateStr = date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU');
    
    if (!confirm(`Восстановить данные от ${dateStr}?\n\nТекущие данные будут заменены.`)) {
        return;
    }
    
    localStorage.setItem('markerInventory', JSON.stringify(backup.data.inventory));
    localStorage.setItem('markerHistory', JSON.stringify(backup.data.history));
    localStorage.setItem('customBrands', JSON.stringify(backup.data.customBrands));
    localStorage.setItem('customMappings', JSON.stringify(backup.data.customMappings));
    // Перезагрузка данных
    inventory = backup.data.inventory;
    history = backup.data.history;
    
    buildReverseIndex();
    mergeCustomMappingsIntoReverseIndex();
    
    populateBrandSelects();
    renderCustomBrandsList();
    renderExistingMappings();
    renderInventory();
    renderRecommendations();
    renderWishlist();
    
    showToast('Данные восстановлены!', 'success');
}

function getBackupsList() {
    return JSON.parse(localStorage.getItem('markerBackups')) || [];
}

// Автобэкап при изменениях (с троттлингом)
let backupTimeout = null;
function scheduleAutoBackup() {
    if (backupTimeout) clearTimeout(backupTimeout);
    backupTimeout = setTimeout(() => {
        createAutoBackup();
    }, 5000); // Бэкап через 5 секунд после последнего изменения
}

// saveData уже вызывает scheduleAutoBackup() напрямую (добавлено в app.js)

// ==================== 4. AUTOCOMPLETE ДЛЯ ПОЛЕЙ ВВОДА ====================

function updateAutocompleteLists() {
    const allBrands = getAllBrands();
    
    // Для поля "Добавить"
    const addBrand = document.getElementById('add-brand');
    const addCodeList = document.getElementById('add-code-list');
    if (addBrand && addCodeList) {
        const selectedBrand = addBrand.value;
        const colors = getBrandColors(selectedBrand);
        addCodeList.innerHTML = colors.map(c => `<option value="${c.brandCode}">`).join('');
    }
    
    // Для поля "Расход"
    const useBrand = document.getElementById('use-brand');
    const useCodeList = document.getElementById('use-code-list');
    if (useBrand && useCodeList) {
        const selectedBrand = useBrand.value;
        const colors = getBrandColors(selectedBrand);
        useCodeList.innerHTML = colors.map(c => `<option value="${c.brandCode}">`).join('');
    }
}

// Привязка событий для обновления datalist при смене бренда
// Autocomplete инициализируется в app.js (единая точка входа DOMContentLoaded)

// ==================== 5. УЛУЧШЕННАЯ СТАТИСТИКА С ГРАФИКАМИ ====================

let brandChartInstance = null;
let usageChartInstance = null;

function renderStats() {
    const content = document.getElementById('stats-content');
    const items = Object.values(inventory);
    
    // Статистика по брендам
    const brandStats = {};
    items.forEach(item => {
        if (!brandStats[item.brand]) {
            brandStats[item.brand] = { total: 0, available: 0, available_replacement: 0, has_replacement: 0, empty: 0 };
        }
        brandStats[item.brand].total += item.quantity;
        const status = getStatus(item.quantity, item.brand, item.code);
        brandStats[item.brand][status]++;
    });
    
    // Топ используемых цветов
    const usageHistory = history.filter(h => h.action === 'usage');
    const usageCount = {};
    usageHistory.forEach(h => {
        const key = `${h.brand}_${h.code}`;
        usageCount[key] = (usageCount[key] || 0) + h.quantity;
    });
    
    const topUsed = Object.entries(usageCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    // Статистика по месяцам
    const monthlyUsage = {};
    usageHistory.forEach(h => {
        const date = new Date(h.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyUsage[monthKey] = (monthlyUsage[monthKey] || 0) + h.quantity;
    });
    
    const sortedMonths = Object.keys(monthlyUsage).sort().slice(-6); // Последние 6 месяцев
    
    let html = `
        <div class="section">
            <h2>Статистика по брендам</h2>
            <div class="gap-24 flex-wrap" style="display: flex; margin-bottom: 24px;">
                <div class="flex-1 min-w-300">
                    <canvas id="brand-chart" style="max-height: 300px;"></canvas>
                </div>
                <div class="flex-1 min-w-300">
                    <table>
                        <thead>
                            <tr>
                                <th>Бренд</th>
                                <th>Всего</th>
                                <th>В наличии</th>
                                <th>В наличии + замена</th>
                                <th>Есть замена</th>
                                <th>Закончились</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    for (const [brand, stats] of Object.entries(brandStats)) {
        html += `
            <tr>
                <td>${getBadgeHtml(brand)}</td>
                <td>${stats.total} шт.</td>
                <td class="status-available">${stats.available}</td>
                <td class="status-available_replacement">${stats.available_replacement}</td>
                <td class="status-has_replacement">${stats.has_replacement}</td>
                <td class="status-empty">${stats.empty}</td>
            </tr>
        `;
    }
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Статистика использования цветов
    const allUsed = Object.entries(usageCount)
        .sort((a, b) => b[1] - a[1]);
    
    // Собираем бренды из истории использования
    const usageBrands = [...new Set(usageHistory.map(h => h.brand))].sort();
    
    if (allUsed.length > 0) {
        html += `
            <div class="section">
                <h2>Статистика использования цветов</h2>
                <div class="filter-row" style="margin-bottom: 12px;">
                    <select id="stats-usage-filter-brand" onchange="filterStatsUsage()">
                        <option value="all">Все бренды</option>
                        ${usageBrands.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('')}
                    </select>
                    <span class="text-muted" style="line-height: 36px;">Всего: <strong id="stats-usage-total">${allUsed.length}</strong> цвет(ов)</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Цвет</th>
                            <th>Использовано</th>
                        </tr>
                    </thead>
                    <tbody id="stats-usage-body">
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // График использования по месяцам
    if (sortedMonths.length > 0) {
        html += `
            <div class="section">
                <h2>Расход маркеров по месяцам</h2>
                <div style="max-width: 700px;">
                    <canvas id="usage-chart" style="max-height: 300px;"></canvas>
                </div>
            </div>
        `;
    }
    
    // Бэкапы
    const backups = getBackupsList();
    if (backups.length > 0) {
        html += `
            <div class="section">
                <h2>💾 Резервные копии</h2>
                <p class="text-muted mb-12">Автоматически сохраняются при изменениях (последние ${MAX_BACKUPS})</p>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Дата</th>
                            <th>Маркеров</th>
                            <th>Операций</th>
                            <th>Действие</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        backups.forEach((backup, index) => {
            const date = new Date(backup.timestamp);
            const dateStr = date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU');
            const markerCount = Object.keys(backup.data.inventory).length;
            const historyCount = backup.data.history.length;
            
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${dateStr}</td>
                    <td>${markerCount}</td>
                    <td>${historyCount}</td>
                    <td><button onclick="restoreBackup(${index})" style="padding: 6px 12px; font-size: 12px;">Восстановить</button></td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    content.innerHTML = html;
    
    // Сохраняем данные для фильтрации
    window._statsUsageData = allUsed;
    
    // Рендер графиков и таблицы после вставки DOM
    setTimeout(() => {
        renderBrandChart(brandStats);
        if (sortedMonths.length > 0) {
            renderUsageChart(monthlyUsage, sortedMonths);
        }
        if (allUsed.length > 0) {
            filterStatsUsage();
        }
    }, 50);
}

function filterStatsUsage() {
    const allUsed = window._statsUsageData || [];
    const filterBrand = document.getElementById('stats-usage-filter-brand')?.value || 'all';
    const tbody = document.getElementById('stats-usage-body');
    const totalEl = document.getElementById('stats-usage-total');
    if (!tbody) return;
    
    const filtered = filterBrand === 'all'
        ? allUsed
        : allUsed.filter(([key]) => key.split('_')[0] === filterBrand);
    
    if (totalEl) totalEl.textContent = filtered.length;
    
    tbody.innerHTML = filtered.map(([key, count], index) => {
        const [brand, code] = key.split('_');
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${getBadgeHtml(brand)} ${escapeHtml(code)}</td>
                <td>${count} раз</td>
            </tr>
        `;
    }).join('');
}

function renderBrandChart(brandStats) {
    const canvas = document.getElementById('brand-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    if (brandChartInstance) {
        brandChartInstance.destroy();
    }
    
    const brands = Object.keys(brandStats);
    const availableData = brands.map(b => brandStats[b].available);
    const replacementData = brands.map(b => brandStats[b].available_replacement);
    const hasReplacementData = brands.map(b => brandStats[b].has_replacement);
    const emptyData = brands.map(b => brandStats[b].empty);
    
    brandChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: brands,
            datasets: [{
                label: 'Всего маркеров',
                data: brands.map(b => brandStats[b].total),
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(162, 155, 254, 0.8)',
                    'rgba(85, 239, 196, 0.8)',
                    'rgba(253, 203, 110, 0.8)',
                    'rgba(255, 107, 107, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(162, 155, 254, 1)',
                    'rgba(85, 239, 196, 1)',
                    'rgba(253, 203, 110, 1)',
                    'rgba(255, 107, 107, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 16,
                        usePointStyle: true
                    }
                },
                title: {
                    display: true,
                    text: 'Распределение маркеров по брендам',
                    font: { size: 14 }
                }
            }
        }
    });
}

function renderUsageChart(monthlyUsage, sortedMonths) {
    const canvas = document.getElementById('usage-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    if (usageChartInstance) {
        usageChartInstance.destroy();
    }
    
    const labels = sortedMonths.map(m => {
        const [year, month] = m.split('-');
        const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    });
    
    const data = sortedMonths.map(m => monthlyUsage[m]);
    
    usageChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Использовано маркеров',
                data: data,
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Расход маркеров по месяцам',
                    font: { size: 14 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
// Autocomplete инициализируется в app.js (единая точка входа DOMContentLoaded)
