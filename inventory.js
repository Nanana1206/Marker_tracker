// ==================== INLINE-РЕДАКТИРОВАНИЕ КОЛИЧЕСТВА ====================

function startInlineEdit(brand, code, tdElement) {
    const key = `${brand}_${code}`;
    const currentQty = inventory[key] ? inventory[key].quantity : 0;

    tdElement.innerHTML = `
        <input type="number" class="inline-edit-input" value="${currentQty}" min="0"
            onkeydown="handleInlineEditKey(event, '${escapeHtml(brand)}', '${escapeHtml(code)}')"
            onblur="saveInlineEdit('${escapeHtml(brand)}', '${escapeHtml(code)}', this)">
    `;

    const input = tdElement.querySelector('.inline-edit-input');
    input.focus();
    input.select();
}

function handleInlineEditKey(event, brand, code) {
    if (event.key === 'Enter') {
        event.target.blur();
    } else if (event.key === 'Escape') {
        event.target.dataset.cancelled = 'true';
        event.target.blur();
    }
}

function saveInlineEdit(brand, code, inputElement) {
    if (inputElement.dataset.cancelled === 'true') {
        renderInventory();
        return;
    }

    const newQty = parseInt(inputElement.value);
    if (isNaN(newQty) || newQty < 0) {
        showToast('Введите неотрицательное число', 'warning');
        renderInventory();
        return;
    }

    const key = `${brand}_${code}`;
    if (!inventory[key]) {
        inventory[key] = { brand, code, quantity: 0, timesEmptied: 0 };
    }

    const oldQty = inventory[key].quantity;
    const diff = newQty - oldQty;

    inventory[key].quantity = newQty;

    if (diff !== 0) {
        history.push({
            date: new Date().toISOString(),
            action: diff > 0 ? 'purchase' : 'usage',
            brand,
            code,
            quantity: Math.abs(diff)
        });
    }

    // Каждое уменьшение = 1 использование
    if (diff < 0) {
        inventory[key].timesEmptied = (inventory[key].timesEmptied || 0) + Math.abs(diff);
    }

    saveData();
    renderInventory();
    renderRecommendations();
}

// ==================== УПРАВЛЕНИЕ ИНВЕНТАРЁМ ====================

// Добавление маркеров
function addMarkers() {
    const brand = document.getElementById('add-brand').value;
    const code = document.getElementById('add-code').value.trim().toUpperCase();
    const quantity = parseInt(document.getElementById('add-quantity').value) || 1;
    
    if (!code) {
        showToast('Введите код цвета', 'warning');
        return;
    }
    
    const key = `${brand}_${code}`;
    if (!inventory[key]) {
        inventory[key] = { brand, code, quantity: 0, timesEmptied: 0 };
    }
    inventory[key].quantity += quantity;
    
    history.push({
        date: new Date().toISOString(),
        action: 'purchase',
        brand,
        code,
        quantity
    });
    
    saveData();
    renderInventory();
    
    document.getElementById('add-code').value = '';
    document.getElementById('add-quantity').value = '1';
    
    showToast(`Добавлено ${quantity} шт. ${brand} ${code}`, 'success');
}

// Списание маркеров
function useMarkers() {
    const brand = document.getElementById('use-brand').value;
    const code = document.getElementById('use-code').value.trim().toUpperCase();
    const quantity = parseInt(document.getElementById('use-quantity').value) || 1;
    
    if (!code) {
        showToast('Введите код цвета', 'warning');
        return;
    }
    
    const key = `${brand}_${code}`;
    if (!inventory[key] || inventory[key].quantity < quantity) {
        showToast('Недостаточно маркеров', 'error');
        return;
    }
    
    inventory[key].quantity -= quantity;
    
    history.push({
        date: new Date().toISOString(),
        action: 'usage',
        brand,
        code,
        quantity
    });
    
    saveData();
    renderInventory();
    renderRecommendations();
    
    document.getElementById('use-code').value = '';
    document.getElementById('use-quantity').value = '1';
    
    // Каждое списание = использование
    inventory[key].timesEmptied = (inventory[key].timesEmptied || 0) + quantity;
    saveData();
    if (inventory[key].quantity === 0) {
        showToast(`Внимание! ${brand} ${code} закончился! (использован ${inventory[key].timesEmptied} раз)`, 'warning');
    }
}

