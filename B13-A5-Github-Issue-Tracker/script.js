const API_URL = "https://phi-lab-server.vercel.app/api/v1/lab";
let allIssues = [];


function handleLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if(u === "admin" && p === "admin123") {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        fetchData();
    } else { alert("ভুল ইউজারনেম বা পাসওয়ার্ড!"); }
}


async function fetchData() {
    toggleLoader(true);
    try {
        const res = await fetch(`${API_URL}/issues`);
        const json = await res.json();
        allIssues = json.data;
        renderCards(allIssues);
    } catch (e) { console.error("Error fetching data"); }
    finally { toggleLoader(false); }
}


function renderCards(data) {
    const container = document.getElementById('issues-container');
    container.innerHTML = "";

    data.forEach(item => {
        const status = item.status.toLowerCase();
        
        const borderClass = status === 'open' ? 'border-open' : 'border-closed';

        const card = document.createElement('div');
        card.className = `bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col overflow-hidden cursor-pointer ${borderClass}`;
        
        card.innerHTML = `
            <div class="p-5 flex-grow">
                <div class="flex justify-between items-center mb-3">
                    <div class="flex items-center gap-1.5">
                        <img src="assets/aperture.png" class="w-3.5 h-3.5"> <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest">${item.label}</span>
                    </div>
                    <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full ${status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} uppercase">
                        ${item.status}
                    </span>
                </div>
                <h3 class="text-[15px] font-bold text-gray-900 mb-2 leading-tight line-clamp-2">${item.title}</h3>
                <p class="text-[12px] text-gray-500 leading-normal line-clamp-3">${item.description}</p>
            </div>
            
            <div class="px-5 py-3 bg-[#F8F9FA] border-t border-gray-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-gray-200 overflow-hidden ring-1 ring-white">
                        <img src="assets/aperture.png" class="w-full h-full object-cover"> </div>
                    <span class="text-[11px] font-semibold text-gray-700">${item.author}</span>
                </div>
                <div class="flex items-center gap-1">
                     <img src="assets/Open-Status.png" class="w-3 h-3 opacity-30"> <span class="text-[9px] text-gray-400 font-bold uppercase">${item.priority}</span>
                </div>
            </div>
        `;
        card.onclick = () => openModal(item.id);
        container.appendChild(card);
    });
}


async function handleSearch() {
    const q = document.getElementById('search-input').value;
    if(!q) return renderCards(allIssues);
    toggleLoader(true);
    const res = await fetch(`${API_URL}/issues/search?q=${q}`);
    const json = await res.json();
    renderCards(json.data);
    toggleLoader(false);
}


function filterIssues(type) {
    const tabs = ['all', 'open', 'closed'];
    tabs.forEach(t => document.getElementById(`tab-${t}`).className = "pb-4 text-sm text-gray-500");
    document.getElementById(`tab-${type}`).className = "active-tab pb-4 text-sm";

    if(type === 'all') renderCards(allIssues);
    else renderCards(allIssues.filter(i => i.status.toLowerCase() === type));
}


async function openModal(id) {
    const res = await fetch(`${API_URL}/issue/${id}`);
    const json = await res.json();
    const issue = json.data;

    document.getElementById('modal-body').innerHTML = `
        <div class="flex items-center gap-2 mb-2">
            <img src="assets/aperture.png" class="w-4 h-4">
            <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">${issue.label}</span>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">${issue.title}</h2>
        <p class="text-sm text-gray-600 mb-8 leading-relaxed">${issue.description}</p>
        <div class="grid grid-cols-2 gap-6 bg-gray-50 p-5 rounded-lg border border-gray-100 text-xs">
            <div><p class="text-gray-400 font-bold uppercase mb-1">Status</p><p class="font-bold uppercase">${issue.status}</p></div>
            <div><p class="text-gray-400 font-bold uppercase mb-1">Priority</p><p class="font-bold text-red-600 uppercase">${issue.priority}</p></div>
            <div><p class="text-gray-400 font-bold uppercase mb-1">Author</p><p class="font-bold">${issue.author}</p></div>
            <div><p class="text-gray-400 font-bold uppercase mb-1">Date</p><p class="font-bold">${new Date(issue.createdAt).toLocaleDateString()}</p></div>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

function toggleLoader(s) { document.getElementById('loader').classList.toggle('hidden', !s); }
function closeModal() { document.getElementById('modal').classList.add('hidden'); }