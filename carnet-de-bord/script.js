const CMYK_PALETTE = [
    { color: '#00e5ff', glow: '0 0 5px rgba(0, 229, 255, 0.2)' },
    { color: '#ff0055', glow: '0 0 5px rgba(255, 0, 85, 0.2)' },
    { color: '#ffea00', glow: '0 0 5px rgba(255, 234, 0, 0.25)' },
    { color: '#111111', glow: '0 0 5px rgba(17, 17, 17, 0.12)' }
];

const initialMockEntries = [
    {
        id: "1", title: "No-Label & Anonymat", type: "TEXTE", subtitle: "Stratégies du vêtement technique", format: "paragraph",
        content: "La suppression de l'étiquette constitue un acte réflexif de refus de la marque commerciale. Le vêtement technique s'exprime exclusivement par son patronage.",
        tags: ["TEXTILE", "DESIGN", "CONCEPT"],
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000", date: "05/11/2026"
    },
    {
        id: "2", title: "Sérigraphie Brute & Cuisson", type: "RÉFÉRENCES",
        content: "Expérimentation d'empâtement d'encre plastisol et spray 7A sur molleton lourd.",
        tags: ["SÉRIGRAPHIE", "CRAFT", "PRINT"],
        image: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000",
        apaRefArtist: "Overmade Workshop", apaRefYear: "2026", apaRefTitle: "Série Textile N°04", apaRefSource: "Belle de Mai, Marseille", date: "03/11/2026"
    },
    {
        id: "3", title: "Naomi Klein // No Logo", type: "CITATION",
        content: "Les marques ne produisent pas des choses, mais des significations. Le design alternatif réapproprie l'objet matériel contre la domination du signe.",
        tags: ["THEORIE", "CRITIQUE", "BRANDING"],
        apaCiteAuthor: "Klein, N.", apaCiteYear: "2000", apaCiteBook: "No Logo: Taking Aim at the Brand Bullies", apaCitePublisher: "Knopf Canada", apaCitePage: "p. 28", date: "01/11/2026"
    },
    {
        id: "4", title: "Atelier Upcycling Marseille", type: "INTERVIEW", speaker1: "Florent (ESDM)", speaker2: "Mathias (HYDDN)",
        dialogue: [
            { spk: "spk1", text: "Comment penses-tu le 'no-label' dans ta production locale ?" },
            { spk: "spk2", text: "On supprime les griffes apparentes pour valoriser la matière et l'assemblage technique." }
        ],
        tags: ["INTERVIEW", "MARSEILLE", "UPCYCLING"], date: "28/10/2026"
    },
    {
        id: "5", title: "Archives Streetwear Minimaliste", type: "RÉFÉRENCES",
        content: "Recherche sur les silhouettes surdimensionnées des années 2000 couplées au minimalisme radical des designers belges.",
        tags: ["FASHION", "ARCHIVES", "2000S"],
        image: "https://images.unsplash.com/photo-1523398002811-999aa8e95707?q=80&w=1000", date: "20/10/2026"
    }
];

let entries = JSON.parse(localStorage.getItem('local_carnet_bord')) || initialMockEntries;
let currentActionId = null;
let draggedItemIndex = null;

// ÉLÉMENTS DOM RECHERCHE
const searchInput = document.getElementById('searchInput');
const searchCategorySelect = document.getElementById('searchCategorySelect');
const searchDateInput = document.getElementById('searchDateInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const searchSuggestions = document.getElementById('searchSuggestions');
const searchContainer = document.getElementById('searchContainer');

// VUES & NAVIGATION
const dynamicList = document.getElementById('dynamicList');
const previewPane = document.getElementById('previewPane');
const tapuscritStream = document.getElementById('tapuscritStream');
const tapuscritImageDisplay = document.getElementById('tapuscritImageDisplay');
const orbitRing = document.getElementById('orbitRing');
const listTableBody = document.getElementById('listTableBody');
const galerieContainer = document.getElementById('galerieContainer');

const menuView = document.getElementById('menuView');
const tapuscritView = document.getElementById('tapuscritView');
const orbiterView = document.getElementById('orbiterView');
const listView = document.getElementById('listView');
const galerieView = document.getElementById('galerieView');

const viewMenuBtn = document.getElementById('viewMenuBtn');
const viewTapuscritBtn = document.getElementById('viewTapuscritBtn');
const viewOrbiterBtn = document.getElementById('viewOrbiterBtn');
const viewListBtn = document.getElementById('viewListBtn');
const viewGalerieBtn = document.getElementById('viewGalerieBtn');

const formModal = document.getElementById('formModal');
const entryForm = document.getElementById('entryForm');
const entryTypeSelect = document.getElementById('entryType');
const actionMenuModal = document.getElementById('actionMenuModal');
const viewEntryModal = document.getElementById('viewEntryModal');
const viewModalBody = document.getElementById('viewModalBody');

// --- 1. FONCTIONS DE FILTRAGE RECHERCHE ---
function getFilteredEntries() {
    const textQuery = searchInput.value.trim().toLowerCase();
    const categoryQuery = searchCategorySelect.value;
    const dateQuery = searchDateInput.value.trim().toLowerCase();

    return entries.filter(entry => {
        const tagsStr = (entry.tags || []).join(' ').toLowerCase();
        const matchText = !textQuery || [
            entry.title,
            entry.subtitle || '',
            entry.content || '',
            entry.apaCiteAuthor || '',
            entry.apaRefArtist || '',
            entry.apaResAuthor || '',
            tagsStr
        ].some(val => val.toLowerCase().includes(textQuery));

        const matchCategory = !categoryQuery || entry.type === categoryQuery;
        const matchDate = !dateQuery || (entry.date && entry.date.toLowerCase().includes(dateQuery));

        return matchText && matchCategory && matchDate;
    });
}

function updateClearSearchVisibility() {
    if (searchInput.value || searchCategorySelect.value || searchDateInput.value) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
        searchSuggestions.classList.add('hidden');
    }
}