// Добавление набора (используем MARKER_SETS из data.js)
function addBulkSet() {
    const brand = document.getElementById('bulk-brand').value;
    const setIndex = parseInt(document.getElementById('bulk-set').value);
    const quantity = 1;
    
    const sets = MARKER_SETS[brand] || [];
    if (isNaN(setIndex) || !sets[setIndex]) {
        showToast('Выберите набор из списка.', 'warning');
        return;
    }
    
    const selectedSet = sets[setIndex];
    const codes = getSetCodes(selectedSet);
    
    if (codes.length === 0) {
        showToast(`Состав набора "${selectedSet.name}" пока неизвестен. Добавляйте маркеры по одному.`, 'warning');
        return;
    }
    
    codes.forEach(code => {
        const key = `${brand}_${code}`;
        if (!inventory[key]) {
            inventory[key] = { brand, code, quantity: 0, timesEmptied: 0 };
        }
        inventory[key].quantity += quantity;
    });
    
    history.push({
        date: new Date().toISOString(),
        action: 'bulk_purchase',
        brand,
        quantity,
        count: codes.length,
        setName: selectedSet.name
    });
    
    saveData();
    renderInventory();
    
    showToast(`Добавлен набор "${selectedSet.name}": ${codes.length} цветов по ${quantity} шт.`, 'success');
}

// Быстрое добавление
function quickAdd(brand, code) {
    const key = `${brand}_${code}`;
    if (!inventory[key]) {
        inventory[key] = { brand, code, quantity: 0, timesEmptied: 0 };
    }
    inventory[key].quantity++;
    
    history.push({
        date: new Date().toISOString(),
        action: 'purchase',
        brand,
        code,
        quantity: 1
    });
    
    saveData();
    renderInventory();
}

// Быстрое списание
function quickUse(brand, code) {
    const key = `${brand}_${code}`;
    if (!inventory[key] || inventory[key].quantity <= 0) {
        showToast('Нет маркеров для списания', 'error');
        return;
    }
    
    inventory[key].quantity--;
    
    history.push({
        date: new Date().toISOString(),
        action: 'usage',
        brand,
        code,
        quantity: 1
    });
    
    saveData();
    renderInventory();
    renderRecommendations();
    
    // Каждое списание = использование
    inventory[key].timesEmptied = (inventory[key].timesEmptied || 0) + 1;
    saveData();
    if (inventory[key].quantity === 0) {
        showToast(`Внимание! ${brand} ${code} закончился! (использован ${inventory[key].timesEmptied} раз)`, 'warning');
    }
}

// Удаление маркера из инвентаря
function deleteMarker(brand, code) {
    const key = `${brand}_${code}`;
    if (!inventory[key]) {
        showToast('Маркер не найден', 'error');
        return;
    }
    
    if (!confirm(`Удалить маркер ${brand} ${code} из инвентаря?\n\nЭто действие нельзя отменить.`)) {
        return;
    }
    
    delete inventory[key];
    
    history.push({
        date: new Date().toISOString(),
        action: 'delete',
        brand,
        code,
        quantity: 0
    });
    
    saveData();
    renderInventory();
    renderRecommendations();
    showToast(`Маркер ${brand} ${code} удалён`, 'success');
}

// ==================== АНАЛОГИ И СТАТУСЫ ====================

// Получение аналогов цвета из других брендов (динамический)
function getAnalogues(brand, code) {
    const key = `${brand}_${code}`;
    const entry = REVERSE_INDEX[key];
    if (!entry) return [];
    
    const allBrands = getAllBrands();
    const analogues = [];
    
    for (const bName of allBrands) {
        if (bName === brand) continue;
        const bKey = bName.charAt(0).toLowerCase() + bName.slice(1);
        if (entry[bKey]) {
            const invKey = `${bName}_${entry[bKey]}`;
            const qty = inventory[invKey] ? inventory[invKey].quantity : 0;
            analogues.push({
                brand: bName,
                code: entry[bKey],
                quantity: qty
            });
        }
    }
    return analogues;
}

// Получение общего количества маркеров данного цвета из всех брендов (динамический)
function getColorTotal(brand, code) {
    const key = `${brand}_${code}`;
    const entry = REVERSE_INDEX[key];
    if (!entry) {
        // Если нет в таблице соответствий — считаем только свой бренд
        const invKey = `${brand}_${code}`;
        return inventory[invKey] ? inventory[invKey].quantity : 0;
    }
    
    const allBrands = getAllBrands();
    let total = 0;
    
    for (const bName of allBrands) {
        const bKey = bName.charAt(0).toLowerCase() + bName.slice(1);
        if (entry[bKey]) {
            const invKey = `${bName}_${entry[bKey]}`;
            total += (inventory[invKey] ? inventory[invKey].quantity : 0);
        }
    }
    return total;
}

