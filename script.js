let gradesData = JSON.parse(localStorage.getItem('gradesData')) || [];

window.onload = function() {
    renderTable();
};

function addGrade() {
    const name = document.getElementById('studentName').value.trim();
    const subject = document.getElementById('subjectName').value.trim();
    const grade = parseInt(document.getElementById('gradeInput').value);

    if (!name || !subject || isNaN(grade)) {
        alert("Барлық өрістерді толтырыңыз!");
        return;
    }

    if (grade < 1 || grade > 10) {
        alert("Қате! Баға 1 мен 10 аралығында болуы тиіс.");
        return;
    }

    let status = "";
    if (grade >= 9) status = "Үздік (Өте жақсы)";
    else if (grade >= 6) status = "Жақсы";
    else if (grade >= 4) status = "Қанағаттанарлық";
    else status = "Нашар (Қайта тапсыру)";

    const newRecord = { id: Date.now(), name, subject, grade, status };
    gradesData.push(newRecord);

    saveToLocalStorage();

    document.getElementById('studentName').value = '';
    document.getElementById('subjectName').value = '';
    document.getElementById('gradeInput').value = '';

    renderTable();
}

function renderTable(dataToRender = gradesData) {
    const tableBody = document.getElementById('gradeTableBody');
    tableBody.innerHTML = '';

    if (dataToRender.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="color: #888;">Әзірге бағалар енгізілмеген.</td></tr>`;
        document.getElementById('statsSection').innerHTML = '';
        return;
    }

    let totalGrade = 0;

    dataToRender.forEach(item => {
        totalGrade += item.grade;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.subject}</td>
            <td><strong>${item.grade}</strong></td>
            <td>${item.status}</td>
            <td><button class="delete-btn" onclick="deleteRecord(${item.id})">Жою</button></td>
        `;
        tableBody.appendChild(row);
    });

    const average = (totalGrade / dataToRender.length).toFixed(1);
    document.getElementById('statsSection').innerHTML = `Барлық жазбалар бойынша орташа көрсеткіш (GPA): <span>${average}</span> / 10`;
}

function deleteRecord(id) {
    gradesData = gradesData.filter(item => item.id !== id);
    saveToLocalStorage();
    renderTable();
}

function clearAllData() {
    if (confirm("Барлық деректерді өшіргіңіз келе ме?")) {
        gradesData = [];
        localStorage.removeItem('gradesData');
        renderTable();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('gradesData', JSON.stringify(gradesData));
}

function filterTable() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filteredData = gradesData.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.subject.toLowerCase().includes(query)
    );
    renderTable(filteredData);
}

// Деректерді Excel форматында жүктеп алу функциясы
function exportToExcel() {
    if (gradesData.length === 0) {
        alert("Жүктеп алу үшін деректер жоқ!");
        return;
    }

    // Кесте үшін таза деректер дайындау (id мен әрекет бағандарын алып тастаймыз)
    const excelData = gradesData.map(item => ({
        "Оқушының аты-жөні": item.name,
        "Пән атауы": item.subject,
        "Баға (1-10)": item.grade,
        "Статус": item.status
    }));

    // Worksheet жасау
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Workbook жасау
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Табель");

    // Excel файлын (.xlsx) жасап, жүктеу
    XLSX.writeFile(workbook, "Oqushy_Tabeli.xlsx");
}