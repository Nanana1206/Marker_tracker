// ==================== FEATURES.JS ====================
// Новые функции: Wishlist, CSV-экспорт, Автобэкап, Autocomplete, Графики

// ==================== 1. СПИСОК ПОКУПОК (WISHLIST) ====================

// Определить статус маркера для списка покупок
function getWishlistItemStatus(item) {
    const analogues = getAnalogues(item.brand, item.code);
    const analoguesQty = analogues.reduce((sum, a) => sum + (a.quantity || 0), 0);
    const timesEmptied = item.timesEmptied || 0;
    
    // Критический: маркер=0, аналоги=0, заканчивался >= 2 раз
    if (analoguesQty === 0 && timesEmptied >= 2) {
        return 'critical';
    }
    
    // Можно обновить: маркер=0, аналоги>0, заканчивался >= 1 раз
    if (analoguesQty > 0 && timesEmptied >= 1) {
        return 'can_update';
    }
    
    // Рассмотреть покупку: маркер=0, аналоги>0, не заканчивался
    if (analoguesQty > 0 && timesEmptied === 0) {
        return 'consider';
    }
    
    // Критический (запасной): маркер=0, аналоги=0, не заканчивался
    return 'critical';
}

function getWishlistStatusInfo(status) {
    switch (status) {
        case 'critical':
            return { icon: '🔴', text: 'Критический', class: 'wishlist-status-critical' };
        case 'can_update':
            return { icon: '🟡', text: 'Можно обновить', class: 'wishlist-status-can-update' };
        case 'consider':
            return { icon: '🟢', text: 'Рассмотреть покупку', class: 'wishlist-status-consider' };
        default:
            return { icon: '⚪', text: 'Неизвестно', class: '' };
    }
}

