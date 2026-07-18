const SUPABASE_URL = 'ваш_project_url';
const SUPABASE_KEY = 'ваш_anon_key';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadActivities() {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('status', 'active');

    if (error) {
        console.error(error);
        return;
    }

    const container = document.getElementById('activities-list');
    container.innerHTML = data.map(a => `
        <div class="card">
            <h3>${a.title}</h3>
            <p>${a.description}</p>
            <p>📍 ${a.city} | 📅 ${new Date(a.event_date).toLocaleDateString()}</p>
            ${a.is_beginner_friendly ? '<span class="badge">Для новичков</span>' : ''}
            <button onclick="register(${a.id})">Записаться ✅</button>
        </div>
    `).join('');
}

async function register(activityId) {
    // пока без реальной авторизации — заглушка user_id
    const { error } = await supabase
        .from('registrations')
        .insert([{ user_id: 'test-user-id', activity_id: activityId }]);

    if (error) {
        alert('Ошибка: возможно уже записан');
    } else {
        alert('Записан!');
    }
}

loadActivities();