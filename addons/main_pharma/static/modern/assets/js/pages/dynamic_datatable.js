window.tableConfigs = window.tableConfigs || {};


function add_table({type} = {}) {
    let config = window.tableConfigs[type];
    if (!config) return console.error("Config not found for type:", type);

    // Destroy existing
    if ($.fn.DataTable.isDataTable('#dynamicTable')) {
        $('#dynamicTable').DataTable().destroy();
        $('#dynamicTable').empty();
    }

    config.columns = enhanceColumns(config.columns);

    // Init DataTable
    let table = $('#dynamicTable').DataTable({
        ajax: {
            url: config.ajax_url,
            dataSrc: "data"
        },
        columns: config.columns,
        scrollX: true,
        responsive: false,
        autoWidth: false,
        fixedColumns: { leftColumns: 1, rightColumns: 1 },
        order: []
    });

    buildColumnToggles(table, config.columns);
    buildDateFiltersBetween(table, config.columns);
}
function enhanceColumns(columns) {
    return columns.map(col => {
        if (col.type === "user") {
            col.render = (data, type, row) => {
                let img = row[col.image_field] || '/default_user.png';
                return `
                    <div class="d-flex align-items-center">
                        <img src="${img}" class="rounded-circle me-2" width="32" height="32" alt="">
                        <span>${data || ''}</span>
                    </div>`;
            };
        } 
        else if (col.type === "array") {
            col.render = (data) => Array.isArray(data)
                ? data.map(item => item[col.array_field]).join(', ')
                : '';
        } 
        else if (col.type === "date") {
            col.render = (data) => data
                ? new Date(data).toISOString().split('T')[0]
                : '';
        }
        return col;
    });
}
function buildColumnToggles(table, columns) {
    let container = $(".columns-toggle");
    container.empty().append(`<strong>Toggle Columns:</strong><br>`);

    columns.forEach((col, index) => {
        if (col.alwaysShow) return; // Skip sticky columns
        let checked = col.visible !== false ? "checked" : "";
        container.append(`
            <label class="me-2">
                <input type="checkbox" class="toggle-col" data-col="${index}" ${checked}> ${col.title}
            </label>
        `);
    });

    container.on("change", ".toggle-col", function() {
        let colIndex = $(this).data("col");
        let column = table.column(colIndex);
        column.visible($(this).is(":checked"));
    });
}
function buildDateFiltersBetween(table, columns) {
    let filterContainer = $('<div class="mb-3 date-filters row g-2 align-items-end"></div>');
    columns.forEach((col, i) => {
        if (col.type === "date" && col.filterable) {
            let idFrom = `filter-from-${i}`;
            let idTo = `filter-to-${i}`;
            filterContainer.append(`
                <div class="col-auto">
                    <label class="form-label d-block">${col.title} From:</label>
                    <input type="date" id="${idFrom}" class="form-control form-control-sm date-filter-from" data-col="${i}">
                </div>
                <div class="col-auto">
                    <label class="form-label d-block">To:</label>
                    <input type="date" id="${idTo}" class="form-control form-control-sm date-filter-to" data-col="${i}">
                </div>
            `);
        }
    });
    $(".columns-toggle").after(filterContainer);

    // Custom filtering function
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        let show = true;
        columns.forEach((col, i) => {
            if (col.type === "date" && col.filterable) {
                let from = $(`#filter-from-${i}`).val();
                let to = $(`#filter-to-${i}`).val();
                let cellData = data[i];
                if (cellData) {
                    let date = new Date(cellData);
                    if (from && date < new Date(from)) show = false;
                    if (to && date > new Date(to)) show = false;
                }
            }
        });
        return show;
    });

    $(".date-filters").on("change", "input[type='date']", function() {
        table.draw();
    });
}