function renderWishlist() {
    const container = document.getElementById('wishlist-body');
    const filterStatus = document.getElementById('wishlist-filter-status').value;
    const filterBrand = document.getElementById('wishlist-filter-brand').value;
    
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
    
    // Собрать все маркеры с quantity === 0
    const items = Object.values(inventory).filter(item => item.quantity === 0);
    
    // Обогатить данными
    let enriched = items.map(item => {
        const analogues = getAnalogues(item.brand, item.code);
        const analoguesQty = analogues.reduce((sum, a) => sum + (a.quantity || 0), 0);
        const status = getWishlistItemStatus(item);
        return {
            brand: item.brand,
            code: item.code,
            timesEmptied: item.timesEmptied || 0,
            analogues,
            analoguesQty,
            status
        };
    });
    
    // Фильтрация
    if (filterStatus !== 'all') {
        enriched = enriched.filter(item => item.status === filterStatus);
    }
    if (filterBrand !== 'all') {
        enriched = enriched.filter(item => item.brand === filterBrand);
    }
    
    // Статистика (до фильтрации по бренду)
    const allEmpty = Object.values(inventory).filter(item => item.quantity === 0);
    const allEnriched = allEmpty.map(item => ({
        ...item,
        status: getWishlistItemStatus(item)
    }));
    const criticalCount = allEnriched.filter(i => i.status === 'critical').length;
    const canUpdateCount = allEnriched.filter(i => i.status === 'can_update').length;
    const considerCount = allEnriched.filter(i => i.status === 'consider').length;
    
    // Разбивка по брендам для каждого статуса
    function brandBreakdown(items, status) {
        const filtered = items.filter(i => i.status === status);
        if (filtered.length === 0) return '';
        const byBrand = {};
        filtered.forEach(i => {
            byBrand[i.brand] = (byBrand[i.brand] || 0) + 1;
        });
        return Object.entries(byBrand)
            .sort((a, b) => b[1] - a[1])
            .map(([brand, count]) => `<span class="wishlist-stat-brand">${getBadgeHtml(brand)} ${count}</span>`)
            .join(' ');
    }
    
    document.getElementById('wishlist-stats').innerHTML = `
        <div class="stats-grid" style="margin-bottom: 0;">
            <div class="stat-card" style="background: var(--gradient-danger); padding: 12px;">
                <h3 class="text-24">${criticalCount}</h3>
                <p>Критический</p>
                <div class="wishlist-stat-breakdown">${brandBreakdown(allEnriched, 'critical')}</div>
            </div>
            <div class="stat-card" style="background: var(--gradient-warning); padding: 12px;">
                <h3 class="text-24">${canUpdateCount}</h3>
                <p>Можно обновить</p>
                <div class="wishlist-stat-breakdown">${brandBreakdown(allEnriched, 'can_update')}</div>
            </div>
            <div class="stat-card" style="background: var(--gradient-success); padding: 12px;">
                <h3 class="text-24">${considerCount}</h3>
                <p>Рассмотреть</p>
                <div class="wishlist-stat-breakdown">${brandBreakdown(allEnriched, 'consider')}</div>
            </div>
        </div>
    `;
    
    if (enriched.length === 0) {
        container.innerHTML = '<div class="empty-state text-center" style="padding: 24px;">Список покупок пуст — все маркеры в наличии!</div>';
        return;
    }
    
    // Группировка по брендам
    const grouped = {};
    enriched.forEach(item => {
        if (!grouped[item.brand]) {
            grouped[item.brand] = [];
        }
        grouped[item.brand].push(item);
    });
    
    // Сортировка внутри группы: critical > can_update > consider
    const statusOrder = { critical: 0, can_update: 1, consider: 2 };
    Object.values(grouped).forEach(group => {
        group.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    });
    
    // Рендер
    let html = '';
    const sortedBrands = Object.keys(grouped).sort();
    
    sortedBrands.forEach(brand => {
        const brandItems = grouped[brand];
        html += `
            <div class="wishlist-brand-group">
                <div class="wishlist-brand-header">
                    ${getBadgeHtml(brand)}
                    <span class="wishlist-brand-count">${brandItems.length} шт.</span>
                </div>
                <table class="wishlist-table">
                    <thead>
                        <tr>
                            <th>Статус</th>
                            <th>Код цвета</th>
                            <th>Аналоги</th>
                            <th>Заканчивался</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${brandItems.map(item => {
                            const statusInfo = getWishlistStatusInfo(item.status);
                            const analoguesHtml = item.analogues.length > 0
                                ? item.analogues.map(a => `${getBadgeHtml(a.brand)} ${escapeHtml(a.code)} (${a.quantity} шт.)`).join(', ')
                                : '<span class="text-disabled">Нет аналогов</span>';
                            
                            return `
                                <tr>
                                    <td><span class="${statusInfo.class}">${statusInfo.icon} ${statusInfo.text}</span></td>
                                    <td><strong>${escapeHtml(item.code)}</strong></td>
                                    <td>${analoguesHtml}</td>
                                    <td>${item.timesEmptied > 0 ? item.timesEmptied + ' раз' : '<span class="text-disabled">—</span>'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ==================== 2. ЭКСПОРТ В CSV ====================

// Унифицированный экспорт CSV с BOM
function downloadCSV(csvContent, filename) {
    const BOM = '\uFEFF';
    downloadFile(BOM + csvContent, filename, 'text/csv;charset=utf-8');
}

function exportDataCSV() {
    const items = Object.values(inventory);
    
    if (items.length === 0) {
        showToast('Нет данных для экспорта', 'warning');
        return;
    }
    
    let csv = 'Бренд;Код цвета;Своих шт.;Аналоги шт.;Всего (цвет);Статус;Заканчивался раз\n';
    
    items.sort((a, b) => {
        if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
        return a.code.localeCompare(b.code);
    });
    
    items.forEach(item => {
        const status = getStatus(item.quantity, item.brand, item.code);
        const statusText = getStatusText(status);
        const analogues = getAnalogues(item.brand, item.code);
        const analoguesQty = analogues.reduce((sum, a) => sum + (a.quantity || 0), 0);
        const colorTotal = getColorTotal(item.brand, item.code);
        const timesEmptied = item.timesEmptied || 0;
        
        csv += `"${item.brand}";"${item.code}";${item.quantity};${analoguesQty};${colorTotal};"${statusText}";${timesEmptied}\n`;
    });
    
    downloadCSV(csv, `marker-inventory-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Инвентарь экспортирован в CSV!', 'success');
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
    const items = Object.values(inventory).filter(item => item.quantity === 0);
    
    if (items.length === 0) {
        showToast('Список покупок пуст', 'warning');
        return;
    }
    
    let csv = 'Статус;Бренд;Код цвета;Аналоги;Заканчивался раз\n';
    
    const enriched = items.map(item => {
        const analogues = getAnalogues(item.brand, item.code);
        const status = getWishlistItemStatus(item);
        const statusInfo = getWishlistStatusInfo(status);
        const analoguesText = analogues.length > 0
            ? analogues.map(a => `${a.brand} ${a.code} (${a.quantity} шт.)`).join(', ')
            : 'Нет аналогов';
        return {
            brand: item.brand,
            code: item.code,
            statusText: statusInfo.text,
            analoguesText,
            timesEmptied: item.timesEmptied || 0
        };
    }).sort((a, b) => a.brand.localeCompare(b.brand) || a.code.localeCompare(b.code));
    
    enriched.forEach(item => {
        csv += `"${item.statusText}";"${item.brand}";"${item.code}";"${item.analoguesText}";${item.timesEmptied}\n`;
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
    const backups = JSON.parse(localStorage.getItem(LS_PREFIX + 'backups')) || [];
    
    const backup = {
        timestamp: new Date().toISOString(),
        data: {
            inventory: JSON.parse(localStorage.getItem(LS_PREFIX + 'inventory')) || {},
            history: JSON.parse(localStorage.getItem(LS_PREFIX + 'history')) || [],
            customBrands: JSON.parse(localStorage.getItem(LS_PREFIX + 'customBrands')) || [],
            customMappings: JSON.parse(localStorage.getItem(LS_PREFIX + 'customMappings')) || {}
        }
    };
    
    backups.push(backup);
    
    // Оставляем только последние MAX_BACKUPS
    while (backups.length > MAX_BACKUPS) {
        backups.shift();
    }
    
    localStorage.setItem(LS_PREFIX + 'backups', JSON.stringify(backups));
    console.log(`Автобэкап создан: ${backup.timestamp}`);
}

function restoreBackup(index) {
    const backups = JSON.parse(localStorage.getItem(LS_PREFIX + 'backups')) || [];
    
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
    
    localStorage.setItem(LS_PREFIX + 'inventory', JSON.stringify(backup.data.inventory));
    localStorage.setItem(LS_PREFIX + 'history', JSON.stringify(backup.data.history));
    localStorage.setItem(LS_PREFIX + 'customBrands', JSON.stringify(backup.data.customBrands));
    localStorage.setItem(LS_PREFIX + 'customMappings', JSON.stringify(backup.data.customMappings));
    // Перезагрузка данных
    inventory = backup.data.inventory;
    history = backup.data.history;
    
    buildReverseIndex();
    mergeCustomMappingsIntoReverseIndex();
    
    populateBrandSelects();
    renderCustomBrandsList();
    renderExistingMappings();
    renderInventory();
    renderHistory();
    renderRecommendations();
    renderStats();
    renderWishlist();
    
    showToast('Данные восстановлены!', 'success');
}

function getBackupsList() {
    return JSON.parse(localStorage.getItem(LS_PREFIX + 'backups')) || [];
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