function renderSuggestions() {
    const textQuery = searchInput.value.trim().toLowerCase();
    if (!textQuery && !searchCategorySelect.value && !searchDateInput.value) {
        searchSuggestions.classList.add('hidden');
        return;
    }

    const filtered = getFilteredEntries();
    searchSuggestions.innerHTML = '';

    if (filtered.length === 0) {
        searchSuggestions.innerHTML = `<div class="suggestion-no-result">AUCUN RÉSULTAT TROUVÉ</div>`;
    } else {
        filtered.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <span class="suggestion-title">${entry.title}</span>
                <div class="suggestion-meta">
                    <span class="suggestion-tag">${entry.type}</span>
                    <span class="suggestion-date">${entry.date}</span>
                </div>
            `;
            div.addEventListener('click', () => {
                searchSuggestions.classList.add('hidden');
                selectAndFocusEntry(entry.id);
            });
            searchSuggestions.appendChild(div);
        });
    }

    searchSuggestions.classList.remove('hidden');
}

function selectAndFocusEntry(entryId) {
    const entry = entries.find(e => e.id === entryId);

    if (!menuView.classList.contains('hidden')) {
        const itemWrapper = document.querySelector(`.list-item-wrapper[data-id="${entryId}"]`);
        if (itemWrapper) {
            itemWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const item = itemWrapper.querySelector('.list-item');
            document.querySelectorAll('.list-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            if (entry) updatePreviewFiltered(entry);
        }
    } else if (!tapuscritView.classList.contains('hidden')) {
        const block = document.querySelector(`.tapuscrit-block[data-id="${entryId}"]`);
        if (block) block.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        if (entry) openViewModal(entry);
    }
}

[searchInput, searchDateInput].forEach(elem => {
    elem.addEventListener('input', () => {
        updateClearSearchVisibility();
        renderSuggestions();
        renderAllViews();
    });
});

searchCategorySelect.addEventListener('change', () => {
    updateClearSearchVisibility();
    renderSuggestions();
    renderAllViews();
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchCategorySelect.value = '';
    searchDateInput.value = '';
    updateClearSearchVisibility();
    renderAllViews();
});

document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
        searchSuggestions.classList.add('hidden');
    }
});

// --- 2. SAUVEGARDE & SYNCHRONISATION GLOBAL DE TOUTES LES VUES ---
function saveToLocalStorage() {
    localStorage.setItem('local_carnet_bord', JSON.stringify(entries));
    renderAllViews();
}

function renderAllViews() {
    renderList();
    renderTapuscrit();
    renderOrbiter();
    renderListViewTable();
    if(!galerieView.classList.contains('hidden')) initGalerie();
}

// --- 3. SWITCH DE VUES (5 VUES) ---
viewMenuBtn.addEventListener('click', () => switchView('menu'));
viewTapuscritBtn.addEventListener('click', () => switchView('tapuscrit'));
viewOrbiterBtn.addEventListener('click', () => switchView('orbiter'));
viewListBtn.addEventListener('click', () => switchView('list'));
viewGalerieBtn.addEventListener('click', () => switchView('galerie'));

function switchView(viewName) {
    [menuView, tapuscritView, orbiterView, listView, galerieView].forEach(v => v.classList.add('hidden'));
    [viewMenuBtn, viewTapuscritBtn, viewOrbiterBtn, viewListBtn, viewGalerieBtn].forEach(b => b.classList.remove('active'));

    if (viewName === 'menu') {
        menuView.classList.remove('hidden'); viewMenuBtn.classList.add('active');
    } else if (viewName === 'tapuscrit') {
        tapuscritView.classList.remove('hidden'); viewTapuscritBtn.classList.add('active');
    } else if (viewName === 'orbiter') {
        orbiterView.classList.remove('hidden'); viewOrbiterBtn.classList.add('active'); renderOrbiter();
    } else if (viewName === 'list') {
        listView.classList.remove('hidden'); viewListBtn.classList.add('active'); renderListViewTable();
    } else if (viewName === 'galerie') {
        galerieView.classList.remove('hidden'); viewGalerieBtn.classList.add('active'); initGalerie();
    }
}

// --- 4. DYNAMISME DES FORMULAIRES ---
entryTypeSelect.addEventListener('change', updateFormSections);
function updateFormSections() {
    const selectedType = entryTypeSelect.value;
    document.querySelectorAll('.dynamic-section').forEach(sec => sec.classList.add('hidden'));

    if (selectedType === 'TEXTE') document.getElementById('sectionTexte').classList.remove('hidden');
    else if (selectedType === 'RÉFÉRENCES') document.getElementById('sectionReferences').classList.remove('hidden');
    else if (selectedType === 'CITATION') document.getElementById('sectionCitation').classList.remove('hidden');
    else if (selectedType === 'INTERVIEW') document.getElementById('sectionInterview').classList.remove('hidden');
    else if (selectedType === 'RESSOURCE') document.getElementById('sectionRessource').classList.remove('hidden');
}

const quickTypeSelect = document.getElementById('quickTypeSelect');
quickTypeSelect.addEventListener('change', updateQuickSections);

function updateQuickSections() {
    const type = quickTypeSelect.value;
    ['quickSectionTexte', 'quickSectionRef', 'quickSectionCitation', 'quickSectionInterview', 'quickSectionRessource'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    if (type === 'TEXTE') document.getElementById('quickSectionTexte').classList.remove('hidden');
    else if (type === 'RÉFÉRENCES') document.getElementById('quickSectionRef').classList.remove('hidden');
    else if (type === 'CITATION') document.getElementById('quickSectionCitation').classList.remove('hidden');
    else if (type === 'INTERVIEW') document.getElementById('quickSectionInterview').classList.remove('hidden');
    else if (type === 'RESSOURCE') document.getElementById('quickSectionRessource').classList.remove('hidden');
}

const dialogueContainer = document.getElementById('interviewDialogueContainer');
document.getElementById('addDialoguePairBtn').addEventListener('click', () => addDialoguePair());

function addDialoguePair(spk = 'spk1', text = '') {
    const div = document.createElement('div');
    div.className = 'dialogue-pair-item';
    div.innerHTML = `
        <select class="dialogue-spk-select">
            <option value="spk1" ${spk === 'spk1' ? 'selected' : ''}>Interlocuteur 1</option>
            <option value="spk2" ${spk === 'spk2' ? 'selected' : ''}>Interlocuteur 2</option>
        </select>
        <textarea class="dialogue-text-input" placeholder="Réplique / Propos...">${text}</textarea>
    `;
    dialogueContainer.appendChild(div);
}

// --- 5. FORMATAGE DU CORPS (BULLES IPHONE CMJN POUR INTERVIEW) ---
function buildFormattedBody(entry) {
    if (entry.type === 'TEXTE') {
        if (entry.format === 'bullet') {
            const lines = (entry.content || '').split('\n').filter(l => l.trim());
            return `<ul class="preview-content" style="padding-left:1.2rem; text-align:left;">${lines.map(l => `<li>${l}</li>`).join('')}</ul>`;
        } else if (entry.format === 'numbered') {
            const lines = (entry.content || '').split('\n').filter(l => l.trim());
            return `<ol class="preview-content" style="padding-left:1.2rem; text-align:left;">${lines.map(l => `<li>${l}</li>`).join('')}</ol>`;
        }
        return `<p class="preview-content">${(entry.content || '').replace(/\n/g, '<br>')}</p>`;
    } 
    else if (entry.type === 'CITATION') {
        let apa = '';
        if (entry.apaCiteAuthor || entry.apaCiteYear || entry.apaCiteBook) {
            apa = `<div class="apa-reference-meta">Source : ${entry.apaCiteAuthor || ''} (${entry.apaCiteYear || ''}). <em>${entry.apaCiteBook || ''}</em>. ${entry.apaCitePublisher || ''} ${entry.apaCitePage || ''}</div>`;
        }
        return `<blockquote class="apa-citation-block">« ${entry.content || ''} »</blockquote>${apa}`;
    }
    else if (entry.type === 'RÉFÉRENCES') {
        let apa = '';
        if (entry.apaRefArtist || entry.apaRefYear || entry.apaRefTitle) {
            apa = `<div class="apa-reference-meta">APA7 : ${entry.apaRefArtist || ''} (${entry.apaRefYear || ''}). <em>${entry.apaRefTitle || ''}</em> [Visuel]. ${entry.apaRefSource || ''}.</div>`;
        }
        return `<p class="preview-content">${entry.content || ''}</p>${apa}`;
    }
    else if (entry.type === 'INTERVIEW') {
        const spk1 = entry.speaker1 || "Interlocuteur 1";
        const spk2 = entry.speaker2 || "Interlocuteur 2";
        let dialogueHTML = (entry.dialogue || []).map(d => `
            <div class="chat-turn ${d.spk}">
                <span class="chat-speaker">${d.spk === 'spk1' ? spk1 : spk2}</span>
                <div class="chat-bubble">${d.text}</div>
            </div>
        `).join('');
        return `<div class="chat-interview-container">${dialogueHTML}</div>`;
    }
    else if (entry.type === 'RESSOURCE') {
        let apa = '';
        if (entry.apaResAuthor || entry.apaResTitle) {
            apa = `<div class="apa-reference-meta">APA7 : ${entry.apaResAuthor || ''} (${entry.apaResDate || ''}). ${entry.apaResTitle || ''}. <em>${entry.apaResJournal || ''}</em>. ${entry.apaResUrl || ''}</div>`;
        }
        return `<p class="preview-content">${entry.content || ''}</p>${apa}`;
    }
    return `<p class="preview-content">${entry.content || ''}</p>`;
}

// --- 6. VUE 01 : INDEX ---
function renderList() {
    dynamicList.innerHTML = '';
    const filtered = getFilteredEntries();

    if (filtered.length === 0) {
        previewPane.innerHTML = `<div class="empty-state">Aucune entrée ne correspond à la recherche</div>`;
        return;
    }

    filtered.slice().reverse().forEach((entry, index) => {
        const realIndex = entries.findIndex(e => e.id === entry.id);
        
        const wrapper = document.createElement('div');
        wrapper.className = 'list-item-wrapper';
        wrapper.draggable = true;
        wrapper.dataset.realIndex = realIndex;
        wrapper.dataset.id = entry.id;

        const handle = document.createElement('span');
        handle.className = 'drag-handle';
        handle.innerHTML = ':::';

        const li = document.createElement('li');
        li.className = 'list-item';
        li.textContent = entry.title;
        li.dataset.index = index;
        li.dataset.id = entry.id;
        
        const cmyk = CMYK_PALETTE[index % CMYK_PALETTE.length];
        li.style.setProperty('--hover-cmyk', cmyk.color);
        li.style.setProperty('--hover-glow', cmyk.glow);
        if (cmyk.color === '#111111') li.dataset.cmyk = "black";

        wrapper.appendChild(handle);
        wrapper.appendChild(li);

        wrapper.addEventListener('dragstart', (e) => {
            draggedItemIndex = realIndex;
            wrapper.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        wrapper.addEventListener('dragend', () => wrapper.classList.remove('dragging'));
        wrapper.addEventListener('dragover', (e) => e.preventDefault());

        wrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetRealIndex = parseInt(wrapper.dataset.realIndex);
            if (draggedItemIndex !== null && draggedItemIndex !== targetRealIndex) {
                const draggedItem = entries.splice(draggedItemIndex, 1)[0];
                entries.splice(targetRealIndex, 0, draggedItem);
                saveToLocalStorage();
            }
        });

        li.addEventListener('click', () => {
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
            document.querySelectorAll('.list-item').forEach(i => i.classList.remove('active'));
            li.classList.add('active');
            updatePreviewFiltered(entry);
        });

        dynamicList.appendChild(wrapper);
    });

    initScrollObserver();
}

function initScrollObserver() {
    const listWrappers = document.querySelectorAll('.list-item-wrapper');
    if (listWrappers.length === 0) return;

    const observer = new IntersectionObserver((entriesObs) => {
        entriesObs.forEach(obs => {
            if (obs.isIntersecting) {
                listWrappers.forEach(w => w.querySelector('.list-item').classList.remove('active'));
                const item = obs.target.querySelector('.list-item');
                item.classList.add('active');
                const entryId = item.dataset.id;
                const entry = entries.find(e => e.id === entryId);
                if (entry) updatePreviewFiltered(entry);
            }
        });
    }, { 
        root: document.getElementById('indexList'), 
        rootMargin: '-45% 0px -45% 0px', 
        threshold: 0 
    });

    listWrappers.forEach(w => observer.observe(w));
}

function updatePreviewFiltered(entry) {
    if (!entry) return;

    let mediaHTML = entry.image ? `<img src="${entry.image}" class="preview-image" alt="Visuel">` : '';

    previewPane.innerHTML = `
        <div class="preview-header-row">
            <span class="preview-tag">${entry.type} // ${entry.date}</span>
            <button class="btn-options-dots" onclick="openActionMenu('${entry.id}')">...</button>
        </div>
        <h2 class="preview-title"><span>${entry.title}</span></h2>
        ${entry.subtitle ? `<div class="preview-subtitle">${entry.subtitle}</div>` : ''}
        ${buildFormattedBody(entry)}
        ${mediaHTML}
    `;
}

// --- 7. VUE 02 : TAPUSCRIT ---
function renderTapuscrit() {
    tapuscritStream.innerHTML = '';
    const filtered = getFilteredEntries();
    
    filtered.forEach((entry) => {
        const realIndex = entries.findIndex(e => e.id === entry.id);
        const block = document.createElement('div');
        block.className = 'tapuscrit-block';
        block.draggable = true;
        block.dataset.realIndex = realIndex;
        block.dataset.id = entry.id;
        
        block.innerHTML = `
            <div class="tapuscrit-meta">
                <div class="tapuscrit-meta-left">
                    <span class="drag-handle">:::</span>
                    <span>[ ${entry.type} ] // ${entry.date}</span>
                </div>
                <button class="btn-options-dots" onclick="openActionMenu('${entry.id}')">...</button>
            </div>
            <h3>${entry.title}</h3>
            ${buildFormattedBody(entry)}
        `;

        block.addEventListener('dragstart', (e) => {
            draggedItemIndex = realIndex;
            block.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        block.addEventListener('dragend', () => block.classList.remove('dragging'));
        block.addEventListener('dragover', (e) => e.preventDefault());

        block.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetRealIndex = parseInt(block.dataset.realIndex);
            if (draggedItemIndex !== null && draggedItemIndex !== targetRealIndex) {
                const draggedItem = entries.splice(draggedItemIndex, 1)[0];
                entries.splice(targetRealIndex, 0, draggedItem);
                saveToLocalStorage();
            }
        });

        block.addEventListener('mouseenter', () => {
            if (entry.image) {
                tapuscritImageDisplay.innerHTML = `<img src="${entry.image}" alt="${entry.title}">`;
            } else {
                tapuscritImageDisplay.innerHTML = `<div class="photo-placeholder">[ PAS D'IMAGE POUR CETTE ENTRÉE ]</div>`;
            }
        });

        tapuscritStream.appendChild(block);
    });

    document.getElementById('currentLiveDate').textContent = new Date().toLocaleDateString('fr-FR');
}

