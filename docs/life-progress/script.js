function updateProgressBars() {
    const now = new Date();

    // Year Progress
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    const yearProgress = ((now - startOfYear) / (endOfYear - startOfYear)) * 100;
    document.getElementById('year-progress').style.width = yearProgress + '%';
    document.getElementById('year-percentage').textContent = Math.floor(yearProgress) + '%';

    // Quarter Progress
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
    const endOfQuarter = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0); // 获取当前季度的最后一天
    const quarterProgress = ((now - startOfQuarter) / (endOfQuarter - startOfQuarter)) * 100;
    document.getElementById('quarter-progress').style.width = quarterProgress + '%';
    document.getElementById('quarter-percentage').textContent = Math.floor(quarterProgress) + '%';

    // Month Progress
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // 获取当前月份的最后一天
    const monthProgress = (now.getDate() / endOfMonth.getDate()) * 100; // (当前日 / 月总天数) * 100
    // 为了更精确的月度进度，应该用毫秒差值
    const daysInMonth = endOfMonth.getDate();
    const millisecondsInMonth = daysInMonth * 24 * 60 * 60 * 1000;
    const millisecondsPassedInMonth = now - startOfMonth;
    const preciseMonthProgress = (millisecondsPassedInMonth / millisecondsInMonth) * 100;

    document.getElementById('month-progress').style.width = preciseMonthProgress + '%';
    document.getElementById('month-percentage').textContent = Math.floor(preciseMonthProgress) + '%';


    // Week Progress (假设一周从周一开始)
    const dayOfWeek = now.getDay(); // 0 (Sunday) - 6 (Saturday)
    const daysIntoWeekForCalc = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 (Monday) - 6 (Sunday)

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysIntoWeekForCalc);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weekProgress = ((now - startOfWeek) / (endOfWeek - startOfWeek)) * 100;
    document.getElementById('week-progress').style.width = weekProgress + '%';
    document.getElementById('week-percentage').textContent = Math.floor(weekProgress) + '%';

    // Day Progress
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const dayProgress = ((now - startOfDay) / (endOfDay - startOfDay)) * 100;
    document.getElementById('day-progress').style.width = dayProgress + '%';
    document.getElementById('day-percentage').textContent = Math.floor(dayProgress) + '%';
}

// 初始化并根据需要设置更新频率
updateProgressBars();
// 对于日期、季度、月份、周，每分钟或每几分钟更新一次就足够了。日进度条可以更频繁。
// 为了简化，这里依然设置为每秒更新一次，但在实际应用中，对于某些进度条可以降低更新频率以节省资源。
setInterval(updateProgressBars, 1000);

// 初始加载时，也确保百分比文本是更新的
document.addEventListener('DOMContentLoaded', () => {
    updateProgressBars(); // 确保初始加载时文本也是正确的
});