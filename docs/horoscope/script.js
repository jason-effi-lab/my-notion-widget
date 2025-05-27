// script.js
const zodiacSignsMap = [ // 仅用于从生日推断英文名给API
    { sign: 'capricorn', name: '摩羯座', MMDD_start: '1222', MMDD_end: '0119' },
    { sign: 'aquarius', name: '水瓶座', MMDD_start: '0120', MMDD_end: '0218' },
    { sign: 'pisces', name: '双鱼座', MMDD_start: '0219', MMDD_end: '0320' },
    { sign: 'aries', name: '白羊座', MMDD_start: '0321', MMDD_end: '0419' },
    { sign: 'taurus', name: '金牛座', MMDD_start: '0420', MMDD_end: '0520' },
    { sign: 'gemini', name: '双子座', MMDD_start: '0521', MMDD_end: '0621' },
    { sign: 'cancer', name: '巨蟹座', MMDD_start: '0622', MMDD_end: '0722' },
    { sign: 'leo', name: '狮子座', MMDD_start: '0723', MMDD_end: '0822' },
    { sign: 'virgo', name: '处女座', MMDD_start: '0823', MMDD_end: '0922' },
    { sign: 'libra', name: '天秤座', MMDD_start: '0923', MMDD_end: '1023' },
    { sign: 'scorpio', name: '天蝎座', MMDD_start: '1024', MMDD_end: '1122' },
    { sign: 'sagittarius', name: '射手座', MMDD_start: '1123', MMDD_end: '1221' }
];

function getBirthdayFromURL() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('birthday');
}

function getZodiacApiType(mmdd) { // 返回API所需的英文名
    if (!mmdd || mmdd.length !== 4 || !/^\d{4}$/.test(mmdd)) return null;
    const capricorn = zodiacSignsMap.find(z => z.sign === 'capricorn');
    if ((mmdd >= capricorn.MMDD_start && mmdd <= "1231") || (mmdd >= "0101" && mmdd <= capricorn.MMDD_end)) {
        return capricorn.sign;
    }
    for (const zodiac of zodiacSignsMap) {
        if (zodiac.sign === 'capricorn') continue;
        if (mmdd >= zodiac.MMDD_start && mmdd <= zodiac.MMDD_end) {
            return zodiac.sign;
        }
    }
    return null;
}

async function fetchHoroscopeData(apiSignType) {
    const API_URL = `https://api.vvhan.com/api/horoscope?type=${apiSignType}&time=today`;
    try {
        const response = await fetch(API_URL, { method: 'GET' }); // 改为GET
        if (!response.ok) { // 网络层面错误
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && result.data) { // API层面成功
            return result.data;
        } else {
            throw new Error(result.message || 'API返回数据格式错误或请求失败');
        }
    } catch (error) {
        console.error("获取星座运势失败:", error);
        displayError(error.message || "运势加载失败，请检查网络或稍后再试。");
        return null;
    }
}

function generateStars(count) {
    const maxStars = 5;
    let stars = '';
    for (let i = 0; i < maxStars; i++) {
        stars += i < count ? '★' : '☆';
    }
    return stars;
}

function displayHoroscopeData(data) {
    if (!data) {
        displayError("未能加载有效的运势数据。");
        return;
    }

    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('data-display').style.display = 'block';
    document.getElementById('error-state').style.display = 'none';

    // Header
    document.getElementById('sign-title').textContent = data.title || '未知星座';
    document.getElementById('current-time').textContent = data.time || '未知日期';

    // Short Comment
    document.getElementById('short-comment').textContent = data.shortcomment || '暂无简评';

    // Todo
    document.getElementById('todo-yi').textContent = data.todo?.yi || '无';
    document.getElementById('todo-ji').textContent = data.todo?.ji || '无';

    // Lucky Info
    document.getElementById('lucky-color').textContent = data.luckycolor || '未知';
    document.getElementById('lucky-number').textContent = data.luckynumber || '未知';
    document.getElementById('lucky-constellation').textContent = data.luckyconstellation || '未知';

    // Ratings & Index
    const ratings = ['all', 'love', 'work', 'money', 'health'];
    ratings.forEach(key => {
        document.getElementById(`fortune-${key}`).textContent = generateStars(data.fortune?.[key]);
        document.getElementById(`index-${key}`).textContent = `(${data.index?.[key] || 'N/A'})`;
    });

    // Fortune Text (Details)
    document.getElementById('text-all').textContent = data.fortunetext?.all || '暂无详细说明。';
    document.getElementById('text-love').textContent = data.fortunetext?.love || '暂无详细说明。';
    document.getElementById('text-work').textContent = data.fortunetext?.work || '暂无详细说明。';
    document.getElementById('text-money').textContent = data.fortunetext?.money || '暂无详细说明。';
    document.getElementById('text-health').textContent = data.fortunetext?.health || '暂无详细说明。';
}

function displayError(message, showInstructions = false) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('data-display').style.display = 'none';

    const errorState = document.getElementById('error-state');
    const errorText = document.getElementById('error-text');
    const instructions = errorState.querySelector('.instructions');

    errorText.textContent = message;
    instructions.style.display = showInstructions ? 'block' : 'none';
    errorState.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
    const birthdayMMDD = getBirthdayFromURL();

    if (!birthdayMMDD) {
        displayError("请提供生日参数以查看运势 (例如: ?birthday=0101)。", true);
        return;
    }

    const apiSignType = getZodiacApiType(birthdayMMDD);

    if (!apiSignType) {
        displayError(`生日参数 "${birthdayMMDD}" 无效或无法确定星座。`, true);
        return;
    }

    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('data-display').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';

    const horoscopeData = await fetchHoroscopeData(apiSignType);

    if (horoscopeData) {
        displayHoroscopeData(horoscopeData);
    }
    // displayError 会在 fetchHoroscopeData 内部调用如果失败
});