// --- 8. VUE 03 : ORBITE CIRCULAIRE ---
function renderOrbiter() {
    orbitRing.innerHTML = '';
    const filtered = getFilteredEntries();
    if (filtered.length === 0) return;

    const total = filtered.length;
    const maxRadius = orbitRing.offsetWidth / 2;

    filtered.forEach((entry, index) => {
        const trackIndex = index % 4;
        const radius = maxRadius * (1 - (trackIndex * 0.22)); 
        
        const angle = (index / total) * (2 * Math.PI);
        const x = maxRadius + radius * Math.cos(angle);
        const y = maxRadius + radius * Math.sin(angle);

        const itemContainer = document.createElement('div');
        itemContainer.className = 'orbit-item';
        itemContainer.style.left = `${x}px`;
        itemContainer.style.top = `${y}px`;

        const textSpan = document.createElement('span');
        textSpan.className = 'orbit-item-content';
        textSpan.textContent = entry.title;
        
        const cmyk = CMYK_PALETTE[index % CMYK_PALETTE.length];
        textSpan.style.setProperty('--hover-cmyk', cmyk.color);
        textSpan.style.setProperty('--hover-glow', cmyk.glow);
        if (cmyk.color === '#111111') textSpan.dataset.cmyk = "black";

        textSpan.addEventListener('click', () => openViewModal(entry));

        itemContainer.appendChild(textSpan);
        orbitRing.appendChild(itemContainer);
    });
}

