function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    document.getElementById('time').textContent = timeString;
}

// 首次加载时更新时间
updateTime();

// 每秒钟更新一次时间
setInterval(updateTime, 1000);