// Получение статуса (с учётом аналогов из других брендов)
function getStatus(quantity, brand, code) {
    // Проверяем наличие аналогов в других брендах
    let hasAnalogues = false;
    if (brand && code) {
        const total = getColorTotal(brand, code);
        // Аналоги есть если общее количество > quantity этого маркера
        hasAnalogues = total > quantity;
    }
    
    if (quantity === 0) {
        // Маркер кончился
        if (hasAnalogues) {
            return 'has_replacement'; // Есть замена в других брендах
        }
        return 'empty'; // Нет замены — закончился
    }
    
    // quantity > 0 — маркер в наличии
    if (hasAnalogues) {
        return 'available_replacement'; // В наличии + есть замена
    }
    
    return 'available'; // В наличии, замены нет
}

// Получение текста статуса
function getStatusText(status) {
    switch(status) {
        case 'available': return '✓ В наличии';
        case 'available_replacement': return '✓ В наличии (есть замена)';
        case 'has_replacement': return '🔄 Есть замена';
        case 'empty': return '✗ Закончился';
        default: return '';
    }
}

// ==================== ОТРИСОВКА ИНВЕНТАРЯ ====================

// Отрисовка инвентаря
function renderInventory() {
    const tbody = document.getElementById('inventory-body');
    const filterBrand = document.getElementById('filter-brand').value;
    const filterStatus = document.getElementById('filter-status').value;
    const filterHighlight = document.getElementById('filter-highlight').value;
    const filterSearch = document.getElementById('filter-search').value.toUpperCase();
    
    let items = Object.values(inventory);
    
    // Фильтрация
    if (filterBrand !== 'all') {
        items = items.filter(item => item.brand === filterBrand);
    }
    
    if (filterSearch) {
        items = items.filter(item => item.code.includes(filterSearch));
    }
    
    if (filterStatus !== 'all') {
        items = items.filter(item => {
            const status = getStatus(item.quantity, item.brand, item.code);
            return status === filterStatus;
        });
    }
    
    // Фильтр по подсветке
    if (filterHighlight === 'top_stock') {
        items = items.filter(item => {
            const colorTotal = getColorTotal(item.brand, item.code);
            return colorTotal >= 3;
        });
    } else if (filterHighlight === 'frequently_empty') {
        items = items.filter(item => (item.timesEmptied || 0) >= 2);
    }
    
    // Сортировка
    items.sort((a, b) => {
        if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
        return a.code.localeCompare(b.code);
    });
    
    tbody.innerHTML = items.map(item => {
        const status = getStatus(item.quantity, item.brand, item.code);
        const statusText = getStatusText(status);
        const statusClass = `status-${status}`;
        const colorTotal = getColorTotal(item.brand, item.code);
        const analogues = getAnalogues(item.brand, item.code);
        const timesEmptied = item.timesEmptied || 0;
        const ownQty = item.quantity || 0;
        const analoguesQty = analogues.reduce((sum, a) => sum + (a.quantity || 0), 0);
        
        // Иконки подсветки
        const isTopStock = colorTotal >= 3;
        const isFrequentlyEmpty = timesEmptied >= 2;
        
        // Формируем иконки
        let codeIcons = '';
        if (isFrequentlyEmpty) {
            codeIcons += ` <span class="icon-frequently-empty" title="Использован ${timesEmptied} раз">⚠️</span>`;
        }
        
        let totalIcons = '';
        if (isTopStock) {
            totalIcons += ` <span class="icon-top-stock" title="Много в наличии (включая аналоги)">🔥</span>`;
        }
        
        // Формируем HTML для аналогов
        let analoguesHtml = '';
        if (analogues.length > 0) {
            analoguesHtml = analogues.map(a => {
                const aStatus = getStatus(a.quantity, a.brand, a.code);
                const aStatusClass = `status-${aStatus}`;
                return `<span class="badge ${getBadgeClass(a.brand)}" style="${getBadgeStyle(a.brand)} margin: 2px;">${a.brand} ${a.code}: <span class="${aStatusClass}">${a.quantity} шт.</span></span>`;
            }).join(' ');
        } else {
            analoguesHtml = '<span class="text-disabled">—</span>';
        }
        
        // Стиль для ячейки "своих" — подсветка если 0
        const ownStyle = ownQty === 0 ? 'color: var(--color-danger);' : '';
        return `
            <tr>
                <td>${getBadgeHtml(item.brand)}</td>
                <td>${escapeHtml(item.code)}${codeIcons}</td>
                <td>${analoguesHtml}</td>
                <td style="${ownStyle}" class="editable-cell" ondblclick="startInlineEdit('${escapeHtml(item.brand)}', '${escapeHtml(item.code)}', this)" title="Дважды кликните для редактирования"><strong>${ownQty} шт.</strong></td>
                <td><strong>${colorTotal} шт.</strong>${totalIcons}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td class="actions-cell">
                    <button class="btn-quick btn-quick-add" onclick="quickAdd('${escapeHtml(item.brand)}', '${escapeHtml(item.code)}')" title="Добавить 1 шт.">＋</button>
                    <button class="btn-quick btn-quick-use" onclick="quickUse('${escapeHtml(item.brand)}', '${escapeHtml(item.code)}')" title="Списать 1 шт.">−</button>
                    <button class="btn-quick btn-quick-delete" onclick="deleteMarker('${escapeHtml(item.brand)}', '${escapeHtml(item.code)}')" title="Удалить маркер">🗑</button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Обновление статистики
    updateStats();
}

// ==================== СТАТИСТИКА ====================

// Обновление статистики
function updateStats() {
    const items = Object.values(inventory);
    
    // В наличии: quantity > 0 (available + available_replacement)
    const inStock = items.filter(item => item.quantity > 0).length;
    
    // Уникальных цветов: в наличии и нет замен (status === 'available')
    const uniqueColors = items.filter(item => getStatus(item.quantity, item.brand, item.code) === 'available').length;
    
    // С заменами: есть аналоги из других брендов (available_replacement + has_replacement)
    const hasReplacements = items.filter(item => {
        const status = getStatus(item.quantity, item.brand, item.code);
        return status === 'available_replacement' || status === 'has_replacement';
    }).length;
    
    // Закончились: quantity === 0 (has_replacement + empty)
    const outOfStock = items.filter(item => item.quantity === 0).length;
    
    document.getElementById('stat-in-stock').textContent = inStock;
    document.getElementById('stat-unique-colors').textContent = uniqueColors;
    document.getElementById('stat-has-replacements').textContent = hasReplacements;
    document.getElementById('stat-out-of-stock').textContent = outOfStock;
}

// ==================== ПОИСК ЗАМЕН ====================

// Поиск замен (с учётом пользовательских брендов)
function searchReplacement() {
    const brand = document.getElementById('search-brand').value;
    const code = document.getElementById('search-code').value.trim().toUpperCase();
    
    if (!code) {
        showToast('Введите код цвета', 'warning');
        return;
    }
    
    const resultsDiv = document.getElementById('search-results');
    
    // 1) Сначала пробуем точный поиск
    let replacements = findReplacements(brand, code);
    let searchMode = 'exact';
    
    // 2) Если не нашли — пробуем поиск по числовой части кода
    if (!replacements) {
        const numMatch = code.match(/\d+/);
        if (numMatch) {
            const number = numMatch[0];
            const numberResults = findByNumber(brand, number);
            
            if (numberResults && numberResults.length > 0) {
                // Берём первый результат как основной
                const first = numberResults[0];
                replacements = {
                    universalCode: first.universalCode,
                    guangNa: first.guangNa,
                    languo: first.languo,
                    grasp: first.grasp
                };
                // Добавляем пользовательские бренды
                const customBrands = getCustomBrands();
                for (const cb of customBrands) {
                    const cbKey = cb.name.charAt(0).toLowerCase() + cb.name.slice(1);
                    if (first[cbKey]) {
                        replacements[cbKey] = first[cbKey];
                    }
                }
                // Убираем исходный бренд
                delete replacements[brand.charAt(0).toLowerCase() + brand.slice(1)];
                searchMode = 'number';
            }
        }
    }
    
    if (!replacements) {
        resultsDiv.innerHTML = `
            <div class="recommendation">
                <h4>Цвет не найден</h4>
                <p>Код ${escapeHtml(brand)} ${escapeHtml(code)} не найден в таблице соответствий. Возможно, это уникальный цвет без аналогов.</p>
            </div>
        `;
        return;
    }
    
    const modeHint = searchMode === 'number'
        ? `<p class="text-warning mb-16">⚠ Поиск по цифрам: найдено совпадение по числовому коду</p>`
        : '';
    
    let html = `
        <div class="section">
            <h2>Результаты поиска для ${escapeHtml(brand)} ${escapeHtml(code)}</h2>
            ${modeHint}
            <p class="text-muted mb-16">
                Универсальный код: ${escapeHtml(replacements.universalCode)}
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Бренд</th>
                        <th>Код цвета</th>
                        <th>Наличие</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Собираем все бренды для показа
    const allBrands = getAllBrands();
    const brandsToShow = allBrands.map(bName => ({
        key: bName.charAt(0).toLowerCase() + bName.slice(1),
        name: bName
    }));
    
    for (const b of brandsToShow) {
        if (replacements[b.key]) {
            const invKey = `${b.name}_${replacements[b.key]}`;
            const qty = inventory[invKey] ? inventory[invKey].quantity : 0;
            const status = getStatus(qty, b.name, replacements[b.key]);
            html += `
                <tr>
                    <td>${getBadgeHtml(b.name)}</td>
                    <td>${escapeHtml(replacements[b.key])}</td>
                    <td><span class="status-${status}">${qty} шт. (${getStatusText(status)})</span></td>
                </tr>
            `;
        }
    }
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
}

// ==================== РЕКОМЕНДАЦИИ ====================

// Рекомендации
function renderRecommendations() {
    const list = document.getElementById('recommendations-list');
    if (!list) return;
    const items = Object.values(inventory);
    
    const emptyItems = items.filter(item => getStatus(item.quantity, item.brand, item.code) === 'empty');
    const hasReplacementItems = items.filter(item => getStatus(item.quantity, item.brand, item.code) === 'has_replacement');
    const frequentItems = items.filter(item => (item.timesEmptied || 0) >= 2)
        .sort((a, b) => (b.timesEmptied || 0) - (a.timesEmptied || 0));
    
    let html = '';
    
    if (emptyItems.length > 0) {
        html += `
            <div class="recommendation">
                <h4>🔴 Закончились (${emptyItems.length} цветов)</h4>
                <p>Эти маркеры нужно срочно докупить (нет аналогов):</p>
                <ul style="margin-top: 8px; margin-left: 20px;">
                    ${emptyItems.map(item => {
                        const colorTotal = getColorTotal(item.brand, item.code);
                        return `<li><strong>${escapeHtml(item.brand)} ${escapeHtml(item.code)}</strong> (всего цвет: ${colorTotal} шт.)</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }
    
    if (hasReplacementItems.length > 0) {
        html += `
            <div class="recommendation recommendation-replacement">
                <h4>🔄 Есть замена (${hasReplacementItems.length} цветов)</h4>
                <p>Эти маркеры закончились, но есть аналоги в других брендах:</p>
                <ul style="margin-top: 8px; margin-left: 20px;">
                    ${hasReplacementItems.map(item => {
                        const analogues = getAnalogues(item.brand, item.code);
                        const analogueInfo = analogues.length > 0
                            ? ` — замена: ${analogues.map(a => `${escapeHtml(a.brand)} ${escapeHtml(a.code)} (${a.quantity} шт.)`).join(', ')}`
                            : '';
                        return `<li><strong>${escapeHtml(item.brand)} ${escapeHtml(item.code)}</strong>${analogueInfo}</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }
    
    if (frequentItems.length > 0) {
        html += `
            <div class="recommendation recommendation-frequent">
                <h4>⚠️ Часто используются (${frequentItems.length} цветов)</h4>
                <p>Эти маркеры использовались 2 и более раз — рекомендуется купить с запасом:</p>
                <ul style="margin-top: 8px; margin-left: 20px;">
                    ${frequentItems.map(item => {
                        const colorTotal = getColorTotal(item.brand, item.code);
                        const status = getStatus(item.quantity, item.brand, item.code);
                        const statusText = getStatusText(status);
                        return `<li><strong>${escapeHtml(item.brand)} ${escapeHtml(item.code)}</strong> — использован ${item.timesEmptied} раз (сейчас: ${item.quantity} шт., статус: ${statusText}, всего цвет: ${colorTotal} шт.)</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }
    
    // Рекомендации по наборам (только для встроенных брендов)
    const allProblemItems = [...emptyItems, ...hasReplacementItems];
    const problemCodes = new Set(allProblemItems.map(item => {
        const entry = REVERSE_INDEX[`${item.brand}_${item.code}`];
        return entry ? entry.universalCode : null;
    }).filter(Boolean));
    
    const frequentCodes = new Set(frequentItems.filter(item => item.quantity > 0).map(item => {
        const entry = REVERSE_INDEX[`${item.brand}_${item.code}`];
        return entry ? entry.universalCode : null;
    }).filter(Boolean));
    
    if (problemCodes.size > 0) {
        const BRAND_SET_INFO = {
            'GuangNa': { label: 'GuangNa (360 цветов)', count: 360 },
            'Languo': { label: 'Languo (288 цветов)', count: 288 },
            'Grasp': { label: 'Grasp (168 цветов)', count: 168 }
        };
        const brands = BUILTIN_BRANDS.map(key => ({ key, ...BRAND_SET_INFO[key] }));
        
        const brandRecommendations = brands.map(brand => {
            const brandColors = getBrandColors(brand.key);
            const brandUniversalCodes = new Set(brandColors.map(c => c.universalCode));
            
            const coversProblem = [...problemCodes].filter(code => brandUniversalCodes.has(code));
            const coversFrequent = [...frequentCodes].filter(code => brandUniversalCodes.has(code));
            
            return {
                ...brand,
                coversProblem: coversProblem.length,
                coversFrequent: coversFrequent.length,
                totalCovers: coversProblem.length + coversFrequent.length,
                problemPercent: problemCodes.size > 0 ? Math.round((coversProblem.length / problemCodes.size) * 100) : 0
            };
        }).sort((a, b) => b.totalCovers - a.totalCovers);
        
        html += `
            <div class="recommendation recommendation-sets">
                <h4>📦 Рекомендация по наборам</h4>
                <p>Для покрытия максимального количества недостающих цветов рекомендуется купить набор:</p>
                <table class="mt-12 color-white" style="width: 100%;">
                    <thead>
                        <tr>
                            <th class="color-white border-bottom-medium">Набор</th>
                            <th class="color-white border-bottom-medium">Покрывает проблемных</th>
                            <th class="color-white border-bottom-medium">Покрывает частых</th>
                            <th class="color-white border-bottom-medium">% покрытия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${brandRecommendations.map((b, i) => `
                            <tr>
                                <td class="border-bottom-light">
                                    ${i === 0 ? '⭐ ' : ''}<strong>${escapeHtml(b.label)}</strong>
                                </td>
                                <td class="border-bottom-light text-center">
                                    ${b.coversProblem} из ${problemCodes.size}
                                </td>
                                <td class="border-bottom-light text-center">
                                    ${b.coversFrequent} из ${frequentCodes.size}
                                </td>
                                <td class="border-bottom-light text-center">
                                    <strong>${b.problemPercent}%</strong>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p class="mt-12 opacity-9 text-13">
                    💡 Лучший выбор: <strong>${escapeHtml(brandRecommendations[0].label)}</strong> — покроет ${brandRecommendations[0].coversProblem} из ${problemCodes.size} проблемных цветов (${brandRecommendations[0].problemPercent}%)
                </p>
            </div>
        `;
    }
    
    if (emptyItems.length === 0 && hasReplacementItems.length === 0 && frequentItems.length === 0) {
        html = `
            <div class="recommendation recommendation-ok">
                <h4>🟢 Все в порядке</h4>
                <p>У вас достаточно маркеров для работы!</p>
            </div>
        `;
    }
    
    list.innerHTML = html;
}

// ==================== ИСТОРИЯ ====================

// История
function renderHistory() {
    const list = document.getElementById('history-list');
    
    if (history.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>История пуста</p></div>';
        return;
    }
    
    const sortedHistory = [...history].reverse().slice(0, 50);
    
    list.innerHTML = sortedHistory.map(item => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
        let actionText = '';
        let actionClass = '';
        
        if (item.action === 'purchase') {
            actionText = `Покупка: ${escapeHtml(item.brand)} ${escapeHtml(item.code)} × ${item.quantity}`;
            actionClass = 'purchase';
        } else if (item.action === 'usage') {
            actionText = `Расход: ${escapeHtml(item.brand)} ${escapeHtml(item.code)} × ${item.quantity}`;
            actionClass = 'usage';
        } else if (item.action === 'bulk_purchase') {
            actionText = `Покупка набора: ${escapeHtml(item.brand)} (${item.count} цветов × ${item.quantity})`;
            actionClass = 'purchase';
        }
        
        return `
            <div class="history-item">
                <div>
                    <div class="history-action ${actionClass}">${actionText}</div>
                    <div class="history-date">${dateStr}</div>
                </div>
            </div>
        `;
    }).join('');
}

// renderStats() перенесена в features.js (с графиками Chart.js)