orbitRing.addEventListener('mouseenter', () => {
    const anims = orbitRing.getAnimations();
    if (anims.length > 0) anims[0].playbackRate = 0.2;
});
orbitRing.addEventListener('mouseleave', () => {
    const anims = orbitRing.getAnimations();
    if (anims.length > 0) anims[0].playbackRate = 1.0;
});

// --- 9. VUE 04 : LIST TABLEAU (STYLE SHOWCASE BRUTALISTE) ---
function renderListViewTable() {
    listTableBody.innerHTML = '';
    const filtered = getFilteredEntries();

    if (filtered.length === 0) {
        listTableBody.innerHTML = `<div class="suggestion-no-result" style="padding: 3rem;">AUCUNE ENTRÉE ENREGISTRÉE</div>`;
        return;
    }

    filtered.forEach((entry, index) => {
        const numStr = (index + 1).toString().padStart(2, '0');
        const cmyk = CMYK_PALETTE[index % CMYK_PALETTE.length];

        const row = document.createElement('div');
        row.className = 'list-table-row';
        row.style.setProperty('--row-cmyk', cmyk.color);
        row.style.setProperty('--row-glow', cmyk.glow);
        if (cmyk.color === '#111111') row.dataset.cmyk = "black";

        // Traitement des tags (extraits du titre, sous-titre ou objet tags)
        const tags = entry.tags || [entry.type, "PROJET"];
        const tagsHTML = tags.map(t => `<span class="tag-pill">#${t}</span>`).join('');

        row.innerHTML = `
            <div class="row-num">${numStr}</div>
            <div class="col-color"><span class="row-accent-box" style="background: ${cmyk.color};"></span></div>
            <div class="row-title">${entry.title}</div>
            <div class="row-category">${entry.type}</div>
            <div class="row-date">${entry.date}</div>
            <div class="row-tags-wrapper">${tagsHTML}</div>
            <div class="col-actions">
                <button class="btn-options-dots" onclick="event.stopPropagation(); openActionMenu('${entry.id}')">...</button>
            </div>
        `;

        row.addEventListener('click', () => openViewModal(entry));

        listTableBody.appendChild(row);
    });
}

