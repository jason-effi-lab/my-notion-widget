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

        // 获取当月第一天和最后一天
        const firstDayOfMonth = Solar.fromYmd(year, month, 1);
        const lunarFirstDay = firstDayOfMonth.getLunar();

        // lunar-javascript 的 Calendar.getDaysInMonth() 获取的是农历月的天数，我们需要公历月的数据。
        // 我们需要自己计算公历月的日历网格，然后用 Solar.fromYmd(y,m,d).getLunar() 来获取每天的农历信息。
        const date = new Date(year, month - 1, 1);
        const daysInMonth = new Date(year, month, 0).getDate(); // 获取当月天数
        const firstDayOfWeek = (date.getDay() === 0) ? 6 : date.getDay() - 1; // 0 (周日) 到 6 (周六) -> 0 (周一) 到 6 (周日)

        let dayCounter = 1;
        for (let i = 0; i < 6; i++) { // 最多6行
            const row = document.createElement('tr');
            let rowHasDates = false; // 标记这行是否有实际日期，避免最后全是空行

            for (let j = 0; j < 7; j++) { // 7天一周
                const cell = document.createElement('td');
                cell.classList.add('date-cell');

                if (i === 0 && j < firstDayOfWeek) {
                    // 填充上个月的日期 (可选，简化版可以不填充)
                    const prevMonthDays = new Date(year, month - 1, 0).getDate();
                    const prevDay = prevMonthDays - firstDayOfWeek + j + 1;
                    const solarPrev = Solar.fromYmd(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1, prevDay);
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
                    if (lunarDayObj.getDay() === 1) { // 如果是农历初一，显示月份
                        lunarDisplay = lunarDayObj.getMonthInChinese() + '月';
                    }

                    // 节日和节气
                    let festivals = '';
                    const solarFestivals = solarDay.getFestivals(); // 公历节日
                    solarFestivals.forEach(f => festivals += `<span class="festival">${f}</span>`);
                    const lunarFestivals = lunarDayObj.getFestivals(); // 农历节日
                    lunarFestivals.forEach(f => festivals += `<span class="festival">${f}</span>`);
                    const otherFestivals = lunarDayObj.getOtherFestivals(); // 其他特定日期名称
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

                    // 高亮今天
                    const today = new Date();
                    if (year === today.getFullYear() && month === (today.getMonth() + 1) && dayCounter === today.getDate()) {
                        cell.classList.add('today');
                    }

                    // 周末高亮 (可选，CSS也可以通过th来判断)
                    if (j === 5 || j === 6) { // 周六或周日
                        // cell.classList.add('weekend'); // 可以通过th样式来让整列变红
                    }

                    cell.dataset.year = year;
                    cell.dataset.month = month;
                    cell.dataset.day = dayCounter;
                    cell.addEventListener('click', showDateInfo);

                    dayCounter++;
                    rowHasDates = true;
                } else {
                    // 填充下个月的日期 (可选)
                    const nextMonthDay = dayCounter - daysInMonth;
                    const solarNext = Solar.fromYmd(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, nextMonthDay);
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
            if (!rowHasDates && dayCounter > daysInMonth) break; // 如果一行没有任何本月日期，并且本月日期已排完，则停止
        }
    }

    function showDateInfo(event) {
        let targetCell = event.target;
        // 确保我们获取到的是 td 元素
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

        const dayLunar = Lunar.fromDate(new Date(year, month - 1, day)); // lunar-javascript 需要用这个获取宜忌
        infoYi.textContent = `宜: ${dayLunar.getDayYi().join(' ')}`;
        infoJi.textContent = `忌: ${dayLunar.getDayJi().join(' ')}`;


        dateInfoPanel.style.display = 'block';
    }


    // 事件监听
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
        // 模拟点击今天的日期来显示信息
        const todayCell = document.querySelector(`.date-cell[data-year="${currentYear}"][data-month="${currentMonth}"][data-day="${today.getDate()}"]`);
        if (todayCell) {
            todayCell.click();
        } else {
            dateInfoPanel.style.display = 'none';
        }
    });

    // 初始渲染
    renderCalendar(currentYear, currentMonth);
    // 初始加载时如果想显示今天的信息，可以模拟一次点击
    const todayForInfo = new Date();
    const todayCellInitial = document.querySelector(`.date-cell[data-year="${todayForInfo.getFullYear()}"][data-month="${todayForInfo.getMonth() + 1}"][data-day="${todayForInfo.getDate()}"]`);
    if (todayCellInitial) {
        todayCellInitial.click();
    }

});