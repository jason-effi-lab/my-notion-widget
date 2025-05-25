document.addEventListener('DOMContentLoaded', () => {
    const currentMonthYearElement = document.getElementById('current-month-year');
    const calendarBodyElement = document.getElementById('calendar-body');
    const prevYearButton = document.getElementById('prev-year');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const nextYearButton = document.getElementById('next-year');
    const goToTodayButton = document.getElementById('go-to-today');

    const dateInfoPanel = document.getElementById('date-info-panel');
    const infoSolar = document.getElementById('info-solar');
    const infoLunar = document.getElementById('info-lunar');
    const infoGanzhiYear = document.getElementById('info-ganzhi-year');
    const infoGanzhiMonth = document.getElementById('info-ganzhi-month');
    const infoGanzhiDay = document.getElementById('info-ganzhi-day');
    const infoAnimal = document.getElementById('info-animal');
    const infoFestivals = document.getElementById('info-festivals');
    const infoJieqi = document.getElementById('info-jieqi');
    const infoYi = document.getElementById('info-yi');
    const infoJi = document.getElementById('info-ji');


    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1; // 月份是从0开始的

    function renderCalendar(year, month) {
        currentMonthYearElement.textContent = `${year} 年 ${month} 月`;
        calendarBodyElement.innerHTML = ''; // 清空旧的日历格子

        const date = new Date(year, month - 1, 1);
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDayOfWeek = (date.getDay() === 0) ? 6 : date.getDay() - 1; // 0 (周日) 到 6 (周六) -> 0 (周一) 到 6 (周日)

        // **关键改动：动态计算行数**
        const numRows = Math.ceil((firstDayOfWeek + daysInMonth) / 7);

        let dayCounter = 1;
        // **关键改动：使用 numRows**
        for (let i = 0; i < numRows; i++) {
            const row = document.createElement('tr');

            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                cell.classList.add('date-cell');

                if (i === 0 && j < firstDayOfWeek) {
                    // 填充上个月的日期
                    const prevMonthLastDay = new Date(year, month - 1, 0);
                    const prevMonthYear = prevMonthLastDay.getFullYear();
                    const prevActualMonth = prevMonthLastDay.getMonth() + 1;
                    const prevDayNum = prevMonthLastDay.getDate() - firstDayOfWeek + j + 1;
                    
                    const solarPrev = Solar.fromYmd(prevMonthYear, prevActualMonth, prevDayNum);
                    const lunarPrev = solarPrev.getLunar();

                    cell.innerHTML = `
                        <span class="solar-day">${solarPrev.getDay()}</span>
                        <span class="lunar-day">${lunarPrev.getDayInChinese()}</span>
                    `;
                    cell.classList.add('other-month-day');
                } else if (dayCounter <= daysInMonth) {
                    // 当月日期
                    const solarDay = Solar.fromYmd(year, month, dayCounter);
                    const lunarDayObj = solarDay.getLunar();

                    let lunarDisplay = lunarDayObj.getDayInChinese();
                    if (lunarDayObj.getDay() === 1) {
                        lunarDisplay = lunarDayObj.getMonthInChinese() + '月';
                    }

                    let festivals = '';
                    const solarFestivals = solarDay.getFestivals();
                    solarFestivals.forEach(f => festivals += `<span class="festival">${f}</span>`);
                    const lunarFestivals = lunarDayObj.getFestivals();
                    lunarFestivals.forEach(f => festivals += `<span class="festival">${f}</span>`);
                    const otherFestivals = lunarDayObj.getOtherFestivals();
                    otherFestivals.forEach(f => festivals += `<span class="festival">${f}</span>`);


                    let jieqiDisplay = '';
                    if (lunarDayObj.getJieQi()) {
                        jieqiDisplay = `<span class="jieqi">${lunarDayObj.getJieQi()}</span>`;
                    }

                    cell.innerHTML = `
                        <span class="solar-day">${dayCounter}</span>
                        <span class="lunar-day">${lunarDisplay}</span>
                        ${festivals}
                        ${jieqiDisplay}
                    `;

                    const today = new Date();
                    if (year === today.getFullYear() && month === (today.getMonth() + 1) && dayCounter === today.getDate()) {
                        cell.classList.add('today');
                    }

                    cell.dataset.year = year;
                    cell.dataset.month = month;
                    cell.dataset.day = dayCounter;
                    cell.addEventListener('click', showDateInfo);

                    dayCounter++;
                } else {
                    // 填充下个月的日期
                    const nextMonthDay = dayCounter - daysInMonth;
                    const nextMonthFirstDay = new Date(year, month, 1); // 下个月的第一天
                    const nextActualMonth = nextMonthFirstDay.getMonth() +1;
                    const nextMonthYear = nextMonthFirstDay.getFullYear();

                    const solarNext = Solar.fromYmd(nextMonthYear, nextActualMonth, nextMonthDay);
                    const lunarNext = solarNext.getLunar();
                    cell.innerHTML = `
                        <span class="solar-day">${solarNext.getDay()}</span>
                        <span class="lunar-day">${lunarNext.getDayInChinese()}</span>
                    `;
                    cell.classList.add('other-month-day');
                    dayCounter++; // 继续计数，确保填充的日期是连续的
                }
                row.appendChild(cell);
            }
            calendarBodyElement.appendChild(row);
        }
    }

    function showDateInfo(event) {
        let targetCell = event.target;
        while (targetCell && targetCell.tagName !== 'TD') {
            targetCell = targetCell.parentElement;
        }
        if (!targetCell || !targetCell.dataset.year) {
            dateInfoPanel.style.display = 'none';
            return;
        }

        const year = parseInt(targetCell.dataset.year);
        const month = parseInt(targetCell.dataset.month);
        const day = parseInt(targetCell.dataset.day);

        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            dateInfoPanel.style.display = 'none';
            return;
        }

        const solar = Solar.fromYmd(year, month, day);
        const lunar = solar.getLunar();

        infoSolar.textContent = `公历: ${solar.toString()} ${solar.getWeekInChinese()}`;
        infoLunar.textContent = `农历: ${lunar.toString()}`;
        infoGanzhiYear.textContent = `年柱: ${lunar.getYearInGanZhi()}(${lunar.getYearShengXiao()})年`;
        infoGanzhiMonth.textContent = `月柱: ${lunar.getMonthInGanZhi()}`;
        infoGanzhiDay.textContent = `日柱: ${lunar.getDayInGanZhi()}`;
        infoAnimal.textContent = `生肖: ${lunar.getYearShengXiao()}`;

        let festivalsText = lunar.getFestivals().join(' ') + ' ' + solar.getFestivals().join(' ') + ' ' + lunar.getOtherFestivals().join(' ');
        infoFestivals.textContent = `节日: ${festivalsText.trim() || '无'}`;
        infoJieqi.textContent = `节气: ${lunar.getJieQi() || '无'}`;

        const dayLunar = Lunar.fromDate(new Date(year, month - 1, day));
        infoYi.textContent = `宜: ${dayLunar.getDayYi().join(' ')}`;
        infoJi.textContent = `忌: ${dayLunar.getDayJi().join(' ')}`;

        dateInfoPanel.style.display = 'block';
    }

    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 1) {
            currentMonth = 12;
            currentYear--;
        }
        renderCalendar(currentYear, currentMonth);
        dateInfoPanel.style.display = 'none';
    });

    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
        renderCalendar(currentYear, currentMonth);
        dateInfoPanel.style.display = 'none';
    });

    prevYearButton.addEventListener('click', () => {
        currentYear--;
        renderCalendar(currentYear, currentMonth);
        dateInfoPanel.style.display = 'none';
    });

    nextYearButton.addEventListener('click', () => {
        currentYear++;
        renderCalendar(currentYear, currentMonth);
        dateInfoPanel.style.display = 'none';
    });

    goToTodayButton.addEventListener('click', () => {
        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth() + 1;
        renderCalendar(currentYear, currentMonth);
        const todayCell = document.querySelector(`.date-cell[data-year="${currentYear}"][data-month="${currentMonth}"][data-day="${today.getDate()}"]`);
        if (todayCell) {
           todayCell.click();
        } else {
            dateInfoPanel.style.display = 'none';
        }
    });

    renderCalendar(currentYear, currentMonth);
    const todayForInfo = new Date();
    const todayCellInitial = document.querySelector(`.date-cell[data-year="${todayForInfo.getFullYear()}"][data-month="${todayForInfo.getMonth() + 1}"][data-day="${todayForInfo.getDate()}"]`);
    if (todayCellInitial) {
       todayCellInitial.click();
    }
});