// --- 10. VUE 05 : GALERIE 3D (ISOMETRIQUE / SCROLL / TACTILE) ---
let galerieScroll = 0;
let targetGalerieScroll = 0;
let galerieItems = [];
let galerieEntries = [];
let isGalerieAnimating = false;

function initGalerie() {
    galerieEntries = getFilteredEntries().filter(e => e.image && e.image.trim() !== "");
    galerieContainer.innerHTML = '';
    galerieItems = [];

    if (galerieEntries.length === 0) {
        galerieContainer.innerHTML = `<div style="color:var(--text-muted); font-family:'TitleFont'; font-size:1.5rem;">AUCUNE IMAGE TROUVÉE</div>`;
        return;
    }

    galerieEntries.forEach((entry, i) => {
        const card = document.createElement('div');
        card.className = 'galerie-card';
        card.innerHTML = `<img src="${entry.image}" alt="">`;
        
        card.addEventListener('click', () => {
            if (Math.abs(targetGalerieScroll - i) < 0.2) {
                openViewModal(entry);
            } else {
                targetGalerieScroll = i;
            }
        });

        galerieContainer.appendChild(card);
        galerieItems.push(card);
    });

    targetGalerieScroll = Math.floor(galerieItems.length / 2);
    galerieScroll = targetGalerieScroll;

    if (!isGalerieAnimating) {
        isGalerieAnimating = true;
        requestAnimationFrame(animateGalerie);
    }
}

// 1. Navigation à la molette (PC)
galerieView.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetGalerieScroll += Math.sign(e.deltaY) * 0.4;
    targetGalerieScroll = Math.max(0, Math.min(targetGalerieScroll, galerieItems.length - 1));
}, { passive: false });

// 2. Navigation Tactile (Mobile & Tablette)
let touchStartY = 0;
galerieView.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

galerieView.addEventListener('touchmove', (e) => {
    let touchY = e.touches[0].clientY;
    let delta = touchStartY - touchY;
    
    // Ajustement sensible du défilement au doigt
    targetGalerieScroll += (delta * 0.015);
    targetGalerieScroll = Math.max(0, Math.min(targetGalerieScroll, galerieItems.length - 1));
    
    touchStartY = touchY; // Réinitialise pour un scroll continu
}, { passive: true });

// Animation 3D de la Galerie (Adaptative Mobile)
function animateGalerie() {
    if (!galerieView.classList.contains('hidden') && galerieItems.length > 0) {
        galerieScroll += (targetGalerieScroll - galerieScroll) * 0.08;
        
        // Détection de la largeur de l'écran pour adapter l'espacement 3D
        const isMobile = window.innerWidth <= 768;
        
        galerieItems.forEach((item, i) => {
            const p = i - galerieScroll;
            const absP = Math.abs(p);
            
            // Distances dynamiques selon l'écran
            let gapX = isMobile ? 120 : 220; 
            let gapY = isMobile ? -60 : -110; 
            let gapZ = isMobile ? 100 : 160;
            
            let x = p * gapX;
            let y = p * gapY;
            let z = -absP * gapZ;
            
            let rotY = p * -12;
            let rotX = 5;
            
            let scale = 1;
            let opacity = Math.max(0, 1 - (absP * 0.18));

            if (absP < 0.5) {
                item.style.zIndex = 100;
                item.style.filter = `brightness(1)`;
                scale = 1 + (0.5 - absP) * 0.15; 
            } else {
                item.style.zIndex = Math.round(100 - absP * 10);
                item.style.filter = `brightness(${Math.max(0.3, 1 - absP * 0.15)})`;
            }

            item.style.opacity = opacity;
            item.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
        });
    }
    requestAnimationFrame(animateGalerie);
}

// Molette de souris pour scroller la galerie 3D
galerieView.addEventListener('wheel', (e) => {
    e.preventDefault();
    // Vitesse de défilement douce
    targetGalerieScroll += Math.sign(e.deltaY) * 0.4;
    // Bloquer les bornes
    targetGalerieScroll = Math.max(0, Math.min(targetGalerieScroll, galerieItems.length - 1));
});

function animateGalerie() {
    if (!galerieView.classList.contains('hidden') && galerieItems.length > 0) {
        // Interpolation fluide (Lerp) de la position de scroll
        galerieScroll += (targetGalerieScroll - galerieScroll) * 0.08;

        galerieItems.forEach((item, i) => {
            const p = i - galerieScroll; // Position relative par rapport au centre du scroll
            const absP = Math.abs(p);
            
            // Calculs de la trajectoire diagonale isométrique (inspiration GIF)
            let x = p * 220;          // Espace horizontal entre les images
            let y = p * -110;         // Espace vertical (crée la diagonale montante)
            let z = -absP * 160;      // Profondeur : les images s'éloignent plus elles sont loin du centre
            
            let rotY = p * -12;       // Légère rotation sur le côté
            let rotX = 5;             // Légère inclinaison vers l'arrière
            
            let scale = 1;
            let opacity = Math.max(0, 1 - (absP * 0.18)); // S'estompe avec la distance

            // L'image centrale ressort (Pop effect)
            if (absP < 0.5) {
                item.style.zIndex = 100;
                item.style.filter = `brightness(1)`;
                scale = 1 + (0.5 - absP) * 0.15; 
            } else {
                item.style.zIndex = Math.round(100 - absP * 10);
                item.style.filter = `brightness(${Math.max(0.3, 1 - absP * 0.15)})`;
            }

            item.style.opacity = opacity;
            item.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
        });
    }
    requestAnimationFrame(animateGalerie);
}


function openViewModal(entry) {
    let mediaHTML = entry.image ? `<img src="${entry.image}" class="preview-image" style="max-height:40vh; margin-top:1.5rem;" alt="Visuel">` : '';
    viewModalBody.innerHTML = `
        <div class="preview-header-row">
            <span class="preview-tag">${entry.type} // ${entry.date}</span>
            <button class="btn-options-dots" onclick="openActionMenu('${entry.id}')">...</button>
        </div>
        <h2 class="preview-title" style="font-size:2.5rem; margin-bottom:1rem;"><span>${entry.title}</span></h2>
        ${entry.subtitle ? `<div class="preview-subtitle">${entry.subtitle}</div>` : ''}
        ${buildFormattedBody(entry)}
        ${mediaHTML}
    `;
    viewEntryModal.classList.remove('hidden');
}

document.getElementById('closeViewModalBtn').addEventListener('click', () => {
    viewEntryModal.classList.add('hidden');
});

// --- 11. MENU D'ACTION (...) ---
window.openActionMenu = function(id) {
    currentActionId = id;
    actionMenuModal.classList.remove('hidden');
};

document.getElementById('closeActionModalBtn').addEventListener('click', () => {
    actionMenuModal.classList.add('hidden');
});

document.getElementById('actMoveUpBtn').addEventListener('click', () => {
    const index = entries.findIndex(e => e.id === currentActionId);
    if (index > 0) {
        const temp = entries[index];
        entries[index] = entries[index - 1];
        entries[index - 1] = temp;
        saveToLocalStorage();
    }
    actionMenuModal.classList.add('hidden');
});

document.getElementById('actMoveDownBtn').addEventListener('click', () => {
    const index = entries.findIndex(e => e.id === currentActionId);
    if (index < entries.length - 1) {
        const temp = entries[index];
        entries[index] = entries[index + 1];
        entries[index + 1] = temp;
        saveToLocalStorage();
    }
    actionMenuModal.classList.add('hidden');
});

document.getElementById('actDeleteBtn').addEventListener('click', () => {
    if (confirm("Supprimer cette entrée ?")) {
        entries = entries.filter(e => e.id !== currentActionId);
        saveToLocalStorage();
        previewPane.innerHTML = `<div class="empty-state">Entrée supprimée.</div>`;
        viewEntryModal.classList.add('hidden');
    }
    actionMenuModal.classList.add('hidden');
});

document.getElementById('actEditBtn').addEventListener('click', () => {
    const entry = entries.find(e => e.id === currentActionId);
    if (!entry) return;

    actionMenuModal.classList.add('hidden');
    viewEntryModal.classList.add('hidden');
    
    document.getElementById('editingId').value = entry.id;
    document.getElementById('modalTitle').textContent = "ÉDITION DE L'ENTRÉE";
    document.getElementById('entryTitle').value = entry.title;
    entryTypeSelect.value = entry.type || 'TEXTE';
    updateFormSections();

    if (entry.type === 'TEXTE') {
        document.getElementById('texteSubtitle').value = entry.subtitle || '';
        document.getElementById('texteFormat').value = entry.format || 'paragraph';
        document.getElementById('texteContent').value = entry.content || '';
    } else if (entry.type === 'CITATION') {
        document.getElementById('citationContent').value = entry.content || '';
        document.getElementById('apaCiteAuthor').value = entry.apaCiteAuthor || '';
        document.getElementById('apaCiteYear').value = entry.apaCiteYear || '';
        document.getElementById('apaCiteBook').value = entry.apaCiteBook || '';
        document.getElementById('apaCitePublisher').value = entry.apaCitePublisher || '';
        document.getElementById('apaCitePage').value = entry.apaCitePage || '';
    } else if (entry.type === 'RÉFÉRENCES') {
        document.getElementById('refDescription').value = entry.content || '';
        document.getElementById('apaRefArtist').value = entry.apaRefArtist || '';
        document.getElementById('apaRefYear').value = entry.apaRefYear || '';
        document.getElementById('apaRefTitle').value = entry.apaRefTitle || '';
        document.getElementById('apaRefSource').value = entry.apaRefSource || '';
    } else if (entry.type === 'INTERVIEW') {
        document.getElementById('speaker1Name').value = entry.speaker1 || '';
        document.getElementById('speaker2Name').value = entry.speaker2 || '';
        dialogueContainer.innerHTML = '';
        (entry.dialogue || []).forEach(d => addDialoguePair(d.spk, d.text));
    } else if (entry.type === 'RESSOURCE') {
        document.getElementById('ressourceContent').value = entry.content || '';
        document.getElementById('apaResAuthor').value = entry.apaResAuthor || '';
        document.getElementById('apaResDate').value = entry.apaResDate || '';
        document.getElementById('apaResTitle').value = entry.apaResTitle || '';
        document.getElementById('apaResJournal').value = entry.apaResJournal || '';
        document.getElementById('apaResUrl').value = entry.apaResUrl || '';
    }

    formModal.classList.remove('hidden');
});

// Ouverture modale nouvelle entrée
document.getElementById('openFormBtn').addEventListener('click', () => {
    document.getElementById('editingId').value = '';
    document.getElementById('modalTitle').textContent = "INDEXATION";
    entryForm.reset();
    dialogueContainer.innerHTML = '';
    addDialoguePair('spk1', '');
    updateFormSections();
    formModal.classList.remove('hidden');
});

document.getElementById('closeFormBtn').addEventListener('click', () => formModal.classList.add('hidden'));

// --- 12. SOUMISSION DU FORMULAIRE MODAL ---
entryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editingId = document.getElementById('editingId').value;
    const title = document.getElementById('entryTitle').value;
    const type = entryTypeSelect.value;
    const fileInput = document.getElementById('entryImageFile');
    const urlImage = document.getElementById('entryImageUrl').value;

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            commitEntryData(editingId, title, type, evt.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        commitEntryData(editingId, title, type, urlImage);
    }
});

function commitEntryData(editingId, title, type, image) {
    let entryData = {
        id: editingId || Date.now().toString(),
        title: title,
        type: type,
        image: image || "",
        tags: [type, "PROJET"],
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };

    if (type === 'TEXTE') {
        entryData.subtitle = document.getElementById('texteSubtitle').value;
        entryData.format = document.getElementById('texteFormat').value;
        entryData.content = document.getElementById('texteContent').value;
    } else if (type === 'RÉFÉRENCES') {
        entryData.content = document.getElementById('refDescription').value;
        entryData.apaRefArtist = document.getElementById('apaRefArtist').value;
        entryData.apaRefYear = document.getElementById('apaRefYear').value;
        entryData.apaRefTitle = document.getElementById('apaRefTitle').value;
        entryData.apaRefSource = document.getElementById('apaRefSource').value;
    } else if (type === 'CITATION') {
        entryData.content = document.getElementById('citationContent').value;
        entryData.apaCiteAuthor = document.getElementById('apaCiteAuthor').value;
        entryData.apaCiteYear = document.getElementById('apaCiteYear').value;
        entryData.apaCiteBook = document.getElementById('apaCiteBook').value;
        entryData.apaCitePublisher = document.getElementById('apaCitePublisher').value;
        entryData.apaCitePage = document.getElementById('apaCitePage').value;
    } else if (type === 'INTERVIEW') {
        entryData.speaker1 = document.getElementById('speaker1Name').value;
        entryData.speaker2 = document.getElementById('speaker2Name').value;
        const dialogueItems = [];
        document.querySelectorAll('.dialogue-pair-item').forEach(item => {
            dialogueItems.push({
                spk: item.querySelector('.dialogue-spk-select').value,
                text: item.querySelector('.dialogue-text-input').value
            });
        });
        entryData.dialogue = dialogueItems;
    } else if (type === 'RESSOURCE') {
        entryData.content = document.getElementById('ressourceContent').value;
        entryData.apaResAuthor = document.getElementById('apaResAuthor').value;
        entryData.apaResDate = document.getElementById('apaResDate').value;
        entryData.apaResTitle = document.getElementById('apaResTitle').value;
        entryData.apaResJournal = document.getElementById('apaResJournal').value;
        entryData.apaResUrl = document.getElementById('apaResUrl').value;
    }

    if (editingId) {
        const index = entries.findIndex(e => e.id === editingId);
        if (index !== -1) {
            if (!image && entries[index].image) entryData.image = entries[index].image;
            entries[index] = entryData;
        }
    } else {
        entries.push(entryData);
    }

    saveToLocalStorage();
    entryForm.reset();
    formModal.classList.add('hidden');
}

// --- 13. SAISIE EN LIGNE TAPUSCRIT ---
document.getElementById('saveTapuscritBtn').addEventListener('click', saveQuickTapuscrit);

function saveQuickTapuscrit() {
    const title = document.getElementById('quickInputTitle').value.trim();
    const type = quickTypeSelect.value;
    if (!title) return;

    let newEntry = {
        id: Date.now().toString(),
        title: title,
        type: type,
        image: "",
        tags: [type, "NOTE"],
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };

    if (type === 'TEXTE') {
        newEntry.content = document.getElementById('quickInputContent').value;
    } else if (type === 'RÉFÉRENCES') {
        newEntry.image = document.getElementById('quickRefUrl').value;
        newEntry.content = document.getElementById('quickRefDesc').value;
    } else if (type === 'CITATION') {
        newEntry.content = document.getElementById('quickCiteContent').value;
        newEntry.apaCiteAuthor = document.getElementById('quickCiteAuthor').value;
    } else if (type === 'INTERVIEW') {
        newEntry.speaker1 = document.getElementById('quickSpeaker1').value;
        newEntry.speaker2 = document.getElementById('quickSpeaker2').value;
        const rawLines = document.getElementById('quickInterviewBody').value.split('\n');
        newEntry.dialogue = rawLines.map((line, idx) => ({
            spk: idx % 2 === 0 ? 'spk1' : 'spk2',
            text: line
        }));
    } else if (type === 'RESSOURCE') {
        newEntry.content = document.getElementById('quickResContent').value;
        newEntry.apaResUrl = document.getElementById('quickResUrl').value;
    }

    entries.push(newEntry);
    saveToLocalStorage();

    document.getElementById('quickInputTitle').value = '';
    document.getElementById('quickInputContent').value = '';
    document.getElementById('quickRefUrl').value = '';
    document.getElementById('quickRefDesc').value = '';
    document.getElementById('quickCiteContent').value = '';
    document.getElementById('quickCiteAuthor').value = '';
    document.getElementById('quickSpeaker1').value = '';
    document.getElementById('quickSpeaker2').value = '';
    document.getElementById('quickInterviewBody').value = '';
    document.getElementById('quickResContent').value = '';
    document.getElementById('quickResUrl').value = '';
}

// --- 14. GESTION DU CURSEUR CARRÉ CMJN INTERACTIF ---
const cursorElement = document.getElementById('customCursor');
const cmykColors = [
    { color: '#00e5ff', glow: '0 0 10px rgba(0, 229, 255, 0.4)' },   // Cyan
    { color: '#ff0055', glow: '0 0 10px rgba(255, 0, 85, 0.4)' },    // Magenta
    { color: '#ffea00', glow: '0 0 10px rgba(255, 234, 0, 0.5)' },   // Jaune
    { color: '#111111', glow: '0 0 10px rgba(17, 17, 17, 0.3)' }     // Noir
];

let colorIndex = 0;

// Suivi fluide de la position de la souris
window.addEventListener('mousemove', (e) => {
    cursorElement.style.left = `${e.clientX}px`;
    cursorElement.style.top = `${e.clientY}px`;
});

// Changement de couleur CMJN à chaque clic / interaction
window.addEventListener('mousedown', () => {
    document.body.classList.add('cursor-active');
    rotateCmykColor();
});

window.addEventListener('mouseup', () => {
    document.body.classList.remove('cursor-active');
});

function rotateCmykColor() {
    colorIndex = (colorIndex + 1) % cmykColors.length;
    const current = cmykColors[colorIndex];
    cursorElement.style.backgroundColor = current.color;
    cursorElement.style.boxShadow = current.glow;
}

// Détection du survol des éléments interactifs
document.addEventListener('mouseover', (e) => {
    if (e.target.matches('a, button, input, select, textarea, .list-item, .orbit-item-content, .list-table-row, .galerie-card, .galerie-card img')) {
        document.body.classList.add('cursor-hover');
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.matches('a, button, input, select, textarea, .list-item, .orbit-item-content, .list-table-row, .galerie-card, .galerie-card img')) {
        document.body.classList.remove('cursor-hover');
    }
});






// Initialisation au chargement
updateFormSections();
updateQuickSections();
renderAllViews();